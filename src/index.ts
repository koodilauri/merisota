import { main } from './main'
import { parseArgs } from 'util'
import { GameSettings } from './types'

export function loadSettings(): GameSettings {
  const config: GameSettings = {
    enemyAI: false,
    boardSize: 5,
    hideEnemy: true,
    ollamaBaseURL: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'llama3.1'
  }

  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      'board-size': { type: 'string' },
      'show-enemies': { type: 'boolean' },
      'enemy-ai': { type: 'boolean' },
      'ollama-url': { type: 'string' },
      'ollama-model': { type: 'string' }
    },
    strict: true,
    allowPositionals: true
  })

  if (values['board-size']) {
    if (Number(values['board-size']) > 10) config.boardSize = 10
    else config.boardSize = Number(values['board-size'])
  }
  if (values['show-enemies']) {
    config.hideEnemy = false
  }
  if (values['enemy-ai']) {
    config.enemyAI = true
  }
  if (values['ollama-url']) {
    config.ollamaBaseURL = String(values['ollama-url'])
  }
  if (values['ollama-model']) {
    config.ollamaModel = String(values['ollama-model'])
  }
  return config
}

main(loadSettings())
