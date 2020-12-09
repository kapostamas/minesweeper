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

window.addEventListener('DOMContentLoaded', ()=> {
    fieldSettings = fieldSettingsList[0];
    allCells = fieldSettings.height * fieldSettings.width;
    numberOfHiddenCells = allCells;
    numberOfFlags = fieldSettings.mines;
    updateFlagCounter();
    generateMinefield();
});

function generateMinefield(){
    const mfield=document.querySelector('.minefield')
    mfield.style.gridTemplateRows=`repeat(${fieldSettings.height},40px)`
    mfield.style.gridTemplateColumns=`repeat(${fieldSettings.width},40px)`    
    for (let i = 0; i < fieldSettings.height; i++) {
        for (let j=0; j < fieldSettings.width; j++) {
            let cell=document.createElement('div')
            /*cell = {
                cellDiv: cellDiv,
                col: i,
                row: j,
                state: "hidden"
            }*/
            cell.classList.add(`f${i}-${j}`)
            cell.classList.add('cell')
            cell.classList.add('hidden')
            cell.addEventListener('click', e=>selectCell(e.target))
            cell.addEventListener('contextmenu', e=>{
                toggleFlag(e.target)
                e.preventDefault()
            })
            mfield.appendChild(cell)
        }
    }
}

function shuffle(exclX, exclY){
    let i=0
    while (i < fieldSettings.mines) {  
        let posX = getRandomInt(0,fieldSettings.width)
        let posY = getRandomInt(0,fieldSettings.height)
        let pos=`f${posY}-${posX}`
        let ff=document.querySelector(`.${pos}`)
        if (!ff.classList.contains('mine') && ((Math.abs(posX - exclX) > 1) || (Math.abs(posY - exclY) > 1))) {
            ff.classList.add('mine')
            i++
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function selectCell(f) {
    if (numberOfHiddenCells == allCells) {
        beginGame(f);
    }
    if (!(f.classList.contains('flag'))) {
        if(f.classList.contains('mine'))
            stepOnMine(f)
        else {
            checkNeighbors(f)
        }
    }
    checkWin()
}

function beginGame(f) {
    let coords = coordFromClasslist(f);
    shuffle(coords[0], coords[1]);
    //startTimer();
}

function toggleFlag(f){
    if(f.classList.contains('hidden')) {
        if (!f.classList.contains('flag')) {
            --numberOfFlags;
            f.classList.add('flag');
        }
        else {
            ++numberOfFlags;
            f.classList.remove('flag');
        }
    }
    updateFlagCounter();
}

function stepOnMine(f){
    let cells=document.querySelectorAll('.cell')
    for(f of cells){
        f.classList.remove('hidden','flag')
    }
    console.log('You have lost...')
}

function checkWin(){
    if (numberOfHiddenCells == fieldSettings.mines) {
        console.log("You have won!")
        let hiddenCells = document.getElementsByClassName('hidden');
        for (cell of hiddenCells) {
            if (!cell.classList.contains('flag'))
                toggleFlag(cell);
        };
    }    
}

function checkNeighbors(f){
    if(!f.classList.contains('hidden') || f.classList.contains('flag'))
        return false
    let cor=coordFromClasslist(f)
    const neighbors=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
    let surroundingMines=0
    let res=[]
    neighbors.forEach(d => {
        let x=cor[0]+d[0]
        let y=cor[1]+d[1]
        if ((x >= 0 && x < fieldSettings.width) && (y >= 0 && y < fieldSettings.height)) {
            let selectedCell=document.querySelector(`.f${y}-${x}`)
            if(selectedCell.classList.contains('mine'))
                ++surroundingMines
            else
                res.push(selectedCell)
        }
    })
    f.classList.remove('hidden')
    --numberOfHiddenCells
    if(surroundingMines>0)
        f.setAttribute("mines", surroundingMines);
    else if(res.length>0)
        res.forEach(checkNeighbors)
}

function coordFromClasslist(f){
    let coord=[]
    let cor=f.classList[0].match(/(\d+)-(\d+)/);
    coord.push(parseInt(cor[2]))
    coord.push(parseInt(cor[1]))
    return coord
}

function updateFlagCounter() {
    let counter = document.getElementById("counter");
    counter.innerText = numberOfFlags;
}