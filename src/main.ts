import { createGameState } from './GameState'
import * as systems from './systems'
import * as ui from './ui'
import { loadConfig } from './config'

export async function main() {
  let gameOver = false
  const config = loadConfig()
  const state = createGameState(config.boardSize)

  ui.printStartScreen()
  await ui.enterInput('Press any key to start!')

  systems.initGame(state)
  if (process.stdin.isTTY) process.stdin.setRawMode(true)
  await systems.placePlayerShips(state)
  if (process.stdin.isTTY) process.stdin.setRawMode(false)

  ui.printBoardSection('\nEnemy Board\n', state.enemyBoard, config.hideEnemy)
  ui.printBoardSection('\nPlayer Board\n', state.playerBoard)

  while (!gameOver) {
    const raw = await ui.enterInput('Enter target (e.g. B7): ')
    const coords = systems.parseCoordinate(raw, state.boardSize)
    if (coords) {
      const result = systems.playerShot(state, coords)
      if (result.success) {
        console.log(result.msg)
        const computerResult = systems.computerTurn(state)
        console.log(computerResult)
        if (!systems.remainingShips(state.enemyShips)) gameOver = true
        if (!systems.remainingShips(state.playerShips)) gameOver = true

        ui.printBoardSection('\nEnemy Board\n', state.enemyBoard, config.hideEnemy)
        ui.printBoardSection('\nPlayer Board\n', state.playerBoard)
      } else {
        console.log(result.msg)
      }
    } else {
      console.log('Error parsing coordinates. Unknown coordinates:', raw)
    }
    if (gameOver) {
      console.log('=== GAME OVER ===')
      if (!systems.remainingShips(state.enemyShips) && !systems.remainingShips(state.playerShips)) {
        console.log('=== TIE GAME! ===')
      } else {
        if (!systems.remainingShips(state.enemyShips)) console.log('=== YOU WIN! ===')
        if (!systems.remainingShips(state.playerShips)) console.log('=== YOU LOSE! ===')
      }
      const input = await ui.enterInput('Enter (q) to quit or press Enter for new game.')
      if (input === 'q') {
        console.log('Thanks for playing! See you again.')
        ui.closeInput()
        return
      } else {
        gameOver = false
        systems.initGame(state)
        ui.printBoardSection('\nEnemy Board\n', state.enemyBoard, config.hideEnemy)
        ui.printBoardSection('\nPlayer Board\n', state.playerBoard)
      }
    }
  }
}
