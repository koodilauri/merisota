import { ShipType, Ship, Board } from './types'

export interface GameState {
  playerShips: Map<ShipType, Ship>
  enemyShips: Map<ShipType, Ship>
  playerBoard: Board
  enemyBoard: Board
  boardSize: number
}
const BOARD_SIZE = 5

export function createGameState(): GameState {
  const playerShips = new Map<ShipType, Ship>()
  const enemyShips = new Map<ShipType, Ship>()
  const enemyBoard = createBoard(BOARD_SIZE)
  const playerBoard = createBoard(BOARD_SIZE)
  return {
    playerShips: playerShips,
    enemyShips: enemyShips,
    enemyBoard: enemyBoard,
    playerBoard: playerBoard,
    boardSize: BOARD_SIZE
  }
}

function createBoard(size: number): Board {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 'empty'))
}
