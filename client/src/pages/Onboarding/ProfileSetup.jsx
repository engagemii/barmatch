import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/index';
import useStore from '../../store/useStore';

const SPECIALTIES = [
  'Craft Cocktails', 'Flair Bartending', 'Beer & Wine', 'Spirits Expert',
  'Shot Specialist', 'Wine Expert', 'Sake', 'Draft Beer', 'Mixology', 'Classic Cocktails',
];

const CERTS = ['TIPS Certified', 'ServSafe', 'Cicerone', 'Sommelier'];

const VENUE_TYPES_LOVE = [
  'Upscale Bar', 'Hotel Bar', 'Rooftop', 'Event Venue',
  'Sports Bar', 'Nightclub', 'Restaurant', 'Brewery',
];

const VENUE_TYPES = [
  'Upscale Bar', 'Sports Bar', 'Restaurant', 'Nightclub',
  'Hotel Bar', 'Rooftop Lounge', 'Event Venue', 'Brewery',
];

const VIBES = [
  'Upscale', 'Rooftop', 'Live DJs', 'High Volume',
  'Weekend Nights', 'Chill', 'Craft Beer', 'Sports',
];

const DAYS = ['S', 'M', 'T', 'W', 'TH', 'F', 'SA'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function ChipSelect({ options, selected, onToggle, colorClass = '' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={`chip ${selected.includes(opt) ? 'selected' : ''} ${colorClass}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { auth, updateUser } = useStore((s) => ({ auth: s.auth, updateUser: s.updateUser }));
  const role = auth.user?.role;
  const fileRef = useRef(null);

  // Step: 2 = profile fields, 3 = location
  const [step, setStep] = useState(2);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Bartender fields
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [yearsExp, setYearsExp] = useState(1);
  const [specialties, setSpecialties] = useState([]);
  const [certs, setCerts] = useState([]);
  const [venueTypesLove, setVenueTypesLove] = useState([]);
  const [availability, setAvailability] = useState({
    sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false,
  });
  const [availableNow, setAvailableNow] = useState(false);
  const [rateMin, setRateMin] = useState(25);
  const [rateMax, setRateMax] = useState(40);
  const [bartenderBio, setBartenderBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Venue fields
  const [venueName, setVenueName] = useState('');
  const [venueType, setVenueType] = useState('');
  const [address, setAddress] = useState('');
  const [seats, setSeats] = useState('');
  const [priceRange, setPriceRange] = useState('$$');
  const [lookingFor, setLookingFor] = useState([]);
  const [vibe, setVibe] = useState([]);
  const [activelyHiring, setActivelyHiring] = useState(false);
  const [openShifts, setOpenShifts] = useState(1);
  const [perks, setPerks] = useState('');
  const [venueBio, setVenueBio] = useState('');

  // Location (step 3)
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const toggleSpecialties = (s) =>
    setSpecialties((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleCerts = (c) =>
    setCerts((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  const toggleVenueTypesLove = (v) =>
    setVenueTypesLove((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);
  const toggleLookingFor = (s) =>
    setLookingFor((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleVibe = (v) =>
    setVibe((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const toggleDay = (key) =>
    setAvailability((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(res.data.url);
      toast.success('Photo uploaded');
    } catch {
      toast.error('Upload failed. You can add photos later.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleNextStep = () => {
    if (role === 'bartender' && !name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (role === 'venue' && !venueName.trim()) {
      toast.error('Please enter your venue name');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!city.trim()) {
      toast.error('Please enter your city');
      return;
    }
    setLoading(true);
    try {
      const profileData = role === 'bartender'
        ? {
            name, title, yearsExp, specialties, certs, venueTypesLove,
            availability, availableNow, bio: bartenderBio,
            hourlyRate: { min: rateMin, max: rateMax },
            avatar: avatarUrl,
          }
        : {
            venueName, venueType, address, seats: Number(seats) || 0,
            priceRange, lookingFor, vibe, activelyHiring,
            openShifts: activelyHiring ? Number(openShifts) : 0,
            perks, bio: venueBio, avatar: avatarUrl,
          };

      const res = await api.put('/profile', {
        profile: profileData,
        location: { city, neighborhood },
        isOnboarded: true,
      });
      updateUser(res.data.user);
      toast.success('Profile created!');
      navigate('/discover');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col safe-top">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange text-sm font-semibold">Step {step} of 3</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full">
            <div
              className="h-full bg-orange rounded-full transition-all"
              style={{ width: step === 2 ? '66%' : '100%' }}
            />
          </div>
        </div>
        <h1 className="text-2xl font-black text-white">
          {step === 2
            ? role === 'bartender' ? 'Your Profile' : 'Venue Details'
            : 'Your Location'}
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          {step === 2
            ? 'Help venues / bartenders find you'
            : 'So we can show you nearby matches'}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-40">
        <AnimatePresence mode="wait">
          {step === 2 && role === 'bartender' && (
            <motion.div
              key="bartender-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-purple/50 flex items-center justify-center bg-bg-card2"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-[#9CA3AF]">
                      <span className="text-3xl">📷</span>
                      <span className="text-xs mt-1">Add photo</span>
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="spinner" />
                    </div>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <p className="text-[#9CA3AF] text-xs">Tap to add profile photo</p>
              </div>

              {/* Name */}
              <div>
                <label className="label-sm">FULL NAME</label>
                <input className="input-dark mt-1.5" placeholder="Marcus Rivera" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              {/* Title */}
              <div>
                <label className="label-sm">PROFESSIONAL TITLE</label>
                <input className="input-dark mt-1.5" placeholder="Craft Cocktail Specialist" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              {/* Years Experience */}
              <div>
                <label className="label-sm">YEARS OF EXPERIENCE</label>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setYearsExp((y) => Math.max(0, y - 1))}
                    className="w-10 h-10 rounded-btn bg-bg-card2 border border-white/10 flex items-center justify-center text-white text-xl"
                  >
                    −
                  </button>
                  <span className="text-white text-2xl font-bold w-12 text-center">{yearsExp}</span>
                  <button
                    type="button"
                    onClick={() => setYearsExp((y) => y + 1)}
                    className="w-10 h-10 rounded-btn bg-bg-card2 border border-white/10 flex items-center justify-center text-white text-xl"
                  >
                    +
                  </button>
                  <span className="text-[#9CA3AF] text-sm">years</span>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="label-sm">SPECIALTIES</label>
                <div className="mt-2">
                  <ChipSelect options={SPECIALTIES} selected={specialties} onToggle={toggleSpecialties} />
                </div>
              </div>

              {/* Certifications */}
              <div>
                <label className="label-sm">CERTIFICATIONS</label>
                <div className="mt-2">
                  <ChipSelect options={CERTS} selected={certs} onToggle={toggleCerts} />
                </div>
              </div>

              {/* Venue Types */}
              <div>
                <label className="label-sm">VENUE TYPES I LOVE</label>
                <div className="mt-2">
                  <ChipSelect options={VENUE_TYPES_LOVE} selected={venueTypesLove} onToggle={toggleVenueTypesLove} colorClass="teal" />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="label-sm">AVAILABILITY</label>
                <div className="flex gap-2 mt-2">
                  {DAY_KEYS.map((key, i) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleDay(key)}
                      className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all ${
                        availability[key]
                          ? 'bg-teal text-white'
                          : 'bg-bg-card2 text-[#9CA3AF] border border-white/10'
                      }`}
                    >
                      {DAYS[i]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Now */}
              <div className="flex items-center justify-between bg-bg-card2 rounded-btn p-4 border border-white/10">
                <div>
                  <p className="text-white font-medium text-sm">Available Now</p>
                  <p className="text-[#9CA3AF] text-xs">Show venues I'm ready to work immediately</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAvailableNow(!availableNow)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${availableNow ? 'bg-teal' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${availableNow ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="label-sm">HOURLY RATE RANGE</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">$</span>
                    <input
                      className="input-dark pl-7"
                      type="number"
                      placeholder="25"
                      value={rateMin}
                      onChange={(e) => setRateMin(Number(e.target.value))}
                    />
                  </div>
                  <span className="text-[#9CA3AF]">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">$</span>
                    <input
                      className="input-dark pl-7"
                      type="number"
                      placeholder="40"
                      value={rateMax}
                      onChange={(e) => setRateMax(Number(e.target.value))}
                    />
                  </div>
                  <span className="text-[#9CA3AF] text-sm">/hr</span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="label-sm">BIO (OPTIONAL)</label>
                <textarea
                  className="input-dark mt-1.5 resize-none"
                  rows={3}
                  placeholder="Tell venues what makes you unique..."
                  value={bartenderBio}
                  onChange={(e) => setBartenderBio(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && role === 'venue' && (
            <motion.div
              key="venue-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              {/* Venue name */}
              <div>
                <label className="label-sm">VENUE NAME</label>
                <input className="input-dark mt-1.5" placeholder="The Rooftop Bar" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
              </div>

              {/* Venue type */}
              <div>
                <label className="label-sm">VENUE TYPE</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {VENUE_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setVenueType(t)}
                      className={`chip ${venueType === t ? 'selected' : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="label-sm">ADDRESS</label>
                <input className="input-dark mt-1.5" placeholder="123 Main St" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              {/* Seats + Price Range */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="label-sm">SEATS</label>
                  <input className="input-dark mt-1.5" type="number" placeholder="150" value={seats} onChange={(e) => setSeats(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="label-sm">PRICE RANGE</label>
                  <div className="flex gap-1 mt-1.5">
                    {['$', '$$', '$$$', '$$$$'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriceRange(p)}
                        className={`flex-1 py-3 rounded-btn text-sm font-medium transition-all ${
                          priceRange === p
                            ? 'bg-orange text-white'
                            : 'bg-bg-card2 text-[#9CA3AF] border border-white/10'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Looking For */}
              <div>
                <label className="label-sm">LOOKING FOR (SKILLS)</label>
                <div className="mt-2">
                  <ChipSelect options={SPECIALTIES} selected={lookingFor} onToggle={toggleLookingFor} />
                </div>
              </div>

              {/* Vibe */}
              <div>
                <label className="label-sm">VIBE & ATMOSPHERE</label>
                <div className="mt-2">
                  <ChipSelect options={VIBES} selected={vibe} onToggle={toggleVibe} colorClass="teal" />
                </div>
              </div>

              {/* Actively Hiring */}
              <div className="flex items-center justify-between bg-bg-card2 rounded-btn p-4 border border-white/10">
                <div>
                  <p className="text-white font-medium text-sm">Actively Hiring</p>
                  <p className="text-[#9CA3AF] text-xs">Show bartenders you have open shifts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActivelyHiring(!activelyHiring)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${activelyHiring ? 'bg-teal' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${activelyHiring ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {activelyHiring && (
                <div>
                  <label className="label-sm">OPEN SHIFTS</label>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setOpenShifts((n) => Math.max(1, n - 1))}
                      className="w-10 h-10 rounded-btn bg-bg-card2 border border-white/10 flex items-center justify-center text-white text-xl"
                    >
                      −
                    </button>
                    <span className="text-white text-2xl font-bold w-12 text-center">{openShifts}</span>
                    <button
                      type="button"
                      onClick={() => setOpenShifts((n) => n + 1)}
                      className="w-10 h-10 rounded-btn bg-bg-card2 border border-white/10 flex items-center justify-center text-white text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Perks */}
              <div>
                <label className="label-sm">PERKS & BENEFITS</label>
                <input className="input-dark mt-1.5" placeholder="$30-$38/hr + pooled tips" value={perks} onChange={(e) => setPerks(e.target.value)} />
              </div>

              {/* Bio */}
              <div>
                <label className="label-sm">VENUE BIO</label>
                <textarea
                  className="input-dark mt-1.5 resize-none"
                  rows={3}
                  placeholder="Tell bartenders what makes your venue special..."
                  value={venueBio}
                  onChange={(e) => setVenueBio(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col items-center py-8">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-[#9CA3AF] text-center text-sm">
                  We use your city to show you relevant matches nearby.
                  We never share your exact location.
                </p>
              </div>

              <div>
                <label className="label-sm">CITY</label>
                <input
                  className="input-dark mt-1.5"
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <label className="label-sm">NEIGHBORHOOD (OPTIONAL)</label>
                <input
                  className="input-dark mt-1.5"
                  placeholder="Lower East Side"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed bottom buttons */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 py-4 bg-bg-primary border-t border-white/10 safe-bottom">
        {step === 2 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNextStep}
            className="btn-primary"
            style={{ boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}
          >
            Continue →
          </motion.button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-4 rounded-btn border border-white/20 text-white font-semibold"
            >
              Back
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={loading}
              className="flex-2 btn-primary flex items-center justify-center gap-2"
              style={{ flex: 2, boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}
            >
              {loading ? <div className="spinner" /> : 'Finish Setup 🍸'}
            </motion.button>
          </div>
        )}
      </div>

      {/* label-sm utility (Tailwind doesn't have this, inject inline) */}
      <style>{`.label-sm { color: #9CA3AF; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; display: block; }`}</style>
    </div>
  );
}
