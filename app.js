require('dotenv').config()
require('./models/db.js')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const chatList = require('./routes/chatList')
const songList = require('./routes/songList')
const ytsearch = require('./routes/ytsearch')
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const cors = require('cors')
const socketSingleton = require('./sockets/socketSingleton.js')
const app = express()
console.log('process.env.VITE_FRONTEND_HOST')
console.log(process.env.VITE_FRONTEND_HOST)
app.use(logger('dev'))
app.use(cors(
  {

    origin: [process.env.VITE_FRONTEND_HOST],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH', 'CONNECT', 'TRACE', 'SEARCH'],
    credentials: true,
    maxAge: 86400
  }
))
// app.use(function (req, res, next) {
// res.io = io
// next()
// })
app.use('/downloads', express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
console.log(path.join(__dirname, '/public'))
app.use((req, res, next) => {
  req.socketSingleton = socketSingleton
  next()
})
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/chatList', chatList)
app.use('/songList', songList)
app.use('/search', ytsearch)

module.exports = app
