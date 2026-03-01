import { ShipType, Ship, Board, GameTurn } from './types'

export interface GameState {
  playerShips: Map<ShipType, Ship>
  enemyShips: Map<ShipType, Ship>
  playerBoard: Board
  enemyBoard: Board
  boardSize: number
  playerTargets: [number, number][]
  enemyTargets: [number, number][]
  playerHits: [number, number][]
  enemyHits: [number, number][]
  gameLog: GameTurn[]
  
}

export function createGameState(boardSize: number): GameState {
  const playerShips = new Map<ShipType, Ship>()
  const enemyShips = new Map<ShipType, Ship>()
  const enemyBoard = createBoard(boardSize)
  const playerBoard = createBoard(boardSize)
  return {
    playerShips: playerShips,
    enemyShips: enemyShips,
    enemyBoard: enemyBoard,
    playerBoard: playerBoard,
    boardSize: boardSize,
    playerTargets: [],
    enemyTargets: [],
    playerHits: [],
    enemyHits: [],
    gameLog: []
  }
}

function createBoard(size: number): Board {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 'empty'))
}
