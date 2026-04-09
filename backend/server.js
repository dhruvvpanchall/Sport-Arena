const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL?.replace(/\/+$/, ''),
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========= API ROUTES =========
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const venueRoutes = require('./routes/venueRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/admin', adminRoutes);

// ========= SERVE FRONTEND IN PRODUCTION =========
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));
  app.get('*path', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
  });
}

// ========= START SERVER =========
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error(err));