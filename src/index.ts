import readline from 'readline'

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

console.log(BATTLESHIP_ART)
console.log("         === Let's play BATTLESHIP ===\n")

// enum SHIP_ID {
//   patrol_boat = 1,
//   submarine = 2,
//   destroyer = 3
// }
type ShipType = 'patrol boat' | 'submarine' | 'destroyer'
// type Coordinate = { x: number; y: number }
type CellType = 'empty' | 'hit' | 'miss' | ShipType
// interface Cell {
//   id: string // `${x}:${y}`
//   x: number
//   y: number
//   shipId: number | null
// }
type Board = CellType[][]
type Ship = {
  size: number
  hitCount: number
}
// type ShipRecord = Record<number, Ship>

const playerShips = new Map<ShipType, Ship>()
const enemyShips = new Map<ShipType, Ship>()

const BOARD_SIZE = 5

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
          if (!hidden) row += `# `
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
    let updateShip: Ship | undefined = undefined

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
          updateShip = enemyShips.get(cell)
          if (updateShip) {
            updateShip.hitCount += 1
            if (updateShip.hitCount >= updateShip.size) {
              enemyShips.delete(cell)
              console.log(`Hit! You sunk my ${cell}!`)
            } else {
              enemyShips.set(cell, updateShip)
              console.log(`Hit!`)
            }
          }
          enemyBoard[coordinates[0]][coordinates[1]] = 'hit'
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
    let updateShip: Ship | undefined = undefined
    switch (playerBoard[x][y]) {
      case 'empty':
        playerBoard[x][y] = 'miss'
        validCoordinate = true
        break
      case 'miss':
      case 'hit':
        break
      default:
        updateShip = playerShips.get(playerBoard[x][y])
        if (updateShip) {
          updateShip.hitCount += 1
          if (updateShip.hitCount >= updateShip.size) {
            playerShips.delete(playerBoard[x][y])
            console.log(`I sunk your ${playerBoard[x][y]}!`)
          } else {
            playerShips.set(playerBoard[x][y], updateShip)
          }
        }
        playerBoard[x][y] = 'hit'
        validCoordinate = true
    }
  }
}

function placeShip(board: Board, shipName: ShipType, shipSize: number, ships: Map<ShipType, Ship>) {
  const ship: Ship = {
    size: shipSize,
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
        for (let i = x; i < x + shipSize; i++) {
          board[i][y] = shipName
        }
        ships.set(shipName, ship)
        shipPlaced = true
      }
    } else {
      const x = Math.floor(Math.random() * BOARD_SIZE)
      const y = Math.floor(Math.random() * (BOARD_SIZE - shipSize + 1))
      const shipArea = board[x].slice(y, y + shipSize)
      if (shipArea.every(coordinate => coordinate === 'empty')) {
        for (let i = y; i < y + shipSize; i++) {
          board[x][i] = shipName
        }
        ships.set(shipName, ship)
        shipPlaced = true
      }
    }
    orientation = Math.floor(Math.random() * 2)
  }
}

const enemyBoard = createBoard(BOARD_SIZE)
const playerBoard = createBoard(BOARD_SIZE)
function initGame() {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      enemyBoard[i][j] = 'empty'
      playerBoard[i][j] = 'empty'
    }
  }

  enemyShips.clear()
  playerShips.clear()
  placeShip(enemyBoard, 'destroyer', 3, enemyShips)
  placeShip(enemyBoard, 'submarine', 3, enemyShips)
  placeShip(enemyBoard, 'patrol boat', 2, enemyShips)

  placeShip(playerBoard, 'destroyer', 3, playerShips)
  placeShip(playerBoard, 'submarine', 3, playerShips)
  placeShip(playerBoard, 'patrol boat', 2, playerShips)
}

function remainingShips(ships: Map<ShipType, Ship>): boolean {
  if (ships.size === 0) return false
  return true
}

initGame()
await enterInput('Press Enter to start!')

console.log('\nEnemy Board\n')
printBoards(enemyBoard)
console.log('\nPlayer Board\n')
printBoards(playerBoard)

let exitGame = false
while (!exitGame) {
  while (!gameOver) {
    await playerTurn()
    computerTurn()
    if (!remainingShips(enemyShips)) gameOver = true
    if (!remainingShips(playerShips)) gameOver = true

    console.log('\nEnemy Board\n')
    printBoards(enemyBoard, true)
    console.log('\nPlayer Board\n')
    printBoards(playerBoard)
  }

  console.log('=== GAME OVER ===')
  if (!remainingShips(enemyShips) && !remainingShips(playerShips)) {
    console.log('=== TIE GAME! ===')
  } else {
    if (!remainingShips(enemyShips)) console.log('=== YOU WIN! ===')
    if (!remainingShips(playerShips)) console.log('=== YOU LOSE! ===')
  }
  const input = await enterInput('Press (q) to quit or (n) for new game.')
  if (input === 'q') {
    exitGame = true
  } else {
    gameOver = false
    initGame()
    console.log('\nEnemy Board\n')
    printBoards(enemyBoard)
    console.log('\nPlayer Board\n')
    printBoards(playerBoard)
  }
}
