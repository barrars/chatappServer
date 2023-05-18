// router for /ytsearch
const { default: YTDlpWrap } = require('yt-dlp-wrap-extended')
const path = require('path')
const chokidar = require('chokidar')

const ytDlpWrap = new YTDlpWrap(path.join(__dirname, '../yt-dlp'))
const audioDir = path.join(__dirname, '../ytDownloadFolder/%(title)s.%(ext)s')
const express = require('express')
// const logger = require('./myLogger')
const fs = require('fs-extra')
const Song = require('../models/songs')
const router = express.Router()
const socketSingleton = require('../sockets/socketSingleton')
const logger = require('../myLogger')
let newSong
const songsBeingDownloaded = []

const watcher = chokidar.watch(path.join(__dirname, '../ytDownloadFolder'), {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
})

router.post('/test', function (req, res, next) {
  const str = req.query.q
  const body = req.body

  const io = req.app.get('io')
  io.emit('test', { str, body })
  res.send({ msg: 'test' })
})
router.post('/', function (req, res, next) {
  const str = req.query.q
  const { socket: id, username } = req.body
  const io = req.app.get('io')
  let songTitle
  let status
  let songURL
  ytDlpWrap
    .exec([
    `${str}`,
    '--no-playlist',
    '--download-archive',
    'archive.txt',
    // '--keep-video',
    '--no-playlist',
    '--default-search',
    'ytsearch',
    '-x',
    '--audio-format',
    'mp3',
    // '--dump-json',
    '-o',
      `${audioDir}`
    ])

    .on('progress', (progress) => {
      socketSingleton().io.emit('eta', progress)
      logger.log(
        progress.percent
      )
    })
    // .on('ytDlpEvent', (eventType, eventData) => {
    //   logger.log('~~~~eventType~~~~')
    //   logger.log(eventType)
    //   logger.log('~~~~eventData~~~~~~~~')
    //   logger.log(eventData)
    //   if (eventData.includes('https://www.youtube.com/watch')) {
    //     songURL = eventData.split(' ')[2]
    //     logger.log('songURL', songURL)
    //   }

    //   if (eventData.includes('Destination') && eventData.includes('mp3')) {
    //     const arr = eventData.split('/')
    //     songTitle = arr[arr.length - 1]
    //     logger.log('songTitle', songTitle)
    //     // io.emit('song', { songTitle })
    //   }
    //   if (eventData.includes('has already been downloaded')) {
    //     songTitle = eventData.split('/')[6].split('has')[0]
    //     status = 'already downloaded'
    //   }
    //   if (eventData.includes('has already been recorded')) {
    //     songTitle = str
    //     status = 'already downloaded'
    //   }
    // }
    // )
    .on('error', (error) => {
      logger.log('error!!!!!!!!!!!!!!!')
      logger.error(error)
      res.send(error)
    })
    .on('close', async (e) => {
      logger.log(songTitle + ' is finnished downloaded by ' + username)
      logger.log('close status = ', status)
      status = status || 'downloaded'
      if (status === 'downloaded') {
        // await fs.stat(path.join(__dirname, '../public/downloads', songTitle))
        // .then(data => {
        // logger.log(data)
        // Song.create({ createdBy: username, title: songTitle, fileName: songTitle, downloaded: data.ctimeMs })
        //   .then(song => {
        //     logger.log(song)
        //     newSong = song
        //     socketSingleton().io.emit('song', { song })
        //   })
        // })
      }
      // list files in ytDownloadFolder
      const files = await fs.readdir(path.join(__dirname, '../ytDownloadFolder'))
      // for each file in ytDownloadFolder
      for (const file of files) {
        // if the file is an mp3
        if (file.includes('.mp3') && file.includes(songsBeingDownloaded[0])) {
          // move the file to the downloads folder
          await fs.move(path.join(__dirname, '../ytDownloadFolder', file), path.join(__dirname, '../public/downloads', file))
            .then(() => {
              logger.log('File', file, 'has been added')
              Song.create({ createdBy: username, title: file, fileName: file, downloaded: Date.now() })
                .then(song => {
                  logger.log(song)
                  newSong = song
                  songsBeingDownloaded.shift()
                  socketSingleton().io.emit('song', { song })
                })
            })
            .catch(err => {
              logger.log('error moving file')
              logger.error(err)
            })
        }
      }

      logger.log('all done', e, newSong)
      res.send({ title: songTitle, status, newSong })
    })

  // this gets the song title from the file name
  watcher
    .on('add', function (file) {
      if (file.includes('.mp3')) {
        // grab the fileName from the path
        const arr = file.split('/')
        songTitle = arr[arr.length - 1]
        songsBeingDownloaded.push(songTitle)
        logger.log('songTitle', songTitle)
      }
    })

  //       Song.create({ createdBy: username, title: songTitle, fileName: songTitle, downloaded: Date.now() })
  //         .then(song => {
  //           // move the file to the downloads folder
  //           fs.move(file, path.join(__dirname, '../public/downloads', songTitle))
  //             .then(() => {
  //               logger.log(song)
  //               newSong = song
  //               socketSingleton().io.emit('song', { song })
  //               logger.log('File', file, 'has been added')
  //             })
  //             .catch(err => {
  //               logger.log('error moving file')
  //               logger.error(err)
  //             })
  //             .finally(() => {
  //               // delete all files in the ytDownloadFolder
  //               fs.emptyDir(path.join(__dirname, '../ytDownloadFolder'))
  //                 .then(() => {
  //                   logger.log('success!')
  //                 })
  //                 .catch(err => {
  //                   logger.log('error deleting files')
  //                   logger.error(err)
  //                 })
  //             })
  //         })
  //     }
  //   })
})

module.exports = router
