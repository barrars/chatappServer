const express = require('express')
const logger = require('../myLogger')
const router = express.Router()
const socketInstance = require('../sockets/socketSingleton').getInstance()
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

/* POST */
router.post('/', function (req, res, next) {
  // get socket and username from req.body
  const { socket, username } = req.body
  logger.log({ socket, username })
  // send a message to the socket
  socketInstance.io.to(socket).emit('chat message', { message: 'hi', name: 'dave' })

  res.send({ msg: `thanks ${username} @ ${socket}` })
})

// socketAPI.io().emit('chat message', { message: 'hi', name: 'dave' })
module.exports = router
