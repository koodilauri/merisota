type ShipType = 'patrol boat' | 'submarine' | 'destroyer'
type CellType = 'empty' | 'hit' | 'miss' | ShipType

type Board = CellType[][]
type Ship = {
  size: number
  hitCount: number
}

class Game {
  enemyBoard: Board
  playerBoard: Board
  playerShips: Map<ShipType, Ship>
  enemyShips: Map<ShipType, Ship>

  constructor(boardSize: number) {
    console.log('Game initialized')
    this.enemyBoard = this.createBoard(boardSize)
    this.playerBoard = this.createBoard(boardSize)
    this.playerShips = new Map()
    this.enemyShips = new Map()
  }

  resetGame() {
    for (let i = 0; i < this.enemyBoard.length; i++) {
      for (let j = 0; j < this.enemyBoard.length; j++) {
        this.enemyBoard[i][j] = 'empty'
        this.playerBoard[i][j] = 'empty'
      }
    }
    this.enemyShips.clear()
    this.playerShips.clear()
    
    this.placeShips()
  }

  placeShips() {
    console.log('Placing ships')
  }

  createBoard(boardSize: number = 5): Board {
    return Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => 'empty'))
  }

  playerTurn() {
    console.log('Player turn')
  }

  computerTurn() {
    console.log('Computer turn')
  }

  getResult() {
    console.log('Game result')
  }

  printBoards() {
    console.log('Boards')
  }

  hasShipsLeft() {
    console.log('Has ships left')
  }


}

export default Game

