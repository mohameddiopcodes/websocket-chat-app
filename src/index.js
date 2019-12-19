const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const app = express()
const port = process.env.PORT || 3000
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const Filter = require('bad-words')

const server = http.createServer(app)
const io = socketio(server)

app.use(express.static('public'))

let count = 0

io.on('connection', (socket) => {
  console.log('New WebSocket Connection')

  socket.on('join', ({username, room}, callback) => {
    const { error, user } = addUser({id: socket.id, username, room})

    if(error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('Welcome!', 'Chat App'))
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`, 'Chat App'))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    callback()
  })

  socket.on('message', (msg, callback) => {
    const user = getUser(socket.id)
    const filter = new Filter
    if(filter.isProfane(msg)) {
      return callback('profanity is not allowed')
    }
    io.to(user.room).emit('message', generateMessage(msg, user.username))
    callback()
  })

  socket.on('location', (loc, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateMessage(`https://google.com/maps?q=${loc.latitude},${loc.longitude}`, user.username))
    callback()
  })

  socket.on('disconnect', () => {
    const { error, user } = removeUser(socket.id)
    if(!error) {
    io.to(user.room).emit('message', generateMessage(`${user.username} has left`, 'Chat App'))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    }
  })
})

server.listen(port, () => {
  console.log('listening on port ' + port)
})
