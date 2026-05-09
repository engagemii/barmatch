import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function MatchModal({ data, onClose }) {
  const navigate = useNavigate();
  const { matchId, otherUser, myUser } = data;

  const myAvatar = myUser?.profile?.avatar;
  const theirAvatar = otherUser?.profile?.avatar;
  const myName = myUser?.profile?.name || myUser?.profile?.venueName || 'You';
  const theirName = otherUser?.profile?.name || otherUser?.profile?.venueName || 'Match';

  useEffect(() => {
    // First burst from left
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.6 },
      colors: ['#F97316', '#FB923C', '#14B8A6', '#8B5CF6', '#ffffff'],
      zIndex: 9999,
    });
    // Second burst from right
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.6 },
        colors: ['#F97316', '#FB923C', '#14B8A6', '#8B5CF6', '#ffffff'],
        zIndex: 9999,
      });
    }, 150);
    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#F97316', '#14B8A6', '#ffffff'],
        zIndex: 9999,
        scalar: 1.2,
      });
    }, 300);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,10,15,0.92)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.05 }}
        className="flex flex-col items-center gap-6 px-8 text-center"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 360, width: '100%' }}
      >
        {/* It's a Match text with glow */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ color: '#F97316', fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}
          >
            ✦ You've Got a Match ✦
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', damping: 12 }}
            style={{ fontSize: 42, fontWeight: 900, color: 'white', lineHeight: 1.1 }}
          >
            It's a Match!
          </motion.h1>
          <div style={{ fontSize: 32, marginTop: 4 }}>🍸</div>
        </div>

        {/* Avatars */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 12 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* My avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
            border: '4px solid #F97316', background: '#15102B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(249,115,22,0.6)', position: 'relative', zIndex: 1,
          }}>
            {myAvatar ? <img src={myAvatar} alt={myName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 40 }}>🍸</span>}
          </div>

          {/* Heart */}
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.5 }}
            style={{
              width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#F97316,#EA6C00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(249,115,22,0.7)', zIndex: 2, margin: '0 -10px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </motion.div>

          {/* Their avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
            border: '4px solid #8B5CF6', background: '#15102B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(139,92,246,0.6)', position: 'relative', zIndex: 1,
          }}>
            {theirAvatar ? <img src={theirAvatar} alt={theirName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 40 }}>🏢</span>}
          </div>
        </motion.div>

        {/* Names */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{myName} &amp; {theirName}</p>
          <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>both swiped right ✓</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.6, maxWidth: 280 }}
        >
          You both think it's a great fit. Start the conversation — talk shifts, pay, and vibe.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { onClose(); navigate(`/messages/${matchId}`); }}
            className="btn-primary"
            style={{ fontSize: 17, boxShadow: '0 8px 32px rgba(249,115,22,0.45)' }}
          >
            Send a Message →
          </motion.button>
          <button
            onClick={onClose}
            style={{ color: '#6B7280', fontSize: 14, fontWeight: 500, padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Keep Swiping
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
