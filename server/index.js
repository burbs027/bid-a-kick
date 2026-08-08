const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const now = Date.now();
let users = [
  { id: 'user-1', username: 'CapeKicks99', email: 'capekicks@email.com', avatar: '/images/avatar1.jpg', balance: 2500, role: 'bidder', rating: 4.8, totalBids: 12, itemsWon: 3, itemsListed: 2, joinedAt: '2024-01-15T10:00:00Z' },
  { id: 'user-2', username: 'SneakerVault', email: 'vault@email.com', avatar: '/images/avatar2.jpg', balance: 1800, role: 'seller', rating: 4.9, totalBids: 5, itemsWon: 1, itemsListed: 8, joinedAt: '2023-11-02T10:00:00Z' },
];
let currentUserId = 'user-1';
const getCurrentUser = () => users.find(u => u.id === currentUserId);

let auctions = [
  { id: 'auc-1', title: "Jordan 1 Retro High OG 'Chicago Lost & Found'", brand: 'Nike', model: 'Air Jordan 1', size: 'US 9', condition: 'DSWT', images: ['/images/sneaker1.jpg', '/images/sneaker1_top.jpg', '/images/sneaker1_back.jpg'], startingBid: 1500, currentBid: 4200, minIncrement: 100, depositAmount: 30, endTime: new Date(now + 2*60*60*1000).toISOString(), status: 'active', sellerId: 'user-2', sellerName: 'SneakerVault', sellerAvatar: '/images/avatar2.jpg', sellerRating: 4.9, bids: [{ id: 'b1', userId: 'user-3', username: 'KicksKing', avatar: '/images/avatar3.jpg', amount: 4200, timestamp: new Date(now-5*60*1000).toISOString(), isDeposit: false }], watchers: ['user-1'], category: 'Nike', description: 'Deadstock with tags. Never worn, original box included. 100% authentic.', createdAt: new Date(now-48*60*60*1000).toISOString() },
  { id: 'auc-2', title: "Nike Dunk Low 'Syracuse'", brand: 'Nike', model: 'Dunk Low', size: 'US 8', condition: 'VNDS', images: ['/images/sneaker2.jpg'], startingBid: 800, currentBid: 1200, minIncrement: 50, depositAmount: 30, endTime: new Date(now + 45*60*1000).toISOString(), status: 'active', sellerId: 'user-3', sellerName: 'KicksKing', sellerAvatar: '/images/avatar3.jpg', sellerRating: 4.7, bids: [{ id: 'b4', userId: 'user-2', username: 'SneakerVault', avatar: '/images/avatar2.jpg', amount: 1200, timestamp: new Date(now-8*60*1000).toISOString(), isDeposit: false }], watchers: ['user-1'], category: 'Nike', description: 'Very Near Deadstock. Worn once indoors.', createdAt: new Date(now-24*60*60*1000).toISOString() },
  { id: 'auc-3', title: "Yeezy Boost 350 V2 'Zebra'", brand: 'Adidas', model: 'Yeezy 350', size: 'US 10', condition: 'DS', images: ['/images/sneaker3.jpg'], startingBid: 1000, currentBid: 2100, minIncrement: 100, depositAmount: 30, endTime: new Date(now + 5*60*60*1000).toISOString(), status: 'active', sellerId: 'user-4', sellerName: 'SneakerHead', sellerAvatar: '/images/avatar2.jpg', sellerRating: 4.6, bids: [{ id: 'b6', userId: 'user-1', username: 'CapeKicks99', avatar: '/images/avatar1.jpg', amount: 2100, timestamp: new Date(now-10*60*1000).toISOString(), isDeposit: false }], watchers: ['user-1'], category: 'Adidas', description: 'Brand new deadstock.', createdAt: new Date(now-72*60*60*1000).toISOString() },
  { id: 'auc-4', title: "New Balance 550 'White Green'", brand: 'New Balance', model: '550', size: 'US 9.5', condition: 'Used - Great', images: ['/images/sneaker4.jpg'], startingBid: 600, currentBid: 950, minIncrement: 50, depositAmount: 30, endTime: new Date(now + 12*60*60*1000).toISOString(), status: 'active', sellerId: 'user-5', sellerName: 'HypeBeast', sellerAvatar: '/images/avatar1.jpg', sellerRating: 4.5, bids: [{ id: 'b8', userId: 'user-2', username: 'SneakerVault', avatar: '/images/avatar2.jpg', amount: 950, timestamp: new Date(now-2*60*60*1000).toISOString(), isDeposit: false }], watchers: [], category: 'New Balance', description: 'Great condition.', createdAt: new Date(now-36*60*60*1000).toISOString() },
  { id: 'auc-5', title: "Adidas Samba OG 'White'", brand: 'Adidas', model: 'Samba OG', size: 'US 7', condition: 'Used - Good', images: ['/images/sneaker5.jpg'], startingBid: 400, currentBid: 780, minIncrement: 50, depositAmount: 30, endTime: new Date(now + 70*60*1000).toISOString(), status: 'active', sellerId: 'user-2', sellerName: 'SneakerVault', sellerAvatar: '/images/avatar2.jpg', sellerRating: 4.9, bids: [{ id: 'b9', userId: 'user-3', username: 'KicksKing', avatar: '/images/avatar3.jpg', amount: 780, timestamp: new Date(now-30*60*1000).toISOString(), isDeposit: false }], watchers: ['user-2'], category: 'Adidas', description: 'Good condition.', createdAt: new Date(now-18*60*60*1000).toISOString() },
];

let notifications = [
  { id: 'n1', type: 'outbid', title: 'You were outbid!', message: 'Someone placed a higher bid on Jordan 1 Chicago Lost & Found', auctionId: 'auc-1', read: false, createdAt: new Date(now-3*60*1000).toISOString() },
  { id: 'n2', type: 'ending_soon', title: 'Auction ending soon', message: 'Nike Dunk Low Syracuse ends soon', auctionId: 'auc-2', read: false, createdAt: new Date(now-10*60*1000).toISOString() },
];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-auction', (id) => socket.join(`auction-${id}`));
  socket.on('leave-auction', (id) => socket.leave(`auction-${id}`));
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

app.get('/', (req, res) => res.json({ message: 'Bid-a-Kick API + Socket.io is live 🚀', version: '1.2.0' }));

app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  let user = users.find(u => u.username.toLowerCase() === (username || '').toLowerCase());
  if (!user) {
    user = { id: `user-${Date.now()}`, username: username || `User${Date.now().toString().slice(-4)}`, email: `${username||'user'}@email.com`, avatar: '/images/avatar1.jpg', balance: 1000, role: 'bidder', rating: 5.0, totalBids: 0, itemsWon: 0, itemsListed: 0, joinedAt: new Date().toISOString() };
    users.push(user);
  }
  currentUserId = user.id;
  res.json(user);
});

app.get('/api/user', (req, res) => res.json(getCurrentUser()));

app.post('/api/user/topup', (req, res) => {
  const user = getCurrentUser();
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  user.balance += Number(amount);
  res.json(user);
});

app.get('/api/auctions', (req, res) => res.json(auctions));
app.get('/api/auctions/:id', (req, res) => {
  const a = auctions.find(x => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json(a);
});

app.post('/api/auctions/:id/bid', (req, res) => {
  const user = getCurrentUser();
  const auction = auctions.find(a => a.id === req.params.id);
  if (!auction) return res.status(404).json({ error: 'Not found' });
  if (auction.status !== 'active') return res.status(400).json({ error: 'Not active' });
  const bidAmount = Number(req.body.amount);
  const min = auction.currentBid + auction.minIncrement;
  if (bidAmount < min) return res.status(400).json({ error: `Min bid R${min}` });
  if (!auction.bids.some(b => b.userId === user.id)) {
    if (user.balance < auction.depositAmount) return res.status(400).json({ error: 'Insufficient balance' });
    user.balance -= auction.depositAmount;
  }
  const newBid = { id: `b${Date.now()}`, userId: user.id, username: user.username, avatar: user.avatar, amount: bidAmount, timestamp: new Date().toISOString(), isDeposit: false };
  auction.bids.unshift(newBid);
  auction.currentBid = bidAmount;
  user.totalBids += 1;
  io.to(`auction-${auction.id}`).emit('bid-update', { auctionId: auction.id, auction, newBid });
  io.emit('auction-updated', auction);
  if (auction.bids.length > 1 && auction.bids[1].userId !== user.id) {
    const notif = { id: `n${Date.now()}`, type: 'outbid', title: 'You were outbid!', message: `Higher bid on ${auction.title}`, auctionId: auction.id, read: false, createdAt: new Date().toISOString() };
    notifications.unshift(notif);
    io.emit('new-notification', notif);
  }
  res.json({ auction, user });
});

app.post('/api/auctions/:id/watch', (req, res) => {
  const user = getCurrentUser();
  const auction = auctions.find(a => a.id === req.params.id);
  if (!auction) return res.status(404).json({ error: 'Not found' });
  const idx = auction.watchers.indexOf(user.id);
  if (idx > -1) auction.watchers.splice(idx, 1); else auction.watchers.push(user.id);
  res.json(auction);
});

app.post('/api/auctions', (req, res) => {
  const user = getCurrentUser();
  const { title, brand, model, size, condition, startingBid, minIncrement, description, images } = req.body;
  if (!title || !startingBid) return res.status(400).json({ error: 'Missing fields' });
  const newAuction = {
    id: `auc-${Date.now()}`, title, brand: brand || 'Other', model: model || '', size: size || 'US 9', condition: condition || 'Used',
    images: images?.length ? images : ['/images/sneaker1.jpg'], startingBid: Number(startingBid), currentBid: Number(startingBid),
    minIncrement: Number(minIncrement) || 50, depositAmount: 30, endTime: new Date(Date.now() + 24*60*60*1000).toISOString(),
    status: 'active', sellerId: user.id, sellerName: user.username, sellerAvatar: user.avatar, sellerRating: user.rating,
    bids: [], watchers: [], category: brand || 'Other', description: description || '', createdAt: new Date().toISOString(),
  };
  auctions.unshift(newAuction);
  user.itemsListed += 1;
  io.emit('new-auction', newAuction);
  res.status(201).json(newAuction);
});

app.get('/api/notifications', (req, res) => res.json(notifications));
app.post('/api/notifications/:id/read', (req, res) => {
  const n = notifications.find(x => x.id === req.params.id);
  if (n) n.read = true;
  res.json(n || {});
});

server.listen(PORT, () => console.log(`✅ Bid-a-Kick on http://localhost:${PORT}`));
