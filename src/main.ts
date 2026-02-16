import { createGameState } from './GameState'
import { initGame, enterInput, playerTurn, computerTurn, remainingShips } from './systems'
import { printBoards } from './ui'

export async function main() {
  let gameOver = false
  let exitGame = false
  const state = createGameState()
  initGame(state)
  await enterInput('Press Enter to start!')

  console.log('\nEnemy Board\n')
  printBoards(state.enemyBoard)
  console.log('\nPlayer Board\n')
  printBoards(state.playerBoard)

  while (!exitGame) {
    while (!gameOver) {
      await playerTurn(state)
      computerTurn(state)
      if (!remainingShips(state.enemyShips)) gameOver = true
      if (!remainingShips(state.playerShips)) gameOver = true

      console.log('\nEnemy Board\n')
      printBoards(state.enemyBoard, true)
      console.log('\nPlayer Board\n')
      printBoards(state.playerBoard)
    }

    console.log('=== GAME OVER ===')
    if (!remainingShips(state.enemyShips) && !remainingShips(state.playerShips)) {
      console.log('=== TIE GAME! ===')
    } else {
      if (!remainingShips(state.enemyShips)) console.log('=== YOU WIN! ===')
      if (!remainingShips(state.playerShips)) console.log('=== YOU LOSE! ===')
    }
    const input = await enterInput('Press (q) to quit or (n) for new game.')
    if (input === 'q') {
      exitGame = true
    } else {
      gameOver = false
      initGame(state)
      console.log('\nEnemy Board\n')
      printBoards(state.enemyBoard)
      console.log('\nPlayer Board\n')
      printBoards(state.playerBoard)
    }
  }
}
