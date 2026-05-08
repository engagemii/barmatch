import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const unreadCount = useStore((s) => s.unreadCount);

  const tabs = [
    {
      id: 'discover',
      path: '/discover',
      label: 'Discover',
      icon: (active) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#F97316' : '#6B7280'} strokeWidth="2">
          <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'swipe',
      path: '/discover',
      label: 'Swipe',
      icon: (active) => (
        <span style={{ fontSize: '22px', filter: active ? 'none' : 'grayscale(1) opacity(0.4)' }}>🍸</span>
      ),
    },
    {
      id: 'messages',
      path: '/messages',
      label: 'Messages',
      icon: (active) => (
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#F97316' : '#6B7280'} strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'profile',
      path: '/profile',
      label: 'Profile',
      icon: (active) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#F97316' : '#6B7280'} strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  const activeTab = pathname.startsWith('/messages') ? 'messages'
    : pathname.startsWith('/profile') ? 'profile'
    : 'discover';

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]"
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,15,0) 0%, #0A0A0F 20%)',
        paddingTop: '16px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 100,
      }}
    >
      <div
        className="flex items-center justify-around px-4 py-3"
        style={{
          background: '#0F0B20',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === 'swipe'
            ? pathname === '/discover'
            : tab.id === activeTab;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 min-w-[56px]"
            >
              {tab.icon(isActive)}
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? '#F97316' : '#6B7280' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
