// router for /chatList
// logger.trace(new Date())
const Chat = require('../models/chatModel')
const express = require('express')
const logger = require('./myLogger')
const router = express.Router()
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
  const io = req.app.get('io')
  logger.log('post to /chatlist ')
  // log all rooms
  const rooms = io.sockets.adapter.rooms
  logger.log(rooms)
  logger.log(rooms.size)
  logger.log(`keys = ${rooms.keys()}`)
  logger.log(`values = ${rooms.values()}`)
  logger.log(`entries = ${rooms.entries()}`)
  logger.log(rooms.forEach((k, v) => logger.log(`key = ${k}, v = ${v}`)))
  const roomIterator = rooms[Symbol.iterator]()
  for (const room of roomIterator) {
    logger.log(room[0])
    logger.log(room[1])
  }

  const chat = req.body
  logger.log(chat)
  const newChat = new Chat(chat)
  if (newChat.save()) {
    res.json({ msg: chat, status: 'saved' })
    // io.emit('chat message', newChat)
    io.to(chat.chatRoom).emit('chat message', newChat)
  } else {
    res.json({ err: 'something isnt right' })
  }
})

module.exports = router
