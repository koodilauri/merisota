import { placeShipRandomly } from '../utils/placeShip'
import { GameState } from '../GameState'
import type { Ship, ShipType, Board } from '../types'

const FLEET: { name: ShipType; size: number }[] = [
  { name: 'destroyer', size: 3 },
  { name: 'submarine', size: 3 },
  { name: 'patrol boat', size: 2 }
  // { name: 'battleship', size: 4 },
  // { name: 'aircraft carrier', size: 5 }
]

function clearBoards(state: GameState): void {
  for (let i = 0; i < state.boardSize; i++) {
    for (let j = 0; j < state.boardSize; j++) {
      state.enemyBoard[i][j] = 'empty'
      state.playerBoard[i][j] = 'empty'
    }
  }
  state.enemyShips.clear()
  state.playerShips.clear()
}

function placeFleet(board: Board, ships: Map<ShipType, Ship>, boardSize: number): void {
  for (const { name, size } of FLEET) {
    placeShipRandomly(board, name, size, ships, boardSize)
  }
}

export function initGame(state: GameState): void {
  clearBoards(state)
  placeFleet(state.enemyBoard, state.enemyShips, state.boardSize)
  placeFleet(state.playerBoard, state.playerShips, state.boardSize)
}
