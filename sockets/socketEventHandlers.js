const Rooms = require('../models/rooms')
const logger = require('../myLogger')

module.exports = {
  handlejoin: async (socket, io, from, room, cb) => {
    logger.log(`request from ${from} to join room ${room}`)
    // await check if room exists and if not create it
    const roomExists = await Rooms.exists({ name: room })
    logger.log('room exists?', roomExists)
    if (!roomExists) {
      await Rooms.create({ name: room, sockets: [socket.id] })
    }
    // add socket to sockets array in room
    await Rooms.findOneAndUpdate({ name: room }, { $addToSet: { sockets: socket.id } }, { new: true })
      .then((doc) => {
        logger.log('doc', doc)
        socket.join(room)
        // brodacast to the other sockets in the room that you've joined to update their counts

        io.to(room).emit('joined', { room, count: doc.sockets.length, from: socket.id })

        // you're own emitted join event callback will update your local storage
        cb(room, doc.sockets.length, socket.id)
      })
  }
}
