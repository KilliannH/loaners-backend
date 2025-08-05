const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, maxlength: 500, required: true },
  address: { type: String, maxlength: 500, required: true },
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true,
    index: '2dsphere',
  }
});

// Index géospatial
locationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);