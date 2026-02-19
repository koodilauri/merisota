import readline from 'readline'

import { GameState } from './GameState'
import { ShipType, Ship, Board } from './types'

export function playerShot(
  state: GameState,
  coordinates: [number, number]
): { success: boolean; msg: string } {
  let updateShip: Ship | undefined = undefined

  const cell = state.enemyBoard[coordinates[0]][coordinates[1]]
  switch (cell) {
    case 'empty':
      state.enemyBoard[coordinates[0]][coordinates[1]] = 'miss'
      return { success: true, msg: 'You miss!' }
    case 'miss':
    case 'hit':
      return { success: false, msg: 'Already shot there, try again' }
    default:
      updateShip = state.enemyShips.get(cell)
      state.enemyBoard[coordinates[0]][coordinates[1]] = 'hit'
      if (updateShip) {
        updateShip.hitCount += 1
        if (updateShip.hitCount >= updateShip.size) {
          state.enemyShips.delete(cell)
          return { success: true, msg: `Hit! You sunk my ${cell}!` }
        } else {
          state.enemyShips.set(cell, updateShip)
          return { success: true, msg: 'Hit!' }
        }
      }
  }
  return { success: false, msg: 'Something went wrong with applying the shot' }
}

export async function playerTurn(state: GameState) {
  let validCoordinate = false
  while (!validCoordinate) {
    const input = await enterInput('Enter target (e.g. B7): ')
    const coordinates = parseCoordinate(input, state.boardSize)
    let updateShip: Ship | undefined = undefined

    if (coordinates) {
      const cell = state.enemyBoard[coordinates[0]][coordinates[1]]
      switch (cell) {
        case 'empty':
          state.enemyBoard[coordinates[0]][coordinates[1]] = 'miss'
          console.log('You miss!')
          validCoordinate = true
          break
        case 'miss':
          console.log('Already shot here, try again')
          break
        case 'hit':
          console.log('Already shot here, try again')
          break
        default:
          updateShip = state.enemyShips.get(cell)
          if (updateShip) {
            updateShip.hitCount += 1
            if (updateShip.hitCount >= updateShip.size) {
              state.enemyShips.delete(cell)
              console.log(`Hit! You sunk my ${cell}!`)
            } else {
              state.enemyShips.set(cell, updateShip)
              console.log(`Hit!`)
            }
          }
          state.enemyBoard[coordinates[0]][coordinates[1]] = 'hit'
          validCoordinate = true
      }
    } else {
      console.log('Error parsing coordinates, please try again. Unknown coordinates:', input)
    }
  }
}

export function computerTurn(state: GameState): string {
  let validCoordinate = false
  let msg = ''
  while (!validCoordinate) {
    const x = Math.floor(Math.random() * state.boardSize)
    const y = Math.floor(Math.random() * state.boardSize)
    const coordinates = state.playerBoard[x][y]
    let updateShip: Ship | undefined = undefined
    switch (coordinates) {
      case 'empty':
        state.playerBoard[x][y] = 'miss'
        validCoordinate = true
        msg = 'Enemy shot missed'
        break
      case 'miss':
      case 'hit':
        break
      default:
        updateShip = state.playerShips.get(coordinates)
        state.playerBoard[x][y] = 'hit'
        if (updateShip) {
          updateShip.hitCount += 1
          if (updateShip.hitCount >= updateShip.size) {
            state.playerShips.delete(coordinates)
            msg = `I sunk your ${coordinates}!`
          } else {
            state.playerShips.set(coordinates, updateShip)
            msg = 'Enemy hit your ship!'
          }
        }
        validCoordinate = true
    }
  }
  return msg
}
export function placeShip(
  board: Board,
  shipName: ShipType,
  shipSize: number,
  ships: Map<ShipType, Ship>,
  boardSize: number
) {
  const ship: Ship = {
    size: shipSize,
    hitCount: 0
  }
  let shipPlaced = false
  let orientation = Math.floor(Math.random() * 2)
  while (!shipPlaced) {
    if (orientation === 0) {
      const x = Math.floor(Math.random() * (boardSize - shipSize + 1))
      const y = Math.floor(Math.random() * boardSize)
      const shipArea = board
        .map(row => row.slice(y, y + 1))
        .flat()
        .slice(x, x + shipSize)
      if (shipArea.every(coordinate => coordinate === 'empty')) {
        for (let i = x; i < x + shipSize; i++) {
          board[i][y] = shipName
        }
        ships.set(shipName, ship)
        shipPlaced = true
      }
    } else {
      const x = Math.floor(Math.random() * boardSize)
      const y = Math.floor(Math.random() * (boardSize - shipSize + 1))
      const shipArea = board[x].slice(y, y + shipSize)
      if (shipArea.every(coordinate => coordinate === 'empty')) {
        for (let i = y; i < y + shipSize; i++) {
          board[x][i] = shipName
        }
        ships.set(shipName, ship)
        shipPlaced = true
      }
    }
    orientation = Math.floor(Math.random() * 2)
  }
}

export function initGame(state: GameState) {
  for (let i = 0; i < state.boardSize; i++) {
    for (let j = 0; j < state.boardSize; j++) {
      state.enemyBoard[i][j] = 'empty'
      state.playerBoard[i][j] = 'empty'
    }
  }

  state.enemyShips.clear()
  state.playerShips.clear()
  placeShip(state.enemyBoard, 'destroyer', 3, state.enemyShips, state.boardSize)
  placeShip(state.enemyBoard, 'submarine', 3, state.enemyShips, state.boardSize)
  placeShip(state.enemyBoard, 'patrol boat', 2, state.enemyShips, state.boardSize)

  placeShip(state.playerBoard, 'destroyer', 3, state.playerShips, state.boardSize)
  placeShip(state.playerBoard, 'submarine', 3, state.playerShips, state.boardSize)
  placeShip(state.playerBoard, 'patrol boat', 2, state.playerShips, state.boardSize)
}

export function parseCoordinate(input: string, boardSize: number): [number, number] | null {
  const match = input
    .trim()
    .toUpperCase()
    .match(/^([A-J])(10|[1-9])$/)
  if (!match) return null

  const col = match[1].charCodeAt(0) - 65
  const row = Number(match[2]) - 1
  if (col > boardSize - 1 || row > boardSize - 1) return null
  return [row, col]
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

export function enterInput(message: string): Promise<string> {
  return new Promise(resolve => rl.question(message, resolve))
}

export function closeInput(): void {
  rl.close()
}

export function remainingShips(ships: Map<ShipType, Ship>): boolean {
  if (ships.size === 0) return false
  return true
}
