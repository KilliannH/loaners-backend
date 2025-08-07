const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, maxlength: 30, required: true, unique: true },
  email: { type: String, maxlength: 100, required: true, unique: true },
  password: { type: String, maxlength: 300 },
  googleId: { type: String, maxlength: 300, default: "" },
  avatarUrl: { type: String, maxlength: 200 },
  bio: {
    type: String,
    maxlength: 100,
    default: "",
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, maxlength: 300 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);