# ShiftMixr

**Where bartenders and venues find their perfect fit**

A Tinder-style matching PWA for the hospitality industry. Restaurants, bars, and clubs swipe on bartenders/mixologists — and vice versa — to find the perfect hire or gig.

**Live site**: [shiftmixr.com](https://shiftmixr.com)
**API**: `https://barmatch-api.onrender.com`

---

## Demo Accounts

All demo accounts use password: **`Demo1234!`**

### Bartenders

| Name | Email |
|------|-------|
| Marcus Rivera | marcus.rivera@demo.com |
| Sofia Chen | sofia.chen@demo.com |
| James Okafor | james.okafor@demo.com |
| Elena Vasquez | elena.vasquez@demo.com |
| Tyler Brooks | tyler.brooks@demo.com |
| Priya Sharma | priya.sharma@demo.com |
| Carlos Mendez | carlos.mendez@demo.com |
| Jessica Park | jessica.park@demo.com |
| Damien Cole | damien.cole@demo.com |
| Ava Thornton | ava.thornton@demo.com |

### Venues

| Venue | Email |
|-------|-------|
| The Rooftop Bar NYC | rooftopbar.nyc@demo.com |
| Barley & Co. | barleyco@demo.com |
| Vino Bistro | vinobistro@demo.com |
| Club Noir | clubnoir@demo.com |
| The Sports Zone | sportszone@demo.com |
| The Grand Hotel Bar | grandhotelbar@demo.com |
| East Village Brewing Co. | eastvillagebrewery@demo.com |
| Azul Rooftop Lounge | azulrooftop@demo.com |
| Harlem Supper Club | harlemsupper@demo.com |
| FiDi Lounge & Bar | fidilounge@demo.com |

---

## Tech Stack

- **Frontend**: Vite + React 18, Tailwind CSS, Framer Motion, react-spring + @use-gesture (swipe physics), Socket.io client, Zustand, PWA (vite-plugin-pwa)
- **Backend**: Node.js + Express, MongoDB + Mongoose, Socket.io, JWT auth, Cloudinary uploads
- **Deploy**: Vercel (client) + Render (server) + MongoDB Atlas + Cloudinary
- **Keepalive**: UptimeRobot pings the backend every 5 min to prevent Render free tier sleep

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)
- Cloudinary account (for photo uploads)

### 1. Install dependencies

```bash
cd server && npm install
cd client && npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env with your values
```

Required `.env` values:
```
MONGODB_URI=mongodb+srv://...   # Atlas URI
JWT_SECRET=long-random-string
JWT_REFRESH_SECRET=another-long-random-string
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=http://localhost:5173
```

### 3. Run both servers

```bash
# Terminal 1 — API server
cd server && npm run dev
# Starts at http://localhost:5000

# Terminal 2 — Vite dev server
cd client && npm run dev
# Opens at http://localhost:5173
```

The Vite dev server proxies `/api` and `/socket.io` to `localhost:5000` automatically.

---

## Seed Demo Data

To re-seed the 10 bartenders + 10 venues:

```bash
cd server
MONGODB_URI="your-atlas-uri" node seed.js
```

---

## Deployment

### Client → Vercel

1. Push repo to GitHub
2. Vercel → New Project → Import repo → Root Directory: `client`
3. Add env var: `VITE_API_URL` = `https://barmatch-api.onrender.com`
4. Deploy. `client/vercel.json` handles SPA routing.

### Server → Render

1. Render → New Web Service → Root Directory: `server`
2. Build: `npm install` / Start: `node index.js`
3. Add env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_*`, `CLIENT_URL`
4. Do NOT set `PORT` — Render assigns it dynamically

### MongoDB Atlas

1. Free cluster (M0)
2. Network Access → `0.0.0.0/0` (required for Render)
3. Connection string → `MONGODB_URI` env var

---

## App Features

- **Swipe matching**: Drag cards left (pass) or right (like)
- **Mutual match**: When both sides swipe right, a Match fires with confetti modal
- **Real-time chat**: Socket.io messaging with typing indicators
- **Shift offers**: Venues send structured shift offers (date/time/pay) in chat
- **PWA**: Installable on iOS/Android
- **Match scoring**: Ranks discover stack by skill overlap, city, availability

---

## Project Structure

```
shiftmixr/
├── client/
│   ├── src/
│   │   ├── api/index.js        # Axios + auth interceptors
│   │   ├── store/useStore.js   # Zustand global state
│   │   ├── pages/
│   │   │   ├── Splash.jsx
│   │   │   ├── Auth/           # Login, Signup
│   │   │   ├── Onboarding/     # RoleSelect, ProfileSetup
│   │   │   ├── Discover.jsx    # Main swipe screen
│   │   │   ├── MatchModal.jsx  # Match celebration overlay
│   │   │   ├── Messages.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ViewProfile.jsx
│   │   └── components/
│   │       ├── BottomNav.jsx
│   │       └── SwipeCard.jsx
│   ├── vite.config.js
│   └── vercel.json             # SPA rewrite rules
│
└── server/
    ├── models/                 # User, Match, Message
    ├── middleware/auth.js      # JWT verification
    ├── routes/                 # auth, profile, discover, swipe, matches, messages, upload
    ├── socket/index.js         # Socket.io handlers
    └── index.js                # Entry point
```
