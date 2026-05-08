const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  lastMessage: String,
  lastMessageAt: Date,
  shiftOffers: [
    {
      fromVenueId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      title: String,
      date: String,
      startTime: String,
      endTime: String,
      pay: String,
      location: String,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending',
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Match', matchSchema);
