// socket.js

const { Server } = require('socket.io')
const logger = require('../myLogger')
const Room = require('../models/rooms')
const Rooms = require('../models/rooms')
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
        // get all Rooms
        allSockets.forEach(socket => {
          logger.log('socket', socket)
          const id = socket.sockets
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
                      // this.io.to(room).emit('left', { room, count: doc.sockets.length, from: socket.id })
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
            socket.join(room)
            // brodacast to the other sockets in the room that you've joined to update their counts

            this.io.to(room).emit('joined', { room, count: doc.sockets.length, from: socket.id })

            // you're own emitted join event callback will update your local storage
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
