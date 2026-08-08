import { AppProvider, useApp } from './store/AppContext'
import BottomNav from './components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import SearchScreen from './screens/SearchScreen'
import SellScreen from './screens/SellScreen'
import AlertsScreen from './screens/AlertsScreen'
import ProfileScreen from './screens/ProfileScreen'
import AuctionDetailScreen from './screens/AuctionDetailScreen'

function ScreenRouter() {
  const { state } = useApp()
  switch (state.activeScreen) {
    case 'home': return <HomeScreen />
    case 'search': return <SearchScreen />
    case 'sell': return <SellScreen />
    case 'alerts': return <AlertsScreen />
    case 'profile': return <ProfileScreen />
    case 'auctionDetail': return <AuctionDetailScreen />
    default: return <HomeScreen />
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-dark-bg text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>
        <ScreenRouter />
        <BottomNav />
      </div>
    </AppProvider>
  )
}
