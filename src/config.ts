import { parseArgs } from "util"

export function loadConfig() {
  const config = {
    boardSize: 5,
    hideEnemy: true
  }
  
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      'board-size': { type: "string" },
      'show-enemies': { type: "boolean" },
    },
    strict: true,
    allowPositionals: true,
  })
  
  if (values['board-size']) {
    if (Number(values['board-size']) > 10) config.boardSize = 10
    else config.boardSize = Number(values['board-size'])
  }
  if (values['show-enemies']) {
    config.hideEnemy = false
  }
  return config

}