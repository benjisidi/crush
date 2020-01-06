class Crush {
  constructor(x, y, squareSize = 20, gridSpacing = 2) {
    this.squareSize = squareSize
    this.gridSpacing = gridSpacing
    this.cols = x
    this.rows = y
    this.grid = []
    this.selected = null
    this.colors = ["red", "green", "blue", "orange", "teal"]
    this.initializeGrid()
  }

  initializeGrid() {
    for (let i = 0; i < this.rows; i++) {
      this.grid.push([])
      for (let j = 0; j < this.cols; j++) {
        this.grid[i].push(random(this.colors))
      }
    }
  }

  drawSquare(col, row, color) {
    fill(color)
    strokeWeight(2)
    if (this.selected && col === this.selected.col && row === this.selected.row) {
      stroke(255)
    } else {
      stroke(0)
    }
    const origin = {
      col: this.squareSize * col + this.gridSpacing * col,
      row: this.squareSize * row + this.gridSpacing * row
    }
    rect(
      origin.col,
      origin.row,
      this.squareSize,
      this.squareSize
    )
  }

  drawGrid() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.drawSquare(j, i, this.grid[i][j] || 0)
      }
    }
  }

  findLines() {
    // First, look for vertical lines
    const lines = []
    let currentColor, count, target
    for (let col = 0; col < this.cols; col++) {
      const colSquares = this.grid.map(row => row[col])
      count = 0
      target = 0
      while (target < this.rows) {
        currentColor = colSquares[target]
        if (colSquares[target + count + 1] === currentColor) {
          count++
          if (count === 2) {
            lines.push({ col, row: target })
            target += 3
            count = 0
          }
        } else {
          count = 0
          target++
        }
      }
    }
    // Now do the same for rows
    for (let row = 0; row < this.rows; row++) {
      const rowSquares = this.grid[row]
      count = 0
      target = 0
      while (target < this.cols) {
        currentColor = rowSquares[target]
        if (rowSquares[target + count + 1] === currentColor) {
          count++
          if (count === 2) {
            lines.push({ col: target, row })
            target += 3
            count = 0
          }
        } else {
          count = 0
          target++
        }
      }
    }
    return lines
  }

  updateGrid() {
    const lines = this.findLines()
    // First remove any squares that need to go
    for (let line of lines) {
      const regionToRemove = this.findConnected(line)
      for (let square of regionToRemove) {
        this.grid[square.row][square.col] = undefined
      }
    }
    // Move squares above downwards
    let squaresMoved
    do {
      squaresMoved = false
      for (let row = 0; row < this.rows - 1; row++) {
        for (let col = 0; col < this.cols; col++) {
          const square = this.grid[row][col]
          if (!this.grid[row + 1][col]) {
            if (this.grid[row][col]) {
              this.grid[row + 1][col] = square
              this.grid[row][col] = undefined
              squaresMoved = true
            }
          }
        }
      }
    } while (squaresMoved)
    // Add new squares in their place
    for (let row = 0; row < this.rows - 1; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!this.grid[row][col]) {
          this.grid[row][col] = random(this.colors)
        }
      }
    }
    this.drawGrid()
  }

  handleClick(e) {
    const targetCol = Math.floor(e.clientX / (this.squareSize + this.gridSpacing))
    const targetRow = Math.floor(e.clientY / (this.squareSize + this.gridSpacing))
    if (this.selected) {
      if (isWithinOne(
        { col: targetCol, row: targetRow },
        { col: this.selected.col, row: this.selected.row })
      ) {
        const targetColor = this.grid[targetRow][targetCol]
        const selectedColor = this.grid[this.selected.row][this.selected.col]
        this.grid[targetRow][targetCol] = selectedColor
        this.grid[this.selected.row][this.selected.col] = targetColor
      }
      this.selected = null
    } else {
      this.selected = { col: targetCol, row: targetRow }
    }
  }

  handleKey(key) {
    if (key === BACKSPACE) {
      this.selected = null
    }
  }

  getColor(square) {
    return this.grid[square.row][square.col]
  }

  /*
  
    0. Add the origin to the squares to check list
    1. While there are squares on the squares to check list:
    2. pick a square, and:
      a. Add any neighbours of the same color to the list
      b. pop the square from the list
      c. add the square to the output
  
  */
  findConnected(origin) {
    const squaresFound = []
    const squaresToCheck = [origin]
    while (squaresToCheck.length) {
      const targetSquare = squaresToCheck[0]
      const neighbours = allWithinOne(targetSquare, this.cols, this.rows)
      for (let neighbour of neighbours) {
        if (this.getColor(targetSquare) === this.getColor(neighbour)) {
          if (!deepIncludes(neighbour, squaresFound)) {
            squaresToCheck.push(neighbour)
          }
        }
      }
      squaresFound.push(targetSquare)
      squaresToCheck.shift()
    }
    return squaresFound
  }

}

const allWithinOne = (target, maxCol, maxRow) => {
  const coords = []
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  for (let direction of directions) {
    const newCoord = { col: target.col + direction[0], row: target.row + direction[1] }
    if (newCoord.col >= 0 && newCoord.row >= 0 && newCoord.col < maxCol && newCoord.row < maxRow) {
      coords.push(newCoord)
    }
  }
  return coords
}

const isWithinOne = (a, b) => {
  return (
    (
      Math.abs(a.col - b.col) === 1 &&
      Math.abs(a.row - b.row) === 0
    ) ||
    (
      Math.abs(a.col - b.col) === 0 &&
      Math.abs(a.row - b.row) === 1
    )
  )
}


// Flawed: deepIncludes({a:1}, [{a:1, b:2}]) returns true 
// Quick and dirty, does what I want
const deepIncludes = (obj, arr) => {
  return arr.some(x => Object.keys(obj).every(key => obj[key] === x[key]))
}