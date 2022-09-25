// router for /chatList
// const logger = require('./myLogger')
// logger.trace(new Date())
const chats = require('../models/chatModel')
const express = require('express')
const logger = require('./myLogger')
const router = express.Router()
router.get('/', async function (req, res) {
  // logger.log('hit songList API route ')
  const chatList = await chats.find({})
  if (chatList) {
    // logger.log(chatList)
    res.json(chatList)
  } else {
    res.json({ err: 'something isnt right' })
  }
})

module.exports = router
