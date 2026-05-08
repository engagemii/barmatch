import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Sparkle({ style }) {
  return (
    <motion.div
      style={style}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 1.5 + Math.random(),
        repeat: Infinity,
        delay: Math.random() * 1.5,
      }}
      className="absolute w-2 h-2 text-orange"
    >
      ✦
    </motion.div>
  );
}

export default function MatchModal({ data, onClose }) {
  const navigate = useNavigate();
  const { matchId, otherUser, myUser } = data;

  const myAvatar = myUser?.profile?.avatar || myUser?.profile?.venueName;
  const theirAvatar = otherUser?.profile?.avatar;
  const myName = myUser?.profile?.name || myUser?.profile?.venueName || 'You';
  const theirName = otherUser?.profile?.name || otherUser?.profile?.venueName || 'Match';

  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    top: `${10 + Math.random() * 80}%`,
    left: `${5 + Math.random() * 90}%`,
    fontSize: `${10 + Math.random() * 16}px`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,10,15,0.95)' }}
      onClick={onClose}
    >
      {/* Sparkles */}
      {sparkles.map((s, i) => (
        <Sparkle key={i} style={{ position: 'absolute', ...s, color: '#F97316' }} />
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15, delay: 0.1 }}
        className="flex flex-col items-center gap-6 px-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header text */}
        <div>
          <p className="text-orange text-sm font-bold tracking-widest uppercase">
            You've Got a Match!
          </p>
          <h1 className="text-4xl font-black text-white mt-2">It's a Match! 🍸</h1>
        </div>

        {/* Overlapping avatars */}
        <div className="flex items-center justify-center relative">
          {/* My avatar */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange bg-bg-card2 flex items-center justify-center relative z-10"
            style={{ boxShadow: '0 0 30px rgba(249,115,22,0.5)' }}
          >
            {myAvatar && myAvatar.startsWith('http') ? (
              <img src={myAvatar} alt={myName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">🍸</span>
            )}
          </motion.div>

          {/* Overlap spacer with heart */}
          <div
            className="w-10 h-10 rounded-full bg-orange flex items-center justify-center z-20 -mx-2"
            style={{ boxShadow: '0 0 20px rgba(249,115,22,0.6)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>

          {/* Their avatar */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple bg-bg-card2 flex items-center justify-center relative z-10"
            style={{ boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}
          >
            {theirAvatar && theirAvatar.startsWith('http') ? (
              <img src={theirAvatar} alt={theirName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">🏢</span>
            )}
          </motion.div>
        </div>

        {/* Names */}
        <div>
          <p className="text-white font-semibold text-lg">
            {myName} &amp; {theirName}
          </p>
          <p className="text-[#9CA3AF] text-sm mt-1">both swiped right ✓</p>
        </div>

        {/* Description */}
        <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-xs">
          You both think it's a great fit. Start a conversation and talk about shifts, pay, and expectations.
        </p>

        {/* CTA Buttons */}
        <div className="w-full flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onClose();
              navigate(`/messages/${matchId}`);
            }}
            className="btn-primary text-lg"
            style={{ boxShadow: '0 8px 32px rgba(249,115,22,0.4)' }}
          >
            Send a Message →
          </motion.button>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] text-sm font-medium py-2"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
