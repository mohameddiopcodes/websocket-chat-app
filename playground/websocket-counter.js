const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

//put on server
io.on('connection', (socket) => {
  console.log('New WebSocket Connection')
  socket.emit('countUpdated', count)
  socket.on('increment', () => {
    count++
    //socket.emit('countUpdated', count)
    io.emit('countUpdated', count)
  })
})

//put on client
const socket = io()

socket.on('countUpdated', (count) => {
  console.log('count updated', count)
})

document.getElementById('increment')
  .addEventListener('click', () => {
  socket.emit('increment')
})
