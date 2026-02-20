import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import {
  parseCoordinate,
  coordinateToDisplay,
  remainingShips,
  playerShot,
  computerTurn,
  initGame
} from './systems'
import { createGameState } from './GameState'
import type { ShipType, Ship } from './types'

const BOARD_SIZE = 5
const GAME_BOARD_SIZE = 10 // initGame uses 10x10 and 5 ship types

describe('parseCoordinate', () => {
  test('parses valid coordinates A1 through E5 for size 5', () => {
    expect(parseCoordinate('A1', BOARD_SIZE)).toEqual([0, 0])
    expect(parseCoordinate('B2', BOARD_SIZE)).toEqual([1, 1])
    expect(parseCoordinate('E5', BOARD_SIZE)).toEqual([4, 4])
    expect(parseCoordinate('C3', BOARD_SIZE)).toEqual([2, 2])
  })

  test('accepts lowercase and trims input', () => {
    expect(parseCoordinate('  a1  ', BOARD_SIZE)).toEqual([0, 0])
    expect(parseCoordinate('e5', BOARD_SIZE)).toEqual([4, 4])
  })

  test('parses column J and row 10 for size 10', () => {
    expect(parseCoordinate('J10', 10)).toEqual([9, 9])
    expect(parseCoordinate('A10', 10)).toEqual([9, 0])
  })

  test('returns null for out-of-bounds for board size 5', () => {
    expect(parseCoordinate('F1', BOARD_SIZE)).toBeNull()
    expect(parseCoordinate('A6', BOARD_SIZE)).toBeNull()
    expect(parseCoordinate('J1', BOARD_SIZE)).toBeNull()
  })

  test('returns null for invalid format', () => {
    expect(parseCoordinate('', BOARD_SIZE)).toBeNull()
    expect(parseCoordinate('1A', BOARD_SIZE)).toBeNull()
    expect(parseCoordinate('AA', BOARD_SIZE)).toBeNull()
    expect(parseCoordinate('A0', BOARD_SIZE)).toBeNull()
    expect(parseCoordinate('K5', BOARD_SIZE)).toBeNull()
    expect(parseCoordinate('B7', BOARD_SIZE)).toBeNull()
  })
})

describe('coordinateToDisplay', () => {
  test('converts 0,0 to A1 and other indices to letter+row', () => {
    expect(coordinateToDisplay([0, 0])).toBe('A1')
    expect(coordinateToDisplay([1, 1])).toBe('B2')
    expect(coordinateToDisplay([4, 4])).toBe('E5')
    expect(coordinateToDisplay([0, 4])).toBe('E1')
    expect(coordinateToDisplay([4, 0])).toBe('A5')
  })

  test('supports full 10x10 (J10)', () => {
    expect(coordinateToDisplay([9, 9])).toBe('J10')
    expect(coordinateToDisplay([9, 0])).toBe('A10')
  })
})

describe('remainingShips', () => {
  test('returns false when no ships', () => {
    expect(remainingShips(new Map())).toBe(false)
  })

  test('returns true when at least one ship', () => {
    const ships = new Map<ShipType, Ship>([
      ['destroyer', { size: 3, hitCount: 0 }]
    ])
    expect(remainingShips(ships)).toBe(true)
  })

  test('returns true when ships exist even if all sunk (hitCount >= size)', () => {
    const ships = new Map<ShipType, Ship>([
      ['destroyer', { size: 3, hitCount: 3 }]
    ])
    expect(remainingShips(ships)).toBe(true)
  })
})

describe('playerShot', () => {
  let state: ReturnType<typeof createGameState>

  beforeEach(() => {
    state = createGameState(GAME_BOARD_SIZE)
    initGame(state)
  })

  test('records miss on empty cell and returns success', () => {
    const [r, c] = findEmptyCell(state.enemyBoard)
    const result = playerShot(state, [r, c])
    expect(result.success).toBe(true)
    expect(result.msg).toContain('You miss!')
    expect(state.enemyBoard[r][c]).toBe('miss')
  })

  test('returns failure when shooting same empty-then-miss cell again', () => {
    const [r, c] = findEmptyCell(state.enemyBoard)
    playerShot(state, [r, c])
    const result = playerShot(state, [r, c])
    expect(result.success).toBe(false)
    expect(result.msg).toBe('Already shot there, try again')
  })

  test('records hit on ship cell and returns hit message', () => {
    const [r, c] = findShipCell(state.enemyBoard)
    const shipType = state.enemyBoard[r][c] as ShipType
    const result = playerShot(state, [r, c])
    expect(result.success).toBe(true)
    expect(result.msg).toContain('Hit!')
    expect(state.enemyBoard[r][c]).toBe('hit')
    const ship = state.enemyShips.get(shipType)
    expect(ship).toBeDefined()
    expect(ship!.hitCount).toBe(1)
  })

  test('returns failure when shooting same ship cell again', () => {
    const [r, c] = findShipCell(state.enemyBoard)
    playerShot(state, [r, c])
    const result = playerShot(state, [r, c])
    expect(result.success).toBe(false)
    expect(result.msg).toBe('Already shot there, try again')
  })

  test('sinks ship when hitCount reaches size and removes from enemyShips', () => {
    const shipType = 'patrol boat' as ShipType
    const ship = state.enemyShips.get(shipType)!
    expect(ship.size).toBe(2)
    const cells = findShipCells(state.enemyBoard, shipType)
    playerShot(state, cells[0])
    const result = playerShot(state, cells[1])
    expect(result.success).toBe(true)
    expect(result.msg).toContain('sunk')
    expect(result.msg).toContain('patrol boat')
    expect(state.enemyShips.has(shipType)).toBe(false)
  })
})

describe('initGame', () => {
  test('creates NxN boards filled with cells', () => {
    const state = createGameState(GAME_BOARD_SIZE)
    initGame(state)
    expect(state.enemyBoard.length).toBe(GAME_BOARD_SIZE)
    expect(state.playerBoard.length).toBe(GAME_BOARD_SIZE)
    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
      expect(state.enemyBoard[i].length).toBe(GAME_BOARD_SIZE)
      expect(state.playerBoard[i].length).toBe(GAME_BOARD_SIZE)
    }
  })

  test('places five enemy ships and five player ships', () => {
    const state = createGameState(GAME_BOARD_SIZE)
    initGame(state)
    expect(state.enemyShips.size).toBe(5)
    expect(state.playerShips.size).toBe(5)
    const shipTypes: ShipType[] = ['destroyer', 'submarine', 'patrol boat', 'battleship', 'aircraft carrier']
    for (const name of shipTypes) {
      expect(state.enemyShips.has(name)).toBe(true)
      expect(state.playerShips.has(name)).toBe(true)
    }
  })

  test('enemy and player boards contain only empty or ship types', () => {
    const state = createGameState(GAME_BOARD_SIZE)
    initGame(state)
    const valid: string[] = ['empty', 'destroyer', 'submarine', 'patrol boat', 'battleship', 'aircraft carrier']
    for (let i = 0; i < state.boardSize; i++) {
      for (let j = 0; j < state.boardSize; j++) {
        expect(valid).toContain(state.enemyBoard[i][j])
        expect(valid).toContain(state.playerBoard[i][j])
      }
    }
  })
})

describe('computerTurn', () => {
  let originalRandom: typeof Math.random

  beforeEach(() => {
    originalRandom = Math.random
  })

  afterEach(() => {
    Math.random = originalRandom
  })

  test('eventually picks a cell and returns a message', () => {
    const state = createGameState(GAME_BOARD_SIZE)
    initGame(state)
    const msg = computerTurn(state)
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
    const valid =
      msg.includes('They missed!') ||
      msg.includes('They hit!') ||
      /They sunk your .+!/.test(msg)
    expect(valid).toBe(true)
  })

  test('marks a cell on player board as miss or hit', () => {
    const state = createGameState(GAME_BOARD_SIZE)
    initGame(state)
    const missOrHitBefore = countMissAndHit(state.playerBoard)
    computerTurn(state)
    const missOrHitAfter = countMissAndHit(state.playerBoard)
    expect(missOrHitAfter).toBe(missOrHitBefore + 1)
  })

  test('with Math.random returning 0, shoots (0,0); cell becomes miss or hit', () => {
    const state = createGameState(GAME_BOARD_SIZE)
    initGame(state) // use real random so placement succeeds
    Math.random = () => 0 // then fix random so computerTurn picks (0,0)
    const was = state.playerBoard[0][0]
    const msg = computerTurn(state)
    expect(state.playerBoard[0][0]).toBe(was === 'empty' ? 'miss' : 'hit')
    const valid =
      msg.includes('They missed!') ||
      msg.includes('They hit!') ||
      /They sunk your .+!/.test(msg)
    expect(valid).toBe(true)
  })
})

function findEmptyCell(board: string[][]): [number, number] {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 'empty') return [r, c]
    }
  }
  throw new Error('no empty cell')
}

function findShipCell(board: string[][]): [number, number] {
  const shipTypes = ['destroyer', 'submarine', 'patrol boat', 'battleship', 'aircraft carrier']
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (shipTypes.includes(board[r][c])) return [r, c]
    }
  }
  throw new Error('no ship cell')
}

function findShipCells(board: string[][], shipType: string): [number, number][] {
  const out: [number, number][] = []
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === shipType) out.push([r, c])
    }
  }
  return out
}

function countMissAndHit(board: string[][]): number {
  let n = 0
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 'miss' || board[r][c] === 'hit') n++
    }
  }
  return n
}
