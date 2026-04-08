const Venue = require('../models/venue');
const Booking = require('../models/booking');

// @GET /api/venues — Public: get all available venues
const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/venues/my — Owner: get own venues
const getMyVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/venues — Owner: create venue
const createVenue = async (req, res) => {
  const { name, type, icon, location, price, amenities, image, description } = req.body;
  try {
    const venue = await Venue.create({
      owner: req.user.id,
      name,
      type,
      icon: icon || '🏟️',
      location,
      price,
      amenities: amenities || [],
      image: image || '',
      description: description || '',
    });
    res.status(201).json(venue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/venues/:id — Owner: update venue
const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findOne({ _id: req.params.id, owner: req.user.id });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });

    const allowed = ['name', 'type', 'icon', 'location', 'price', 'amenities', 'image', 'available', 'description'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) venue[field] = req.body[field];
    });
    await venue.save();
    res.json(venue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/venues/:id — Owner: delete venue
const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json({ message: 'Venue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/venues/:id/bookings — Owner: get bookings for own venue
const getVenueBookings = async (req, res) => {
  try {
    const venue = await Venue.findOne({ _id: req.params.id, owner: req.user.id });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });

    const bookings = await Booking.find({ venueName: venue.name }).sort({ createdAt: -1 }).populate('user', 'name email phone');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllVenues, getMyVenues, createVenue, updateVenue, deleteVenue, getVenueBookings };
