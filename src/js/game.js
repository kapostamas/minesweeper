let fieldSides;
let numberOfMines;

window.addEventListener('DOMContentLoaded', ()=> {
    fieldSides=4
    numberOfMines=(fieldSides**2/5).toFixed(0) 
    generateMinefield()
    shuffle()
});

function generateMinefield(){
    const mfield=document.querySelector('.minefield')
    mfield.style.gridTemplateRows=`repeat(${fieldSides},20px)`
    mfield.style.gridTemplateColumns=`repeat(${fieldSides},20px)`    
    for(let i=0;i<fieldSides;i++){
        for(let j=0;j<fieldSides;j++){
            let cell=document.createElement('div')
            cell.classList.add(`f${i}-${j}`)
            cell.classList.add('field')
            cell.classList.add('hide')
            cell.addEventListener('click', e=>selectField(e.target))
            cell.addEventListener('contextmenu', e=>{
                toggleFlag(e.target)
                e.preventDefault()
            })
            mfield.appendChild(cell)
        }
    }
}

function shuffle(){
    let i=0
    console.log(numberOfMines)
    while (i < numberOfMines) {        
        let pos=`f${getRandomInt(0,fieldSides)}-${getRandomInt(0,fieldSides)}`
        let ff=document.querySelector(`.${pos}`)
        if(!ff.classList.contains('mine')){
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
    if(f.classList.contains('mine')) stepOnMine(f)
    else{
        f.classList.remove('flag')
        checkNeighbors(f)
    }
    checkWin()
}

function toggleFlag(f){
    if(f.classList.contains('hide'))
        f.classList.toggle('flag')
}

function stepOnMine(f){
    let fields=document.querySelectorAll('.field')
    for(f of fields){
        f.classList.remove('hide','flag')
    }
    console.log('You have lost...')
}

function checkWin(){
    let countHide=document.querySelectorAll('.hide')
    let countFlag=document.querySelectorAll('.flag')
    if(countHide.length==numberOfMines && countFlag.length==numberOfMines)
        console.log("You have won!")
}

function checkNeighbors(f){
    if(!f.classList.contains('hide') || f.classList.contains('flag')) return false
    let cor=coordFromClasslist(f)
    const ar=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
    let mine=0
    let res=[]
    ar.map(d=>{
        let x=cor[0]+d[0]
        let y=cor[1]+d[1]
        if((x>=0 && x<fieldSides) && (y>=0 && y<fieldSides)){
            let sfield=document.querySelector(`.f${x}-${y}`)
            if(sfield.classList.contains('mine')) mine++
            else res.push(sfield)
        }
    })
    f.classList.remove('hide')
    if(mine>0) f.textContent=mine
    else if(res.length>0) res.map(checkNeighbors)
}

function coordFromClasslist(f){
    let coord=[]
    let cor=f.classList[0].match(/(\d+)-(\d+)/);
    coord.push(parseInt(cor[1]))
    coord.push(parseInt(cor[2]))
    return coord
}

