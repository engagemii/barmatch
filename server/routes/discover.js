const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

function computeMatchScore(currentUser, candidate) {
  let score = 0;

  // Shared skills/specialties overlap — 40%
  const mySkills = currentUser.role === 'bartender'
    ? (currentUser.profile?.specialties || [])
    : (currentUser.profile?.lookingFor || []);
  const theirSkills = candidate.role === 'bartender'
    ? (candidate.profile?.specialties || [])
    : (candidate.profile?.lookingFor || []);

  if (mySkills.length > 0 && theirSkills.length > 0) {
    const overlap = mySkills.filter((s) => theirSkills.includes(s)).length;
    const maxPossible = Math.max(mySkills.length, theirSkills.length);
    score += (overlap / maxPossible) * 40;
  } else {
    score += 20; // neutral if no data yet
  }

  // Same city — 30%
  const myCity = currentUser.location?.city?.toLowerCase();
  const theirCity = candidate.location?.city?.toLowerCase();
  if (myCity && theirCity && myCity === theirCity) {
    score += 30;
  } else if (!myCity || !theirCity) {
    score += 15; // neutral
  }

  // Availability overlap — 20%
  if (currentUser.role === 'bartender' && candidate.role === 'venue') {
    const avail = currentUser.profile?.availability || {};
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const availableDays = days.filter((d) => avail[d]).length;
    score += (availableDays / 7) * 20;
  } else if (currentUser.role === 'venue' && candidate.role === 'bartender') {
    const avail = candidate.profile?.availability || {};
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const availableDays = days.filter((d) => avail[d]).length;
    score += (availableDays / 7) * 20;
  } else {
    score += 10;
  }

  // Random factor — 10%
  score += Math.random() * 10;

  return Math.min(Math.round(score), 100);
}

// GET /api/discover
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const oppositeRole = currentUser.role === 'bartender' ? 'venue' : 'bartender';

    const alreadySwiped = [
      ...currentUser.swipedRight,
      ...currentUser.swipedLeft,
      ...currentUser.superSwiped,
      currentUser._id,
    ];

    const candidates = await User.find({
      role: oppositeRole,
      isOnboarded: true,
      _id: { $nin: alreadySwiped },
    })
      .select('-password -swipedRight -swipedLeft -superSwiped -email')
      .limit(20)
      .lean();

    const scored = candidates.map((candidate) => ({
      ...candidate,
      matchScore: computeMatchScore(currentUser, candidate),
    }));

    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ users: scored });
  } catch (err) {
    console.error('Discover error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
