import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';

const SWIPE_THRESHOLD = 120;

export default function SwipeCard({ user, onSwipe, isTop, stackIndex }) {
  const [{ x, rotate, opacity, scale, y }, api] = useSpring(() => ({
    x: 0,
    rotate: 0,
    opacity: 1,
    scale: isTop ? 1 : 1 - stackIndex * 0.04,
    y: stackIndex * 14,
    config: { tension: 280, friction: 28 },
  }));

  // Smoothly animate scale/y when stack position changes
  useEffect(() => {
    api.start({
      scale: isTop ? 1 : 1 - stackIndex * 0.04,
      y: stackIndex * 14,
    });
  }, [stackIndex, isTop]);

  const isDragging = useRef(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (!isTop) return;
      isDragging.current = active;

      if (active) {
        api.start({ x: mx, rotate: mx * 0.06, opacity: 1, immediate: false });
      } else {
        const shouldSwipe = Math.abs(mx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.5;
        if (shouldSwipe) {
          const direction = mx > 0 || dx > 0 ? 'right' : 'left';
          const flyX = direction === 'right' ? window.innerWidth + 300 : -window.innerWidth - 300;
          api.start({ x: flyX, rotate: flyX * 0.06, opacity: 0, config: { tension: 200, friction: 25 } });
          setTimeout(() => onSwipe(direction, user._id), 250);
        } else {
          api.start({ x: 0, rotate: 0, opacity: 1 });
        }
      }
    },
    {
      filterTaps: true,
      rubberband: true,
      pointer: { touch: true },
      eventOptions: { passive: false },
    }
  );

  const rightOpacity = x.to((v) => Math.max(0, Math.min(1, v / SWIPE_THRESHOLD)));
  const leftOpacity  = x.to((v) => Math.max(0, Math.min(1, -v / SWIPE_THRESHOLD)));

  const p = user.profile || {};
  const isBartender = user.role === 'bartender';
  const photo = p.avatar || null;

  const fallbackBg = isBartender
    ? 'linear-gradient(135deg, #2D1B69, #1A0E3D)'
    : 'linear-gradient(135deg, #1A2740, #0A1520)';

  return (
    <animated.div
      {...(isTop ? bind() : {})}
      style={{
        x, rotate, opacity, scale, y,
        touchAction: 'none',
        position: 'absolute',
        left: 0, right: 0, top: 0, bottom: 0,
        zIndex: 10 - stackIndex,
        cursor: isTop ? 'grab' : 'default',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <div style={{
        margin: 0,
        height: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        background: fallbackBg,
        boxShadow: isTop ? '0 24px 64px rgba(0,0,0,0.7)' : '0 8px 24px rgba(0,0,0,0.4)',
      }}>
        {/* Shimmer while image loads */}
        {photo && !imgLoaded && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(110deg, #1a1a2e 30%, #2a1f4e 50%, #1a1a2e 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }} />
        )}

        {/* Photo */}
        {photo && (
          <img
            src={photo}
            alt=""
            onLoad={() => setImgLoaded(true)}
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.25s ease',
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              zIndex: 2,
            }}
          />
        )}

        {/* LIKE / PASS stamp overlays */}
        {isTop && (
          <>
            <animated.div style={{ opacity: rightOpacity, position: 'absolute', inset: 0, zIndex: 20,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '20px', pointerEvents: 'none' }}>
              <div style={{ border: '4px solid #14B8A6', borderRadius: '12px', padding: '4px 14px', transform: 'rotate(-20deg)' }}>
                <span style={{ color: '#14B8A6', fontSize: '28px', fontWeight: 900 }}>LIKE</span>
              </div>
            </animated.div>
            <animated.div style={{ opacity: leftOpacity, position: 'absolute', inset: 0, zIndex: 20,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '20px', pointerEvents: 'none' }}>
              <div style={{ border: '4px solid #EF4444', borderRadius: '12px', padding: '4px 14px', transform: 'rotate(20deg)' }}>
                <span style={{ color: '#EF4444', fontSize: '28px', fontWeight: 900 }}>PASS</span>
              </div>
            </animated.div>
          </>
        )}

        {/* Match % badge */}
        {user.matchScore && (
          <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10,
            background: '#F97316', borderRadius: '50px', padding: '4px 12px',
            color: 'white', fontSize: '12px', fontWeight: 700, boxShadow: '0 2px 12px rgba(249,115,22,0.5)' }}>
            {user.matchScore}% Match
          </div>
        )}

        {/* Hiring / Available badge top-left */}
        {isBartender && p.availableNow && (
          <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 10,
            background: '#14B8A6', borderRadius: '50px', padding: '4px 12px',
            color: 'white', fontSize: '11px', fontWeight: 700 }}>
            ● Available Now
          </div>
        )}
        {!isBartender && p.activelyHiring && (
          <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 10,
            background: '#14B8A6', borderRadius: '50px', padding: '4px 12px',
            color: 'white', fontSize: '11px', fontWeight: 700 }}>
            ● {p.openShifts || 0} Open Shifts
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.65) 58%, rgba(0,0,0,0.96) 100%)',
        }} />

        {/* Bottom info panel */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '16px 18px 20px' }}>
          {isBartender ? <BartenderInfo user={user} p={p} /> : <VenueInfo user={user} p={p} />}
        </div>
      </div>
    </animated.div>
  );
}

function BartenderInfo({ user, p }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
        <span style={{ color: 'white', fontSize: '24px', fontWeight: 800, lineHeight: 1.1 }}>
          {p.name || 'Bartender'}
        </span>
        {p.yearsExp && (
          <span style={{ color: '#9CA3AF', fontSize: '16px', fontWeight: 400 }}>{p.yearsExp} yrs</span>
        )}
      </div>
      <div style={{ color: '#F97316', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
        {p.title || 'Bartender'}
      </div>
      {user.location?.neighborhood && (
        <div style={{ color: '#D1D5DB', fontSize: '12px', marginBottom: '10px' }}>
          📍 {user.location.neighborhood}, {user.location.city}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {(p.specialties || []).slice(0, 3).map(s => <Chip key={s} label={s} variant="orange" />)}
        {(p.certs || []).slice(0, 1).map(c => <Chip key={c} label={`✓ ${c}`} variant="yellow" />)}
        {p.hourlyRate?.min && <Chip label={`$${p.hourlyRate.min}–$${p.hourlyRate.max}/hr`} variant="teal" />}
      </div>
    </>
  );
}

function VenueInfo({ user, p }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
        <span style={{ color: 'white', fontSize: '24px', fontWeight: 800, lineHeight: 1.1 }}>
          {p.venueName || 'Venue'}
        </span>
        {p.priceRange && <span style={{ color: '#9CA3AF', fontSize: '15px' }}>{p.priceRange}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ color: '#F97316', fontSize: '13px', fontWeight: 600 }}>{p.venueType}</span>
        {p.rating && <span style={{ color: '#D1D5DB', fontSize: '12px' }}>⭐ {p.rating}</span>}
        {p.seats && <span style={{ color: '#D1D5DB', fontSize: '12px' }}>· {p.seats} seats</span>}
      </div>
      {user.location?.neighborhood && (
        <div style={{ color: '#D1D5DB', fontSize: '12px', marginBottom: '10px' }}>
          📍 {user.location.neighborhood}, {user.location.city}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {(p.vibe || []).slice(0, 3).map(v => <Chip key={v} label={v} variant="teal" />)}
        {p.perks && <Chip label={`💰 ${p.perks}`} variant="green" />}
      </div>
    </>
  );
}

function Chip({ label, variant = 'default' }) {
  const styles = {
    orange: { background: 'rgba(249,115,22,0.25)', border: '1px solid rgba(249,115,22,0.5)', color: '#FB923C' },
    teal:   { background: 'rgba(20,184,166,0.25)',  border: '1px solid rgba(20,184,166,0.5)',  color: '#2DD4BF' },
    yellow: { background: 'rgba(234,179,8,0.25)',   border: '1px solid rgba(234,179,8,0.5)',   color: '#FCD34D' },
    green:  { background: 'rgba(34,197,94,0.2)',    border: '1px solid rgba(34,197,94,0.4)',   color: '#86EFAC' },
    default:{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',color: 'white' },
  };
  return (
    <span style={{
      ...styles[variant],
      borderRadius: '50px', padding: '4px 10px', fontSize: '11px', fontWeight: 600,
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    }}>
      {label}
    </span>
  );
}
