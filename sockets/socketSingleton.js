// socket.js

const { Server } = require('socket.io')
const logger = require('../myLogger')
const Room = require('../models/rooms')
class SocketSingleton {
  constructor (server) {
    if (!SocketSingleton.instance) {
      logger
        .log('Creating a new instance of SocketSingleton')
      const opts = {
        cors: {
          origin: [process.env.VITE_FRONTEND_HOST],
          // origin: '*',
          credentials: true,
          maxAge: 86400

        },
        reconnect: true,
        timeout: 5000

      }
      // list namespaces

      this.io = new Server(server, opts)
      // use monitorio middleware
      // this.io.use(monitorio({ port: 8000 }))
      this.rooms = new Map() // Create a Map to store room data
      this.initialize()
      SocketSingleton.instance = this
    }

    return SocketSingleton.instance
  }

  initialize () {
    this.io.on('connection', (socket) => {
      logger.log('A user connected ' + socket.id)

      socket.on('join', async (from, room, cb) => {
        logger.log(`request from ${from} to join room ${room}`)
        // await check if room exists and if not create it
        const roomExists = await Room.exists({ name: room })
        logger.log('room exists?', roomExists)
        if (!roomExists) {
          await Room.create({ name: room, sockets: [socket.id] })
        }
        // add socket to sockets array in room
        await Room.findOneAndUpdate({ name: room }, { $addToSet: { sockets: socket.id } }, { new: true })
          .then((doc) => {
            logger.log('doc', doc)
            // emit to all sockets in room
            this.io.to(room).emit('joined', { room, count: doc.sockets.length, from: socket.id })
            cb(room, doc.sockets.length, socket.id)
          })
      })

      socket.on('leave', async (room, cb) => {
        logger.log(`User left room: ${room}`)
        // remove socket from sockets array in room
        await Room.findOneAndUpdate({ name: room }, { $pull: { sockets: socket.id } })
        // get length of sockets in room and set to count
        const count = await Room.findOne({ name: room }).then((doc) => doc.sockets.length)

        // emit to all sockets in room
        this.io.to(room).emit('left', { room, count })
        socket.leave(room)
        cb(room)
      })

      socket.on('sendMessage', ({ message, username, room }) => {
        logger.log('does this trigger? ' + JSON.stringify(room) + ' ' + message)
        // emit receiveMessage to socket

        // this.io.emit('receiveMessage', message)

        this.io.to(room).emit('receiveMessage', message)
      })

      socket.on('disconnect', () => {
        console.log('user disconnected' + socket.id)
        // find all Rooms with socket.id in sockets array and remove
        Room.updateMany({ sockets: socket.id }, { $pull: { sockets: socket.id } })
          .then((doc) => {
            logger.log('doc', doc)
            // emit to all sockets in room
            // this.io.to(room).emit('left', { room, count: doc.sockets.length, from: socket.id })
            // cb(room, doc.sockets.length, socket.id)
          })

        logger.log(`remaining sockets minus ${socket.id}`)
        logger.log('Rooms:', this.rooms)
        // emit to all sockets in this.rooms
        this.rooms.forEach((value, key) => {
          this.io.to(key).emit('left', { room: key, count: value.length })
        })
      })
    })
  }
}

module.exports = (server) => new SocketSingleton(server)
