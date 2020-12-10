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
let fieldSettings;
let allCells;
let numberOfHiddenCells;
let numberOfFlags;
let minefield = [];

window.addEventListener('DOMContentLoaded', ()=> {
    fieldSettings = fieldSettingsList[0];
    allCells = fieldSettings.height * fieldSettings.width;
    numberOfHiddenCells = allCells;
    numberOfFlags = fieldSettings.mines;
    updateFlagCounter();
    generateMinefield();
});

function generateMinefield(){
    const minefieldContainer=document.querySelector('.minefield');
    minefieldContainer.classList.remove("game-over");
    minefieldContainer.style.gridTemplateRows=`repeat(${fieldSettings.height},40px)`
    minefieldContainer.style.gridTemplateColumns=`repeat(${fieldSettings.width},40px)`    
    for (let i = 0; i < fieldSettings.height; i++) {
        minefield.push([])
        for (let j=0; j < fieldSettings.width; j++) {
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
            cellDiv.addEventListener('click', () => selectCell(cell))
            cellDiv.addEventListener('contextmenu', (e) => {
                toggleFlag(cell)
                e.preventDefault()
            })
            minefieldContainer.appendChild(cellDiv);
            minefield[i].push(cell);
        }
    }
}

function shuffle(exclX, exclY){
    let minesPlaced = 0;
    while (minesPlaced < fieldSettings.mines) {  
        let posX = getRandomInt(0,fieldSettings.width);
        let posY = getRandomInt(0,fieldSettings.height);
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
    if (cell.state != "flagged") {
        if (cell.content == 'mine')
            stepOnMine(cell);
        else {
            checkNeighbors(cell);
        }
    }
    checkWin()
}

function beginGame(cell) {
    shuffle(cell.col, cell.row);
    //startTimer();
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

function stepOnMine(mineCell) {
    const minefieldContainer = document.querySelector(".minefield");
    minefieldContainer.classList.add("game-over");
    for (cell of minefield.flat()) {
        if (cell.content == "mine")
            cell.node.classList.add("mine");
    }
    mineCell.node.classList.remove("hidden");
    console.log('You have lost...')
}

function checkWin() {
    if (numberOfHiddenCells == fieldSettings.mines) {
        console.log("You have won!")
        for (cell of minefield.flat().filter((cell) => {return cell.state == "hidden";})) { // for all hidden (and not flagged) cells
            toggleFlag(cell);
        };
    }    
}


function checkNeighbors(cell) {
    if(cell.state != "hidden")
        return false;
    const neighbors = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
    let surroundingMines = 0;
    let res = [];
    neighbors.forEach (direction => {
        let x = cell.col + direction[0];
        let y = cell.row + direction[1];
        if ((x >= 0 && x < fieldSettings.width) && (y >= 0 && y < fieldSettings.height)) {
            let selectedCell = minefield[y][x];
            if (selectedCell.content == 'mine')
                ++surroundingMines;
            else
                res.push(selectedCell);
        }
    })
    cell.state = "shown";
    cell.node.classList.remove('hidden');
    --numberOfHiddenCells;
    if (surroundingMines > 0) {
        cell.node.setAttribute("mines", surroundingMines);
        cell.content = surroundingMines;
    }
    else if(res.length>0)
        res.forEach(checkNeighbors);
}

function updateFlagCounter() {
    let counter = document.getElementById("counter");
    counter.innerText = numberOfFlags;
}