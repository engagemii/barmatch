const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Match = require('../models/Match');
const User = require('../models/User');

module.exports = function setupSocket(io) {
  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.userId}`);

    // Join personal room for direct notifications
    socket.join(socket.userId);

    // Update last active
    try {
      await User.findByIdAndUpdate(socket.userId, { lastActive: new Date() });
    } catch (err) {
      console.error('Error updating lastActive:', err);
    }

    // Join a match room for real-time chat
    socket.on('join_match', (matchId) => {
      socket.join(matchId);
      console.log(`User ${socket.userId} joined match room ${matchId}`);
    });

    // Leave a match room
    socket.on('leave_match', (matchId) => {
      socket.leave(matchId);
    });

    // Send message via socket
    socket.on('send_message', async (data) => {
      try {
        const { matchId, type = 'text', text, shiftOffer } = data;

        // Verify the user is part of this match
        const match = await Match.findOne({
          _id: matchId,
          users: socket.userId,
        });
        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const message = new Message({
          matchId,
          senderId: socket.userId,
          type,
          text,
          shiftOffer,
        });
        await message.save();

        // Update match lastMessage
        match.lastMessage = type === 'text' ? text : '📋 Shift offer sent';
        match.lastMessageAt = new Date();
        await match.save();

        // Emit to the match room (all participants)
        io.to(matchId).emit('new_message', message);

        // Also notify the other user in their personal room
        const otherUserId = match.users.find(
          (u) => u.toString() !== socket.userId.toString()
        );
        if (otherUserId) {
          io.to(otherUserId.toString()).emit('match_updated', {
            matchId,
            lastMessage: match.lastMessage,
            lastMessageAt: match.lastMessageAt,
          });
        }
      } catch (err) {
        console.error('Socket send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ matchId, isTyping }) => {
      socket.to(matchId).emit('user_typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    // Notify match event (from swipe route via socket)
    socket.on('notify_match', ({ targetUserId, matchId }) => {
      io.to(targetUserId).emit('new_match', { matchId });
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.userId}`);
      try {
        await User.findByIdAndUpdate(socket.userId, { lastActive: new Date() });
      } catch (err) {
        console.error('Error updating lastActive on disconnect:', err);
      }
    });
  });
};
