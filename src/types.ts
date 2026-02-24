export type ShipType = 'patrol boat' | 'submarine' | 'destroyer' | 'battleship' | 'aircraft carrier'
export type CellType = 'empty' | 'hit' | 'miss' | ShipType
export type Board = CellType[][]
export type Ship = {
  size: number
  hitCount: number
}
export type GameSettings = {
  enemyAI: boolean
  playerAI: boolean
  boardSize: number
  hideEnemy: boolean
  ollamaBaseURL: string
  ollamaModel: string
}

export type GenericShotResult =
  | {
      kind: 'miss' | 'repeat'
      coords: [number, number]
    }
  | {
      kind: 'hit' | 'sunk'
      coords: [number, number]
      ship: ShipType
    }

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type ChatOptions = {
  model: string
  temperature?: number
  stream?: boolean
}
