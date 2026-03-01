import { GameState } from '../GameState'
import { applyShotToBoard } from '../utils/applyShot'
import { validCoordinates, coordinateToDisplay } from '../utils/coords'
import { TurnResult, Board, GenericShotResult } from '../types'

export function computerTurn(state: GameState, coord?: [number, number]): TurnResult {
  let coordNumbers: [number, number]

  if (coord) {
    const msg = checkAiTarget(state.playerBoard, coord)
    if (msg.ok) {
      coordNumbers = coord
    } else {
      return msg
    }
  } else {
    coordNumbers = pickRandomTarget(state.playerBoard)
  }

  const outcome = applyShotToBoard(state.playerBoard, state.playerShips, coordNumbers)
  const message = shotOutcomeMsg(outcome, coordNumbers)

  return message
}

export function checkAiTarget(board: Board, coord: [number, number]): TurnResult {
  const validTargets = validCoordinates(board)

  const isValid = validTargets.some(([r, c]) => r === coord[0] && c === coord[1])
  if (!isValid)
    return {
      ok: false,
      printMsg: `Enemy AI had invalid coordinates ${coord}`,
      logMsg: `invalid coordinates ${coord}`
    }
  else {
    return {
      ok: true,
      printMsg: `AI coordinates are valid ${coord}`,
      logMsg: `valid coordinates ${coord}`
    }
  }
}

export function pickRandomTarget(board: Board) {
  const validTargets = validCoordinates(board)
  return validTargets[Math.floor(Math.random() * validTargets.length)]
}

export function shotOutcomeMsg(
  outcome: GenericShotResult,
  coordNumbers: [number, number]
): TurnResult {
  const message = {
    ok: false,
    printMsg: '',
    logMsg: ''
  }

  const coordDisplay = coordinateToDisplay(coordNumbers)

  switch (outcome.kind) {
    case 'miss':
      message.ok = true
      message.printMsg = `Enemy shot at ${coordDisplay}: They missed!`
      message.logMsg = `Shot at ${coordNumbers}: Miss!`
      break
    case 'repeat':
      message.ok = false
      message.printMsg = 'Enemy tried a coordinate that was already targeted.'
      message.logMsg = 'Already shot there, pick another target.'
      break
    case 'hit':
      message.ok = true
      message.printMsg = `Enemy shot at ${coordDisplay}: They hit!`
      message.logMsg = `Shot at ${coordNumbers}: Hit!`
      break
    case 'sunk':
      message.ok = true
      message.printMsg = `Enemy shot at ${coordDisplay}: They sunk your ${outcome.ship}!`
      message.logMsg = `Shot at ${coordNumbers}: Sunk a ${outcome.ship}!`
      break
  }
  return message
}
