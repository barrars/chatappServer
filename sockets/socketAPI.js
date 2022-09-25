
const { Server } = require('socket.io')
const logger = require('../routes/myLogger')

module.exports = function (httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origins: ['localhost:3000']
    }
  })

  io.on('connection', (socket) => {
    logger.log('a user connected')
    logger.log(socket.handshake.query)

    socket.on('disconnect', () => {
      logger.log('user disconnected')
    })
    socket.on('join', (msg) => {
      // logger.log(Socket)
      logger.log('message: ' + msg)
    })
    socket.on('bish', (msg) => {
      // logger.log(Socket)
      logger.log('clack: ' + msg)
      logger.log(socket.handshake.query.name)
    })
  })
}
