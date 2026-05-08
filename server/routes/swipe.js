const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// POST /api/swipe
router.post('/', auth, async (req, res) => {
  try {
    const { targetId, direction } = req.body;

    if (!targetId || !direction) {
      return res.status(400).json({ error: 'targetId and direction are required' });
    }
    if (!['right', 'left', 'super'].includes(direction)) {
      return res.status(400).json({ error: 'direction must be right, left, or super' });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

    // Prevent duplicate swipes
    const alreadySwiped =
      currentUser.swipedRight.includes(targetId) ||
      currentUser.swipedLeft.includes(targetId) ||
      currentUser.superSwiped.includes(targetId);

    if (alreadySwiped) {
      return res.status(409).json({ error: 'Already swiped on this user' });
    }

    // Record the swipe
    if (direction === 'right') {
      currentUser.swipedRight.push(targetId);
    } else if (direction === 'left') {
      currentUser.swipedLeft.push(targetId);
    } else if (direction === 'super') {
      currentUser.superSwiped.push(targetId);
      currentUser.swipedRight.push(targetId); // super also counts as right
    }

    await currentUser.save();

    // Check for mutual match
    let matched = false;
    let matchId = null;

    if (direction === 'right' || direction === 'super') {
      const targetSwipedRight = targetUser.swipedRight.map((id) => id.toString());
      const targetSuperSwiped = targetUser.superSwiped.map((id) => id.toString());
      const currentIdStr = req.user.id.toString();

      const targetLikesBack =
        targetSwipedRight.includes(currentIdStr) ||
        targetSuperSwiped.includes(currentIdStr);

      if (targetLikesBack) {
        // Create match
        const existingMatch = await Match.findOne({
          users: { $all: [req.user.id, targetId] },
        });

        if (!existingMatch) {
          const match = new Match({
            users: [req.user.id, targetId],
          });
          await match.save();

          // Add to both users' matches arrays
          currentUser.matches.push(targetId);
          await currentUser.save();

          targetUser.matches.push(req.user.id);
          await targetUser.save();

          matched = true;
          matchId = match._id;
        }
      }
    }

    res.json({ matched, matchId });
  } catch (err) {
    console.error('Swipe error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
