const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: { type: String, maxlength: 500, required: true },
  address: { type: String, maxlength: 500, required: true },
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  }
});

locationSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Location", locationSchema);