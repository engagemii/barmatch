const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/profile — own profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/profile — update own profile
router.put('/', auth, async (req, res) => {
  try {
    const {
      role,
      profile,
      location,
      isOnboarded,
    } = req.body;

    const updateFields = {};
    if (role !== undefined) updateFields.role = role;
    if (profile !== undefined) updateFields.profile = profile;
    if (location !== undefined) updateFields.location = location;
    if (isOnboarded !== undefined) updateFields.isOnboarded = isOnboarded;
    updateFields.lastActive = new Date();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/profile/:id — any user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      '-password -swipedRight -swipedLeft -superSwiped -email'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
