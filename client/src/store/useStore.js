import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Auth state
  auth: {
    user: null,
    token: localStorage.getItem('barmatch_token') || null,
    isAuthenticated: !!localStorage.getItem('barmatch_token'),
  },

  setAuth: ({ user, token }) => {
    if (token) {
      localStorage.setItem('barmatch_token', token);
    }
    set({
      auth: {
        user,
        token,
        isAuthenticated: true,
      },
    });
  },

  updateUser: (updates) => {
    set((state) => ({
      auth: {
        ...state.auth,
        user: { ...state.auth.user, ...updates },
      },
    }));
  },

  logout: () => {
    localStorage.removeItem('barmatch_token');
    set({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
      },
      discover: {
        stack: [],
        currentIndex: 0,
      },
      matches: [],
      unreadCount: 0,
    });
  },

  // Discover state
  discover: {
    stack: [],
    currentIndex: 0,
  },

  setDiscoverStack: (stack) =>
    set({ discover: { stack, currentIndex: 0 } }),

  advanceDiscover: () =>
    set((state) => ({
      discover: {
        ...state.discover,
        currentIndex: state.discover.currentIndex + 1,
      },
    })),

  appendDiscoverStack: (newUsers) =>
    set((state) => ({
      discover: {
        ...state.discover,
        stack: [...state.discover.stack, ...newUsers],
      },
    })),

  // Matches state
  matches: [],

  setMatches: (matches) => set({ matches }),

  addMatch: (match) =>
    set((state) => ({ matches: [match, ...state.matches] })),

  // Unread message count
  unreadCount: 0,

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  // Match modal
  matchModal: null,

  showMatchModal: (data) => set({ matchModal: data }),

  hideMatchModal: () => set({ matchModal: null }),
}));

export default useStore;
