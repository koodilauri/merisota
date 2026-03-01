import { GameState } from '../GameState'
import { applyShotToBoard } from '../utils/applyShot'
import { coordinateToDisplay, validCoordinates } from '../utils/coords'
import { TurnResult, GenericShotResult } from '../types'

export function playerShot(state: GameState, coords: [number, number]): TurnResult {
  const outcome = applyShotToBoard(state.enemyBoard, state.enemyShips, coords)
  const message = playerShotMsg(outcome, coords)
  updatePlayerState(state, coords, message.logMsg)
  console.log(message.printMsg)

  return message
}

export function playerShotMsg(outcome: GenericShotResult, coordNumbers: [number, number]) {
  const message = {
    ok: false,
    printMsg: 'Something went wrong with applying the shot',
    logMsg: ''
  }
  const coordDisplay = coordinateToDisplay(coordNumbers)

  switch (outcome.kind) {
    case 'miss':
      message.ok = true
      message.printMsg = `You shot at ${coordDisplay}: You miss!`
      message.logMsg = `Miss`
      break
    case 'repeat':
      message.ok = false
      message.printMsg = 'Already shot there, try again'
      message.logMsg = `Repeat`
      break
    case 'hit':
      message.ok = true
      message.printMsg = `You shot at ${coordDisplay}: Hit!`
      message.logMsg = `Hit a ${outcome.ship}`
      break
    case 'sunk':
      message.ok = true
      message.printMsg = `You shot at ${coordDisplay}: Hit! You sunk my ${outcome.ship}!`
      message.logMsg = `Sunk a ${outcome.ship}`
      break
  }
  return message
}

// export function playerTurn(state: GameState, coords: [number, number]): TurnResult {

//   const outcome = applyShotToBoard(state.enemyBoard, state.enemyShips, coords)
//   const message = playerShotMsg(outcome, coords)
//   updatePlayerState(state, coords, message.logMsg)
//   ui.printMessage(message)

//   return message

// }

export function updatePlayerState(
  state: GameState,
  coords: [number, number],
  result: string
): void {
  state.playerHits.push(coords)
  state.playerTargets = validCoordinates(state.enemyBoard)
  state.gameLog.push({
    coords: coords,
    side: 'player',
    result: result
  })
}
