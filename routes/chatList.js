// router for /chatList
// const { showRooms } = require('../sockets/roomHandler')
const Chat = require('../models/chatModel')
const express = require('express')
const router = express.Router()
const socketSingleton = require('../sockets/socketSingleton')
const logger = require('../myLogger')

// get optional chatRoom parameter

router.get('/:chatRoom?', async function (req, res) {
  const chatRoom = req.params.chatRoom
  logger.log('chatRoom: ', chatRoom)
  const chatList = await Chat.find({ chatRoom: chatRoom || 'default' })
  if (chatList) {
    res.json(chatList)
  } else {
    res.json({ err: 'something isnt right' })
  }
})

router.post('/:rooom?', async function (req, res) {
  const chatRoom = req.params.rooom

  logger.log(`Post to /chatlist in room: ${chatRoom || 'default'} with body ${JSON.stringify(req.body)}`)

  const chat = req.body
  chat.chatRoom = chatRoom || 'default'
  logger.log(chat, chatRoom)
  const newChat = new Chat(chat)
  socketSingleton().io.to(`${chatRoom}`).emit('chat message', chat)
  if (newChat.save()) {
    // broadcast to chatRoom
    const roomList = socketSingleton().rooms
    const sockets = roomList.get(chatRoom)
    logger.log(sockets)
    // check if chatRoom exists in rooms
    if (!roomList.has(chatRoom)) {
      // join socket to chatRoom
      const socket = socketSingleton().io.sockets.sockets.get(chat.id)
      // logger.log(socket)
      socket.join(chatRoom)
      // add chatRoom to rooms
      roomList.set(chatRoom, [chat.socketID])
    }

    res.json({ msg: chat, status: 'saved' })
    // socketSingleton().io.to(`${chatRoom}`).emit('chat message', { newChat, chatRoom })
    // socketSingleton().io.to(`/${chatRoom}`).emit('chat message', newChat)
    // socketSingleton().io.emit('chat message', { newChat, chatRoom })
  } else {
    res.json({ err: 'something isnt right' })
  }
})

module.exports = router
