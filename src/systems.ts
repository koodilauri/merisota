import { GameState } from './GameState'
import { ShipType, Ship, Board } from './types'
import readline from 'readline'

export function playerShot(
  state: GameState,
  coordinates: [number, number]
): { success: boolean; msg: string } {
  let updateShip: Ship | undefined = undefined

  const cell = state.enemyBoard[coordinates[0]][coordinates[1]]
  switch (cell) {
    case 'empty':
      state.enemyBoard[coordinates[0]][coordinates[1]] = 'miss'
      return { success: true, msg: `You shot at ${coordinateToDisplay(coordinates)}: You miss!` }
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
          return {
            success: true,
            msg: `You shot at ${coordinateToDisplay(coordinates)}: Hit! You sunk my ${cell}!`
          }
        } else {
          state.enemyShips.set(cell, updateShip)
          return { success: true, msg: `You shot at ${coordinateToDisplay(coordinates)}: Hit!` }
        }
      }
  }
  return { success: false, msg: 'Something went wrong with applying the shot' }
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
        msg = `Enemy shot at ${coordinateToDisplay([x, y])}: They missed!`
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
            msg = `Enemy shot at ${coordinateToDisplay([x, y])}: They sunk your ${coordinates}!`
          } else {
            state.playerShips.set(coordinates, updateShip)
            msg = `Enemy shot at ${coordinateToDisplay([x, y])}: They hit!`
          }
        }
        validCoordinate = true
    }
  }
  return msg
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
  placeShipRandomly(state.enemyBoard, 'aircraft carrier', 5, state.enemyShips, state.boardSize)
  placeShipRandomly(state.enemyBoard, 'battleship', 4, state.enemyShips, state.boardSize)
  placeShipRandomly(state.enemyBoard, 'destroyer', 3, state.enemyShips, state.boardSize)
  placeShipRandomly(state.enemyBoard, 'submarine', 3, state.enemyShips, state.boardSize)
  placeShipRandomly(state.enemyBoard, 'patrol boat', 2, state.enemyShips, state.boardSize)

  placeShipRandomly(state.playerBoard, 'aircraft carrier', 5, state.playerShips, state.boardSize)
  placeShipRandomly(state.playerBoard, 'battleship', 4, state.playerShips, state.boardSize)
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
  const ships = [
    { name: 'aircraft carrier', size: 5 },
    { name: 'battleship', size: 4 },
    { name: 'destroyer', size: 3 },
    { name: 'submarine', size: 3 },
    { name: 'patrol boat', size: 2 }
  ]

  for (const ship of ships) {
    let shipPlaced = false
    let row = 0
    let col = 0
    let orientation = 0

    while (!shipPlaced) {
      const key =  null//await readKey()
      switch (key) {
        case 'up':
          col++
          break
        case 'down':
          col--
          break
        case 'left':
          row--
          break
        case 'right':
          row++
          break
        case 'space':
          orientation = 1 - orientation
          break
        case 'enter':
          if (canPlaceShip(state.playerBoard, state.boardSize, row, col, ship.size, orientation)) {
            placeShipAt(
              state.playerBoard,
              state.playerShips,
              ship.name,
              row,
              col,
              ship.size,
              orientation
            )
          }
      }
      shipPlaced = true
    }
  }
}
