const stateHeader = document.getElementById('stateHeader');
const gameGrid = document.getElementById('gameGrid');
const stateButton = document.getElementById('stateButton');
const roundsElement = document.getElementById('rounds');
const fuelElement = document.getElementById('fuel');
const userScoreElement = document.getElementById('userScore');
const compScoreElement = document.getElementById('compScore');
const winner = document.getElementById('winner');

//each object placed on table is a class
class Submarine {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }
}

class KillerSubmarine {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }
}

class Obstacle {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }
}

class FuelCell {
  constructor(row, col, value) {
    this.row = row;
    this.col = col;
    this.value = value;
  }
}
//keep track of amount and position of item classes
const gameState = {
  playerSubmarine: null,
  killerSubmarines: [],
  obstacles: [],
  fuelCells: [],
  setup: true
};

let rounds = 1;
let fuel = 10;
let userScore = 0;
let compScore = 0;

function init() {
  createGrid();
  setUpState();
}
//creates interactable 10x10 grid
function createGrid() {
  for (let row = 0; row < 10; row++) {
    const tableRow = document.createElement('tr');
    for (let col = 0; col < 10; col++) {
      const tableCell = document.createElement('td');
      tableCell.dataset.row = row;
      tableCell.dataset.col = col;
      tableRow.appendChild(tableCell);
    }
    gameGrid.appendChild(tableRow);
  }
}
//initial state where items can be added and starts game when button is pressed
function setUpState() {
  updateGameInfo();
  stateHeader.textContent = 'Set Up';
  stateButton.innerText = 'Start Game';
  winner.textContent = '';
  gameGrid.addEventListener('click', cellInput);//if sqaure clicked
  stateButton.addEventListener('click', checkSubPlaced);//only proceeds if u is placed
}

//adds letter that has been input
function cellInput(event) {
  const cell = event.target;
  if (cell.tagName !== 'TD') return;//checks its a cell
	if (cell.textContent !== ''){//checks empty
  	alert('There is already an element here');
  	return;
  }
  const input = prompt('Enter object type (5-9, o, u, k):');
  const row = parseInt(cell.dataset.row, 10);
  const col = parseInt(cell.dataset.col, 10);

  if (['5', '6', '7', '8', '9', 'o', 'u', 'k'].includes(input)) {//checks valid input
    if (input === 'u') {
      if (gameState.playerSubmarine == null) {//only adds if sub doesnt exist already
        gameState.playerSubmarine = new Submarine(row, col);
      } else {
        alert('u is already placed');
        return;
      }
    } else if (input === 'k') {
      gameState.killerSubmarines.push(new KillerSubmarine(row, col));
    } else if (input === 'o') {
      gameState.obstacles.push(new Obstacle(row, col));
    } else {
      gameState.fuelCells.push(new FuelCell(row, col, parseInt(input, 10)));
    }
    cell.textContent = input;
  } else {
    alert('Please type 5-9, o, u, k');
  }
}

function checkSubPlaced() {//proceeds if sub is placed
  if (gameState.playerSubmarine !== null) {
    playState();
  } else {
    alert('Please place player submarine (u)');
  }
}

function playState() {
  gameState.setup = false;
  updateGameInfo();
  stateHeader.textContent = 'Game in Progress';
  gameGrid.removeEventListener('click', cellInput);
  stateButton.removeEventListener('click', checkSubPlaced);
  stateButton.innerText = 'End Game';
  document.addEventListener('keydown', playerMove);//senses key down to play round
  stateButton.addEventListener('click', endGameResult);//can end game with button
}


function endGameResult(){//checks score when game is ended to decide winner
  let winningPlayer = '';
  if (userScore < compScore) {
    winningPlayer = 'Computer wins';
  }else if (userScore > compScore) {
    winningPlayer = 'User wins';
  } else {
    winningPlayer = 'Draw';
  }
  gameOverState(winningPlayer);
}

function updateGameInfo() {//updates all scores and also checks win conditions, this is called every turn 
  roundsElement.textContent = rounds;
  fuelElement.textContent = fuel;
  userScoreElement.textContent = userScore;
  compScoreElement.textContent = compScore;

  if (!gameState.setup && (fuel <= 0 || gameState.fuelCells.length === 0 || gameState.killerSubmarines.length === 0)) {//checks when fuel 0 or all fuel cells are gone then compares scores
    let winningPlayer = '';
    if (userScore > compScore || gameState.killerSubmarines.length === 0) {//if no killers user wins
      winningPlayer = 'User wins';
    } else if (userScore < compScore) {
      winningPlayer = 'Computer wins';
    } else {
      winningPlayer = 'Draw';
    }
    gameOverState(winningPlayer);
  }
}

function playerMove(event) {
  const oldRow = gameState.playerSubmarine.row;
  const oldCol = gameState.playerSubmarine.col;
  let newRow = oldRow;
  let newCol = oldCol;

  switch (event.key) {//checks for valid input and changes either column or row accordingly
    case 'a':
      newCol -= 1;
      break;
    case 'd':
      newCol += 1;
      break;
    case 'w':
      newRow -= 1;
      break;
    case 's':
      newRow += 1;
      break;
    default:
      alert('Press a, d, w, or s to move');
      return;
  }

  let moveValid = validMove(newRow, newCol);//checks if there is a parameter that may stop your move and gives corresponding error code
  let isValid = false
  
	switch (moveValid) {
    case 'oob':
      alert('Submarine cannot move outside of the grid');
      break;
    case 'obs':
      alert('There is an obstacle in the way');
      break;
    case 'killer':
      alert('There is a killer submarine this way');
      break;
    case 'valid':
    	isValid = true;
      break;
  }
  
  if(isValid == true){//only continues of move is allowed
  
    gameState.playerSubmarine.row = newRow;
    gameState.playerSubmarine.col = newCol;
		
    //checks if new move was a fuel cell and adds its value to score and fuel amount
    const fuelCellIndex = gameState.fuelCells.findIndex(fuelCell => fuelCell.row === newRow && fuelCell.col === newCol);
    if (fuelCellIndex !== -1) {
      const fuelCellValue = gameState.fuelCells[fuelCellIndex].value;
      gameState.fuelCells.splice(fuelCellIndex, 1);
      userScore += fuelCellValue;
      fuel += fuelCellValue;
    }
		
    //one fuel decreased per move and round incremented
    fuel -= 1;
    rounds += 1;
    updateGameInfo();
		
    //moves u to the new position
    const oldCell = gameGrid.querySelector(`[data-row="${oldRow}"][data-col="${oldCol}"]`);
    oldCell.textContent = '';

    const newCell = gameGrid.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
    newCell.textContent = 'u';
    
    //computer turn
    computerTurn();
    
    //checks if one of the computer k's has moved to the new u square and if it has game over computer win
    if (gameState.killerSubmarines.some(
      killerSubmarine => killerSubmarine.row === gameState.playerSubmarine.row && killerSubmarine.col === gameState.playerSubmarine.col
    )) {
      gameOverState('Computer wins');
    } else {
      updateGameInfo();
    }

  }
}

function gameOverState(winningPlayer){//shows game over and who has won
	stateHeader.textContent = 'Game Over';
  winner.textContent = winningPlayer;
  document.removeEventListener('keydown', playerMove);
  stateButton.removeEventListener('click', endGameResult);
  stateButton.innerText = 'Game Ended';
  stateButton.disabled = true;
}

function computerTurn() {

  gameState.killerSubmarines.forEach((killerSubmarine, index) => {//loops through each killer to give them a specific move
		
    const oldKillerSubmarineCell = gameGrid.querySelector(`[data-row="${killerSubmarine.row}"][data-col="${killerSubmarine.col}"]`);
    oldKillerSubmarineCell.textContent = '';//deletes old k in table
    
    const nextMove = determineNextMove(killerSubmarine);

    gameState.killerSubmarines[index].row = nextMove.row;//moves position in class
    gameState.killerSubmarines[index].col = nextMove.col;
		
    //checks if fuel cell in new cell and adds its value
    const fuelCellIndex = gameState.fuelCells.findIndex(
      (fuelCell) => fuelCell.row === nextMove.row && fuelCell.col === nextMove.col
    );
    if (fuelCellIndex !== -1) {
      const fuelValue = gameState.fuelCells[fuelCellIndex].value;
      compScore += fuelValue;
      gameState.fuelCells.splice(fuelCellIndex, 1);
    }
	//takes all new positions and places k's there
  gameState.killerSubmarines.forEach(killerSubmarine => {
      const killerSubmarineCell = gameGrid.querySelector(`[data-row="${killerSubmarine.row}"][data-col="${killerSubmarine.col}"]`);
      killerSubmarineCell.textContent = 'k';
  	});
  });
}

function determineNextMove(killerSubmarine) {
  const { row: kRow, col: kCol } = killerSubmarine;//current position
  
  const checkFuel = [//all possible positions to check for fueld
  { row: kRow - 1, col: kCol },
  { row: kRow + 1, col: kCol },
  { row: kRow, col: kCol - 1 },
  { row: kRow, col: kCol + 1 },
  { row: kRow - 1, col: kCol - 1 },
  { row: kRow - 1, col: kCol + 1 },
  { row: kRow + 1, col: kCol - 1 },
  { row: kRow + 1, col: kCol + 1 },
];
  for (const move of checkFuel) {//if there is fuel in one of these positions it will go there before moving towards player
      if (gameState.fuelCells.some(fuelCell => fuelCell.row === move.row && fuelCell.col === move.col) && validMove(move.row, move.col) == 'valid') {
        return move;
    }
  }

  const { row: uRow, col: uCol } = gameState.playerSubmarine;
  
  let rowDirection = 0;
  let colDirection = 0;
  
	//works out what direction player is
  if (uRow > kRow) {
    rowDirection = 1;
  } else if (uRow < kRow) {
    rowDirection = -1;
  }

  if (uCol > kCol) {
    colDirection = 1;
  } else if (uCol < kCol) {
    colDirection = -1;
  }
	
  //list of moves that can be taken with at least one axis towards user
  const moves = [
    { row: kRow + rowDirection, col: kCol + colDirection },
    { row: kRow + rowDirection, col: kCol },
    { row: kRow, col: kCol + colDirection },
  ];
	
  //loops through moves and does the first valid one, usually this is diagonal
  for (const move of moves) {
    if (validMove(move.row, move.col)=='valid') {
      return move;
    }
  }
  
  return null;
}
//checks if move is valid and if not outputs an error 
function validMove(row, col) {

  if (row < 0 || row >= 10 || col < 0 || col >= 10) {
    return 'oob';
  }

  if (gameState.obstacles.some(obstacle => obstacle.row === row && obstacle.col === col)) {
    return 'obs';
  }

  if (gameState.killerSubmarines.some(killerSubmarine => killerSubmarine.row === row && killerSubmarine.col === col)) {
    return 'killer';
  }

  return 'valid';
}
init();