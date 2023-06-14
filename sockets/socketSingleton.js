// socket.js

const { Server } = require('socket.io')
const logger = require('../myLogger')

class SocketSingleton {
  constructor (server) {
    if (!SocketSingleton.instance) {
      logger
        .log('Creating a new instance of SocketSingleton')
      const opts = {
        cors: {
          origin: [process.env.FRONTEND_HOST, process.env.VITE_FRONTEND_HOST],
          credentials: true,
          maxAge: 86400

        },
        reconnect: true,
        timeout: 5000

      }
      // list namespaces

      this.io = new Server(server, opts)
      this.rooms = new Map() // Create a Map to store room data
      this.initialize()
      SocketSingleton.instance = this
    }

    return SocketSingleton.instance
  }

  initialize () {
    // Set up namespaces and rooms
    this.io.on('connection', (socket) => {
      logger.log('A user connected ' + socket.id)

      socket.on('join', (from, room, cb) => {
        logger.log(`request from ${from} to join room ${room}`)
        let count
        if (!room) return
        socket.join(room)
        // Update the rooms map
        logger.log(`do we have this room? ${this.rooms.has(room)}}`)
        logger.log(`is this socket in the rooom? ${socket.id} ${this.rooms.get(room)}`)
        logger.log(`is this socket in the room already? ${this.rooms.get(room)?.includes(socket.id)}`)
        const alreadInRoom = this.rooms.get(room)?.includes(socket.id)
        if (this.rooms.has(room) && !alreadInRoom) {
          logger.log(`User joined room: ${room}`)
          // If the room exists, add the socket id to the array if it's not already there
          this.rooms.get(room).push(socket.id)
          count = this.rooms.get(room).length
        } else {
          // If the room doesn't exist, create it and add the socket id to the set
          logger.log(`User created: ${room}`)
          this.rooms.set(room, [socket.id])
          count = 1
        }
        logger.log('Rooms:', this.rooms)
        // emit to all sockets in room
        this.io.to(room).emit('joined', { room, count, from })

        // socket.emit('joined', { room, count })
        // eslint-disable-next-line n/no-callback-literal
        cb(room, count, from)
      })

      socket.on('leaveRoom', (room) => {
        socket.leave(room)
        logger.log(`User left room: ${room}`)
        if (this._rooms.has(room)) {
          const socketIndex = this._rooms.get(room).indexOf(socket.id)
          if (socketIndex > -1) {
            this._rooms.get(room).splice(socketIndex, 1)

            // Remove the room from the map if it's empty
            if (this._rooms.get(room).length === 0) {
              this._rooms.delete(room)
            }
          }
        }
        logger.log('Rooms:', this._rooms)
      })

      socket.on('sendMessage', ({ message, username, room }) => {
        logger.log('does this trigger? ' + JSON.stringify(room) + ' ' + message)
        // emit receiveMessage to socket

        // this.io.emit('receiveMessage', message)

        this.io.to(room).emit('receiveMessage', message)
      })

      socket.on('disconnect', () => {
        console.log('user disconnected' + socket.id)
        // get all connected sockets
        // const sockets = Object.keys(this.io.sockets.sockets)
        // logger.log('all socket its remaining', sockets, sockets.length)
        // // if sockets length is 0, then remove all sockets from all rooms
        // if (sockets.length === 0) {
        //   logger.log('no sockets remaining, removing all sockets from all rooms')
        //   this.rooms.clear()
        //   logger.log('Rooms:', this.rooms)
        // }
        // remove socket from all rooms

        this.rooms.forEach((value, key) => {
          const socketIndex = value.indexOf(socket.id)
          if (socketIndex > -1) {
            value.splice(socketIndex, 1)
            // Remove the room from the map if it's empty
            if (value.length === 0) {
              this.rooms.delete(key)
            }
          }
        })
        logger.log(`remaining sockets minus ${socket.id}`)
        logger.log('Rooms:', this.rooms)
      })
    })
  }
}

module.exports = (server) => new SocketSingleton(server)
