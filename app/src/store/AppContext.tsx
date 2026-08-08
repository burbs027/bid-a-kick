import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { AppState, AppAction, Auction, Bid, Notification, User } from '@/types';
import { mockAuctions, mockNotifications, currentUser } from '@/data/mock';

// Production-ready: use env vars when deployed
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const initialState: AppState = {
  user: currentUser,
  auctions: mockAuctions,
  notifications: mockNotifications,
  watchedAuctions: ['auc-1', 'auc-2', 'auc-3'],
  activeScreen: 'home',
  selectedAuctionId: null,
  isAuthenticated: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload };
    case 'LOGIN': return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT': return { ...state, user: null, isAuthenticated: false, activeScreen: 'home' };
    case 'SET_AUCTIONS': return { ...state, auctions: action.payload };
    case 'UPDATE_AUCTION': {
      const updated = state.auctions.map(a => a.id === action.payload.id ? action.payload : a);
      return { ...state, auctions: updated };
    }
    case 'PLACE_BID': {
      const { auctionId, bid } = action.payload;
      const auctions = state.auctions.map(a =>
        a.id === auctionId ? { ...a, currentBid: bid.amount, bids: [bid, ...a.bids] } : a
      );
      return { ...state, auctions };
    }
    case 'ADD_NOTIFICATION': return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'READ_NOTIFICATION': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return { ...state, notifications };
    }
    case 'SET_NOTIFICATIONS': return { ...state, notifications: action.payload };
    case 'SET_SCREEN': return { ...state, activeScreen: action.payload };
    case 'SELECT_AUCTION':
      return { ...state, selectedAuctionId: action.payload, activeScreen: action.payload ? 'auctionDetail' : 'home' };
    case 'TOGGLE_WATCH': {
      const watched = state.watchedAuctions.includes(action.payload)
        ? state.watchedAuctions.filter(id => id !== action.payload)
        : [...state.watchedAuctions, action.payload];
      return { ...state, watchedAuctions: watched };
    }
    case 'TOP_UP': {
      if (!state.user) return state;
      return { ...state, user: { ...state.user, balance: state.user.balance + action.payload } };
    }
    case 'CREATE_AUCTION': return { ...state, auctions: [action.payload, ...state.auctions] };
    default: return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  navigateTo: (screen: string) => void;
  selectAuction: (id: string | null) => void;
  placeBid: (auctionId: string, amount: number) => Promise<boolean>;
  toggleWatch: (auctionId: string) => void;
  readNotification: (id: string) => void;
  topUp: (amount: number) => void;
  createAuction: (auction: Auction) => void;
  login: (username: string) => Promise<void>;
  logout: () => void;
  refreshAuctions: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, u, n] = await Promise.all([
          fetch(`${API_BASE}/auctions`),
          fetch(`${API_BASE}/user`),
          fetch(`${API_BASE}/notifications`),
        ]);
        if (a.ok) dispatch({ type: 'SET_AUCTIONS', payload: await a.json() });
        if (u.ok) dispatch({ type: 'SET_USER', payload: await u.json() });
        if (n.ok) dispatch({ type: 'SET_NOTIFICATIONS', payload: await n.json() });
      } catch {
        console.warn('Backend offline - using mock data');
      }
    };
    load();

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('connect', () => console.log('Live connection ready'));
    socket.on('bid-update', ({ auction }) => dispatch({ type: 'UPDATE_AUCTION', payload: auction }));
    socket.on('auction-updated', (auction) => dispatch({ type: 'UPDATE_AUCTION', payload: auction }));
    socket.on('new-auction', (auction) => dispatch({ type: 'CREATE_AUCTION', payload: auction }));
    socket.on('new-notification', (notif) => dispatch({ type: 'ADD_NOTIFICATION', payload: notif }));
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    const s = socketRef.current;
    if (!s || !state.selectedAuctionId) return;
    s.emit('join-auction', state.selectedAuctionId);
    return () => { s.emit('leave-auction', state.selectedAuctionId); };
  }, [state.selectedAuctionId]);

  const refreshAuctions = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/auctions`);
      if (r.ok) dispatch({ type: 'SET_AUCTIONS', payload: await r.json() });
    } catch {}
  }, []);

  const navigateTo = useCallback((screen: string) => dispatch({ type: 'SET_SCREEN', payload: screen }), []);
  const selectAuction = useCallback((id: string | null) => dispatch({ type: 'SELECT_AUCTION', payload: id }), []);

  const placeBid = useCallback(async (auctionId: string, amount: number): Promise<boolean> => {
    if (!state.user) return false;
    try {
      const res = await fetch(`${API_BASE}/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) return false;
      const { auction, user } = await res.json();
      dispatch({ type: 'UPDATE_AUCTION', payload: auction });
      dispatch({ type: 'SET_USER', payload: user });
      return true;
    } catch {
      return false;
    }
  }, [state.user]);

  const toggleWatch = useCallback(async (id: string) => {
    dispatch({ type: 'TOGGLE_WATCH', payload: id });
    try { await fetch(`${API_BASE}/auctions/${id}/watch`, { method: 'POST' }); } catch {}
  }, []);

  const readNotification = useCallback(async (id: string) => {
    dispatch({ type: 'READ_NOTIFICATION', payload: id });
    try { await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' }); } catch {}
  }, []);

  const topUp = useCallback(async (amount: number) => {
    dispatch({ type: 'TOP_UP', payload: amount });
    try {
      const r = await fetch(`${API_BASE}/user/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (r.ok) dispatch({ type: 'SET_USER', payload: await r.json() });
    } catch {}
  }, []);

  const createAuction = useCallback(async (auction: Auction) => {
    try {
      const r = await fetch(`${API_BASE}/auctions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auction),
      });
      if (r.ok) {
        dispatch({ type: 'CREATE_AUCTION', payload: await r.json() });
        return;
      }
    } catch {}
    dispatch({ type: 'CREATE_AUCTION', payload: auction });
  }, []);

  const login = useCallback(async (username: string) => {
    try {
      const r = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (r.ok) dispatch({ type: 'LOGIN', payload: await r.json() });
    } catch {}
  }, []);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);

  return (
    <AppContext.Provider value={{
      state, dispatch, navigateTo, selectAuction, placeBid,
      toggleWatch, readNotification, topUp, createAuction, login, logout, refreshAuctions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
