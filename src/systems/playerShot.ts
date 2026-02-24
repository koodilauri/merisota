import { GameState } from '../GameState'
import { applyShotToBoard } from '../utils/applyShot'
import { coordinateToDisplay } from '../utils/coords'

export function playerShot(
  state: GameState,
  coordinates: [number, number]
): { ok: boolean; msg: string; shotResult: string } {
  const outcome = applyShotToBoard(state.enemyBoard, state.enemyShips, coordinates)
  const coordDisplay = coordinateToDisplay(coordinates)

  const message = {
    ok: false,
    msg: 'Something went wrong with applying the shot',
    shotResult: ''
  }

  switch (outcome.kind) {
    case 'miss':
      message.ok = true
      message.msg = `You shot at ${coordDisplay}: You miss!`
      message.shotResult = `Shot at ${coordinates}: Miss!`
      break
    case 'repeat':
      message.ok = false
      message.msg = 'Already shot there, try again'
      message.shotResult = `Shot at ${coordinates}: Already shot there, pick another target.`
      break
    case 'hit':
      message.ok = true
      message.msg = `You shot at ${coordDisplay}: Hit!`
      message.shotResult = `Shot at ${coordinates}: Hit!`
      break
    case 'sunk':
      message.ok = true
      message.msg = `You shot at ${coordDisplay}: Hit! You sunk my ${outcome.ship}!`
      message.shotResult = `Shot at ${coordinates}: Sunk a ${outcome.ship}!`
      break
  }

  return message
}
