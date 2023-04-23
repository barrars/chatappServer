// roomHandler.js

const logger = require('../myLogger')
const socketSingleton = require('./socketSingleton')

// const socketSingleton = require('./socket')
function showRooms () {
  // Get the rooms map
  const rooms = socketSingleton().rooms

  // Iterate over the rooms and sockets
  for (const [room, sockets] of rooms.entries()) {
    logger.log(`Room: ${room}, Sockets: ${sockets.join(', ')}`)
  }
}

module.exports = { showRooms }
