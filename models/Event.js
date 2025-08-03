const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  type:        { type: String, enum: ['concert', 'expo', 'spectacle', 'autre'], required: true },
  date:        { type: Date, required: true },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location:    { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  attendees:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  chatId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);