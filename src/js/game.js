let numberofSide;

window.addEventListener('DOMContentLoaded', ()=> {
    numberofSide=10
    generateMinefield()
    shuffle()
});

function generateMinefield(){
    const mfield=document.querySelector('.minefield')
    mfield.style.gridTemplateRows=`repeat(${numberofSide},20px)`
    mfield.style.gridTemplateColumns=`repeat(${numberofSide},20px)`    
    for(let i=0;i<numberofSide;i++){
        for(let j=0;j<numberofSide;j++){
            let fld=document.createElement('div')
            fld.classList.add(`f${i}-${j}`)
            fld.classList.add('field')
            fld.classList.add('hide')
            fld.addEventListener('click', e=>selectField(e.target))
            fld.addEventListener('contextmenu', e=>{
                e.target.classList.toggle('blue')
                e.preventDefault()
            })
            mfield.appendChild(fld)
        }
    }
}

function shuffle(){
    let i=0
    while (i < (numberofSide**2/5)) {        
        let pos=`f${getRandomInt(0,numberofSide)}-${getRandomInt(0,numberofSide)}`
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
    if(f.classList.contains('mine')){
        let fields=document.querySelectorAll('.field')
        for(f of fields){
            f.classList.remove('hide')
            f.classList.remove('blue')
        }
    }else{
        findNeighbors(f)
    }
}

function findNeighbors(f){
    if(!f.classList.contains('hide') || f.classList.contains('blue')) return false
    let cor=coordFromClasslist(f)
    const ar=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
    let mine=0
    let res=[]
    ar.map(d=>{
        let x=cor[0]+d[0]
        let y=cor[1]+d[1]
        if((x>=0 && x<numberofSide) && (y>=0 && y<numberofSide)){
            let sfield=document.querySelector(`.f${x}-${y}`)
            if(sfield.classList.contains('mine')) mine++
            else res.push(sfield)
        }
    })
    f.classList.remove('hide')
    if(mine>0) f.textContent=mine
    else if(res.length>0) res.map(d=> findNeighbors(d))

}

function coordFromClasslist(f){
    let coord=[]
    let cor=f.classList[0].match(/(\d+)-(\d+)/);
    coord.push(parseInt(cor[1]))
    coord.push(parseInt(cor[2]))
    return coord
}

