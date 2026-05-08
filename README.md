# BarMatch

**Where bartenders and venues find their perfect fit**

A Tinder/Bumble-style matching PWA for the hospitality industry. Restaurants, bars, and clubs swipe on bartenders/mixologists — and vice versa — to find the perfect hire or gig.

---

## Tech Stack

- **Frontend**: Vite + React 18, Tailwind CSS, Framer Motion, react-spring + @use-gesture (swipe physics), Socket.io client, Zustand, PWA (vite-plugin-pwa)
- **Backend**: Node.js + Express, MongoDB + Mongoose, Socket.io, JWT auth, Cloudinary uploads
- **Deploy**: Vercel (client) + Render (server) + MongoDB Atlas + Cloudinary

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)
- Cloudinary account (for photo uploads)

### 1. Install dependencies

```bash
cd /Users/gregpellitteri/barmatch/server
npm install

cd /Users/gregpellitteri/barmatch/client
npm install
```

### 2. Configure environment

```bash
cd /Users/gregpellitteri/barmatch/server
cp .env.example .env
# Edit .env with your values
```

Required `.env` values:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/barmatch   # or Atlas URI
JWT_SECRET=pick-a-long-random-string
JWT_REFRESH_SECRET=another-long-random-string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### 3. Run both servers

**Terminal 1 — API server:**
```bash
cd /Users/gregpellitteri/barmatch/server
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Vite dev server:**
```bash
cd /Users/gregpellitteri/barmatch/client
npm run dev
# App opens at http://localhost:5173
```

The Vite dev server proxies `/api` and `/socket.io` to `localhost:5000` automatically.

---

## Deployment

### Client → Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set **Root Directory** to `client`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-render-server-url.onrender.com`
5. Deploy. The `client/vercel.json` handles SPA routing.

### Server → Render

1. Go to [render.com](https://render.com) → New Web Service → Connect your GitHub repo
2. Set **Root Directory** to `server`
3. **Build Command**: `npm install`
4. **Start Command**: `node index.js`
5. Add all environment variables from `.env.example`:
   - `PORT` = (Render sets this automatically; leave blank or set 5000)
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = long random string
   - `JWT_REFRESH_SECRET` = another long random string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLIENT_URL` = your Vercel client URL (e.g. `https://barmatch.vercel.app`)

---

## MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster (M0)
3. Create a database user with read/write access
4. Under **Network Access**, allow `0.0.0.0/0` (all IPs) for Render
5. Copy the connection string: `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/barmatch`
6. Paste into `MONGODB_URI` env var

---

## Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up free
2. From the Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Paste these into the corresponding env vars

---

## App Features

- **Swipe-based matching**: Drag cards left (pass) or right (like), or tap action buttons
- **Super Swipe**: Star button sends a special "super swipe" for priority matching
- **Mutual match detection**: When both parties swipe right, a Match is created instantly
- **Match modal**: Full-screen celebration overlay appears on match
- **Real-time chat**: Socket.io for live messaging, typing indicators
- **Shift offers**: Venues can send structured shift offers (date, time, pay) directly in chat
- **Shift acceptance**: Bartenders can accept or decline shift offers in-chat
- **PWA**: Installable on iOS/Android, offline-capable via Workbox service worker
- **Match scoring**: Algorithm ranks discover stack by skill overlap, city, availability

---

## Project Structure

```
barmatch/
├── client/
│   ├── public/               # PWA icons
│   ├── src/
│   │   ├── api/index.js      # Axios instance + auth interceptors
│   │   ├── store/useStore.js # Zustand global state
│   │   ├── pages/
│   │   │   ├── Splash.jsx
│   │   │   ├── Auth/         # Login, Signup
│   │   │   ├── Onboarding/   # RoleSelect, ProfileSetup
│   │   │   ├── Discover.jsx  # Main swipe screen
│   │   │   ├── MatchModal.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ViewProfile.jsx
│   │   └── components/
│   │       ├── BottomNav.jsx
│   │       └── SwipeCard.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
│
└── server/
    ├── models/               # User, Match, Message
    ├── middleware/auth.js    # JWT verification
    ├── routes/               # auth, profile, discover, swipe, matches, messages, upload
    ├── socket/index.js       # Socket.io event handlers
    ├── index.js              # Entry point
    └── render.yaml           # Render deployment config
```
