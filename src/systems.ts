import { GameState } from './GameState'
import { ShipType, Ship, Board } from './types'
import { GenericShotResult } from './types'

function applyShotToBoard(
  board: Board,
  ships: Map<ShipType, Ship>,
  coords: [number, number]
): GenericShotResult {
  const [row, col] = coords
  const cell = board[row][col]

  switch (cell) {
    case 'empty':
      board[row][col] = 'miss'
      return { kind: 'miss', coords }
    case 'miss':
    case 'hit':
      return { kind: 'repeat', coords }
    default: {
      const shipName = cell
      const ship = ships.get(shipName)
      board[row][col] = 'hit'

      if (!ship) {
        return { kind: 'hit', coords, ship: shipName }
      }

      ship.hitCount += 1
      if (ship.hitCount >= ship.size) {
        ships.delete(shipName)
        return { kind: 'sunk', coords, ship: shipName }
      } else {
        ships.set(shipName, ship)
        return { kind: 'hit', coords, ship: shipName }
      }
    }
  }
}

export function playerShot(
  state: GameState,
  coordinates: [number, number]
): { ok: boolean; msg: string; shotResult: string } {
  const outcome = applyShotToBoard(state.enemyBoard, state.enemyShips, coordinates)
  const coordDisplay = coordinateToDisplay(coordinates)

  const message = {
    ok: false,
    msg: 'Something went wrong with applying the shot',
    shotResult: ''
  }

  switch (outcome.kind) {
    case 'miss':
      message.ok = true
      message.msg = `You shot at ${coordDisplay}: You miss!`
      message.shotResult = `Shot at ${coordinates}: Miss!`
      break
    case 'repeat':
      message.ok = false
      message.msg = 'Already shot there, try again'
      message.shotResult = `Shot at ${coordinates}: Already shot there, pick another target.`
      break
    case 'hit':
      message.ok = true
      message.msg = `You shot at ${coordDisplay}: Hit!`
      message.shotResult = `Shot at ${coordinates}: Hit!`
      break
    case 'sunk':
      message.ok = true
      message.msg = `You shot at ${coordDisplay}: Hit! You sunk my ${outcome.ship}!`
      message.shotResult = `Shot at ${coordinates}: Sunk a ${outcome.ship}!`
      break
  }

  return message
}

export function computerTurn(
  state: GameState,
  coord?: [number, number]
): { ok: boolean; msg: string; shotResult: string } {
  const message = {
    ok: false,
    msg: '',
    shotResult: ''
  }
  const validTargets = validCoordinates(state.playerBoard)

  let target: [number, number]
  if (coord) {
    const isValid = validTargets.some(([r, c]) => r === coord[0] && c === coord[1])
    if (!isValid) {
      message.ok = false
      message.msg = `Enemy AI had invalid coordinates ${coord}`
      message.shotResult = `invalid coordinates ${coord}`
    }
    target = coord
  } else {
    target = validTargets[Math.floor(Math.random() * validTargets.length)]
  }

  const outcome = applyShotToBoard(state.playerBoard, state.playerShips, target)
  const coordDisplay = coordinateToDisplay(target)

  switch (outcome.kind) {
    case 'miss':
      message.ok = true
      message.msg = `Enemy shot at ${coordDisplay}: They missed!`
      message.shotResult = `Shot at ${target}: Miss!`
      break
    case 'repeat':
      message.ok = false
      message.msg = 'Enemy tried a coordinate that was already targeted.'
      message.shotResult = 'Already shot there, pick another target.'
      break
    case 'hit':
      message.ok = true
      message.msg = `Enemy shot at ${coordDisplay}: They hit!`
      message.shotResult = `Shot at ${target}: Hit!`
      break
    case 'sunk':
      message.ok = true
      message.msg = `Enemy shot at ${coordDisplay}: They sunk your ${outcome.ship}!`
      message.shotResult = `Shot at ${target}: Sunk a ${outcome.ship}!`
      break
  }

  return message
}
export function placeShipRandomly(
  board: Board,
  shipName: ShipType,
  shipSize: number,
  ships: Map<ShipType, Ship>,
  boardSize: number
) {
  let shipPlaced = false
  while (!shipPlaced) {
    const orientation = Math.floor(Math.random() * 2)
    let x = 0
    let y = 0
    if (orientation === 0) {
      x = Math.floor(Math.random() * (boardSize - shipSize + 1))
      y = Math.floor(Math.random() * boardSize)
    } else {
      x = Math.floor(Math.random() * boardSize)
      y = Math.floor(Math.random() * (boardSize - shipSize + 1))
    }
    if (canPlaceShip(board, boardSize, x, y, shipSize, orientation)) {
      placeShipAt(board, ships, shipName, x, y, shipSize, orientation)
      shipPlaced = true
    }
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
  // placeShipRandomly(state.enemyBoard, 'aircraft carrier', 5, state.enemyShips, state.boardSize)
  // placeShipRandomly(state.enemyBoard, 'battleship', 4, state.enemyShips, state.boardSize)
  placeShipRandomly(state.enemyBoard, 'destroyer', 3, state.enemyShips, state.boardSize)
  placeShipRandomly(state.enemyBoard, 'submarine', 3, state.enemyShips, state.boardSize)
  placeShipRandomly(state.enemyBoard, 'patrol boat', 2, state.enemyShips, state.boardSize)

  // placeShipRandomly(state.playerBoard, 'aircraft carrier', 5, state.playerShips, state.boardSize)
  // placeShipRandomly(state.playerBoard, 'battleship', 4, state.playerShips, state.boardSize)
  placeShipRandomly(state.playerBoard, 'destroyer', 3, state.playerShips, state.boardSize)
  placeShipRandomly(state.playerBoard, 'submarine', 3, state.playerShips, state.boardSize)
  placeShipRandomly(state.playerBoard, 'patrol boat', 2, state.playerShips, state.boardSize)
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

export function coordinateToDisplay(coords: [number, number]): string {
  const letter = String.fromCharCode(65 + coords[1])
  const num = coords[0] + 1
  return `${letter}${num}`
}

export function remainingShips(ships: Map<ShipType, Ship>): boolean {
  if (ships.size === 0) return false
  return true
}

export function validCoordinates(board: Board): [number, number][] {
  const validCoords: [number, number][] = []
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j] !== 'hit' && board[i][j] !== 'miss') {
        validCoords.push([i, j])
      }
    }
  }
  return validCoords
}

export function canPlaceShip(
  board: Board,
  boardSize: number,
  row: number,
  col: number,
  shipSize: number,
  orientation: number
): boolean {
  if (orientation === 0) {
    if (row + shipSize > boardSize) return false
    for (let i = row; i < row + shipSize; i++) {
      if (board[i][col] !== 'empty') return false
    }
  } else {
    if (col + shipSize > boardSize) return false
    for (let i = col; i < col + shipSize; i++) {
      if (board[row][i] !== 'empty') return false
    }
  }
  return true
}

export function placeShipAt(
  board: Board,
  shipMap: Map<ShipType, Ship>,
  shipName: ShipType,
  row: number,
  col: number,
  shipSize: number,
  orientation: number
): void {
  const ship: Ship = { size: shipSize, hitCount: 0 }
  shipMap.set(shipName, ship)
  if (orientation === 0) {
    for (let i = row; i < row + shipSize; i++) board[i][col] = shipName
  } else {
    for (let i = col; i < col + shipSize; i++) board[row][i] = shipName
  }
}

export async function placePlayerShips(state: GameState) {
  const ships: { name: ShipType; size: number }[] = [
    { name: 'aircraft carrier', size: 5 },
    { name: 'battleship', size: 4 },
    { name: 'destroyer', size: 3 },
    { name: 'submarine', size: 3 },
    { name: 'patrol boat', size: 2 }
  ]

  for (const ship of ships) {
    let shipPlaced = false
    const row = 0
    const col = 0
    const orientation = 0

    while (!shipPlaced) {
      // TODO: Implement interactive ship placement with real key input.
      shipPlaced = true
    }
  }
}
