const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// GET /api/matches — list all matches for current user
router.get('/', auth, async (req, res) => {
  try {
    const matches = await Match.find({ users: req.user.id })
      .populate({
        path: 'users',
        select: 'role profile location lastActive',
      })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    // Transform to include the "other" user's info
    const transformed = matches.map((match) => {
      const otherUser = match.users.find(
        (u) => u._id.toString() !== req.user.id.toString()
      );
      return {
        _id: match._id,
        createdAt: match.createdAt,
        lastMessage: match.lastMessage,
        lastMessageAt: match.lastMessageAt,
        otherUser,
      };
    });

    res.json({ matches: transformed });
  } catch (err) {
    console.error('Get matches error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
