export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  balance: number;
  role: string;
  rating: number;
  totalBids: number;
  itemsWon: number;
  itemsListed: number;
  joinedAt: string;
}

export interface Bid {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  amount: number;
  timestamp: string;
  isDeposit: boolean;
}

export interface Auction {
  id: string;
  title: string;
  brand: string;
  model: string;
  size: string;
  condition: string;
  images: string[];
  startingBid: number;
  currentBid: number;
  minIncrement: number;
  depositAmount: number;
  endTime: string;
  status: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number;
  bids: Bid[];
  watchers: string[];
  category: string;
  description: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  auctionId?: string;
  read: boolean;
  createdAt: string;
}

export interface AppState {
  user: User | null;
  auctions: Auction[];
  notifications: Notification[];
  watchedAuctions: string[];
  activeScreen: string;
  selectedAuctionId: string | null;
  isAuthenticated: boolean;
}

export type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUCTIONS'; payload: Auction[] }
  | { type: 'UPDATE_AUCTION'; payload: Auction }
  | { type: 'PLACE_BID'; payload: { auctionId: string; bid: Bid } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'READ_NOTIFICATION'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_SCREEN'; payload: string }
  | { type: 'SELECT_AUCTION'; payload: string | null }
  | { type: 'TOGGLE_WATCH'; payload: string }
  | { type: 'TOP_UP'; payload: number }
  | { type: 'CREATE_AUCTION'; payload: Auction };
