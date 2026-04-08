const Booking = require('../models/booking');

// @POST /api/bookings
const createBooking = async (req, res) => {
  const { venueName, venueType, venueLocation, venueImage, venuePrice, date, slots, totalPrice } = req.body;
  try {
    const booking = await Booking.create({
      user: req.user.id,
      venueName,
      venueType,
      venueLocation,
      venueImage,
      venuePrice,
      date,
      slots,
      totalPrice,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking };
