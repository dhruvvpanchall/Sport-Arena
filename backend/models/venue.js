const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['Football Turf', 'Cricket Ground', 'Badminton Court', 'Tennis Court', 'Multi-Sport'] },
  icon: { type: String, default: '🏟️' },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  priceLabel: { type: String, default: '' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  amenities: [{ type: String }],
  image: { type: String, default: '' },
  available: { type: Boolean, default: true },
  description: { type: String, default: '' },
}, { timestamps: true });

// Auto-generate priceLabel from price
venueSchema.pre('save', function () {
  if (this.isModified('price')) {
    this.priceLabel = `₹${this.price} / hr`;
  }
});

module.exports = mongoose.model('Venue', venueSchema);
