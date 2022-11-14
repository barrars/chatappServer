require('dotenv').config()
require('./models/db.js')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const chatList = require('./routes/chatList')
const songList = require('./routes/songList')
const ytsearch = require('./routes/ytsearch')
// const socketRoutes = require('./sockets/socket')
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const cors = require('cors')
// const { createServer } = require('http')
// const httpServer = createServer()
const app = express()
// const { Server } = require('socket.io')
// const server = require('http').Server(app)

// const io = new Server(httpServer, {
//   cors: {
//     origins: ['localhost:3000']
//   }
// })
// io.on('connection', socketRoutes)

app.use(logger('dev'))
app.use(cors())
app.use(function (req, res, next) {
  // res.io = io
  next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/chatList', chatList)
app.use('/songList', songList)
app.use('/search', ytsearch)

// module.exports = app

module.exports = app
