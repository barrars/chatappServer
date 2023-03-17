const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})
// socketAPI.io().emit('chat message', { message: 'hi', name: 'dave' })
module.exports = router
