// router for /chatList
// const { showRooms } = require('../sockets/roomHandler')
const Chat = require('../models/chatModel')
const express = require('express')
const logger = require('./myLogger')
const router = express.Router()
const socketSingleton = require('../sockets/socketSingleton')
router.get('/', async function (req, res) {
  // logger.log('hit songList API route ')
  const chatList = await Chat.find({})
  if (chatList) {
    // logger.log(chatList)
    res.json(chatList)
  } else {
    res.json({ err: 'something isnt right' })
  }
})
router.post('/', async function (req, res) {
  // const io = req.app.get('io')
  logger.log('post to /chatlist ')
  // socketSingleton.showRooms()

  const chat = req.body
  logger.log(chat)
  const newChat = new Chat(chat)
  if (newChat.save()) {
    res.json({ msg: chat, status: 'saved' })
    socketSingleton().io.emit('chat message', newChat)
    // socketSingleton().io.to('/').emit('chat message', newChat)
  } else {
    res.json({ err: 'something isnt right' })
  }
})

module.exports = router
