import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/index';
import BottomNav from '../components/BottomNav';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'TH', 'F', 'SA'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function ViewProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/profile/${id}`)
      .then((res) => setUser(res.data.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg-primary flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-bg-primary flex items-center justify-center">
        <p className="text-[#9CA3AF]">User not found</p>
      </div>
    );
  }

  const p = user.profile || {};
  const isBartender = user.role === 'bartender';

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col safe-top">
      {/* Back header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-btn border border-white/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-white font-bold text-base">
          {isBartender ? p.name : p.venueName}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {isBartender ? (
          <BartenderProfile user={user} p={p} />
        ) : (
          <VenueProfile user={user} p={p} />
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function BartenderProfile({ user, p }) {
  const avail = p.availability || {};

  return (
    <div className="px-5 flex flex-col gap-5 pb-4">
      {/* Avatar + name */}
      <div className="flex flex-col items-center py-6">
        <div
          className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple bg-bg-card2 flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(139,92,246,0.4)' }}
        >
          {p.avatar ? (
            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">🍸</span>
          )}
        </div>
        <h2 className="text-white text-2xl font-black mt-4">{p.name}</h2>
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(user.rating || 0) ? '#F97316' : 'none'} stroke="#F97316" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
        </div>
        {p.title && <p className="text-[#9CA3AF] text-sm mt-1">{p.title}</p>}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: p.yearsExp ? `${p.yearsExp}` : '—', label: 'YRS EXP' },
          { value: user.reviewCount || 0, label: 'REVIEWS' },
          { value: (user.matches || []).length, label: 'MATCHES' },
          { value: user.location?.city?.split(' ')[0] || '—', label: 'CITY' },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg-card rounded-card p-3 text-center">
            <p className="text-white font-bold text-lg">{stat.value}</p>
            <p className="text-[#9CA3AF] text-[10px] font-semibold mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Available Now badge */}
      {p.availableNow && (
        <div className="flex items-center justify-center gap-2 bg-teal/10 rounded-btn py-3 border border-teal/30">
          <span className="w-2 h-2 rounded-full bg-teal" />
          <span className="text-teal font-semibold text-sm">Available Now</span>
        </div>
      )}

      {/* Specialties */}
      {(p.specialties || []).length > 0 && (
        <div>
          <h3 className="text-[#9CA3AF] text-xs font-bold mb-2 tracking-widest">SPECIALTIES</h3>
          <div className="flex flex-wrap gap-2">
            {p.specialties.map((s) => (
              <span key={s} className="bg-orange/20 text-orange rounded-pill px-3 py-1.5 text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Venue types */}
      {(p.venueTypesLove || []).length > 0 && (
        <div>
          <h3 className="text-[#9CA3AF] text-xs font-bold mb-2 tracking-widest">VENUE TYPES I LOVE</h3>
          <div className="flex flex-wrap gap-2">
            {p.venueTypesLove.map((v) => (
              <span key={v} className="chip teal text-xs">{v}</span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {(p.certs || []).length > 0 && (
        <div>
          <h3 className="text-[#9CA3AF] text-xs font-bold mb-2 tracking-widest">CERTIFICATIONS</h3>
          <div className="flex flex-wrap gap-2">
            {p.certs.map((c) => (
              <span key={c} className="bg-yellow-500/20 text-yellow-400 rounded-pill px-3 py-1.5 text-xs font-medium border border-yellow-500/30">
                ✓ {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      <div>
        <h3 className="text-[#9CA3AF] text-xs font-bold mb-2 tracking-widest">AVAILABILITY</h3>
        <div className="flex gap-2">
          {DAY_KEYS.map((key, i) => (
            <div
              key={key}
              className={`flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-semibold ${
                avail[key] ? 'bg-teal text-white' : 'bg-bg-card2 text-[#6B7280]'
              }`}
            >
              {DAY_LABELS[i]}
            </div>
          ))}
        </div>
      </div>

      {/* Rate */}
      {p.hourlyRate?.min && (
        <div className="bg-bg-card rounded-card px-5 py-4">
          <h3 className="text-[#9CA3AF] text-xs font-bold tracking-widest mb-1">HOURLY RATE</h3>
          <p className="text-teal font-bold text-xl">
            ${p.hourlyRate.min} – ${p.hourlyRate.max}<span className="text-sm font-normal text-[#9CA3AF]">/hr</span>
          </p>
        </div>
      )}

      {/* Bio */}
      {p.bio && (
        <div>
          <h3 className="text-[#9CA3AF] text-xs font-bold mb-2 tracking-widest">BIO</h3>
          <p className="text-white text-sm leading-relaxed">{p.bio}</p>
        </div>
      )}
    </div>
  );
}

function VenueProfile({ user, p }) {
  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Banner image */}
      <div className="h-52 bg-bg-surface relative">
        {p.avatar ? (
          <img src={p.avatar} alt={p.venueName} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #231847, #15102B)' }}
          >
            <span className="text-8xl">🏢</span>
          </div>
        )}
        {p.activelyHiring && (
          <div className="absolute bottom-3 left-3 bg-teal rounded-pill px-3 py-1.5 text-white text-xs font-bold">
            ● Actively Hiring — {p.openShifts || 0} Open Shifts
          </div>
        )}
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* Name + type */}
        <div>
          <h2 className="text-white text-2xl font-black">{p.venueName}</h2>
          <div className="flex items-center gap-2 mt-1">
            {p.venueType && <span className="text-orange font-medium">{p.venueType}</span>}
            {p.priceRange && <span className="text-[#9CA3AF]">{p.priceRange}</span>}
          </div>
          {user.location?.city && (
            <p className="text-[#6B7280] text-sm mt-1">
              📍 {user.location.city}{user.location?.neighborhood ? `, ${user.location.neighborhood}` : ''}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: p.rating ? `${p.rating}⭐` : '—', label: 'RATING' },
            { value: p.seats || '—', label: 'SEATS' },
            { value: p.priceRange || '—', label: 'PRICE' },
            { value: p.openShifts || 0, label: 'SHIFTS' },
          ].map((stat) => (
            <div key={stat.label} className="bg-bg-card rounded-card p-3 text-center">
              <p className="text-white font-bold text-base">{stat.value}</p>
              <p className="text-[#9CA3AF] text-[10px] font-semibold mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Looking For */}
        {(p.lookingFor || []).length > 0 && (
          <div>
            <h3 className="text-[#9CA3AF] text-xs font-bold mb-2 tracking-widest">LOOKING FOR</h3>
            <div className="flex flex-wrap gap-2">
              {p.lookingFor.map((s) => (
                <span key={s} className="bg-orange/20 text-orange rounded-pill px-3 py-1.5 text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vibe */}
        {(p.vibe || []).length > 0 && (
          <div>
            <h3 className="text-[#9CA3AF] text-xs font-bold mb-2 tracking-widest">VIBE & ATMOSPHERE</h3>
            <div className="flex flex-wrap gap-2">
              {p.vibe.map((v) => (
                <span key={v} className="chip teal text-xs">{v}</span>
              ))}
            </div>
          </div>
        )}

        {/* Perks */}
        {p.perks && (
          <div className="bg-bg-card rounded-card px-5 py-4">
            <h3 className="text-[#9CA3AF] text-xs font-bold tracking-widest mb-1">PERKS & BENEFITS</h3>
            <p className="text-teal font-semibold">{p.perks}</p>
          </div>
        )}

        {/* Bio */}
        {p.bio && (
          <div>
            <h3 className="text-[#9CA3AF] text-xs font-bold mb-2 tracking-widest">ABOUT</h3>
            <p className="text-white text-sm leading-relaxed">{p.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
