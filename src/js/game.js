initGame();



function initGame() { 
    let maxx=20   
    generateMinefield(10,10)
    shuffle(10,10,10)
}

function generateMinefield(x,y){
    const mfield=document.querySelector('.minefield')
    mfield.style.gridTemplateRows=`repeat(${x}, 40px)`
    mfield.style.gridTemplateColumns=`repeat(${y}, 40px)`    
    for(let i=0;i<x;i++){
        for(let j=0;j<y;j++){
            let fld=document.createElement('div')
            fld.classList.add(`f${i}-${j}`)
            fld.classList.add('field')
            fld.classList.add('hide')
            fld.addEventListener('click',(e)=>selectField(e.target))
            mfield.appendChild(fld)
        }
    }
}



function shuffle(minex,miney,minesNumber){
    const mf=document.querySelector('.minefield')
    let mines=mf.querySelectorAll('.mine')
    for (n of mines){
        n.classList.remove('mine')
    }
    let i=0
    while (i < minesNumber) {        
        let pos=`f${getRandomInt(0,minex)}-${getRandomInt(0,miney)}`
        let ff=mf.querySelector(`.${pos}`)
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
    if(f.classList.contains('hide'))
        f.classList.contains('mine') ? console.log('Bumm!') : findNeighbors(f)
}


function findNeighbors(f){
    let b=0;
    let cor=coordFromClasslist(f)
    const ar=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
    let mine=0
    let sfield
    let res=[]
    ar.map(d=>{
        let x=cor.x+d[0]
        let y=cor.y+d[1]
        if((x>=0 && x<20) && (y>=0 && y<20) && f.classList.contains('hide')){
            sfield=document.querySelector(`.f${x}-${y}`)
            console.log(`.f${x}-${y}`)
            if(sfield.classList.contains('mine')){
                mine++
            }else{ 
                if(!res.includes(sfield))
                sfield.textContent=b++
                res.push(sfield)
            }
        }
    })
    f.classList.remove('hide')
    console.log(res.length)
    if(mine>0){
        f.textContent=mine
    }else{
        findNeighbors(sfield)
        /*res.map(d=>{
            findNeighbors(d)
            //d.classList.remove('hide')
        })*/
    }

}

function coordFromClasslist(f){
    let coord={}
    let cor=f.classList[0].match(/(\d+)-(\d+)/);
    coord.x=parseInt(cor[1])
    coord.y=parseInt(cor[2])
    return coord
}

