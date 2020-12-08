let fieldSize;
let numberOfMines;
let allCells;
let numberOfHiddenCells;

window.addEventListener('DOMContentLoaded', ()=> {
    fieldSize=10
    numberOfMines=(fieldSize**2/5).toFixed(0)
    numberOfHiddenCells=fieldSize**2
    allCells=fieldSize**2
    generateMinefield()
   // shuffle()
});

function generateMinefield(){
    const mfield=document.querySelector('.minefield')
    mfield.style.gridTemplateRows=`repeat(${fieldSize},30px)`
    mfield.style.gridTemplateColumns=`repeat(${fieldSize},30px)`    
    for (let i=0;i<fieldSize;i++){
        for (let j=0;j<fieldSize;j++){
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
            cell.addEventListener('click', e=>selectField(e.target))
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
    console.log(numberOfMines)
    while (i < numberOfMines) {  
        let posX = getRandomInt(0,fieldSize)
        let posY = getRandomInt(0,fieldSize)
        let pos=`f${posX}-${posY}`
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

function selectField(f){
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
    if(f.classList.contains('hidden'))
        f.classList.toggle('flag')
}

function stepOnMine(f){
    let cells=document.querySelectorAll('.field')
    for(f of cells){
        f.classList.remove('hidden','flag')
    }
    console.log('You have lost...')
}

function checkWin(){
    if (numberOfHiddenCells == numberOfMines) {
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
        if((x>=0 && x<fieldSize) && (y>=0 && y<fieldSize)){
            let selectedCell=document.querySelector(`.f${x}-${y}`)
            if(selectedCell.classList.contains('mine'))
                ++surroundingMines
            else
                res.push(selectedCell)
        }
    })
    f.classList.remove('hidden')
    --numberOfHiddenCells
    if(surroundingMines>0)
        f.textContent=surroundingMines
    else if(res.length>0)
        res.forEach(checkNeighbors)
}

function coordFromClasslist(f){
    let coord=[]
    let cor=f.classList[0].match(/(\d+)-(\d+)/);
    coord.push(parseInt(cor[1]))
    coord.push(parseInt(cor[2]))
    return coord
}

