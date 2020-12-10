const fieldSettingsList = [
    {
        height: 10,
        width: 10,
        mines: 20
    },
    {
        height: 16,
        width: 16,
        mines: 40
    },
    {
        height: 16,
        width: 30,
        mines: 99
    }
];
let currentFieldSettings;
let allCells;
let numberOfHiddenCells;
let numberOfFlags;
let minefield = [];
let timeCounter;
let timer;
let gameOver;

window.addEventListener('DOMContentLoaded', ()=> {
    init(fieldSettingsList[0]);
    document.getElementById("restart").addEventListener('click', () => {
        settingsIndex = document.getElementById('difficulty').value;
        init(fieldSettingsList[settingsIndex > 0 ? settingsIndex : 0]); /// TODO
    });
});


function init(fieldSettings) {
    gameOver = false;
    currentFieldSettings = fieldSettings;
    allCells = fieldSettings.height * fieldSettings.width;
    numberOfHiddenCells = allCells;
    numberOfFlags = fieldSettings.mines;
    updateFlagCounter();
    timeCounter = 0;
    stopTimer();
    updateTimer();
    generateMinefield();
}

function generateMinefield(){
    const minefieldContainer=document.getElementById("minefield");
    minefieldContainer.classList.remove("game-over");
    clearMinefield();
    minefieldContainer.style.gridTemplateRows=`repeat(${currentFieldSettings.height},40px)`
    minefieldContainer.style.gridTemplateColumns=`repeat(${currentFieldSettings.width},40px)`    
    for (let i = 0; i < currentFieldSettings.height; i++) {
        minefield.push([])
        for (let j=0; j < currentFieldSettings.width; j++) {
            let cellDiv = document.createElement('div');
            let cell = {
                node: cellDiv,      // cell on playing field
                row: i,
                col: j,
                state: "hidden",    // may be "hidden", "shown" or "flagged"
                content: null       // may be null, 0, 1, 2, ..., 8 or "mine"
            }
            cellDiv.classList.add('cell');
            cellDiv.classList.add('hidden');
            cellDiv.addEventListener('click', () => {
                if (!gameOver)
                    selectCell(cell);
            });
            cellDiv.addEventListener('contextmenu', (e) => {
                if (!gameOver)
                    toggleFlag(cell);
                e.preventDefault();
            })
            minefieldContainer.appendChild(cellDiv);
            minefield[i].push(cell);
        }
    }
}

function clearMinefield() {
    const minefieldContainer = document.getElementById("minefield");
    for (let cell of minefield.flat()) {
        minefieldContainer.removeChild(cell.node);
    }
    minefield = [];
}

function shuffle(exclX, exclY){
    let minesPlaced = 0;
    while (minesPlaced < currentFieldSettings.mines) {  
        let posX = getRandomInt(0,currentFieldSettings.width);
        let posY = getRandomInt(0,currentFieldSettings.height);
        let cell = minefield[posY][posX];
        if (cell.content != 'mine' && ((Math.abs(posX - exclX) > 1) || (Math.abs(posY - exclY) > 1))) {
            // cell is unoccupied and is at least 2 cells from the starting cell
            cell.content = 'mine';  // place a mine
            ++minesPlaced;
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function selectCell(cell) {
    if (numberOfHiddenCells == allCells) {
        beginGame(cell);
    }
    if (cell.state == "hidden") {
        checkNeighbors(cell);
    }
    else if (cell.state == "shown") {
        nameTBD(cell);
    }
    checkWin();
}

function beginGame(cell) {
    shuffle(cell.col, cell.row);
    timeCounter = 0;
    startTimer();
}


function stepOnMine(mineCell) {
    const minefieldContainer = document.getElementById("minefield");
    minefieldContainer.classList.add("game-over");
    for (cell of minefield.flat()) {
        if (cell.content == "mine")
        cell.node.classList.add("mine");
    }
    mineCell.node.classList.remove("hidden");
    stopTimer();
    gameOver = true;
    console.log('You have lost...')
}

function checkWin() {
    if (numberOfHiddenCells == currentFieldSettings.mines) {
        console.log("You have won!")
        for (cell of minefield.flat().filter((cell) => {return cell.state == "hidden";})) { // for all hidden (and not flagged) cells
            toggleFlag(cell);
        };
        stopTimer();
        gameOver = true;
    }    
}

function getNeighbors(cell) {
    const neighborDirs = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
    let neighbors = [];
    neighborDirs.forEach (direction => {
        let x = cell.col + direction[0];
        let y = cell.row + direction[1];
        if ((x >= 0 && x < currentFieldSettings.width) && (y >= 0 && y < currentFieldSettings.height)) {
            neighbors.push(minefield[y][x]);
        }
    });
    return neighbors;
}

function nameTBD(cell) {
    let neighbors = getNeighbors(cell);
    let surroundingFlags = 0;
    for (neighbor of neighbors) {
        if (neighbor.state == "flagged")
        ++surroundingFlags;
    }
    if (surroundingFlags == cell.content) {
        neighbors.forEach(checkNeighbors);
    }
}

function checkNeighbors(cell) {
    if (cell.state != "hidden")
        return;
    if (cell.content == 'mine') {
        stepOnMine(cell);
        return;
    }
    let surroundingMines = 0;
    let neighbors = getNeighbors(cell);
    neighbors.forEach (neighbor => {
        if (neighbor.content == 'mine')
        ++surroundingMines;
    })
    cell.state = "shown";
    cell.node.classList.remove('hidden');
    --numberOfHiddenCells;
    if (surroundingMines > 0) {
        cell.node.setAttribute("mines", surroundingMines);
        cell.content = surroundingMines;
    }
    else if (neighbors.length > 0)
    neighbors.forEach(checkNeighbors);
}

function toggleFlag(cell){
    if (cell.state != "shown") {
        if (cell.state != "flagged" && numberOfFlags > 0) {
            --numberOfFlags;
            cell.state = "flagged";
            cell.node.classList.add('flag');
        }
        else if (cell.state == "flagged") {
            cell.state = "hidden";
            ++numberOfFlags;
            cell.node.classList.remove('flag');
        }
    }
    updateFlagCounter();
}

function startTimer() {
    timer = window.setInterval(function() {
        ++timeCounter;
        updateTimer();
    }, 1000);
}

function stopTimer() {
    window.clearInterval(timer);
    updateTimer();
}

function updateFlagCounter() {
    let counter = document.getElementById("counter");
    counter.innerText = numberOfFlags;
}

function updateTimer() {
    let timeDisplay = document.getElementById("timer");
    let minutes = `${Math.floor(timeCounter/60)}`.padStart(2, '0');
    let seconds = `${timeCounter%60}`.padStart(2, '0');
    timeDisplay.innerText = `${minutes}:${seconds}`;
}