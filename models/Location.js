const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  address:   { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
});
locationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);