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

        }
      }
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
      console.log('A user connected')

      socket.on('joinRoom', (room, cb) => {
        socket.join(room)
        console.log(`User joined room: ${room}`)
        // Update the rooms map
        if (this.rooms.has(room)) {
          this.rooms.get(room).push(socket.id)
        } else {
          this.rooms.set(room, [socket.id])
        }
        console.log('Rooms:', this.rooms)
        cb(room)
      })

      socket.on('leaveRoom', (room) => {
        socket.leave(room)
        console.log(`User left room: ${room}`)
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
        console.log('Rooms:', this._rooms)
      })

      socket.on('sendMessage', (room, message) => {
        this.io.to(room).emit('receiveMessage', message)
      })

      socket.on('disconnect', () => {
        console.log('A user disconnected')
      })
    })
  }
}

module.exports = (server) => new SocketSingleton(server)
