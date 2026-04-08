const User = require('../models/user');
const Venue = require('../models/venue');
const Tournament = require('../models/tournament');
const Booking = require('../models/booking');

// @GET /api/admin/stats — Dashboard stats
const getStats = async (req, res) => {
  try {
    const [users, venues, tournaments, bookings, pendingRequests] = await Promise.all([
      User.countDocuments(),
      Venue.countDocuments(),
      Tournament.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments({ roleRequest: { $ne: '' } }),
    ]);
    res.json({ users, venues, tournaments, bookings, pendingRequests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/users — Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/role-requests — Get users with pending role requests
const getRoleRequests = async (req, res) => {
  try {
    const users = await User.find({ roleRequest: { $ne: '' } }).select('name email role roleRequest createdAt').sort({ updatedAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/role-requests/:id/approve — Approve role request
const approveRoleRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.roleRequest) return res.status(400).json({ message: 'No pending role request' });

    user.role = user.roleRequest;
    user.roleRequest = '';
    await user.save();

    res.json({ message: `Role upgraded to ${user.role}`, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/role-requests/:id/reject — Reject role request
const rejectRoleRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.roleRequest = '';
    await user.save();

    res.json({ message: 'Role request rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/users/:id/role — Directly change user role
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'venue-owner', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    user.roleRequest = '';
    await user.save();

    res.json({ message: `Role changed to ${role}`, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getAllUsers, getRoleRequests, approveRoleRequest, rejectRoleRequest, changeUserRole };
