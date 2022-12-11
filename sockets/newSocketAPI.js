// // const { Socket, Server } = require('socket.io')
// const { Server, Socket } = require('socket.io')
// const logger = require('../routes/myLogger')
// const Chats = require('../models/chatModel')
// const socket = require('./socket')
// let ssocket
// let sio
// /**
//  * @param {Server} io
//  */

// module.exports = io => {
//   sio = io
//   /**
//  * @param {Socket} socket
//  */
//   io.on('connection', socket => {
//     // socket.join('one')
//     // io.to('one').emit('roommsg', 'this is a roommsg')

//     logger.log('socket ' + socket.id + ' Connected from ' + socket.conn.remoteAddress)
//     socket.on('chat', onChat)
//     socket.onAny((event, ...args) => {
//       logger.log(event, args)
//     })
//     socket.on('join-room', room => {
//       socket.join('one')
//       io.to('one').emit('roommsg', 'this a join-room-click')
//     })
//     // socket.on('downloadSong', downloadSong)
//     ssocket = socket
//   })
//   io.of(/^\/dynamic-\d+$/).on('connection', (socket) => {
//     const namespace = socket.nsp
//     logger.log({ namespace })
//   })
// }

// const onChat = (message) => {
//   const name = ssocket.handshake.query.name
//   Chats.create({ message, name })
//     .then((doc) => {
//       sio.emit('chat message', doc)
//     })
// }

// const onProgress = (progress) => {
//   sio.emit('eta', progress)
// }
