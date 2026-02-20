export type ShipType = 'patrol boat' | 'submarine' | 'destroyer' | 'battleship' | 'aircraft carrier'
export type CellType = 'empty' | 'hit' | 'miss' | ShipType
export type Board = CellType[][]
export type Ship = {
  size: number
  hitCount: number
}
