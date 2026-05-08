import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/index';
import useStore from '../../store/useStore';

export default function RoleSelect() {
  const navigate = useNavigate();
  const { updateUser } = useStore((s) => ({ updateUser: s.updateUser }));
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [howExpanded, setHowExpanded] = useState(false);

  const handleContinue = async () => {
    if (!selected) {
      toast.error('Please select your role');
      return;
    }
    setLoading(true);
    try {
      const res = await api.put('/profile', { role: selected });
      updateUser({ role: selected });
      navigate('/onboarding/profile');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col px-6 py-8 safe-top safe-bottom">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-orange text-sm font-semibold">Step 1 of 3</span>
        <div className="flex-1 h-1 bg-white/10 rounded-full">
          <div className="h-full w-1/3 bg-orange rounded-full" />
        </div>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white leading-tight">I am a...</h1>
        <p className="text-[#9CA3AF] text-sm mt-2">
          Choose your role to create the right profile for you.
        </p>
      </div>

      {/* Role cards */}
      <div className="flex flex-col gap-4 flex-1">
        {/* Bartender card */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSelected('bartender')}
          className={`w-full text-left rounded-card p-5 border-2 transition-all ${
            selected === 'bartender'
              ? 'border-orange bg-bg-card2'
              : 'border-white/10 bg-bg-card'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-gradient flex items-center justify-center text-2xl flex-shrink-0">
              🍸
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Bartender</h3>
                {selected === 'bartender' && (
                  <div className="w-6 h-6 rounded-full bg-orange flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-[#9CA3AF] text-sm mt-1 leading-snug">
                Showcase your skills, experience, and availability to get hired at top venues.
              </p>
            </div>
          </div>
          {selected === 'bartender' && (
            <div className="flex flex-wrap gap-2 mt-4">
              {['Craft Cocktails', 'Flexible Shifts', 'Get Discovered'].map((tag) => (
                <span key={tag} className="bg-purple/20 text-purple-light rounded-pill px-3 py-1 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.button>

        {/* Venue card */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSelected('venue')}
          className={`w-full text-left rounded-card p-5 border-2 transition-all ${
            selected === 'venue'
              ? 'border-orange bg-bg-card2'
              : 'border-white/10 bg-bg-card'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-gradient flex items-center justify-center text-2xl flex-shrink-0">
              🏢
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Venue / Bar / Restaurant</h3>
                {selected === 'venue' && (
                  <div className="w-6 h-6 rounded-full bg-orange flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-[#9CA3AF] text-sm mt-1 leading-snug">
                Post your open shifts and find bartenders who are the perfect fit.
              </p>
            </div>
          </div>
          {selected === 'venue' && (
            <div className="flex flex-wrap gap-2 mt-4">
              {['Post Shifts', 'Find Talent', 'Hire Directly'].map((tag) => (
                <span key={tag} className="bg-orange/20 text-orange rounded-pill px-3 py-1 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.button>

        {/* How it works */}
        <div className="rounded-card border border-white/10 bg-bg-card overflow-hidden">
          <button
            onClick={() => setHowExpanded(!howExpanded)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <span className="text-white font-semibold text-sm">HOW IT WORKS</span>
            <motion.div
              animate={{ rotate: howExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </button>
          {howExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="px-5 pb-4"
            >
              {[
                { n: '1', text: 'Create your profile' },
                { n: '2', text: 'Browse the stack' },
                { n: '3', text: 'Swipe right to connect' },
                { n: '4', text: 'Get matched' },
                { n: '5', text: 'Chat & hire directly in-app' },
              ].map((step) => (
                <div key={step.n} className="flex items-center gap-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-orange flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {step.n}
                  </div>
                  <span className="text-[#9CA3AF] text-sm">{step.text}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          disabled={!selected || loading}
          className={`btn-primary flex items-center justify-center gap-2 ${
            !selected ? 'opacity-50' : ''
          }`}
          style={selected ? { boxShadow: '0 8px 32px rgba(249,115,22,0.35)' } : {}}
        >
          {loading ? <div className="spinner" /> : 'Continue →'}
        </motion.button>
      </div>
    </div>
  );
}
