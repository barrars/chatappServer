const mongoose = require('mongoose')
// const logger = require('../routes/myLogger')
const Schema = mongoose.Schema

const chatSchema = new Schema({
  message: { type: String },
  username: { type: String },
  color: { type: String, default: '#e21400' },
  timestamp: { type: Date, default: Date.now },
  chatRoom: { type: String }
})
const Chats = module.exports = mongoose.model('chat', chatSchema)

async function create (chat) {
  const newChat = new Chats(chat)
  if (!newChat.save()) {
    throw new Error()
  }
  return newChat
}

Chats.create = create
