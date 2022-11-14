
const logger = require('../routes/myLogger')
const Chats = require('../models/chatModel')

let io

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origins: [
          'http://localhost:3000'
        ],
        methods: ['GET', 'POST']
      }
    })
    io.on('connection', async function (socket) {
      console.log(
        'socket ' +
        socket.id +
        ' Connected from ' +
        socket.conn.remoteAddress
      )
      socket.on('chat', (message) => {
        logger.log('message: ' + message)
        logger.log(socket.handshake.query.name)
        const name = socket.handshake.query.name
        Chats.create({ message, name })
          .then((doc) => {
            logger.log(doc)
            // io.emit('chat', doc)
            io.emit('chat message', { message, name })
          })
      })
      socket.on('disconnect', () => {
        console.log('user disconnected!!!!!!!!!!!!!!!!!!!!!!11')
      })
    })
  },
  on: (event, callback) => {
    io.on(event, callback)
  },

  emitEventTo: (socketId, event, data) => {
    const ns = io.of('/')
    const my_socket = ns.connected[socketId]
    if (!my_socket) return `Socket not found ${socketId}`
    my_socket.emit(event, data)
  },
  emit: (event, data) => {
    if (!io) return
    io.emit(event, data)
  },
  io: () => io

}
