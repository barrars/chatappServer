// router for /ytsearch
const { default: YTDlpWrap } = require('yt-dlp-wrap-extended')
const path = require('path')
const ytDlpWrap = new YTDlpWrap(path.join(__dirname, '../yt-dlp'))
const audioDir = path.join(__dirname, '../public/downloads/%(title)s.%(ext)s')
const express = require('express')
const logger = require('./myLogger')
// const { socket } = require('../sockets/socketAPI')
const fs = require('fs-extra')
const Song = require('../models/songs')
const router = express.Router()

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
      io.emit('eta', progress)
      logger.log(
        progress.percent,
        progress.totalSize,
        progress.currentSpeed,
        progress.eta
      )
    })
    .on('ytDlpEvent', (eventType, eventData) => {
      logger.log('~~~~eventType~~~~')
      logger.log(eventType)
      logger.log('~~~~eventData~~~~~~~~')
      logger.log(eventData)
      if (eventData.includes('https://www.youtube.com/watch')) {
        songURL = eventData.split(' ')[2]
        logger.log('songURL', songURL)
      }

      if (eventData.includes('Destination') && eventData.includes('mp3')) {
        const arr = eventData.split('/')
        songTitle = arr[arr.length - 1]
        logger.log('songTitle', songTitle)
        // io.emit('song', { songTitle })
      }
      if (eventData.includes('has already been downloaded')) {
        songTitle = eventData.split('/')[7].split('has')[0]
        status = 'already downloaded'
      }
    }
    )
    .on('error', (error) => {
      logger.error(error)
      res.send(error)
    })
    .on('close', (e) => {
      logger.log('close status = ', status)
      status = status || 'downloaded'
      if (status === 'downloaded') {
        fs.stat(path.join(__dirname, '../public/downloads', songTitle))
          .then(data => {
            logger.log(data)
            Song.create({ createdBy: username, title: songTitle, fileName: songTitle, downloaded: data.ctimeMs })
              .then(song => {
                logger.log(song)
                io.emit('song', { song })
                // socket('song', { song, status })
              })
          })
      }
      // socket('song', { songTitle, status })
      // res.json({ title: songTitle, status })
      logger.log('all done', e)
      res.send({ title: songTitle, status })
    })
})

module.exports = router
