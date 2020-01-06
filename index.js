let crush

function setup() {
  createCanvas(800, 600)
  crush = new Crush(4, 8, 40, 2)
  frameRate(5)
}


function draw() {
  crush.updateGrid()
}

function mouseClicked(e) {
  crush.handleClick(e)
}

function keyPressed() {
  crush.handleKey(keyCode)
}