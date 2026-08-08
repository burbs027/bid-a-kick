# Bid-a-Kick 🔥

Live sneaker auction platform for South Africa.

## Features
- Real-time bidding with **Socket.io**
- Live outbid notifications
- Wallet + Top-up
- Sell your kicks
- Watchlist
- Dark neon UI

## Quick Start

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (new terminal)
cd app
npm install
npx vite --host
```

- Frontend → http://localhost:5173  
- Backend  → http://localhost:5000

## Docs
- [DEPLOY.md](./DEPLOY.md) — Vercel + Railway / Render / Fly.io
- [SCALING.md](./SCALING.md) — Socket.io + Redis horizontal scaling
- CI runs on every push (see `.github/workflows/ci.yml`)

## Tech
React · Vite · TypeScript · Tailwind · Shadcn · Framer Motion  
Node.js · Express · Socket.io

Made for the culture.
