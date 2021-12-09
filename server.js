require('dotenv').config();
const express = require('express');
const cors= require('cors')
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const http = require('http')
const helmet = require('helmet')

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const Collectible =require('./public/Collectible')

const app = express();

/**
 * socket
 */

let onlineUsers= []
let width = 600,height = 400,value=10
const Server  = http.createServer(app)
const io = socket(Server)


const issueReward = ()=>new Collectible({x:Math.floor(Math.random()*width),y:Math.floor(Math.random()*height),value,id:1})
let item = issueReward()

io.on('connection',sock=>{
  let newUser = {id:sock.id,x:width/2,y:height/2,score:0}
  onlineUsers.push(newUser)
  sock.username  = sock.id
  sock.emit('users',onlineUsers)
  sock.emit('live',{user:newUser,item})

  // 
  sock.on('collision',client=>{
    onlineUsers.map(u=>{
      if(u.id===client.id)
        u.score+=value
    })
    // issue new reward
    item = issueReward()
    io.emit('newReward',{item})
    sock.emit('users',onlineUsers)
  })
  
  sock.once('disconnect',client=>{
    onlineUsers = onlineUsers.filter(u=>u.id!==sock.username)
    sock.emit('users',onlineUsers)    
  })


})


// public
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(cors({
  origin:'*'
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// security 
app.use(helmet.noSniff())
app.use(helmet.xssFilter())
app.use((req, res, next) => {
  res.set('Cache-Control', `no-store, no-cache, must-revalidate, proxy-revalidate`)
  res.set('Surrogate-Control','no-store')
  res.set('pragma','no-cache')
  res.set('expires',0)
  res.set('x-powered-by', 'PHP 7.4.3')
  next()
})

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = Server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
