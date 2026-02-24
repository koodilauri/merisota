import { GameState } from '../GameState'
import { applyShotToBoard } from '../utils/applyShot'
import { validCoordinates, coordinateToDisplay } from '../utils/coords'

export function computerTurn(
  state: GameState,
  coord?: [number, number]
): { ok: boolean; msg: string; shotResult: string } {
  const message = {
    ok: false,
    msg: '',
    shotResult: ''
  }
  const validTargets = validCoordinates(state.playerBoard)

  let target: [number, number]
  if (coord) {
    const isValid = validTargets.some(([r, c]) => r === coord[0] && c === coord[1])
    if (!isValid) {
      message.ok = false
      message.msg = `Enemy AI had invalid coordinates ${coord}`
      message.shotResult = `invalid coordinates ${coord}`
    }
    target = coord
  } else {
    target = validTargets[Math.floor(Math.random() * validTargets.length)]
  }

  const outcome = applyShotToBoard(state.playerBoard, state.playerShips, target)
  const coordDisplay = coordinateToDisplay(target)

  switch (outcome.kind) {
    case 'miss':
      message.ok = true
      message.msg = `Enemy shot at ${coordDisplay}: They missed!`
      message.shotResult = `Shot at ${target}: Miss!`
      break
    case 'repeat':
      message.ok = false
      message.msg = 'Enemy tried a coordinate that was already targeted.'
      message.shotResult = 'Already shot there, pick another target.'
      break
    case 'hit':
      message.ok = true
      message.msg = `Enemy shot at ${coordDisplay}: They hit!`
      message.shotResult = `Shot at ${target}: Hit!`
      break
    case 'sunk':
      message.ok = true
      message.msg = `Enemy shot at ${coordDisplay}: They sunk your ${outcome.ship}!`
      message.shotResult = `Shot at ${target}: Sunk a ${outcome.ship}!`
      break
  }

  return message
}
