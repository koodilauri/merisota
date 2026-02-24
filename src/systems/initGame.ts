import { placeShipRandomly } from '../utils/placeShip'
import { GameState } from '../GameState'

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
