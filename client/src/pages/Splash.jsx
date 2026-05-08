import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-between bg-bg-primary px-6 py-12 safe-top safe-bottom">
      {/* Spacer top */}
      <div className="flex-1" />

      {/* Center content */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Icon with glow */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-orange opacity-40 blur-2xl scale-150" />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-24 h-24 rounded-3xl bg-orange-gradient flex items-center justify-center text-5xl shadow-lg"
            style={{ boxShadow: '0 0 60px rgba(249,115,22,0.5)' }}
          >
            🍸
          </motion.div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-orange tracking-tight leading-none">
            BarMatch
          </h1>
          <p className="text-[#9CA3AF] text-base mt-3 leading-snug max-w-xs">
            Where bartenders and venues find their perfect fit
          </p>
          <p className="text-[#6B7280] text-sm mt-2 leading-snug max-w-xs">
            The app that connects talented bartenders with venues that need them
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-2">
          {[
            { value: '2,400+', label: 'Bartenders' },
            { value: '850+', label: 'Venues' },
            { value: '12K+', label: 'Matches' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-orange font-bold text-lg">{stat.value}</div>
              <div className="text-[#6B7280] text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA Buttons */}
      <div className="w-full flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/signup')}
          className="btn-primary text-lg py-4 font-bold"
          style={{ boxShadow: '0 8px 32px rgba(249,115,22,0.4)' }}
        >
          Create Account
        </motion.button>

        <div className="flex items-center justify-center gap-2">
          <span className="text-[#9CA3AF] text-sm">Already have one?</span>
          <button
            onClick={() => navigate('/login')}
            className="text-orange font-semibold text-sm border border-orange rounded-btn px-5 py-2 hover:bg-orange hover:text-white transition-colors"
          >
            Sign In
          </button>
        </div>

        <p className="text-center text-[#4B5563] text-xs mt-2">
          By continuing you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}
