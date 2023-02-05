const logger = require('../routes/myLogger')
// const Chats = require('../models/chatModel')
// let io
// let socket

module.exports =
{
  onConnect: async (io, socket) => {
    socket.join('main')

    logger.log('socket ' + socket.id + ' Connected from ' + socket.conn.remoteAddress)
    // socket.emit('message', 'Welcome to the chat')
    socket.on('join', username => {
    // list all namespaces
      // logger.log(io.nsps)
      socket.username = username
      logger.log('join', username)
    })
    socket.onAny((event, ...args) => {
      logger.log(event, args)
    })
    socket.on('join-room', (room, ack) => {
      socket.join(room)
      // logger.log(io._nsps.keys())
      ack({
        msg: 'joined room acknowledgement',
        room
      })
      io.to(room).except(socket).emit('roommsg', `${socket.username} ${socket.id} has joined room ${room}`)
    })

    // const handshake = socket.handshake
    // logger.log({
    //   id,
    //   handshake
    // })
    // const allSockets = await io.allSockets()
    // logger.log({ allSockets })
    // logger.log('socket ' + socket.id + ' Connected from ' + socket.conn.remoteAddress)

    // socket.on('chat', (message) => {
    //   logger.log('message: ' + message)
    //   logger.log(socket.handshake.query.name)
    //   const name = socket.handshake.query.name

    //   logger.log({ message, name })
    //   Chats.create({ message, name })
    //     .then((doc) => {
    //       logger.log(doc)
    //       // io.emit('chat', doc)
    //       io.emit('chat message', doc)
    //     })
    // })
    // io.on('new_namespace', (namespace) => {
    //   logger.log({ namespace })
    // })
    // socket.on('click', (data, ack) => {
    //   logger.log('click', data)
    //   // socketEmit('clack', { msg: 'clack' })
    //   ack({ data })
    // })

    // const rooms = io.of('/').adapter.rooms
    // const sids = io.of('/').adapter.sids
    // const clients = io.of('/').adapter.clients
    // const allRooms = io.of('/').adapter.allRooms
    // logger.log({ rooms, sids })
  }
  // socketEmit: (event, data) => {
  //   if (!io) return
  //   io.emit(event, data)
  // },
  // socketOn: (event, callback) => {
  //   if (!socket) return
  //   socket.on(event, callback)
  // },
  // ioON: (event, callback) => {
  //   if (!io) return
  //   io.on(event, callback)
  // },
  // emitEventTo: (socketId, event, data) => {
  //   const ns = io.of('/')
  //   const mySocket = ns.connected[socketId]
  //   if (!mySocket) return `Socket not found ${socketId}`
  //   mySocket.emit(event, data)
  // }
}
