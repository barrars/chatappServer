// socket.js

const { Server } = require('socket.io')
const logger = require('../myLogger')
const Room = require('../models/rooms')
const Rooms = require('../models/rooms')
const { handlejoin } = require('./socketEventHandlers')
class SocketSingleton {
  constructor (server) {
    if (!SocketSingleton.instance && server) {
      logger
        .log('Creating a new instance of SocketSingleton')
      this.initializeServer(server)
      this.rooms = new Map()
      this.initialize()
      SocketSingleton.instance = this
    }

    return SocketSingleton.instance
  }

  initializeServer (server) {
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
    this.io = new Server(server, opts)
    this.rooms = new Map()
    this.registerListeners()
  }

  registerListeners () {
    this.io.on('connection', (socket) => {
      logger.log('A user connected ' + socket.id)

      // make a function called connectionTest to check all sockets in all Rooms and see if the socket is actually connected to the server
      async function connectionTest () {
        logger.log('connectionTest')
        // first aggregate all sockets in all Rooms into an array of unique sockets
        const allSockets = await Rooms.aggregate([
          { $unwind: '$sockets' },
          { $group: { _id: '$sockets' } },
          { $project: { _id: 0, sockets: '$_id' } }
        ])

        logger.log('allSockets', allSockets)
        const disconnectedSockets = allSockets
          .filter(socket => !this.io.sockets.sockets.get(socket.sockets))
          .map(socket => socket.sockets)
        logger.log('disconnectedSockets', disconnectedSockets)
        // get all Rooms
        allSockets.forEach(socket => {
          const id = socket.sockets
          logger.log('socket', socket)
          // logger.log(this.io.sockets.sockets.get(id))
          if (!this.io.sockets.sockets.get(id)) {
            //   // if not connected remove from sockets array
            logger.log('socket not connected')
            Rooms.find({ sockets: id })
              .then(rooms => {
                Rooms.updateMany({ sockets: id }, { $pull: { sockets: id } })
                  .then((doc) => {
                    logger.log('doc', doc)
                    rooms.forEach(room => {
                      logger.log('room', room)
                      // emit to all sockets in room
                      this.io.to(room).emit('left', { room, count: room.sockets.length, from: socket.id })
                      // cb(room, doc.sockets.length, socket.id)
                    })
                    // .catch(err => logger.log(err))
                  })
                  // .catch(err => logger.log(err))
              }
              )
              // .catch(err => logger.log(err))
          }
        })
      }
      connectionTest.bind(this)()

      socket.on('join', handlejoin.bind(null, socket, this.io))

      socket.on('leave', async (room, cb) => {
        try {
          logger.log(`User left room: ${room}`)

          // Remove socket from sockets array in room and get the updated room document
          const updatedRoom = await Room.findOneAndUpdate(
            { name: room },
            { $pull: { sockets: socket.id } },
            { new: true } // This option returns the modified document
          )

          // Check if the room exists and get the count from the updated room document
          if (!updatedRoom) {
            throw new Error(`Room ${room} not found`)
          }
          const count = updatedRoom.sockets.length

          // Make the socket leave the room
          socket.leave(room)

          // Broadcast to all sockets in the room
          this.io.to(room).emit('left', { room, count })

          // If you have a callback, execute it
          cb(room)
        } catch (error) {
          logger.error(`Error handling 'leave' event for room ${room}:`, error)
          // Handle or report the error appropriately
          cb(new Error(`Failed to leave room ${room}`))
        }
      })

      socket.on('sendMessage', ({ message, username, room }) => {
        logger.log('does this trigger? ' + JSON.stringify(room) + ' ' + message)
        // emit receiveMessage to socket

        // this.io.emit('receiveMessage', message)

        this.io.to(room).emit('receiveMessage', message)
      })

      socket.on('disconnect', (cb) => {
        logger.log('user disconnected' + socket.id)
        // find all Rooms with socket.id in sockets array and remove
        Room.updateMany({ sockets: socket.id }, { $pull: { sockets: socket.id } }, { new: true })
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

const instance = new SocketSingleton()

module.exports = {
  getInstance: () => instance,
  initialize: (server) => instance.initializeServer(server)
}

// module.exports = (server) => new SocketSingleton(server)
