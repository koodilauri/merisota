import { createGameState } from './GameState'
import * as systems from './systems'
import * as ui from './ui'
import { Reader } from './Reader'
import { GameSettings } from './types'
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
    let playerTarget: [number, number] | undefined = undefined
    let raw: string | undefined
    if (config.playerAI) {
      playerTarget = await getMove(
        systemPrompt,
        systems.validCoordinates(state.enemyBoard),
        previousPlayerShot
      )
    } else {
      raw = await ui.enterInput('Enter target (e.g. B7): ')
      const parsed = systems.parseCoordinate(raw, state.boardSize)
      playerTarget = parsed === null ? undefined : parsed
    }
    if (playerTarget !== undefined) {
      const playerResult = systems.playerShot(state, playerTarget)
      if (playerResult.ok) {
        previousPlayerShot = playerResult.shotResult
        let computerTurnResult: { ok: boolean; msg: string; shotResult: string } | null = null
        do {
          let enemyTarget: [number, number] | undefined = undefined
          if (config.enemyAI) {
            enemyTarget = await getMove(
              systemPrompt,
              systems.validCoordinates(state.playerBoard),
              previousEnemyShot
            )
          }
          computerTurnResult = systems.computerTurn(state, enemyTarget)
          if (config.enemyAI && computerTurnResult === null && enemyTarget) {
            console.log(
              'Error parsing enemy coordinates. Unknown coordinates from AI:',
              JSON.stringify(enemyTarget)
            )
          }
        } while (config.enemyAI && computerTurnResult === null)

        if (!computerTurnResult) {
          // Should not happen for non-AI, but guard just in case.
          console.log('Enemy turn could not be resolved due to invalid coordinates.')
          continue
        }

        const computerMessage = computerTurnResult.msg
        const computerShotResult = computerTurnResult.shotResult
        previousEnemyShot = computerShotResult
        console.log(playerResult.msg)
        console.log(computerMessage)
        if (!systems.remainingShips(state.enemyShips)) gameOver = true
        if (!systems.remainingShips(state.playerShips)) gameOver = true

        ui.printBoardSection('\nEnemy Board\n', state.enemyBoard, config.hideEnemy)
        ui.printBoardSection('\nPlayer Board\n', state.playerBoard)
      } else {
        console.log(playerResult.msg)
      }
    } else {
      console.log('Error parsing coordinates. Unknown coordinates:', raw ?? '(none)')
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
