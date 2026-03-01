import { createGameState } from './GameState'
import { initGame } from './systems/initGame'
import { playerShot } from './systems/playerShot'
import { computerTurn } from './systems/computerTurn'
import { placePlayerShips } from './utils/placeShip'
import * as coords from './utils/coords'
import * as ui from './ui'
import { Reader } from './Reader'
import { GameSettings, TurnResult } from './types'
import { getMove } from './ollama'

const systemPrompt = `You are a Battleship AI.

Rules:
- Pick one coordinate form the existing State to fire
- Do not output a coordinate not found in State
- If the previous shot was a hit, try to target nearby coordinates if possible
- DO NOT PICK THE COORDINATE FROM THE PREVIOUS SHOT

Output ONLY valid JSON:
{"shot":[row,col]}
No extra text.`

export async function main(config: GameSettings) {
  let gameOver = false
  let previousEnemyShot = 'Miss'
  let previousPlayerShot = 'Miss'
  const reader = new Reader()
  const state = createGameState(config.boardSize)

  ui.printStartScreen()
  await ui.enterInput('Press any key to start!')

  initGame(state)
  // await placePlayerShips(state)
  // while (true) {
  //   const nextKey = await reader.readNext(['up', 'down', 'left', 'right', 'return', 'space'])
  //   console.log(nextKey)
  // }

  ui.printBoardSection('\nEnemy Board\n', state.enemyBoard, config.hideEnemy)
  ui.printBoardSection('\nPlayer Board\n', state.playerBoard)

  while (!gameOver) {
    // console.log('enter target')
    // const raw2 = await reader.readNextLine()
    let playerTarget: [number, number] | undefined = undefined
    let raw: string | undefined
    if (config.playerAI) {
      playerTarget = await getMove(
        systemPrompt,
        coords.validCoordinates(state.enemyBoard),
        previousPlayerShot
      )
    } else {
      raw = await ui.enterInput('Enter target (e.g. B7): ')
      playerTarget = coords.parseCoordinate(raw, state.boardSize)
    }
    if (playerTarget !== undefined) {
      const playerResult = playerShot(state, playerTarget)
      if (playerResult.ok) {
        previousPlayerShot = playerResult.logMsg
        let computerTurnResult: TurnResult
        let enemyTarget: [number, number] | undefined
        do {
          enemyTarget = undefined
          if (config.enemyAI) {
            enemyTarget = await getMove(
              systemPrompt,
              coords.validCoordinates(state.playerBoard),
              previousEnemyShot
            )
          }
          computerTurnResult = computerTurn(state, enemyTarget)
          if (config.enemyAI && !computerTurnResult.ok && enemyTarget) {
            console.log(
              'Error parsing enemy coordinates. Unknown coordinates from AI:',
              enemyTarget,
              computerTurnResult
            )
          }
        } while (config.enemyAI && !computerTurnResult.ok && enemyTarget)

        const computerShotResult = computerTurnResult.logMsg
        previousEnemyShot = computerShotResult
        if (state.enemyShips.size === 0) gameOver = true
        if (state.playerShips.size === 0) gameOver = true

        ui.printBoardSection('\nEnemy Board\n', state.enemyBoard, config.hideEnemy)
        ui.printBoardSection('\nPlayer Board\n', state.playerBoard)
      }
    } else {
      console.log('Error parsing coordinates. Unknown coordinates:', raw ?? '(none)')
    }
    if (gameOver) {
      ui.gameOverScreen(state)
      console.log(state.gameLog) // testing
      const input = await ui.enterInput('Enter (q) to quit or press Enter for new game.')
      if (input === 'q') {
        console.log('Thanks for playing! See you again.')
        ui.closeInput()
        return
      } else {
        gameOver = false
        initGame(state)
        ui.printBoardSection('\nEnemy Board\n', state.enemyBoard, config.hideEnemy)
        ui.printBoardSection('\nPlayer Board\n', state.playerBoard)
      }
    }
  }
}
