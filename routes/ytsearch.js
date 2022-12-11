// router for /ytsearch
const { default: YTDlpWrap } = require('yt-dlp-wrap-extended')
const path = require('path')
const ytDlpWrap = new YTDlpWrap(path.join(__dirname, '../yt-dlp'))
const audioDir = path.join(__dirname, '../public/downloads/%(title)s.%(ext)s')
const express = require('express')
const logger = require('./myLogger')
const { emit, socket } = require('../sockets/socketAPI')
// const socket = require('../sockets/socketAPI')
// const {} = require('../sockets/oldsocketAPI')
// const { socketEmit } = require('../sockets/oldsocketAPI')
// const socketAPI = require('../sockets/socketAPI')
// logger.log(typeof socketEmit)
// logger.log('socketEmit')
// const { Socket } = require('socket.io')
// const socketAPI = require('../sockets/socketAPI')
const router = express.Router()

router.get('/', function (req, res, next) {
  let songTitle
  const str = req.query.q
  // logger.info(socketEmit)
  // socketEmit('song', { str })
  ytDlpWrap
    .exec([
    `${str}`,
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
      // socketEmit('eta', progress.eta)
      // socketAPI.emit('eta', progress.eta)
      socket('eta', progress.percent)
      logger.log(
        progress.percent,
        progress.totalSize,
        progress.currentSpeed,
        progress.eta
      )
    })
    .on('ytDlpEvent', (eventType, eventData) => {
      // console.log('~~~~eventType~~~~')
      // logger.log(eventType)
      // console.log('~~~~eventData~~~~~~~~')
      // logger.log(eventData)
      if (eventData.includes('Destination') && eventData.includes('mp3')) {
        const arr = eventData.split('/')
        songTitle = arr[arr.length - 1]
        // socketEmit('song', { songTitle })
      }
    }
    )
    .on('error', (error) => {
      console.error(error)
      res.send(error)
    })
    .on('close', (e) => {
      // socketEmit('song', songTitle)
      res.json({ str })
      console.log('all done', e)
    })
})

module.exports = router
