const User = require('../models/user');

// @GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, city, age, gender, bio, favSports, skillLevel } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (city !== undefined) updates.city = city;
    if (age !== undefined) updates.age = age;
    if (gender !== undefined) updates.gender = gender;
    if (bio !== undefined) updates.bio = bio;
    if (favSports !== undefined) updates.favSports = typeof favSports === 'string' ? JSON.parse(favSports) : favSports;
    if (skillLevel !== undefined) updates.skillLevel = skillLevel;

    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/user/request-role
const requestRole = async (req, res) => {
  const { role } = req.body;
  if (!['venue-owner', 'organizer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Choose venue-owner or organizer.' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === role) return res.status(400).json({ message: `You are already a ${role}` });
    if (user.roleRequest === role) return res.status(400).json({ message: 'Request already pending' });

    user.roleRequest = role;
    await user.save();

    res.json({ message: `Role request for "${role}" submitted. An admin will review it.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, requestRole };
