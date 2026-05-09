import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/index';
import useStore from '../store/useStore';
import BottomNav from '../components/BottomNav';
import SwipeCard from '../components/SwipeCard';

const BARTENDER_SPECIALTIES = ['Craft Cocktails', 'Flair Bartending', 'Beer & Wine', 'Spirits Expert', 'Shot Specialist', 'Wine Expert', 'Sake', 'Draft Beer'];
const VENUE_VIBES = ['Upscale', 'Rooftop', 'Live DJs', 'High Volume', 'Weekend Nights', 'Chill', 'Craft Beer', 'Sports'];
const DAYS = ['S', 'M', 'T', 'W', 'TH', 'F', 'SA'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function Discover() {
  const { auth, discover, setDiscoverStack, advanceDiscover, appendDiscoverStack, showMatchModal } = useStore((s) => ({
    auth: s.auth,
    discover: s.discover,
    setDiscoverStack: s.setDiscoverStack,
    advanceDiscover: s.advanceDiscover,
    appendDiscoverStack: s.appendDiscoverStack,
    showMatchModal: s.showMatchModal,
  }));

  const [loading, setLoading] = useState(false);
  const [emptyStack, setEmptyStack] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const isBartender = auth.user?.role === 'bartender';
  const [filters, setFilters] = useState({ availableNow: false, activelyHiring: false, selectedTags: [], selectedDays: [] });
  const [pendingFilters, setPendingFilters] = useState({ availableNow: false, activelyHiring: false, selectedTags: [], selectedDays: [] });

  const fetchStack = useCallback(async (replace = false, activeFilters = filters) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = {};
      if (activeFilters.availableNow) params.availableNow = true;
      if (activeFilters.activelyHiring) params.activelyHiring = true;
      if (activeFilters.selectedTags.length) params.tags = activeFilters.selectedTags.join(',');
      if (activeFilters.selectedDays.length) params.days = activeFilters.selectedDays.join(',');
      const res = await api.get('/discover', { params });
      if (res.data.users.length === 0) { setEmptyStack(true); }
      else {
        setEmptyStack(false);
        if (replace) setDiscoverStack(res.data.users);
        else appendDiscoverStack(res.data.users);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [loading, filters]);

  useEffect(() => { if (discover.stack.length === 0) fetchStack(true); }, []);
  useEffect(() => {
    const remaining = discover.stack.length - discover.currentIndex;
    if (remaining <= 3 && !loading && !emptyStack) fetchStack(false);
  }, [discover.currentIndex, discover.stack.length]);

  // Preload images for upcoming cards so they're cached before the user sees them
  useEffect(() => {
    const upcoming = discover.stack.slice(discover.currentIndex, discover.currentIndex + 5);
    upcoming.forEach(u => {
      const src = u?.profile?.avatar;
      if (src) { const img = new Image(); img.src = src; }
    });
  }, [discover.currentIndex, discover.stack.length]);

  const applyFilters = () => {
    setFilters(pendingFilters);
    setShowFilters(false);
    fetchStack(true, pendingFilters);
  };
  const resetFilters = () => {
    const blank = { availableNow: false, activelyHiring: false, selectedTags: [], selectedDays: [] };
    setPendingFilters(blank); setFilters(blank); setShowFilters(false); fetchStack(true, blank);
  };
  const toggleTag = (tag) => setPendingFilters(f => ({ ...f, selectedTags: f.selectedTags.includes(tag) ? f.selectedTags.filter(t => t !== tag) : [...f.selectedTags, tag] }));
  const toggleDay = (day) => setPendingFilters(f => ({ ...f, selectedDays: f.selectedDays.includes(day) ? f.selectedDays.filter(d => d !== day) : [...f.selectedDays, day] }));

  const handleSwipe = (direction, targetId) => {
    const swipedUser = discover.stack[discover.currentIndex];
    advanceDiscover(); // advance immediately — don't wait for API
    api.post('/swipe', { targetId, direction })
      .then(res => {
        if (res.data.matched) showMatchModal({ matchId: res.data.matchId, otherUser: swipedUser, myUser: auth.user });
      })
      .catch(() => {}); // silent
  };

  const swipeTop = (dir) => { const c = discover.stack[discover.currentIndex]; if (c) handleSwipe(dir, c._id); };
  const superSwipe = () => { const c = discover.stack[discover.currentIndex]; if (c) { handleSwipe('super', c._id); toast('⭐ Super Swipe!'); } };

  const activeFilterCount = (filters.availableNow || filters.activelyHiring ? 1 : 0) + filters.selectedTags.length + filters.selectedDays.length;
  const visibleCards = discover.stack.slice(discover.currentIndex, discover.currentIndex + 3);
  const hasCards = visibleCards.length > 0;

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0A0A0F', overflow: 'hidden' }}>

      {/* ── Minimal header ── */}
      <div style={{ flexShrink: 0, padding: '12px 16px 8px', paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 500 }}>{auth.user?.location?.city || 'Your City'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Dot indicators */}
            {hasCards && visibleCards.map((_, i) => (
              <div key={i} style={{ borderRadius: '50%', background: i === 0 ? '#F97316' : 'rgba(255,255,255,0.2)', width: i === 0 ? 16 : 8, height: 8, transition: 'all 0.3s' }} />
            ))}
          </div>
          {/* Gear */}
          <button onClick={() => { setPendingFilters(filters); setShowFilters(true); }}
            style={{ position: 'relative', width: 36, height: 36, borderRadius: 10, background: '#15102B', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={activeFilterCount > 0 ? '#F97316' : '#9CA3AF'} strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            {activeFilterCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#F97316', color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Card area — fills all remaining space above action bar ── */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {loading && !hasCards ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Finding matches...</p>
          </div>
        ) : !hasCards ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: '0 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 64 }}>🍸</div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>You've seen everyone!</h2>
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Check back later as more {isBartender ? 'venues' : 'bartenders'} join.</p>
            <button onClick={() => fetchStack(true)} className="btn-primary" style={{ maxWidth: 200 }}>Refresh</button>
            <button
              onClick={async () => {
                await api.delete('/swipe/reset');
                setEmptyStack(false);
                fetchStack(true);
              }}
              style={{ maxWidth: 200, width: '100%', padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#9CA3AF', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Reset &amp; Start Over
            </button>
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: '0 8px', overflow: 'hidden' }}>
            <AnimatePresence>
              {visibleCards.slice().reverse().map((user, reverseIdx) => {
                const stackIndex = visibleCards.length - 1 - reverseIdx;
                return (
                  <SwipeCard key={user._id} user={user} onSwipe={handleSwipe} isTop={stackIndex === 0} stackIndex={stackIndex} />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Action buttons — BELOW card, never overlapping ── */}
      {hasCards && (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '12px 0 10px', background: '#0A0A0F' }}>
          {/* Pass */}
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => swipeTop('left')}
            style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A0F0F', border: '2px solid rgba(239,68,68,0.5)', cursor: 'pointer', boxShadow: '0 4px 20px rgba(239,68,68,0.2)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/></svg>
          </motion.button>

          {/* Super swipe */}
          <motion.button whileTap={{ scale: 0.88 }} onClick={superSwipe}
            style={{ width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A1500', border: '2px solid rgba(234,179,8,0.5)', cursor: 'pointer', boxShadow: '0 4px 20px rgba(234,179,8,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </motion.button>

          {/* Like */}
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => swipeTop('right')}
            style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A1A18', border: '2px solid rgba(20,184,166,0.5)', cursor: 'pointer', boxShadow: '0 4px 20px rgba(20,184,166,0.2)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#14B8A6" stroke="#14B8A6" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </motion.button>
        </div>
      )}

      <BottomNav />

      {/* ── Filter drawer ── */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto', width: '100%', maxWidth: 430, zIndex: 201, background: '#15102B', borderRadius: '24px 24px 0 0', paddingBottom: 'env(safe-area-inset-bottom, 16px)', maxHeight: '85vh', overflowY: 'auto', overflowX: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }} />
              </div>
              <div style={{ padding: '0 20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 16px' }}>
                  <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>Filters</span>
                  <button onClick={resetFilters} style={{ color: '#F97316', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Reset all</button>
                </div>

                <FilterSection title={isBartender ? 'Availability' : 'Hiring Status'}>
                  <Toggle
                    label={isBartender ? 'Available Now Only' : 'Actively Hiring Only'}
                    value={isBartender ? pendingFilters.availableNow : pendingFilters.activelyHiring}
                    onChange={(v) => setPendingFilters(f => isBartender ? { ...f, availableNow: v } : { ...f, activelyHiring: v })}
                  />
                </FilterSection>

                <FilterSection title={isBartender ? 'Specialties' : 'Vibe'}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(isBartender ? BARTENDER_SPECIALTIES : VENUE_VIBES).map(tag => {
                      const on = pendingFilters.selectedTags.includes(tag);
                      return (
                        <button key={tag} onClick={() => toggleTag(tag)} style={{ borderRadius: 50, padding: '7px 14px', fontSize: 13, fontWeight: 500, border: on ? '1px solid #F97316' : '1px solid rgba(255,255,255,0.12)', background: on ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)', color: on ? '#F97316' : '#9CA3AF', cursor: 'pointer', transition: 'all 0.15s' }}>{tag}</button>
                      );
                    })}
                  </div>
                </FilterSection>

                {isBartender && (
                  <FilterSection title="Available Days">
                    <div style={{ display: 'flex', gap: 6 }}>
                      {DAYS.map((d, i) => {
                        const key = DAY_KEYS[i];
                        const on = pendingFilters.selectedDays.includes(key);
                        return (
                          <button key={key} onClick={() => toggleDay(key)} style={{ flex: 1, height: 40, borderRadius: 10, fontSize: 12, fontWeight: 600, border: on ? '1px solid #14B8A6' : '1px solid rgba(255,255,255,0.12)', background: on ? '#14B8A6' : 'rgba(255,255,255,0.05)', color: on ? 'white' : '#9CA3AF', cursor: 'pointer', transition: 'all 0.15s' }}>{d}</button>
                        );
                      })}
                    </div>
                  </FilterSection>
                )}

                <button onClick={applyFilters} className="btn-primary" style={{ marginTop: 16 }}>Apply Filters</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ color: '#6B7280', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: 'white', fontSize: 14 }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{ width: 48, height: 28, borderRadius: 14, position: 'relative', background: value ? '#F97316' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
        <span style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  );
}
