const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name:        { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 300 },
  type:        { type: String, enum: ['concert', 'expo', 'spectacle', 'festival', 'soiree_a_theme', 'autre'], required: true },
  date:        { type: Date, required: true },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location:    { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  attendees:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  chatId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);