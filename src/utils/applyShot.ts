import { ShipType, Ship, Board, GenericShotResult } from '../types'

export function applyShotToBoard(
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
