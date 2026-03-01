import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

import { GameTurn } from '../types'

export function saveGameLog(gameLog: GameTurn[]) {
  const timestamp = formatTimestamp(new Date())

  const filename = `game-log-${timestamp}.json`
  const json = JSON.stringify(gameLog, null, 2)
  const logsDir = join(process.cwd(), 'logs')
  mkdirSync(logsDir, { recursive: true })
  const filepath = join(logsDir, filename)
  writeFileSync(filepath, json)
  writeFileSync(join(logsDir, 'latest-game-log.json'), JSON.stringify(gameLog, null, 2))
  console.log(`Saved: ${filename}`)
}

function formatTimestamp(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    '_' +
    pad(date.getHours()) +
    '-' +
    pad(date.getMinutes()) +
    '-' +
    pad(date.getSeconds())
  )
}
