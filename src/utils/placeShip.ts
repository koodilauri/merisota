import { ShipType, Ship, Board } from '../types'
import { GameState } from '../GameState'

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
