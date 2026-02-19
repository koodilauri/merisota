import { Board } from './types'

export function printBoards(board: Board, hidden = false) {
  const header = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  console.log('  ' + header.slice(0, board.length).join(' '))

  let row = ''
  for (const x in board) {
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
