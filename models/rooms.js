const mongoose = require('mongoose')
const { Schema } = mongoose
// const uuidv4 = require('uuid').v4
// const fs = require('fs-extra')
// const path = require('path')
// const logger = require('../routes/myLogger')
// logger.log(new Date())

const roomSchema = new Schema({
  name: { type: String, required: true },
  sockets: [{ type: String }],
  messages: [{
    message: { type: String },
    username: { type: String },
    color: { type: String, default: '#e21400' },
    timestamp: { type: Date, default: Date.now },
    chatRoom: { type: String }
  }]
  // messages: [{ type: Schema.Types.ObjectId, ref: 'chat' }]

})

// const Room = module.exports = mongoose.model('rooms', roomSchema)
const Room = mongoose.model('rooms', roomSchema)
module.exports = Room

// fs.readdir(path.join(__dirname, '../public/downloads'))
//   .then(files => {
//     files.forEach(file => {
//       if (file !== '.gitignore') {
//         Song.find({ fileName: file }, (err, doc) => {
//           if (err) {
//             throw err
//           }
//           if (!doc.length) {
//           // logger.log(doc.length)
//           // logger.log('creating')
//             fs.stat(path.join(__dirname, '../public/downloads', file))
//               .then(data => {
//               // logger.log(data.ctimeMs)
//               // logger.log(file)
//                 Song.create({ title: file, fileName: file, downloaded: data.ctimeMs })
//               })
//           }
//         })
//       }
//     })
//   })

// Song.create = create

// async function create (song) {
//   const newSong = await new Song(addFileSlug(song))

//   if (!newSong.save()) {
//     throw Error('Error saving playlist')
//   }
//   return newSong
// }

// function addFileSlug (song) {
//   song.fileSlug = uuidv4()

//   return song
// }
