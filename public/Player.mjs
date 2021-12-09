class Player {
  constructor({x, y, score, id}) {
    this.id = id
    this.score = score
    this.x = x 
    this.y = y

  }

  movePlayer(dir, speed) {
    
    switch(dir){
      case 'up':
        if(this.y - speed >0)
          this.y-=speed
        break
      case 'down':
        if(this.y + speed < 470 )
          this.y+=speed
        break
      case 'left':
        if(this.x - speed >0)
          this.x -= speed
        break
      case 'right':
        if(this.x+speed < 630)
          this.x +=speed
    }

  }

  collision(item) {
    if((item.x>this.x-20 && item.x<=this.x+20) && (item.y> this.y-20 && item.y < this.y+20))
      return true
    
    return false
  }

  calculateRank(arr) {
    let ranks = arr.sort((a,b)=>b.score-a.score)

    let el = ranks.find(({id}) =>id==this.id)
    if(!el)
      return `Rank: ${arr.length}/${arr.length}`

    let rank = ranks.indexOf(el)+1
    return `Rank: ${rank}/${arr.length}`
  }
}

export default Player;
