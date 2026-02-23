import { createGameState } from './GameState'
import * as systems from './systems'
import * as ui from './ui'
import { Reader } from './Reader'
import { GameSettings } from './types'
import { getMove } from './ollama'

const systemPrompt = `You are the Enemy Battleship AI.

Rules:
- Pick one coordinate form the existing State to fire
- Do not output a coordinate not in State

Output ONLY valid JSON:
{"shot":[row,col]}
No extra text.`

export async function main(config: GameSettings) {
  let gameOver = false
  let previousShot = 'Miss'
  const reader = new Reader()
  const state = createGameState(config.boardSize)

  ui.printStartScreen()
  await ui.enterInput('Press any key to start!')

  systems.initGame(state)
  await systems.placePlayerShips(state)
  // while (true) {
  //   const nextKey = await reader.readNext(['up', 'down', 'left', 'right', 'return', 'space'])
  //   console.log(nextKey)
  // }

  ui.printBoardSection('\nEnemy Board\n', state.enemyBoard, config.hideEnemy)
  ui.printBoardSection('\nPlayer Board\n', state.playerBoard)

  while (!gameOver) {
    // console.log('enter target')
    // const raw2 = await reader.readNextLine()
    const raw = await ui.enterInput('Enter target (e.g. B7): ')
    const coords = systems.parseCoordinate(raw, state.boardSize)
    if (coords) {
      const result = systems.playerShot(state, coords)
      if (result.success) {
        console.log(result.msg)
        let target = undefined
        if (config.enemyAI) target = await getMove(systemPrompt, systems.validCoordinates(state.playerBoard), previousShot)
        const [computerResult, prevShot] = systems.computerTurn(state, target)
        previousShot = prevShot
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
