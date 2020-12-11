const fieldSettingsList = [
    {
        name: "Könnyű",
        diffIndex: 0,
        height: 10,
        width: 10,
        mines: 15
    },
    {
        name: "Közepes",
        diffIndex: 1,
        height: 16,
        width: 16,
        mines: 40
    },
    {
        name: "Nehéz",
        diffIndex: 2,
        height: 16,
        width: 30,
        mines: 99
    }
];
let currentFieldSettings;
let allCells;
let numberOfHiddenCells;
let minefield = [];

let numberOfFlags;
let timeCounter;
let timer;

let gameOver;

let storage;

window.addEventListener('DOMContentLoaded', ()=> {
    storage = window.localStorage;
    init(fieldSettingsList[0]);

    document.getElementById("restart").addEventListener('click', () => {
        settingsIndex = document.getElementById('difficulty').value;
        if (settingsIndex >= 0) {
            init(fieldSettingsList[settingsIndex]);
        }
        else {
            init(getCustomSettings());
        }
    });
    
    document.getElementById("difficulty").onchange = (e) => {
        let customSettingFields = document.querySelectorAll(".custom-setting");
        if (e.target.value == -1) {
            const properties = ["width", "height", "mines"];
            customSettingFields.forEach((elem, index) => {
                elem.classList.remove("hidden");
                elem.lastElementChild.value = currentFieldSettings[properties[index]];
            });
            document.getElementById("show-highscores").classList.add("hidden");

        }
        else {
            customSettingFields.forEach((elem) => {elem.classList.add("hidden");});
            document.getElementById("show-highscores").classList.remove("hidden");
            renderHighscores(e.target.value);
        }
    }
    document.getElementById("width-input").onchange = updateMineInput;
    document.getElementById("height-input").onchange = updateMineInput;
    document.getElementById("mines-input").onchange = updateMineInput;
    document.getElementById("width-input").onwheel = (e) => e.target.focus();
    document.getElementById("height-input").onwheel = (e) => e.target.focus();
    document.getElementById("mines-input").onwheel = (e) => e.target.focus();

    document.getElementById("show-highscores").onclick = showHighscores;

    document.querySelectorAll(".close-button").forEach((button) => button.onclick = closeModal);
});

function getCustomSettings() {
    let settings = {};
    settings.width = document.getElementById("width-input").value;
    settings.height = document.getElementById("height-input").value;
    settings.mines = document.getElementById("mines-input").value;
    settings.diffIndex = null;
    return settings;
}

function updateMineInput() {
    let widthInput = document.getElementById("width-input");
    let heightInput = document.getElementById("height-input");
    let minesInput = document.getElementById("mines-input");

    clamp(widthInput, 10);
    clamp(heightInput, 10);

    let maxMines = widthInput.value * heightInput.value - 10;
    minesInput.max = maxMines;
    clamp(minesInput, Math.max(Math.round(maxMines * 0.2), 1));
}

function clamp(inputNode, def) {
    let val = parseInt(inputNode.value);
    if (isNaN(val)) {
        inputNode.value = def;
        return;
    }
    if (val < inputNode.min) {
        inputNode.value = inputNode.min;
    }
    if (val > inputNode.max) {
        inputNode.value = inputNode.max;
    }
}

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
    renderHighscores(currentFieldSettings.diffIndex);
    generateMinefield();
}

function generateMinefield() {
    const minefieldContainer = document.getElementById("minefield");
    minefieldContainer.classList.remove("game-over");
    clearMinefield();
    minefieldContainer.style = `--rows: ${currentFieldSettings.height}; --columns: ${currentFieldSettings.width};`
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
        checkShownNeighbors(cell);
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
}

function checkWin() {
    if (numberOfHiddenCells == currentFieldSettings.mines) {
        console.log("You have won!")
        for (cell of minefield.flat().filter((cell) => {return cell.state == "hidden";})) { // for all hidden (and not flagged) cells
            toggleFlag(cell);
        };
        stopTimer();
        gameOver = true;
        
        let position = saveHighscore({name: "unnamed", score: timeCounter, date: new Date().toISOString()});
        renderHighscores(currentFieldSettings.diffIndex, position);
        showHighscores();
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

function checkShownNeighbors(cell) {
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

function saveHighscore(scoreObj) {
    if (currentFieldSettings.diffIndex === null)
        return;
    let scores = getAllHighscores();
    let scoresForDiff = [];
    Object.assign(scoresForDiff, scores[currentFieldSettings.diffIndex]);
    let i = 0;
    while ((i < scoresForDiff.length) && (scoreObj.score > scoresForDiff[i].score)) {
        ++i;
    }
    scoresForDiff.splice(i, 0, scoreObj);
    while (scoresForDiff.length > 10) {
        scoresForDiff.pop();
    }
    scores[currentFieldSettings.diffIndex] = scoresForDiff;
    storage.setItem("highscores", JSON.stringify(scores));

    return i;
}

function getAllHighscores() {
    scoresString = storage.getItem("highscores");
    if (scoresString) {
        return JSON.parse(scoresString);
    }
    return Array(fieldSettingsList.length).fill([]);
}

function clearHighscores() {
    storage.removeItem("highscores");
}

function renderHighscores(diffIndex, position = null)
{
    document.getElementById("highscore-diff").innerText = fieldSettingsList[diffIndex].name;

    const scoresContainer = document.getElementById("scores-container");
    for (let child of scoresContainer.querySelectorAll("div:not(.header)")) {
        scoresContainer.removeChild(child);
    }
    scores = getAllHighscores()[diffIndex];
    for (let i in scores) {
        let score = scores[i];
    //    let nameDiv = document.createElement("div");
        let dateDiv = document.createElement("div");
        let scoreDiv = document.createElement("div");
    //    nameDiv.innerText = score.name;
        let sDate = score.date.split(/-|T|Z|:/);
        sDate[3] = `${parseInt(sDate[3]) + 1}`.padStart(2, '0');
        dateDiv.innerText = `${sDate[0]}. ${sDate[1]}. ${sDate[2]}. ${sDate[3]}:${sDate[4]}`;
        scoreDiv.innerText = `${Math.floor(score.score / 60)}:${`${score.score % 60}`.padStart(2, '0')}`;

    //    nameDiv.classList.add("name");
        dateDiv.classList.add("date");
        scoreDiv.classList.add("score");

        if (i == position) {
    //        nameDiv.classList.add("new-score");
            dateDiv.classList.add("new-score");
            scoreDiv.classList.add("new-score");
        }

    //    scoresContainer.appendChild(nameDiv);
        scoresContainer.appendChild(dateDiv);
        scoresContainer.appendChild(scoreDiv);
    }

}
function showHighscores() {
    showModal();
    document.getElementById("highscores-window").classList.remove("hidden");
}

function showModal() {
    document.getElementById("modal-container").classList.remove("hidden");
}
function hideModal() {
    document.getElementById("modal-container").classList.add("hidden");
}
function closeModal(e) {
    e.target.parentNode.classList.add("hidden");
    hideModal();
}