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
        reconnect: true

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
      logger.log('A user connected')

      socket.on('join', (room, cb) => {
        let count
        if (!room) return
        socket.join(room)
        logger.log(`User joined room: ${room}`)
        // Update the rooms map
        if (this.rooms.has(room) && !this.rooms.get(room).includes(socket.id)) {
          // If the room exists, add the socket id to the array if it's not already there
          this.rooms.get(room).push(socket.id)
          count = this.rooms.get(room).length
        } else {
          // If the room doesn't exist, create it and add the socket id to the set
          this.rooms.set(room, [socket.id])
          count = 1
        }
        logger.log('Rooms:', this.rooms)
        // socket.emit('joined', { room, count })
        // eslint-disable-next-line n/no-callback-literal
        cb({ room, count })
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
        // list all sockets connected to socket.io server

        logger.log('A user disconnected')
        // Remove the socket id from all rooms it's in
        this.rooms.forEach((value, key) => {
          const socketIndex = value.indexOf(socket.id)
          if (socketIndex > -1) {
            value.splice(socketIndex, 1)
            // Remove the room from the map if it's empty
            if (value.length === 0) {
              this.rooms.delete(key)
            }
          }
        } // end forEach
        )
      })
    })
  }
}

module.exports = (server) => new SocketSingleton(server)
