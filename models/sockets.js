const mongoose = require('mongoose')
const { Schema } = mongoose
const uuidv4 = require('uuid').v4
// const fs = require('fs-extra')
// const path = require('path')
// const logger = require('../routes/myLogger')
// logger.log(new Date())

const socketSchema = new Schema({
  socketID: { type: String, required: true },
  username: { type: String, required: true },
  lastLogin: { type: Date, default: Date.now },
  rooms: { type: Array, default: [] }
  // deleted: { type: Boolean, default: false }

})

module.exports = mongoose.model('sockets', socketSchema)

// Socket.create = create

// async function create (song) {
//   const newSong = await new Socket(addFileSlug(song))

//   if (!newSong.save()) {
//     throw Error('Error saving playlist')
//   }
//   return newSong
// }

// function addFileSlug (song) {
//   song.fileSlug = uuidv4()

//   return song
// }
