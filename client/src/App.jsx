import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';
import useStore from './store/useStore';
import api from './api/index';

import Splash from './pages/Splash';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import RoleSelect from './pages/Onboarding/RoleSelect';
import ProfileSetup from './pages/Onboarding/ProfileSetup';
import Discover from './pages/Discover';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import ViewProfile from './pages/ViewProfile';
import MatchModal from './pages/MatchModal';

// Socket singleton
export let socket = null;

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useStore((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AppInner() {
  const { auth, setAuth, logout, matchModal, hideMatchModal } = useStore((s) => ({
    auth: s.auth,
    setAuth: s.setAuth,
    logout: s.logout,
    matchModal: s.matchModal,
    hideMatchModal: s.hideMatchModal,
  }));
  const socketRef = useRef(null);

  // Bootstrap user on mount if token exists
  useEffect(() => {
    if (auth.token && !auth.user) {
      api.get('/auth/me')
        .then((res) => {
          setAuth({ user: res.data.user, token: auth.token });
        })
        .catch(() => {
          logout();
        });
    }
  }, []);

  // Setup socket when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.token && !socketRef.current) {
      const socketUrl = import.meta.env.VITE_API_URL || '/';
      socketRef.current = io(socketUrl, {
        auth: { token: auth.token },
        transports: ['websocket', 'polling'],
      });
      socket = socketRef.current;

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket error:', err.message);
      });
    }

    return () => {
      if (!auth.isAuthenticated && socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socket = null;
      }
    };
  }, [auth.isAuthenticated, auth.token]);

  return (
    <div className="app-container">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#15102B',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#F97316', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />

      {/* Match Modal overlay */}
      {matchModal && (
        <MatchModal
          data={matchModal}
          onClose={hideMatchModal}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            auth.isAuthenticated ? (
              auth.user?.isOnboarded ? (
                <Navigate to="/discover" replace />
              ) : auth.user?.role ? (
                <Navigate to="/onboarding/profile" replace />
              ) : (
                <Navigate to="/onboarding/role" replace />
              )
            ) : (
              <Splash />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding/role" element={
          <ProtectedRoute><RoleSelect /></ProtectedRoute>
        } />
        <Route path="/onboarding/profile" element={
          <ProtectedRoute><ProfileSetup /></ProtectedRoute>
        } />
        <Route path="/discover" element={
          <ProtectedRoute><Discover /></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute><Messages /></ProtectedRoute>
        } />
        <Route path="/messages/:matchId" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute><ViewProfile /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
