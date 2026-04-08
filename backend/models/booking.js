const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venueName: { type: String, required: true },
  venueType: { type: String },
  venueLocation: { type: String },
  venueImage: { type: String },
  venuePrice: { type: String },
  date: { type: String, required: true },
  slots: [{
    id: Number,
    start: String,
    end: String,
    label: String,
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
