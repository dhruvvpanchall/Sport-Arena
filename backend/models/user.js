const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  age: { type: Number, default: null },
  gender: { type: String, enum: ['', 'Male', 'Female', 'Other'], default: '' },
  bio: { type: String, default: '' },
  favSports: [{ type: String }],
  skillLevel: { type: String, enum: ['', 'Beginner', 'Intermediate', 'Advanced', 'Pro'], default: '' },
  role: { type: String, enum: ['user', 'venue-owner', 'organizer', 'admin'], default: 'user' },
  roleRequest: { type: String, enum: ['', 'venue-owner', 'organizer'], default: '' },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
