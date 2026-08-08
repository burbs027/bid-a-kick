# Socket.io Scaling — Bid-a-Kick

## Current setup (single process)

One Node process holds all Socket.io connections in memory. Fine for:
- Demos
- Hundreds of concurrent users
- Single region

When you outgrow it (multiple servers / high concurrency), you need a **shared pub/sub** so every server sees the same events.

---

## Scaling pattern

```
Client A ──► Server 1 ──┐
                        ├──► Redis (pub/sub) ──► all servers emit
Client B ──► Server 2 ──┘
```

### 1. Install adapter

```bash
cd server
npm install @socket.io/redis-adapter redis
```

### 2. Wire it up

```js
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

Now any server that receives a bid can `io.emit(...)` and every other server will broadcast it to its local clients.

### 3. Redis providers
- Redis Cloud / Upstash (free tier)
- Railway Redis plugin
- AWS ElastiCache

---

## Other production concerns

| Concern | Approach |
|---------|----------|
| Sticky sessions | Not required with Redis adapter |
| Horizontal scale | Add more Node instances behind a load balancer |
| Rooms | Already using `auction-{id}` rooms — works with adapter |
| Auth | Attach JWT on `socket.handshake.auth` and verify on connection |
| Rate limiting | `socket.io-rate-limiter` or custom middleware |
| Memory | Don’t store large state only in process memory long-term → move auctions to DB |

---

## Recommended production path

1. **Phase 1 (now)** — single Node process + in-memory data (current)
2. **Phase 2** — add MongoDB/Postgres for auctions + users
3. **Phase 3** — Redis adapter + 2–3 backend instances
4. **Phase 4** — sticky or pure Redis + CDN for static assets

---

## Load test tip

Use [Artillery](https://www.artillery.io/) or `socket.io` client scripts to simulate many concurrent bidders before you scale.
