import type { Board } from '../types'

export function parseCoordinate(input: string, boardSize: number): [number, number] | undefined {
  const match = input
    .trim()
    .toUpperCase()
    .match(/^([A-J])(10|[1-9])$/)
  if (!match) return undefined

  const col = match[1].charCodeAt(0) - 65
  const row = Number(match[2]) - 1
  if (col > boardSize - 1 || row > boardSize - 1) return undefined
  return [row, col]
}
export function coordinateToDisplay(coords: [number, number]): string {
  const letter = String.fromCharCode(65 + coords[1])
  const num = coords[0] + 1
  return `${letter}${num}`
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
