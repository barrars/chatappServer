// router for /songlist

const songs = require('../models/songs')
const express = require('express')
const logger = require('./myLogger')
const router = express.Router()
router.get('/', async function (req, res, next) {
  logger.log('hit songList API route ')
  const songList = await songs.find({})
  if (songList) {
    res.json(songList)
  } else {
    res.json({ err: 'something isnt right' })
  }
})

module.exports = router
