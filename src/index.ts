import readline from 'readline'

console.log("=== Let's play BATTLESHIP ===\n")

type Cell = 'empty' | 'ship' | 'hit' | 'miss'

type Board = Cell[][]

const BOARD_SIZE = 5
// const SHIPS = [3, 2, 2]

function createBoard(size: number): Board {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 'empty'))
}

let gameOver = false

function printBoards(board: Board, hidden = false) {
  const header = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  console.log('  ' + header.slice(0, BOARD_SIZE).join(' '))

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
        case 'ship':
          if (hidden) row += '~ '
          if (!hidden) row += '# '
          break
        default:
          row += '~ '
      }
    }
    console.log(row)
    row = ''
  }
}

function parseCoordinate(input: string): [number, number] | null {
  const match = input
    .trim()
    .toUpperCase()
    .match(/^([A-J])(10|[1-9])$/)
  if (!match) return null

  const col = match[1].charCodeAt(0) - 65
  const row = Number(match[2]) - 1
  if (col > BOARD_SIZE - 1 || row > BOARD_SIZE - 1) return null
  return [row, col]
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function enterInput(message: string): Promise<string> {
  return new Promise(resolve => rl.question(message, resolve))
}

async function playerTurn() {
  let validCoordinate = false
  while (!validCoordinate) {
    const input = await enterInput('Enter target (e.g. B7): ')
    const coordinates = parseCoordinate(input)

    if (coordinates) {
      switch (enemyBoard[coordinates[0]][coordinates[1]]) {
        case 'empty':
          enemyBoard[coordinates[0]][coordinates[1]] = 'miss'
          console.log('You miss!')
          validCoordinate = true
          break
        case 'miss':
          console.log('Already shot here, try again')
          break
        case 'hit':
          console.log('Already shot here, try again')
          break
        case 'ship':
          enemyBoard[coordinates[0]][coordinates[1]] = 'hit'
          console.log('You hit an enemy ship!')
          validCoordinate = true
          break
      }
    } else {
      console.log('Error parsing coordinates, please try again. Unknown coordinates:', input)
    }
  }
}

function computerTurn() {
  let validCoordinate = false
  while (!validCoordinate) {
    const x = Math.floor(Math.random() * BOARD_SIZE)
    const y = Math.floor(Math.random() * BOARD_SIZE)
    switch (playerBoard[x][y]) {
      case 'empty':
        playerBoard[x][y] = 'miss'
        validCoordinate = true
        break
      case 'ship':
        playerBoard[x][y] = 'hit'
        validCoordinate = true
        break
      case 'miss':
        break
      case 'hit':
        break
    }
  }
}

function placeShip(board: Board) {
  const x = Math.floor(Math.random() * BOARD_SIZE)
  const y = Math.floor(Math.random() * BOARD_SIZE)

  board[x][y] = 'ship'
}

const enemyBoard = createBoard(BOARD_SIZE)
const playerBoard = createBoard(BOARD_SIZE)
placeShip(enemyBoard)
placeShip(playerBoard)

function remainingShips(board: Board): boolean {
  for (const row of board) {
    if (row.includes('ship')) return true
  }
  return false
}

await enterInput('Press Enter to start!')

console.log('\nEnemy Board\n')
printBoards(enemyBoard, true)
console.log('\nPlayer Board\n')
printBoards(playerBoard)

while (!gameOver) {
  await playerTurn()
  if (!remainingShips(enemyBoard)) gameOver = true
  computerTurn()
  if (!remainingShips(playerBoard)) gameOver = true

  console.log('\nEnemy Board\n')
  printBoards(enemyBoard, true)
  console.log('\nPlayer Board\n')
  printBoards(playerBoard)
}

console.log('=== GAME OVER ===')
if (!remainingShips(enemyBoard)) console.log('=== YOU WIN! ===')
if (!remainingShips(playerBoard)) console.log('=== YOU LOSE! ===')
