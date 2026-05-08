import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/index';
import useStore from '../store/useStore';
import { socket } from '../App';

function timeLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ShiftOfferBubble({ msg, isOwn, onRespond }) {
  const { shiftOffer } = msg;
  const isPending = shiftOffer.status === 'pending';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className="rounded-card overflow-hidden max-w-[280px]"
        style={{
          background: '#15102B',
          border: '1px solid rgba(255,255,255,0.1)',
          width: '100%',
        }}
      >
        {/* Header */}
        <div className="px-4 py-2 border-b border-white/10">
          <span className="text-[#9CA3AF] text-xs font-bold tracking-widest">📋 SHIFT OFFER</span>
        </div>
        {/* Details */}
        <div className="px-4 py-3 flex flex-col gap-1.5">
          {shiftOffer.title && (
            <p className="text-white font-semibold text-sm">{shiftOffer.title}</p>
          )}
          {(shiftOffer.startDate || shiftOffer.startTime) && (
            <p className="text-[#9CA3AF] text-xs">
              📅 {shiftOffer.startDate} {shiftOffer.startTime && `· ${shiftOffer.startTime}`}{shiftOffer.endTime && ` – ${shiftOffer.endTime}`}
            </p>
          )}
          {shiftOffer.pay && (
            <p className="text-teal text-xs font-medium">💰 {shiftOffer.pay}</p>
          )}
          {shiftOffer.location && (
            <p className="text-[#9CA3AF] text-xs">📍 {shiftOffer.location}</p>
          )}
        </div>
        {/* Status / Actions */}
        <div className="px-4 pb-3">
          {shiftOffer.status === 'accepted' && (
            <div className="bg-teal/20 rounded-btn px-3 py-2 text-center">
              <span className="text-teal text-sm font-semibold">✓ Accepted</span>
            </div>
          )}
          {shiftOffer.status === 'declined' && (
            <div className="bg-red-500/20 rounded-btn px-3 py-2 text-center">
              <span className="text-red-400 text-sm font-semibold">Declined</span>
            </div>
          )}
          {isPending && !isOwn && (
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => onRespond(msg._id, 'accepted')}
                className="flex-1 py-2 rounded-btn bg-teal text-white text-sm font-semibold"
              >
                ✓ Accept
              </button>
              <button
                onClick={() => onRespond(msg._id, 'declined')}
                className="flex-1 py-2 rounded-btn border border-white/20 text-white text-sm font-semibold"
              >
                Decline
              </button>
            </div>
          )}
          {isPending && isOwn && (
            <p className="text-[#9CA3AF] text-xs text-center mt-1">Awaiting response...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ShiftOfferForm({ onSend, onClose }) {
  const [form, setForm] = useState({
    title: '', startDate: '', startTime: '', endTime: '', pay: '', location: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Please enter a shift title'); return; }
    onSend(form);
    onClose();
  };

  return (
    <motion.div
      initial={{ y: 300, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 300, opacity: 0 }}
      className="absolute bottom-0 left-0 right-0 bg-bg-card2 rounded-t-2xl border-t border-white/10 p-5 z-30"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">New Shift Offer</h3>
        <button onClick={onClose} className="text-[#9CA3AF]">✕</button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="input-dark" placeholder="Shift title (e.g. Fri & Sat Nights)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input-dark" placeholder="Date (e.g. Fri & Sat)" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        <div className="flex gap-2">
          <input className="input-dark" placeholder="Start (8:00 PM)" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          <input className="input-dark" placeholder="End (3:00 AM)" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        </div>
        <input className="input-dark" placeholder="Pay (e.g. $32/hr + tips)" value={form.pay} onChange={(e) => setForm({ ...form, pay: e.target.value })} />
        <input className="input-dark" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <button type="submit" className="btn-primary mt-1">Send Shift Offer</button>
      </form>
    </motion.div>
  );
}

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { auth } = useStore((s) => ({ auth: s.auth }));

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  const isVenue = auth.user?.role === 'venue';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Load messages + match info
    Promise.all([
      api.get(`/messages/${matchId}`),
      api.get(`/matches`),
    ])
      .then(([msgRes, matchRes]) => {
        setMessages(msgRes.data.messages);
        const match = matchRes.data.matches.find((m) => m._id === matchId);
        if (match) setOtherUser(match.otherUser);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Socket setup
    if (socket) {
      socket.emit('join_match', matchId);

      socket.on('new_message', (msg) => {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setIsOtherTyping(false);
      });

      socket.on('user_typing', ({ userId, isTyping }) => {
        if (userId !== auth.user?._id) {
          setIsOtherTyping(isTyping);
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit('leave_match', matchId);
        socket.off('new_message');
        socket.off('user_typing');
      }
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherTyping]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    // Typing indicator
    if (socket && !typing) {
      socket.emit('typing', { matchId, isTyping: true });
      setTyping(true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (socket) socket.emit('typing', { matchId, isTyping: false });
      setTyping(false);
    }, 1500);
  };

  const sendMessage = async (type = 'text', extra = {}) => {
    if (type === 'text' && !inputText.trim()) return;
    const payload = type === 'text'
      ? { type: 'text', text: inputText.trim() }
      : { type: 'shift_offer', shiftOffer: extra };

    // Optimistic UI
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      matchId,
      senderId: auth.user?._id,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputText('');

    // Also emit via socket for real-time
    if (socket) {
      socket.emit('send_message', { matchId, ...payload });
    } else {
      // Fallback to REST
      try {
        const res = await api.post(`/messages/${matchId}`, payload);
        setMessages((prev) => prev.map((m) => m._id === tempMsg._id ? res.data.message : m));
      } catch {
        setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
        toast.error('Failed to send message');
      }
    }
  };

  const handleShiftResponse = async (messageId, status) => {
    try {
      const res = await api.put(`/messages/${matchId}/shift/${messageId}`, { status });
      setMessages((prev) => prev.map((m) => m._id === messageId ? res.data.message : m));
      toast.success(status === 'accepted' ? 'Shift accepted!' : 'Shift declined');
    } catch {
      toast.error('Failed to update shift');
    }
  };

  const displayName = otherUser?.profile?.name || otherUser?.profile?.venueName || 'Match';

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg-primary flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col safe-top relative">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <button
          onClick={() => navigate('/messages')}
          className="w-9 h-9 flex items-center justify-center rounded-btn border border-white/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-card2 flex items-center justify-center flex-shrink-0">
          {otherUser?.profile?.avatar ? (
            <img src={otherUser.profile.avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">{otherUser?.role === 'bartender' ? '🍸' : '🏢'}</span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-white font-bold text-sm">{displayName}</p>
          <p className="text-xs">
            <span className="w-1.5 h-1.5 inline-block rounded-full bg-teal mr-1" />
            <span className="text-teal">Online now</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-btn border border-white/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.42a2 2 0 0 1 1.99-2.18H6.6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-btn border border-white/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages list */}
      <div style={{ overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "16px 16px 112px" }} className="flex-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="text-4xl">👋</div>
            <p className="text-[#9CA3AF] text-sm">
              You're now connected! Send a message to start the conversation.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === auth.user?._id || msg.senderId?.toString() === auth.user?._id?.toString();
          const showTime = idx === 0 || (
            new Date(msg.createdAt) - new Date(messages[idx - 1]?.createdAt) > 300000
          );

          if (msg.type === 'shift_offer') {
            return (
              <div key={msg._id}>
                {showTime && (
                  <p className="text-center text-[#6B7280] text-xs my-2">{timeLabel(msg.createdAt)}</p>
                )}
                <ShiftOfferBubble
                  msg={msg}
                  isOwn={isOwn}
                  onRespond={handleShiftResponse}
                />
              </div>
            );
          }

          return (
            <div key={msg._id}>
              {showTime && (
                <p className="text-center text-[#6B7280] text-xs my-2">{timeLabel(msg.createdAt)}</p>
              )}
              <div className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="rounded-2xl px-4 py-2.5 max-w-[75%]"
                  style={
                    isOwn
                      ? { background: 'linear-gradient(135deg, #F97316, #EA6C00)' }
                      : { background: '#15102B', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  <p className="text-white text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isOtherTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-bg-card border border-white/10 rounded-2xl px-4 py-2.5">
              <div className="flex gap-1">
                {[0, 0.2, 0.4].map((delay) => (
                  <motion.div
                    key={delay}
                    className="w-2 h-2 bg-[#9CA3AF] rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Shift offer form (venue only) */}
      <AnimatePresence>
        {showShiftForm && (
          <ShiftOfferForm
            onSend={(data) => sendMessage('shift_offer', data)}
            onClose={() => setShowShiftForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 safe-bottom border-t border-white/10"
        style={{ background: '#0A0A0F' }}
      >
        <div className="flex items-center gap-2">
          {isVenue && (
            <button
              onClick={() => setShowShiftForm(true)}
              className="w-10 h-10 flex items-center justify-center rounded-btn bg-bg-card2 border border-white/10 flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <input
            className="flex-1 input-dark py-3"
            placeholder={`Message ${displayName}...`}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage()}
            disabled={!inputText.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-btn bg-orange flex-shrink-0"
            style={{ opacity: inputText.trim() ? 1 : 0.4 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
