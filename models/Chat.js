const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  messages: [{
    sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:     { type: String, maxlength: 300 },
    sentAt:   { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Chat', chatSchema);