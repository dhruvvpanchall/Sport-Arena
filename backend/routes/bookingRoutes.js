const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createBooking, getMyBookings, cancelBooking } = require('../controllers/bookingController');

router.post('/', protect, createBooking);
router.get('/', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
