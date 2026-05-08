const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// GET /api/messages/:matchId — get message history
router.get('/:matchId', auth, async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.matchId,
      users: req.user.id,
    });
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const messages = await Message.find({ matchId: req.params.matchId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    messages.reverse();

    // Mark messages as read
    await Message.updateMany(
      { matchId: req.params.matchId, senderId: { $ne: req.user.id }, read: false },
      { $set: { read: true } }
    );

    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/messages/:matchId — send a message
router.post('/:matchId', auth, async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.matchId,
      users: req.user.id,
    });
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const { type = 'text', text, shiftOffer } = req.body;

    if (type === 'text' && !text) {
      return res.status(400).json({ error: 'Text is required for text messages' });
    }
    if (type === 'shift_offer' && !shiftOffer) {
      return res.status(400).json({ error: 'shiftOffer data is required' });
    }

    const message = new Message({
      matchId: req.params.matchId,
      senderId: req.user.id,
      type,
      text,
      shiftOffer,
    });

    await message.save();

    // Update match lastMessage
    match.lastMessage = type === 'text' ? text : '📋 Shift offer sent';
    match.lastMessageAt = new Date();
    await match.save();

    res.status(201).json({ message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/messages/:matchId/shift/:messageId — accept or decline shift offer
router.put('/:matchId/shift/:messageId', auth, async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.matchId,
      users: req.user.id,
    });
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or declined' });
    }

    const message = await Message.findOneAndUpdate(
      {
        _id: req.params.messageId,
        matchId: req.params.matchId,
        type: 'shift_offer',
      },
      { $set: { 'shiftOffer.status': status } },
      { new: true }
    );

    if (!message) return res.status(404).json({ error: 'Message not found' });

    res.json({ message });
  } catch (err) {
    console.error('Update shift error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
