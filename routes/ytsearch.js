// router for /search
const { default: YTDlpWrap } = require('yt-dlp-wrap-extended')
const path = require('path')
const chokidar = require('chokidar')

const ytDlpWrap = new YTDlpWrap(path.join(__dirname, '../yt-dlp'))
const audioDir = path.join(__dirname, '../public/downloads/%(title)s.%(ext)s')
const express = require('express')
const fs = require('fs-extra')
const Song = require('../models/songs')
const router = express.Router()
const socketSingleton = require('../sockets/socketSingleton')
const logger = require('../myLogger')
let newSong
const songsBeingDownloaded = []

const watcher = chokidar.watch(path.join(__dirname, '../public/downloads'), {
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
  const { socket, username } = req.body
  let songTitle
  let status
  ytDlpWrap
    .exec([
    `${str}`,
    '--no-playlist',
    '--download-archive',
    'archive.txt',
    '--no-playlist',
    '--default-search',
    'ytsearch',
    '-x',
    '--audio-format',
    'mp3',
    '-o',
      `${audioDir}`
    ])

    .on('progress', (progress) => {
      socketSingleton().io.emit('eta', progress)
      logger.log(
        progress.percent
      )
    })
    .on('error', (error) => {
      logger.log('error!!!!!!!!!!!!!!!')
      logger.error(error)
      res.send(error)
    })
    .on('close', async (e) => {
      logger.log('close event ' + e)
      logger.log(songTitle + ' is finnished downloaded by ' + username)
      logger.log('close status = ', status)
      status = status || 'downloaded'
      // songTitle comes from file watcher
      Song.create({ createdBy: username, title: songTitle, fileName: songTitle, downloaded: Date.now() })
        .then(song => {
          logger.log(song)
          // newSong = song
          songsBeingDownloaded.shift()
          socketSingleton().io.emit('song', { song })
        })

      res.send({ title: songTitle })
    })

  // this gets the song title from the file name
  watcher
    .on('add', function (file) {
      if (file.includes('.mp3')) {
        const arr = file.split('/')
        songTitle = arr[arr.length - 1]
        logger.log('songTitle = ', songTitle)
      }
    })
})

module.exports = router
