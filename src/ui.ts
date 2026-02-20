import readline from 'readline'

import { Board } from './types'

export function printBoardSection(title: string, board: Board, hidden = false) {
  const header = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  console.log(title)
  console.log('   ' + header.slice(0, board.length).join(' '))

  let row = ''
  for (const x in board) {
    if (Number(x) < 9) row += ' '
    row += `${Number(x) + 1} `
    for (const y of board[x]) {
      switch (y) {
        case 'miss':
          row += '0 '
          break
        case 'hit':
          row += 'X '
          break
        case 'empty':
          row += '~ '
          break
        default:
          if (hidden) row += '~ '
          if (!hidden) row += `# `
      }
    }
    console.log(row)
    row = ''
  }
}

const BATTLESHIP_ART = `
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                   ║
║    ██████╗  █████╗ ████████╗████████╗██╗     ██████╗███████╗██╗  ██╗██╗██████╗    ║
║    ██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██║     ██╔═══╝██╔════╝██║  ██║██║██╔══██╗   ║
║    ██████╔╝███████║   ██║      ██║   ██║     █████╗ ███████╗███████║██║██████╔╝   ║
║    ██╔══██╗██╔══██║   ██║      ██║   ██║     ██╔══╝ ╚════██║██╔══██║██║██╔═══╝    ║
║    ██████╔╝██║  ██║   ██║      ██║   ███████╗██████╗███████║██║  ██║██║██║        ║
║    ╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═════╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ║
║                                                                                   ║
║                        ~ ~ ~ ~ ~   NAVAL COMBAT  ~ ~ ~ ~ ~                        ║
║                                                                                   ║
╚═══════════════════════════════════════════════════════════════════════════════════╝
`

export function printStartScreen() {
  console.log(BATTLESHIP_ART)
  console.log("         === Let's play BATTLESHIP ===\n")
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

export function enterInput(message: string): Promise<string> {
  return new Promise(resolve => rl.question(message, resolve))
}

export function closeInput(): void {
  rl.close()
}