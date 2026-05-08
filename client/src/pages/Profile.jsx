import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/index';
import useStore from '../store/useStore';
import BottomNav from '../components/BottomNav';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'TH', 'F', 'SA'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function Profile() {
  const navigate = useNavigate();
  const { auth, updateUser, logout } = useStore((s) => ({
    auth: s.auth,
    updateUser: s.updateUser,
    logout: s.logout,
  }));

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState(null);
  const fileRef = useRef(null);

  const user = auth.user;
  const p = user?.profile || {};
  const isBartender = user?.role === 'bartender';

  const startEditing = () => {
    setEditData({ ...p });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/profile', {
        profile: editData,
        location: user.location,
      });
      updateUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditData((d) => ({ ...d, avatar: res.data.url }));
      toast.success('Photo updated');
    } catch {
      toast.error('Upload failed');
    }
  };

  const displayName = isBartender ? p.name : p.venueName;
  const avail = p.availability || {};

  return (
    <div className="bg-bg-primary flex flex-col safe-top" style={{ height: '100dvh', overflow: 'hidden' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">My Profile</h1>
        <div className="flex items-center gap-2">
          {!editing && (
            <button
              onClick={startEditing}
              className="px-4 py-2 rounded-btn bg-bg-card border border-white/10 text-white text-sm font-medium"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="px-4 py-2 rounded-btn bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 px-5" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '100px' }}>
        {/* Avatar */}
        <div className="flex flex-col items-center py-6">
          <div
            className="relative w-28 h-28 rounded-full overflow-hidden border-4 flex items-center justify-center bg-bg-card2"
            style={{ borderColor: isBartender ? '#8B5CF6' : '#F97316' }}
          >
            {(editing ? editData?.avatar : p.avatar) ? (
              <img src={editing ? editData.avatar : p.avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">{isBartender ? '🍸' : '🏢'}</span>
            )}
            {editing && (
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <span className="text-white text-xs font-medium">Change</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <h2 className="text-white text-xl font-bold mt-3">{displayName || 'Complete your profile'}</h2>
          <p className="text-orange text-sm font-medium mt-0.5">{user?.role === 'bartender' ? 'Bartender' : 'Venue'}</p>
          {user?.location?.city && (
            <p className="text-[#6B7280] text-sm mt-1">📍 {user.location.city}</p>
          )}
        </div>

        {!editing ? (
          // View mode
          <div className="flex flex-col gap-5">
            {isBartender ? (
              <>
                {p.title && (
                  <InfoRow label="TITLE" value={p.title} />
                )}
                {p.yearsExp !== undefined && (
                  <InfoRow label="EXPERIENCE" value={`${p.yearsExp} years`} />
                )}
                {p.hourlyRate?.min && (
                  <InfoRow label="RATE" value={`$${p.hourlyRate.min}–$${p.hourlyRate.max}/hr`} />
                )}
                {(p.specialties || []).length > 0 && (
                  <TagSection label="SPECIALTIES" tags={p.specialties} color="orange" />
                )}
                {(p.certs || []).length > 0 && (
                  <TagSection label="CERTIFICATIONS" tags={p.certs} color="yellow" />
                )}
                {(p.venueTypesLove || []).length > 0 && (
                  <TagSection label="VENUE TYPES I LOVE" tags={p.venueTypesLove} color="teal" />
                )}
                <div>
                  <p className="text-[#9CA3AF] text-xs font-bold tracking-widest mb-2">AVAILABILITY</p>
                  <div className="flex gap-2">
                    {DAY_KEYS.map((key, i) => (
                      <div
                        key={key}
                        className={`flex-1 h-9 rounded-lg flex items-center justify-center text-xs font-semibold ${
                          avail[key] ? 'bg-teal text-white' : 'bg-bg-card2 text-[#6B7280]'
                        }`}
                      >
                        {DAY_LABELS[i]}
                      </div>
                    ))}
                  </div>
                </div>
                {p.bio && (
                  <div>
                    <p className="text-[#9CA3AF] text-xs font-bold tracking-widest mb-2">BIO</p>
                    <p className="text-white text-sm leading-relaxed">{p.bio}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {p.venueType && <InfoRow label="VENUE TYPE" value={p.venueType} />}
                {p.address && <InfoRow label="ADDRESS" value={p.address} />}
                {p.seats && <InfoRow label="SEATS" value={p.seats} />}
                {p.priceRange && <InfoRow label="PRICE RANGE" value={p.priceRange} />}
                {p.perks && <InfoRow label="PERKS" value={p.perks} />}
                {(p.lookingFor || []).length > 0 && (
                  <TagSection label="LOOKING FOR" tags={p.lookingFor} color="orange" />
                )}
                {(p.vibe || []).length > 0 && (
                  <TagSection label="VIBE" tags={p.vibe} color="teal" />
                )}
                {p.bio && (
                  <div>
                    <p className="text-[#9CA3AF] text-xs font-bold tracking-widest mb-2">BIO</p>
                    <p className="text-white text-sm leading-relaxed">{p.bio}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // Edit mode
          <div className="flex flex-col gap-4">
            {isBartender ? (
              <>
                <EditField label="NAME" value={editData?.name || ''} onChange={(v) => setEditData({ ...editData, name: v })} />
                <EditField label="TITLE" value={editData?.title || ''} onChange={(v) => setEditData({ ...editData, title: v })} />
                <EditField label="BIO" value={editData?.bio || ''} onChange={(v) => setEditData({ ...editData, bio: v })} multiline />
              </>
            ) : (
              <>
                <EditField label="VENUE NAME" value={editData?.venueName || ''} onChange={(v) => setEditData({ ...editData, venueName: v })} />
                <EditField label="ADDRESS" value={editData?.address || ''} onChange={(v) => setEditData({ ...editData, address: v })} />
                <EditField label="PERKS" value={editData?.perks || ''} onChange={(v) => setEditData({ ...editData, perks: v })} />
                <EditField label="BIO" value={editData?.bio || ''} onChange={(v) => setEditData({ ...editData, bio: v })} multiline />
              </>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-4 rounded-btn border border-white/20 text-white font-semibold"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="flex-2 btn-primary flex items-center justify-center gap-2"
                style={{ flex: 2 }}
              >
                {saving ? <div className="spinner" /> : 'Save Changes'}
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-bg-card rounded-btn px-4 py-3">
      <p className="text-[#9CA3AF] text-xs font-bold tracking-widest">{label}</p>
      <p className="text-white text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}

function TagSection({ label, tags, color }) {
  const colorMap = {
    orange: 'bg-orange/20 text-orange',
    teal: 'bg-teal/20 text-teal',
    yellow: 'bg-yellow-500/20 text-yellow-400',
  };
  return (
    <div>
      <p className="text-[#9CA3AF] text-xs font-bold tracking-widest mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t} className={`rounded-pill px-3 py-1.5 text-xs font-medium ${colorMap[color] || colorMap.orange}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, multiline = false }) {
  return (
    <div>
      <label className="text-[#9CA3AF] text-xs font-bold tracking-widest block mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          className="input-dark resize-none"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input-dark"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
