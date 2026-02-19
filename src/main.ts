import { createGameState } from './GameState'
import * as systems from './systems'
import * as ui from './ui'

export async function main() {
  let gameOver = false
  // let exitGame = false
  const state = createGameState()
  systems.initGame(state)
  ui.printStartScreen()
  await systems.enterInput('Press any key to start!')

  console.log('\nEnemy Board\n')
  ui.printBoards(state.enemyBoard)
  console.log('\nPlayer Board\n')
  ui.printBoards(state.playerBoard)

  while (!gameOver) {
    const raw = await systems.enterInput('Enter target (e.g. B7): ')
    const coords = systems.parseCoordinate(raw, state.boardSize)
    if (coords) {
      const result = systems.playerShot(state, coords)
      if (result.success) {
        console.log(result.msg)
        const computerResult = systems.computerTurn(state)
        console.log(computerResult)
        if (!systems.remainingShips(state.enemyShips)) gameOver = true
        if (!systems.remainingShips(state.playerShips)) gameOver = true

        console.log('\nEnemy Board\n')
        ui.printBoards(state.enemyBoard, true)
        console.log('\nPlayer Board\n')
        ui.printBoards(state.playerBoard)
      } else {
        console.log('Error parsing coordinates. Unknown coordinates:', raw)
      }
    }
    if (gameOver) {
      console.log('=== GAME OVER ===')
      if (!systems.remainingShips(state.enemyShips) && !systems.remainingShips(state.playerShips)) {
        console.log('=== TIE GAME! ===')
      } else {
        if (!systems.remainingShips(state.enemyShips)) console.log('=== YOU WIN! ===')
        if (!systems.remainingShips(state.playerShips)) console.log('=== YOU LOSE! ===')
      }
      const input = await systems.enterInput('Enter (q) to quit or press Enter for new game.')
      if (input === 'q') {
        console.log('Thanks for playing! See you again.')
        systems.closeInput()
        return
      } else {
        gameOver = false
        systems.initGame(state)
        console.log('\nEnemy Board\n')
        ui.printBoards(state.enemyBoard)
        console.log('\nPlayer Board\n')
        ui.printBoards(state.playerBoard)
      }
    }
  }
}
