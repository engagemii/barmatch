import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/index';
import useStore from '../store/useStore';
import BottomNav from '../components/BottomNav';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function getDisplayName(user) {
  return user?.profile?.name || user?.profile?.venueName || 'Match';
}

function getAvatar(user) {
  return user?.profile?.avatar;
}

export default function Messages() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matches')
      .then((res) => setMatches(res.data.matches))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const recentMatches = matches.filter((m) => !m.lastMessage).slice(0, 10);
  const conversations = matches.filter((m) => m.lastMessage);

  return (
    <div style={{ height: "100dvh", overflow: "hidden" }} className="bg-bg-primary flex flex-col safe-top">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-2xl font-black text-white">Messages</h1>
        {matches.length > 0 && (
          <p className="text-[#9CA3AF] text-sm mt-1">
            {matches.length} match{matches.length !== 1 ? 'es' : ''} 🔥
          </p>
        )}
      </div>

      <div style={{ overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "100px" }} className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 px-8 text-center">
            <div className="text-6xl">💬</div>
            <h2 className="text-white text-xl font-bold">No matches yet</h2>
            <p className="text-[#9CA3AF] text-sm">
              Start swiping to connect with bartenders and venues!
            </p>
            <button
              onClick={() => navigate('/discover')}
              className="btn-primary mt-2"
              style={{ maxWidth: 200 }}
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <>
            {/* New Matches Row */}
            {recentMatches.length > 0 && (
              <div className="px-5 mb-6">
                <h2 className="text-white font-bold text-base mb-3">New Matches</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {recentMatches.map((match) => (
                    <button
                      key={match._id}
                      onClick={() => navigate(`/messages/${match._id}`)}
                      className="flex flex-col items-center gap-1.5 flex-shrink-0"
                    >
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-full overflow-hidden bg-bg-card2 flex items-center justify-center"
                          style={{ border: '2.5px solid #F97316' }}
                        >
                          {getAvatar(match.otherUser) ? (
                            <img
                              src={getAvatar(match.otherUser)}
                              alt={getDisplayName(match.otherUser)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">
                              {match.otherUser?.role === 'bartender' ? '🍸' : '🏢'}
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-teal rounded-full border-2 border-bg-primary" />
                      </div>
                      <span className="text-white text-xs font-medium max-w-[64px] truncate text-center">
                        {getDisplayName(match.otherUser)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversations */}
            {conversations.length > 0 && (
              <div className="px-5">
                <h2 className="text-white font-bold text-base mb-3">Recent Conversations</h2>
                <div className="flex flex-col gap-2">
                  {conversations.map((match) => (
                    <motion.button
                      key={match._id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/messages/${match._id}`)}
                      className="flex items-center gap-3 p-3 rounded-card bg-bg-card border border-white/5 text-left"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-bg-card2 flex items-center justify-center">
                          {getAvatar(match.otherUser) ? (
                            <img
                              src={getAvatar(match.otherUser)}
                              alt={getDisplayName(match.otherUser)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">
                              {match.otherUser?.role === 'bartender' ? '🍸' : '🏢'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold text-sm">
                            {getDisplayName(match.otherUser)}
                          </span>
                          <span className="text-[#6B7280] text-xs">
                            {timeAgo(match.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-[#9CA3AF] text-xs mt-0.5 truncate">
                          {match.lastMessage}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-orange flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* All matches with no messages */}
            {recentMatches.length === 0 && conversations.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-10 px-8 text-center">
                <p className="text-[#9CA3AF] text-sm">Say hello to your matches!</p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
