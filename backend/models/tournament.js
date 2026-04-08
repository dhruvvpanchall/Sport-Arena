const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  sport: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  maxTeams: { type: Number, required: true },
  prize: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'open', 'few-slots', 'closed', 'ongoing', 'completed'], default: 'open' },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  entryFee: { type: Number, default: 0 },
  registrations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teamName: { type: String, required: true },
    captainName: String,
    email: String,
    phone: String,
    city: String,
    playerCount: { type: Number, default: 1 },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'free'], default: 'pending' },
    amountPaid: { type: Number, default: 0 },
    registeredAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
