const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllVenues, getMyVenues, createVenue, updateVenue, deleteVenue, getVenueBookings } = require('../controllers/venueController');

// Public
router.get('/', getAllVenues);

// Venue owner only
router.get('/my', protect, authorize('venue-owner', 'admin'), getMyVenues);
router.post('/', protect, authorize('venue-owner', 'admin'), createVenue);
router.put('/:id', protect, authorize('venue-owner', 'admin'), updateVenue);
router.delete('/:id', protect, authorize('venue-owner', 'admin'), deleteVenue);
router.get('/:id/bookings', protect, authorize('venue-owner', 'admin'), getVenueBookings);

module.exports = router;
