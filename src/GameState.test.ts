import { describe, expect, test } from 'bun:test'
import { createGameState } from './GameState'

describe('createGameState', () => {
  test('returns state with boardSize 5', () => {
    const state = createGameState()
    expect(state.boardSize).toBe(5)
  })

  test('returns 5x5 enemy and player boards', () => {
    const state = createGameState()
    expect(state.enemyBoard.length).toBe(5)
    expect(state.playerBoard.length).toBe(5)
    state.enemyBoard.forEach(row => expect(row.length).toBe(5))
    state.playerBoard.forEach(row => expect(row.length).toBe(5))
  })

  test('all board cells start as empty', () => {
    const state = createGameState()
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        expect(state.enemyBoard[i][j]).toBe('empty')
        expect(state.playerBoard[i][j]).toBe('empty')
      }
    }
  })

  test('playerShips and enemyShips start empty', () => {
    const state = createGameState()
    expect(state.playerShips.size).toBe(0)
    expect(state.enemyShips.size).toBe(0)
  })
})
