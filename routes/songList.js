// router for /songlist

const songs = require('../models/songs')
const express = require('express')
const logger = require('../myLogger')
const router = express.Router()
router.get('/', async function (req, res, next) {
  logger.log('hit songList API route ')
  const songList = await songs.find({ deleted: false })
  if (songList) {
    res.json(songList)
  } else {
    res.json({ err: 'something with songList.js isnt right' })
  }
})

module.exports = router
