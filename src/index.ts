import readline from 'readline'

console.log("=== Let's play BATTLESHIP ===\n")

type ShipType = 'patrol boat' | 'submarine' | 'destroyer'
type Coordinate = { x: number; y: number }
type Cell = 'empty' | 'hit' | 'miss' | number
type Board = Cell[][]
type ShipInfo = {
  owner: 'player' | 'computer'
  type: ShipType
  length: number
  cells: Coordinate[]
  hitCount: number
}
type ShipRecord = Record<number, ShipInfo>

// const ships: ShipInfo[] = []
const BOARD_SIZE = 5
const ships: ShipRecord = {}

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
        case 'empty':
          row += '~ '
          break
        default:
          if (hidden) row += '~ '
          if (!hidden) row += `${y} `
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
      const cell = enemyBoard[coordinates[0]][coordinates[1]]
      switch (cell) {
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
        default:
          console.log(ships[cell])
          ships[cell].cells
          // enemyBoard[coordinates[0]][coordinates[1]] = 'hit'
          // console.log('You hit an enemy ship!')
          validCoordinate = true
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
      case 'hit':
        break
    }
  }
}

function placeShip(
  board: Board,
  shipName: ShipType,
  shipSize: number,
  shipId: number,
  owner: 'player' | 'computer'
) {
  const ship: ShipInfo = {
    owner: owner,
    type: shipName,
    length: shipSize,
    cells: [],
    hitCount: 0
  }
  let shipPlaced = false
  let orientation = Math.floor(Math.random() * 2)
  while (!shipPlaced) {
    if (orientation === 0) {
      const x = Math.floor(Math.random() * (BOARD_SIZE - shipSize + 1))
      const y = Math.floor(Math.random() * BOARD_SIZE)
      const shipArea = board
        .map(row => row.slice(y, y + 1))
        .flat()
        .slice(x, x + shipSize)
      if (shipArea.every(coordinate => coordinate === 'empty')) {
        console.log(shipArea, orientation)
        for (let i = x; i < x + shipSize; i++) {
          board[i][y] = shipId
          ship.cells.push({ x: i, y: y })
          console.log(i, y, shipName)
        }
        ships[shipId] = ship
        shipPlaced = true
      }
    } else {
      const x = Math.floor(Math.random() * BOARD_SIZE)
      const y = Math.floor(Math.random() * (BOARD_SIZE - shipSize + 1))
      const shipArea = board[x].slice(y, y + shipSize)
      if (shipArea.every(coordinate => coordinate === 'empty')) {
        console.log(shipArea, orientation)
        for (let i = y; i < y + shipSize; i++) {
          board[x][i] = shipId
          ship.cells.push({ x: x, y: i })
          console.log(x, i, shipName)
        }
        ships[shipId] = ship
        shipPlaced = true
      }
    }
    orientation = Math.floor(Math.random() * 2)
  }
}

const enemyBoard = createBoard(BOARD_SIZE)
const playerBoard = createBoard(BOARD_SIZE)

placeShip(enemyBoard, 'destroyer', 3, 0, 'computer')
placeShip(enemyBoard, 'destroyer', 3, 1, 'computer')
placeShip(enemyBoard, 'patrol boat', 2, 2, 'computer')

placeShip(playerBoard, 'destroyer', 3, 3, 'player')
placeShip(playerBoard, 'destroyer', 3, 4, 'player')
placeShip(playerBoard, 'patrol boat', 2, 5, 'player')

function remainingShips(board: Board): boolean {
  for (const row of board) {
    if (row.includes('ship')) return true
  }
  return false
}

await enterInput('Press Enter to start!')

console.log('\nEnemy Board\n')
printBoards(enemyBoard)
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
