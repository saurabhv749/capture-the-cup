import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
// setup
const socket = io();
const canvas = document.getElementById('game-window');
const scoreBoard = document.getElementById('score')
const GAME_WIDTH = canvas.width
const GAME_HEIGHT = canvas.height
let step = 7
const ctx = canvas.getContext('2d');

//instances
let character = new Image()
character.src = `/assets/char${Math.floor(Math.random()*12+1)}.png`
character.onload = ()=> ctx.drawImage(character,GAME_WIDTH/2,GAME_HEIGHT/2)

let item = new Image()
item.src = `/assets/reward.png`
item.onload = ()=>ctx.drawImage(item,800,800,30,20)

let player = new Player({x:GAME_WIDTH/2,y:GAME_HEIGHT/2,score:0,id:1})
let rewardItem = new Collectible({x:800,y:800,value:10,id:1})
// socket
socket.on('live',data=>{
    rewardItem.x = data.item.x
    rewardItem.y = data.item.y
    player.id = data.user.id
})

socket.on('newReward',data=>{
    rewardItem.x = data.item.x
    rewardItem.y = data.item.y
})
socket.on('users',data=>{
    let rank = player.calculateRank(data)
    scoreBoard.innerText = rank
})
// key input
document.addEventListener('keydown',(e)=>{
    switch(e.key){
        case 'ArrowUp':
        case 'W':
        case 'w':
            player.movePlayer('up',step)
            break
        case 'ArrowDown':
        case 'S':
        case 's':
            player.movePlayer('down',step)
            break
        case 'ArrowLeft':
        case 'A':
        case 'a':
            player.movePlayer('left',step)
            break
        case 'ArrowRight':
        case 'D':
        case 'd':
            player.movePlayer('right',step)
            break
        
    }
})
// redraw
function gameLoop(){
    ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT)
    ctx.drawImage(item,rewardItem.x,rewardItem.y,30,20)
    ctx.drawImage(character,player.x,player.y)

    if(player.collision(rewardItem)){
        socket.emit('collision',{id:player.id})
    }

    requestAnimationFrame(gameLoop)
}

gameLoop()