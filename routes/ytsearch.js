// router for /search
// const { default: YTDlpWrap } = require('yt-dlp-wrap-extended')
const YTDlpWrap = require('yt-dlp-wrap').default
YTDlpWrap.downloadFromGithub()
const path = require('path')
// const chokidar = require('chokidar')

const ytDlpWrap = new YTDlpWrap(path.join(__dirname, '../yt-dlp'))
const audioDir = path.join(__dirname, '../public/downloads/')
// const audioDir = path.join(__dirname, '../public/downloads/%(title)s.%(ext)s')
const express = require('express')
// const fs = require('fs-extra')
const Song = require('../models/songs')
const router = express.Router()
const { getInstance } = require('../sockets/socketSingleton')
const logger = require('../myLogger')
const socketInstance = getInstance()
const slug = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 8; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  return result + '.mp3'
}
// ytDlpWrap.getVersion()
//   .then((version) => {
//     logger.log('ytDlpWrap version is ' + version)
//   })

// const watcher = chokidar.watch(path.join(__dirname, '../public/downloads'), {
//   ignored: /(^|[\/\\])\../, // ignore dotfiles
//   persistent: true
// })

router.post('/test', function (req, res, next) {
  const str = req.query.q
  const body = req.body

  const io = req.app.get('io')
  io.emit('test', { str, body })
  res.send({ msg: 'test' })
})

router.post('/', async function (req, res, next) {
  const str = req.query.q
  const { socket: socketID, username } = req.body
  logger.log('##################################')
  const songSlug = slug()
  // 1. Get song details using yt-dlp --dump-json
  // ytDlpWrap.getVideoInfo([`${str}`])
  const metadata = await ytDlpWrap.execPromise([
    `${str}`,
    '--default-search', 'ytsearch',
    '--dump-json'

  ])
  // console.log(JSON.parse(metadata, null, 2))
  const jsonData = await JSON.parse(metadata)
  const songTitle = jsonData.title
  const tags = jsonData.tags
  const ytID = jsonData.id
  logger.log(tags)
  logger.log(jsonData.title)

  // emit song title to socketID
  socketSingleton().io.to(`${socketID}`).emit('downloadingSongTitle', songTitle)
  // create a slug length of 8 using alpha and numbers function

  // 2. Download the song using the extracted title
  const downloadProcess = ytDlpWrap.exec([
      `${str}`,
      '--no-playlist',
      '--download-archive', 'archive.txt',
      '--default-search', 'ytsearch',
      '-x',
      '--audio-format', 'mp3',
      '-o',
      `${audioDir}${songSlug}`
  ])
  downloadProcess.on('progress', (progress) => {
    socketSingleton().io.emit('eta', progress)
    logger.log(progress.percent)
  })
  downloadProcess.on('error', (error) => {
    logger.log('error!!!!!!!!!!!!!!!')
    logger.error(error)
    res.send(error)
  })
  downloadProcess.on('close', (e) => {
    logger.log('close event ' + e)
    logger.log(songTitle + ' is finished downloading by ' + username)
    logger.log('')
    if (songTitle) {
      Song.create({ ytID, tags, createdBy: username, title: songTitle, fileName: songSlug, downloaded: Date.now() })
        .then(song => {
          logger.log(song)
          socketSingleton().io.emit('song', { song })
          res.send({ title: songTitle })
        })
    } else {
      logger.log('no songTitle')
      res.send({ title: 'no songTitle' })
    }
  })

    .on('error', (error) => {
      logger.error('Failed to get song details:', error)
      res.status(500).send(error)
    })
})

// function watchFileDownload (str, socket, username, cb) {
//   let songTitle
//   let status
//   const download = ytDlpWrap.exec([
//       `${str}`,
//       '--no-playlist',
//       '--download-archive',
//       'archive.txt',
//       '--no-playlist',
//       '--default-search',
//       'ytsearch',
//       '-x',
//       '--audio-format',
//       'mp3',
//       '-o',
//         `${audioDir}`
//   ])

//   download.on('progress', (progress) => {
//     socketSingleton().io.emit('eta', progress)
//     logger.log(progress.percent)
//   })
//     .on('error', (error) => {
//       logger.log('error!!!!!!!!!!!!!!!')
//       logger.error(error)
//       cb(error, null)
//     })
//     .on('close', () => {
//       logger.log(songTitle + ' is finished downloading by ' + username)
//       logger.log('close status = ', status)
//       status = status || 'downloaded'
//       if (songTitle) {
//         Song.create({ createdBy: username, title: songTitle, fileName: songTitle, downloaded: Date.now() })
//           .then(song => {
//             cb(null, songTitle)
//           })
//       } else {
//         cb(new Error('no songTitle'), null)
//       }
//     })

//   const watcher = chokidar.watch(audioDir) // assuming chokidar or similar is being used

//   watcher.on('add', function (file) {
//     if (file.includes('.mp3')) {
//       const arr = file.split('/')
//       songTitle = arr[arr.length - 1]
//       logger.log('songTitle = ', songTitle)
//       watcher.close() // important to close watcher after first match
//     }
//   })
// }

// router.post('/', function (req, res, next) {
//   const str = req.query.q
//   const { socket, username } = req.body

//   watchFileDownload(str, socket, username, (error, songTitle) => {
//     if (error) {
//       return res.send(error)
//     }
//     socketSingleton().io.emit('song', { song: songTitle })
//     res.send({ title: songTitle })
//   })
// })

// router.post('/', function (req, res, next) {
//   const str = req.query.q
//   const { socket, username } = req.body
//   logger.log('##################################')
//   logger.log(socket, str)
//   let songTitle
//   let status
//   ytDlpWrap
//     .exec([
//     `${str}`,
//     '--no-playlist',
//     '--download-archive',
//     'archive.txt',
//     '--no-playlist',
//     '--default-search',
//     'ytsearch',
//     '-x',
//     '--audio-format',
//     'mp3',
//     '-o',
//       `${audioDir}`
//     ])

//     .on('progress', (progress) => {
//       socketSingleton().io.emit('eta', progress)
//       logger.log(
//         progress.percent
//       )
//     })
//     // .on('ytDlpEvent', (info) => {
//     //   logger.log('info event')
//     //   logger.log(info)
//     //   // status = 'downloading'
//     //   // socketSingleton().io.emit('info', info)
//     // })
//     .on('error', (error) => {
//       logger.log('error!!!!!!!!!!!!!!!')
//       logger.error(error)
//       res.send(error)
//     })
//     .on('close', (e) => {
//       logger.log('close event ' + e)
//       logger.log(songTitle + ' is finnished downloaded by ' + username)
//       logger.log('close status = ', status)
//       status = status || 'downloaded'
//       // songTitle comes from file watcher
//       if (songTitle) {
//         Song.create({ createdBy: username, title: songTitle, fileName: songTitle, downloaded: Date.now() })
//           .then(song => {
//             logger.log(song)
//             // newSong = song
//             songsBeingDownloaded.shift()
//             socketSingleton().io.emit('song', { song })
//           })

//         // res.json({ title: songTitle })
//         res.send({ title: songTitle })
//       } else {
//         res.send({ title: 'no songTitle' })
//       }
//     })

//   // this gets the song title from the file name
//   watcher
//     .on('add', function (file) {
//       if (file.includes('.mp3')) {
//         const arr = file.split('/')
//         songTitle = arr[arr.length - 1]
//         logger.log('songTitle = ', songTitle)
//       }
//     })
// })

module.exports = router
