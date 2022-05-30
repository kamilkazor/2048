import Display from "./display";
import waitForDirrection from "./waitForDirrection";

interface GameDataInterface {
  score: number;
  bestScore: number;
  hightTile: number;
  isContinued: boolean;
  board: Board;
}

type Board = Array<CellInterface>[];

interface CellInterface {
  content: null | TileInterface;
  row: number;
  column: number;
}

interface TileInterface {
  id: string;
  value: number;
}

class Game {
  private container;

  private bestScore: number;
  private score: number;
  private points: number;

  private winCondition: number;
  private highTile: number;
  private isContinued: boolean;

  private rows: number;
  private columns: number;
  private board: Board;

  private display: Display;

  constructor(
    container: HTMLElement,
    ) {
    this.container = container;

    this.score = 0;
    this.bestScore = 0;
    this.points = 0;

    this.winCondition = 2048;
    this.highTile = 0;
    this.isContinued = false;
    
    this.rows = 4;
    this.columns = 4;
    this.board = [];
    
    this.display = new Display(
      container, 
      this.startNewGame, 
      this.continueAfterWin, 
      this
      );
  }
  async run() {
    const gameData = localStorage.getItem("gameData");
    gameData ? await this.loadGame(JSON.parse(gameData)) : await this.startNewGame();
    this.gameLoop();
  }
  private async gameLoop() {
    await this.checkWin();
    await this.checkGameOver();
    let dirrection = await waitForDirrection(this.container, this.display.board);
    if(this.checkMove(dirrection)) {
      this.move(dirrection);
      this.updateScore();
      this.createRandomTiles(1);
      await this.display.update();
      this.saveLocalStorage();
    }
    this.gameLoop();
  }
  private saveLocalStorage() {
    const gameData: GameDataInterface = {
      score: this.score,
      bestScore: this.bestScore,
      hightTile: this.highTile,
      isContinued: this.isContinued,
      board: this.board
    }
    localStorage.setItem("gameData", JSON.stringify(gameData));
  }
  private async loadGame(gameData: GameDataInterface) {
    this.score = gameData.score;
    this.bestScore = gameData.bestScore;
    this.highTile = gameData.hightTile;
    this.isContinued = gameData.isContinued;
    this.board = gameData.board;

    this.display.updateBestScore(this.bestScore);
    this.display.updateScore(this.score);
    this.display.drawNewBoard(this.rows, this.columns);

    this.board.forEach((row) => {
      row.forEach((cell) => {
        if(cell.content) {
          const tile = cell.content;
          this.display.addTile(tile.id, tile.value, cell.row, cell.column);
        }
      })
    })

    await this.display.update();
  }
  private async startNewGame() {
    this.score = 0;
    this.highTile = 0;
    this.isContinued = false;
    this.createNewBoard();
    this.createRandomTiles(2);
    this.saveLocalStorage();
    this.display.updateScore(this.score);
    this.display.drawNewBoard(this.rows, this.columns);
    await this.display.update();
  }

  private createNewBoard() {
    this.board = [];
    for(let row = 0; row < this.rows; row++) {
      const boardRow = [];
      for(let column = 0; column < this.columns; column++) {
        const cell = {
          content: null,
          row,
          column
        }
        boardRow.push(cell);
      }
      this.board.push(boardRow);
    }
  }
  private createRandomTiles(numberOfTiles: number) {
    const emptyCells = [];
    for(let row = 0; row < this.rows; row++) {
      for(let column = 0; column < this.columns; column++) {
        const cell = this.board[row][column];
        if(cell.content === null) {
          emptyCells.push(cell);
        }
      }
    }
    for(let tileNumber = 0; tileNumber < numberOfTiles; tileNumber++) {
      if(emptyCells.length === 0) {
        break;
      }
      const randomCellIndex = Math.floor(Math.random() * emptyCells.length);
      const randomCell = emptyCells.splice(randomCellIndex, 1)[0];
      const randomValue = Math.random() < 0.9 ? 2 : 4;
      this.createTile(randomValue, randomCell);
    }
  }
  private createTile(value: number, cell: CellInterface) {
    const id = "tile" + cell.row.toString() + cell.column.toString()+ Date.now().toString();
    const tile: TileInterface = {
      id,
      value
    }
    this.board[cell.row][cell.column].content = tile;
    this.display.addTile(id, value, cell.row, cell.column);
  }
  private moveTile(fromCell: CellInterface, toCell: CellInterface) {
    const tile: TileInterface = fromCell.content!;
    this.board[fromCell.row][fromCell.column].content = null;
    this.board[toCell.row][toCell.column].content = tile;
    this.display.moveTile(tile?.id, toCell.row, toCell.column);
  }
  private mergeTile(fromCell: CellInterface, toCell: CellInterface) {
    const tileToMove: TileInterface = fromCell.content!;
    const tileToRemove: TileInterface = toCell.content!;
    const newValue = tileToMove.value + tileToRemove.value;

    tileToMove.value = newValue;
    this.board[fromCell.row][fromCell.column].content = null;
    this.board[toCell.row][toCell.column].content = tileToMove;

    this.display.moveTile(tileToMove.id, toCell.row, toCell.column);
    this.display.upgradeTile(tileToMove.id, newValue);
    this.display.removeTile(tileToRemove.id);

    this.addPoints(newValue);
    if(newValue > this.highTile) {
      this.highTile = newValue;
    }
  }

  private createLines(dirrection: "RIGHT"|"LEFT"|"TOP"|"BOTTOM") {
    type Line = CellInterface[];
    const linesToMove: Line[] = [];
    switch(dirrection) {
      case "RIGHT":
        for(let row = 0; row < this.rows; row++) {
          const line: Line = [];
          for(let column = this.columns - 1; column >= 0; column--) {
            line.push({...this.board[row][column]})
          }
          linesToMove.push(line);
        }
        break;
      case "LEFT":
        for(let row = 0; row < this.rows; row++) {
          const line: Line = [];
          for(let column = 0; column < this.columns; column++) {
            line.push({...this.board[row][column]})
          }
          linesToMove.push(line);
        }
        break;
      case "TOP":
        for(let column = 0; column < this.columns; column++) {
          const line: Line = [];
          for(let row = 0; row < this.rows; row++) {
            line.push({...this.board[row][column]})
          }
          linesToMove.push(line);
        }
        break;
      case "BOTTOM":
        for(let column = 0; column < this.columns; column++) {
          const line: Line = [];
          for(let row = this.rows - 1; row >= 0; row--) {
            line.push({...this.board[row][column]})
          }
          linesToMove.push(line);
        }
        break;
      default:
        break;
    }
    return linesToMove;
  }
  private loopThroughCells(dirrection: "RIGHT"|"LEFT"|"TOP"|"BOTTOM") {
    const tilesToMove: {fromCell: CellInterface; toCell: CellInterface}[] = [];
    const linesToMove = this.createLines(dirrection);
    linesToMove.forEach((line) => {
      let mergedTiles: TileInterface["id"][] = [];
      for(let index = 0; index < line.length; index++) {
        if(index > 0) {
          const cell = line[index];
          if(cell.content) {
            let lastValidCell: null|CellInterface = null;
            for(let indexToCheck = index - 1; indexToCheck >= 0; indexToCheck--) {
              const cellToCheck = line[indexToCheck];
              if(!cellToCheck.content) {
                lastValidCell = cellToCheck;
              }
              if(cellToCheck.content) {
                if(cellToCheck.content.value === cell.content.value && 
                  !mergedTiles.includes(cellToCheck.content.id)) {
                    mergedTiles.push(cell.content.id);
                    lastValidCell = cellToCheck;
                }
                break;
              }
            }
            if(lastValidCell) {
              tilesToMove.push({fromCell: {...cell}, toCell: {...lastValidCell}});
              lastValidCell.content = {...cell.content};
              cell.content = null;
            }
          }
        }
      }
    })
    return tilesToMove;
  }
  private move(dirrection: "RIGHT"|"LEFT"|"TOP"|"BOTTOM") {
    this.display.animateBoard(dirrection);
    const tilesToMove = this.loopThroughCells(dirrection);
    tilesToMove.forEach((obj) => {
      obj.toCell.content ?
        this.mergeTile(obj.fromCell, obj.toCell) :
        this.moveTile(obj.fromCell, obj.toCell);
    })
  }
  private checkMove(dirrection: "RIGHT"|"LEFT"|"TOP"|"BOTTOM") {
    const tilesToMove = this.loopThroughCells(dirrection);
    return tilesToMove.length > 0 ? true : false;
  }

  private addPoints (valueToAdd: number) {
    this.points += valueToAdd;
  }
  private updateScore() {
    this.score += this.points;
    
    this.points > 0 ? 
    this.display.updateScore(this.score, this.points) : 
    this.display.updateScore(this.score);
    this.points = 0;
    
    if(this.score > this.bestScore) {
      this.bestScore = this.score;
      this.display.updateBestScore(this.bestScore, true);
    }
  }

  private async checkGameOver() {
    if(!this.checkMove("RIGHT") && 
      !this.checkMove("LEFT") && 
      !this.checkMove("TOP") && 
      !this.checkMove("BOTTOM")) {
      await this.display.gameOverNotification();
    }
  }
  private async checkWin() {
    if(this.highTile >= this.winCondition && !this.isContinued) {
      await this.display.winNotification();
    }
  }
  private continueAfterWin() {
    this.isContinued = true;
  }
}


export default Game;