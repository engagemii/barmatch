import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/index';
import useStore from '../../store/useStore';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth({ user: res.data.user, token: res.data.token });
      toast.success('Welcome back!');
      if (res.data.user.isOnboarded) {
        navigate('/discover');
      } else if (res.data.user.role) {
        navigate('/onboarding/profile');
      } else {
        navigate('/onboarding/role');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col px-6 py-6 safe-top safe-bottom">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="w-10 h-10 flex items-center justify-center rounded-btn border border-white/10 text-white mb-8"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="text-4xl mb-3">👋</div>
        <h1 className="text-3xl font-black text-white">Welcome Back</h1>
        <p className="text-[#9CA3AF] text-sm mt-1">Sign in to your BarMatch account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label className="text-[#9CA3AF] text-xs font-medium mb-1.5 block">EMAIL ADDRESS</label>
          <input
            className="input-dark"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-[#9CA3AF] text-xs font-medium mb-1.5 block">PASSWORD</label>
          <div className="relative">
            <input
              className="input-dark pr-12"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" className="text-[#9CA3AF] text-sm hover:text-orange transition-colors">
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="btn-primary mt-2 flex items-center justify-center gap-2"
          style={{ boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}
        >
          {loading ? <div className="spinner" /> : 'Sign In'}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-[#9CA3AF] text-sm">Don't have an account? </span>
        <button
          onClick={() => navigate('/signup')}
          className="text-orange font-semibold text-sm"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
