const logger = require('../routes/myLogger')
const Chats = require('../models/chatModel')
const { Server, Socket } = require('socket.io')

let io

let socket
module.exports = function (httpServer) {
  io = new Server(httpServer, {
    cors: {
      origins: ['localhost:3000', '*']
    }
  })
  io.on('connection', (sock) => {
    socket = sock
    socket.emit('song', { msg: 'socket~' })
    io.emit('song', { msg: 'io~' })
    logger.log('a user connected')
    logger.log(sock.handshake.query)
    // log all connected sockets
    // logger.log(io.sockets.sockets)
    // logger.log(Object.keys(io.sockets.sockets))
    // logger.log(Array.from(io.sockets.sockets))
    io.sockets.sockets.forEach((socket) => {
      logger.log('1', socket.handshake.query, socket.id)
      // logger.log('2', io.sockets.eventNames())
      // logger.log('3', io.sockets.adapter.rooms)
      // logger.log('3', socket.conn.)
    })
    // logger.log(Object.keys(io.engine.))
    sock.on('chat', (message) => {
      logger.log('message: ' + message)
      logger.log(sock.handshake.query.name)
      const name = sock.handshake.query.name
      Chats.create({ message, name })
        .then((doc) => {
          logger.log(doc)
          // io.emit('chat', doc)
          io.emit('chat message', { message, name })
        })
    })
    // io.emit('allSocketId', io.sockets.clients().connected)
  })
}

module.exports.ioEmit = (event, data) => {
  if (!io) return
  io.emit(event, data)
}

module.exports.socketEmit = (event, data) => {
  logger.log('socketEmit', { event, data })
  // logger.log(socket)
  if (!socket) return
  socket.emit(event, data)
}

// socket.on('disconnect', () => {
//   logger.log('user disconnected')
// })
// socket.on('join', (data) => {
//   logger.log(data)
// })
// socket.on('bish', (msg) => {
//   logger.log('clack: ' + msg)
//   logger.log(socket.handshake.query.name)
// })
// socket.on('chat', (message) => {
//   logger.log('message: ' + message)
//   logger.log(socket.handshake.query.name)
//   const name = socket.handshake.query.name
//   Chats.create({ message, name })
//     .then((doc) => {
//       logger.log(doc)
//       // io.emit('chat', doc)
//       io.emit('chat message', { message, name })
//     })
// })
// socket.on('ping', () => {
//   logger.log('ping')
//   socket.emit('pong')
// })
