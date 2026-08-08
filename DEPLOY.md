# Deployment Guide — Bid-a-Kick

## Architecture

```
Browser  →  Frontend (Vite/React)  →  Backend (Express + Socket.io)
                Vercel / Netlify           Railway / Render / Fly.io
```

Socket.io needs a long-lived Node process. Static hosts (plain Vercel serverless) are **not** ideal for the backend. Use a container or always-on Node host.

---

## 1. Backend (recommended: Railway or Render)

### Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select this repo, set **Root Directory** to `server`
3. Add start command: `npm start`
4. Railway gives you a public URL, e.g. `https://bid-a-kick-api.up.railway.app`
5. Set env if needed: `PORT` is injected automatically

### Render
1. [render.com](https://render.com) → New → Web Service
2. Connect repo, Root Directory = `server`
3. Build: `npm install`
4. Start: `npm start`
5. Instance type: Free or Starter

### Fly.io
```bash
cd server
fly launch
fly deploy
```

After deploy, note your backend URL:
```
https://your-backend.example.com
```

---

## 2. Frontend (Vercel)

1. [vercel.com](https://vercel.com) → New Project → Import this repo
2. **Root Directory**: `app`
3. Framework: Vite
4. Environment variables (Production):
   ```
   VITE_API_URL=https://your-backend.example.com/api
   VITE_SOCKET_URL=https://your-backend.example.com
   ```
5. Deploy

Update `app/src/store/AppContext.tsx` to use env vars:

```ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
```

---

## 3. CORS & Socket.io

On the backend, lock CORS in production:

```js
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});
```

Set `FRONTEND_URL=https://your-frontend.vercel.app` on the backend host.

---

## 4. Quick local → production checklist

- [ ] Backend live and `/` returns JSON
- [ ] Frontend env vars point to production API + Socket URL
- [ ] CORS allows your frontend origin
- [ ] Test a live bid from two browser tabs
- [ ] Images load (put public assets on CDN or keep in `app/public`)

---

## 5. Optional: Docker (backend)

```dockerfile
# server/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

```bash
docker build -t bid-a-kick-api ./server
docker run -p 5000:5000 bid-a-kick-api
```
