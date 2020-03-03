import { Tile } from './tile.js';
import { Listener } from './listener.js';

export class Playground {
  constructor(config) {
    this.columns = config.dimensions.columns;
    this.rows = config.dimensions.rows;
    this.graphic = config.graphic;
    this.matrix = [];
    this.emptyCellsList = [];
    this.tileGoalValue = 2048;
    this.paused = true;
    this.initListeners();
  }

  startNewGame() {
    this.gameIsWon = false;
    this.initMatrix();
    for (let i = 0; i < 2; i++) {
      this.addNewTile();
    }
    this.paused = false;
  }

  initListeners() {
    const listener = new Listener();
    listener.onLeft = () => { this.move('left') };
    listener.onUp = () => { this.move('up') };
    listener.onRight = () => { this.move('right') };
    listener.onDown = () => { this.move('down') };
    listener.initKeyboardListener();
    listener.initSwipeListener();
  }

  initMatrix() {
    this.matrix = [...Array(this.rows)].map((row, rowIndex) => {
      return [...Array(this.columns)].map((column, columnIndex) => {
        this.emptyCellsList.push({'row': rowIndex, 'column': columnIndex});
      }).fill(null);
    });

    this.graphic.init({
      rows: this.rows,
      columns: this.columns,
    });
  }

  createTile() {
    const value = Math.random() >= 0.1? 2 : 4;
    return new Tile(value);
  }

  addNewTile() {
    if (0 === this.emptyCellsList.length) {
      throw new Error('No empty cells');
    }
    const tile = this.createTile();
    const randomEmptyCellIndex = Math.floor(Math.random() * Math.floor(this.emptyCellsList.length));
    const randomEmptyCell = this.emptyCellsList.splice(randomEmptyCellIndex, 1)[0];
    this.matrix[randomEmptyCell.row][randomEmptyCell.column] = tile;

    this.graphic.add({
      value: tile.value,
      coords: randomEmptyCell,
    });
  }

  moveTile(config) {
    const from = config.from;
    const to = config.to;
    this.matrix[to.row][to.column] = this.matrix[from.row][from.column];
    this.matrix[from.row][from.column] = null;

    const indexToDelete = this.emptyCellsList.findIndex(cell => {
      return cell.row === to.row && cell.column === to.column;
    });
    if (-1 !== indexToDelete) {
      this.emptyCellsList.splice(indexToDelete, 1);
    }
    this.emptyCellsList.push(from);

    this.graphic.move(config);
  }

  doubleTile(tileCoords) {
    const tile = this.matrix[tileCoords.row][tileCoords.column];
    tile.double();

    this.graphic.update({
      value: tile.value,
      coords: tileCoords,
    });

    if (this.tileGoalValue === tile.value && !this.gameIsWon) {
      this.gameIsWon = true;
      this.paused = true;
      this.graphic.winningNotification().then(() => {
        this.paused = false;
      });
    }
  }

  moveHelper(config) {
    const outer = config.outer;
    const inner = config.inner;
    let moved = false;
    let currentCoords;
    let comparedCoords;
    let currentTile;
    let comparedTile;
    for (let outerIndex = 0; outerIndex < outer.iterationsNumber; outerIndex++) {
      for (let innerIndex = inner.beginning; innerIndex !== inner.end; innerIndex = inner.modifier(innerIndex)) {
        currentCoords = {
          [outer.name]: outerIndex,
          [inner.name]: innerIndex,
        };
        for (let compared = innerIndex + inner.offset; compared !== inner.end + inner.offset; compared = inner.modifier(compared)) {
          comparedCoords = { ...currentCoords, [inner.name]: compared };
          currentTile = this.matrix[currentCoords.row][currentCoords.column];
          comparedTile = this.matrix[comparedCoords.row][comparedCoords.column];
          if (comparedTile) {
            if (currentTile) {
              if (currentTile.value === comparedTile.value) {
                this.doubleTile(comparedCoords);
                this.moveTile({
                  from: comparedCoords,
                  to: currentCoords,
                });
                if (!moved) {
                  moved = true;
                }
              }
              break;
            }
            this.moveTile({
              from: comparedCoords,
              to: currentCoords,
            });
            if (!moved) {
              moved = true;
            }
          }
        }
      }
    }
    return moved;
  }

  moveLeft() {
    return this.moveHelper({
      outer: {
        name: 'row',
        iterationsNumber: this.rows,
      },
      inner: {
        name: 'column',
        beginning: 0,
        end: this.columns - 1,
        modifier: index => ++index,
        offset: 1,
      },
    });
  }

  moveUp() {
    return this.moveHelper({
      outer: {
        name: 'column',
        iterationsNumber: this.columns,
      },
      inner: {
        name: 'row',
        beginning: 0,
        end: this.rows - 1,
        modifier: index => ++index,
        offset: 1,
      },
    });
  }

  moveRight() {
    return this.moveHelper({
      outer: {
        name: 'row',
        iterationsNumber: this.rows,
      },
      inner: {
        name: 'column',
        beginning: this.columns - 1,
        end: 0,
        modifier: index => --index,
        offset: -1,
      },
    });
  }

  moveDown() {
    return this.moveHelper({
      outer: {
        name: 'column',
        iterationsNumber: this.columns,
      },
      inner: {
        name: 'row',
        beginning: this.rows - 1,
        end: 0,
        modifier: index => --index,
        offset: -1,
      },
    });
  }

  move(direction) {
    if (this.paused) {
      return false;
    }
    const moved = (() => {
      switch (direction) {
        case 'up':
          return this.moveUp();
        case 'right':
          return this.moveRight();
        case 'down':
          return this.moveDown();
        case 'left':
          return this.moveLeft();
        default:
          throw new Error('Unknown movement direction');
      }
    })();
    if (moved) {
      this.addNewTile();

      if (!this.checkForMoves()) {
        this.paused = true;
        this.graphic.losingNotification().then(() => {
          this.paused = false;
          this.startNewGame();
        });
      }
    }
  }

  checkForMoves() {
    if (0 !== this.emptyCellsList.length) {
      return true;
    }
    let currentCell;
    let nextCell;
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        currentCell = this.matrix[row][column];
        if (currentCell) {
          if (column < this.columns - 1) {
            nextCell = this.matrix[row][column + 1];
            if (nextCell && currentCell.value === nextCell.value) {
              return true;
            }
          }
          if (row < this.rows - 1) {
            nextCell = this.matrix[row + 1][column];
            if (nextCell && currentCell.value === nextCell.value) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}
