
// const logger = require('../routes/myLogger')
// const Chats = require('../models/chatModel')
// // const { io } = require('./socket')
// let io = require('socket.io')
// let thisSocket

// module.exports = {
//   init: (server) => {
//     io = io(server, {
//       cors: {
//         origins: [
//           'http://localhost:3000'
//         ],
//         methods: ['GET', 'POST']
//       }
//     })

//     io.on('connection', function (socket) {
//       thisSocket = socket
//       logger.log(
//         'socket ' +
//         socket.id +
//         ' Connected from ' +
//         socket.conn.remoteAddress +
//         ' name' + socket.username
//       )

//       socket.on('join-room', (room, cb) => {
//         logger.log('join-room', room)
//         socket.join('one')
//         io.to('one').emit('roommsg', 'this is a roommsg')
//         // eslint-disable-next-line n/no-callback-literal
//         cb(`joined room ${room}`)
//       })
//       socket.on('chat', (message) => {
//         logger.log('message: ' + message)
//         logger.log(socket.handshake.query.name)
//         const name = socket.handshake.query.name
//         Chats.create({ message, name })
//           .then((doc) => {
//             logger.log(doc)
//             io.emit('chat message', { message, name })
//           })
//       })
//       socket.on('disconnect', () => {
//         logger.log('user disconnected!!!!!!!!!!!!!!!!!!!!!!11')
//       })
//     })
//     // io.of(/^\/dynamic-\d+$/).on('connection', (socket) => {
//     //   logger.log('dynamic namespace')
//     //   const namespace = socket.nsp
//     //   logger.log({ namespace })
//     // })
//   },
//   on: (event, callback) => {
//     io.on(event, callback)
//   },

//   emitEventTo: (socketId, event, data) => {
//     const ns = io.of('/')
//     const mySocket = ns.connected[socketId]
//     if (!mySocket) return `Socket not found ${socketId}`
//     mySocket.emit(event, data)
//   },
//   /* emits to all connected clients */
//   emit: (event, data) => {
//     if (!io) return
//     io.emit(event, data)
//   },
//   socket: (event, data) => {
//     if (!io) return
//     thisSocket.emit(event, data)
//   },

//   io: () => io

// }
