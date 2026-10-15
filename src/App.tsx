import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { BookRideView } from './views/BookRideView';
import { SearchResultsView } from './views/SearchResultsView';
import { MyBookingsView } from './views/MyBookingsView';
import { TicketDetailsView } from './views/TicketDetailsView';
import { TrackRideView } from './views/TrackRideView';
import { WalletView } from './views/WalletView';
import { PassesView } from './views/PassesView';
import { SupportView } from './views/SupportView';
import { ProfileView } from './views/ProfileView';
import { AllRoutesView } from './views/AllRoutesView';
import { DriverPortalView } from './views/DriverPortalView';
import { OperatorPortalView } from './views/OperatorPortalView';
import { AdminPortalView } from './views/AdminPortalView';

import { AuthModal } from './components/AuthModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallBanner } from './components/PWAInstallBanner';

import {
  UserProfile,
  UserRole,
  Booking,
  WalletAccount,
  BusRoute,
  CommuterPass,
} from './types/busway';
import {
  INITIAL_USER,
  INITIAL_BOOKINGS,
  INITIAL_WALLET,
  INITIAL_ROUTES,
  INITIAL_PASSES,
} from './data/mockData';
import { api } from './lib/api';

type AppView =
  | 'home'
  | 'book-ride'
  | 'search-results'
  | 'bookings'
  | 'ticket-details'
  | 'track-ride'
  | 'wallet'
  | 'passes'
  | 'support'
  | 'profile'
  | 'all-routes'
  | 'driver-portal'
  | 'operator-portal'
  | 'admin-portal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>('passenger');

  // App Data States
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [wallet, setWallet] = useState<WalletAccount>(INITIAL_WALLET);
  const [routes, setRoutes] = useState<BusRoute[]>(INITIAL_ROUTES);
  const [passes, setPasses] = useState<CommuterPass[]>(INITIAL_PASSES);
  const [isEmergencyPaused, setIsEmergencyPaused] = useState(false);
  const [emergencyNotice, setEmergencyNotice] = useState<string | undefined>();

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Active selections
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(INITIAL_BOOKINGS[0]);
  const [searchParams, setSearchParams] = useState({
    origin: 'Bally',
    destination: 'Sector V',
    date: '2026-10-16',
    passengers: 1,
    tripType: 'one-way' as 'one-way' | 'return',
  });

  // Sync initial data from backend if running
  useEffect(() => {
    api.getProfile().then(setUser).catch(() => {});
    api.getBookings().then(setBookings).catch(() => {});
    api.getWallet().then(setWallet).catch(() => {});
    api.getRoutes().then(setRoutes).catch(() => {});
    api.getPasses().then(setPasses).catch(() => {});

    // Check emergency status
    fetch('/api/v1/health')
      .then((r) => r.json())
      .then((h) => {
        setIsEmergencyPaused(!!h.isBookingsPaused);
        setEmergencyNotice(h.emergencyNotice);
      })
      .catch(() => {});
  }, []);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (['search-results', 'all-routes', 'book-ride'].includes(currentView)) {
      navigateTo('home');
    } else if (currentView === 'ticket-details' || currentView === 'track-ride') {
      navigateTo('bookings');
    } else {
      navigateTo('home');
    }
  };

  const handleTabChange = (tab: TabKey) => {
    if (tab === 'home') navigateTo('home');
    else if (tab === 'bookings') navigateTo('bookings');
    else if (tab === 'passes') navigateTo('passes');
    else if (tab === 'support') navigateTo('support');
    else if (tab === 'profile') navigateTo('profile');
  };

  const handleSwitchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'driver') {
      navigateTo('driver-portal');
    } else if (role === 'operator') {
      navigateTo('operator-portal');
    } else if (role === 'superadmin') {
      navigateTo('admin-portal');
    } else {
      navigateTo('home');
    }
  };

  const handleSearchTrigger = (params: typeof searchParams) => {
    setSearchParams(params);
    navigateTo('search-results');
  };

  const handleSelectRoute = (origin: string, destination: string) => {
    setSearchParams((prev) => ({
      ...prev,
      origin,
      destination,
    }));
    navigateTo('search-results');
  };

  const handleBookingSuccess = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
    setSelectedBooking(booking);
    api.getWallet().then(setWallet).catch(() => {
      setWallet((prev) => ({
        ...prev,
        availableBalance: Math.max(0, prev.availableBalance - booking.fare),
      }));
    });
    navigateTo('ticket-details');
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await api.cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? res.booking : b))
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(res.booking);
      }
      const updatedWallet = await api.getWallet();
      setWallet(updatedWallet);
    } catch (err) {
      console.error('Cancel booking error:', err);
    }
  };

  const handleTopupWallet = async (amount: number) => {
    const res = await api.topupWallet(amount);
    setWallet((prev) => ({
      ...prev,
      availableBalance: res.newBalance,
      transactions: [res.transaction, ...prev.transactions],
    }));
  };

  const handleBuyPass = async (passId: string) => {
    const res = await api.buyPass(passId);
    setPasses((prev) =>
      prev.map((p) => (p.id === passId ? res.pass : p))
    );
    const updatedWallet = await api.getWallet();
    setWallet(updatedWallet);
  };

  const handleUpdateProfile = async (name: string, phone: string, email: string) => {
    const res = await api.updateProfile({ name, phone, email });
    setUser(res.user);
  };

  const handleAuthSuccess = (authUser: any) => {
    setUser(authUser);
    setShowAuthModal(false);
  };

  // Page title mapping
  let pageTitle = '';
  let showBack = false;

  switch (currentView) {
    case 'book-ride':
      pageTitle = 'Book a Ride';
      showBack = true;
      break;
    case 'search-results':
      pageTitle = 'Select Shuttle';
      showBack = true;
      break;
    case 'bookings':
      pageTitle = 'Trips Activity';
      showBack = true;
      break;
    case 'ticket-details':
      pageTitle = 'Ticket Details';
      showBack = true;
      break;
    case 'track-ride':
      pageTitle = 'Track Ride';
      showBack = true;
      break;
    case 'wallet':
      pageTitle = 'Wallet & Credits';
      showBack = true;
      break;
    case 'passes':
      pageTitle = 'Passes & Subscriptions';
      showBack = true;
      break;
    case 'support':
      pageTitle = 'Support';
      showBack = true;
      break;
    case 'profile':
      pageTitle = 'Profile';
      showBack = true;
      break;
    case 'all-routes':
      pageTitle = 'All Routes';
      showBack = true;
      break;
    case 'driver-portal':
      pageTitle = 'Driver Operations';
      showBack = true;
      break;
    case 'operator-portal':
      pageTitle = 'Fleet & Compliance';
      showBack = true;
      break;
    case 'admin-portal':
      pageTitle = 'Operations Console';
      showBack = true;
      break;
    default:
      pageTitle = '';
      showBack = false;
  }

  // Active upcoming booking (if any)
  const upcomingBooking = bookings.find(
    (b) => b.bookingStatus === 'CONFIRMED'
  );

  // Active bottom navigation tab mapping
  let activeTab: TabKey = 'home';
  if (currentView === 'home' || currentView === 'book-ride' || currentView === 'all-routes') activeTab = 'home';
  else if (currentView === 'bookings' || currentView === 'ticket-details' || currentView === 'track-ride') activeTab = 'bookings';
  else if (currentView === 'passes') activeTab = 'passes';
  else if (currentView === 'support') activeTab = 'support';
  else if (currentView === 'profile' || currentView === 'wallet') activeTab = 'profile';

  return (
    <div className="min-h-screen bg-[#08111e] text-slate-100 flex flex-col font-sans selection:bg-[#F28C28] selection:text-white relative">
      {/* Network Connectivity Offline Warning Toast */}
      <OfflineIndicator />

      {/* Top App Bar */}
      <Header
        title={pageTitle}
        showBack={showBack}
        onBack={handleBack}
        user={user}
        currentRole={currentRole}
        onSwitchRole={handleSwitchRole}
        activeView={currentView}
      />

      {/* Main Container Viewport (Mobile-first centered responsive canvas) */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-4 pb-24">
        {/* PWA In-App Install Prompt Banner on Home view */}
        {currentView === 'home' && (
          <div className="mb-4">
            <PWAInstallBanner />
          </div>
        )}

        {/* Emergency Pause Public Notice */}
        {isEmergencyPaused && (
          <div className="mb-4 p-3.5 bg-rose-500/20 border border-rose-500/50 rounded-2xl text-xs text-rose-200">
            <strong className="block text-rose-300 font-bold uppercase tracking-wider mb-0.5">
              Corridor Transit Advisory
            </strong>
            <span>{emergencyNotice || 'Bookings temporarily suspended due to corridor maintenance.'}</span>
          </div>
        )}

        {currentView === 'home' && (
          <HomeView
            onBookNewRide={() => navigateTo('book-ride')}
            onNavigateTab={(tab) => {
              if (tab === 'wallet') navigateTo('wallet');
              else handleTabChange(tab as TabKey);
            }}
            onSelectRoute={handleSelectRoute}
            onViewAllRoutes={() => navigateTo('all-routes')}
            onViewTicket={(bk) => {
              setSelectedBooking(bk);
              navigateTo('ticket-details');
            }}
            onTrackRide={(bk) => {
              setSelectedBooking(bk);
              navigateTo('track-ride');
            }}
            upcomingBooking={upcomingBooking}
          />
        )}

        {currentView === 'book-ride' && (
          <BookRideView
            onSearch={handleSearchTrigger}
            initialOrigin={searchParams.origin}
            initialDestination={searchParams.destination}
          />
        )}

        {currentView === 'search-results' && (
          <SearchResultsView
            origin={searchParams.origin}
            destination={searchParams.destination}
            date={searchParams.date}
            passengers={searchParams.passengers}
            wallet={wallet}
            onBookingSuccess={handleBookingSuccess}
            onTopupWallet={handleTopupWallet}
            onBack={() => navigateTo('book-ride')}
          />
        )}

        {currentView === 'bookings' && (
          <MyBookingsView
            bookings={bookings}
            onViewDetails={(bk) => {
              setSelectedBooking(bk);
              navigateTo('ticket-details');
            }}
            onRepeatBooking={(bk) => {
              handleSelectRoute(bk.origin, bk.destination);
            }}
            onTrackRide={(bk) => {
              setSelectedBooking(bk);
              navigateTo('track-ride');
            }}
          />
        )}

        {currentView === 'ticket-details' && selectedBooking && (
          <TicketDetailsView
            booking={selectedBooking}
            onTrackRide={(bk) => {
              setSelectedBooking(bk);
              navigateTo('track-ride');
            }}
            onCancelBooking={handleCancelBooking}
            onBack={handleBack}
          />
        )}

        {currentView === 'track-ride' && selectedBooking && (
          <TrackRideView
            booking={selectedBooking}
            onBack={handleBack}
          />
        )}

        {currentView === 'wallet' && (
          <WalletView
            wallet={wallet}
            onTopup={handleTopupWallet}
            onBack={handleBack}
          />
        )}

        {currentView === 'passes' && (
          <PassesView
            passes={passes}
            wallet={wallet}
            onBuyPass={handleBuyPass}
            onBack={handleBack}
          />
        )}

        {currentView === 'support' && (
          <SupportView onBack={handleBack} />
        )}

        {currentView === 'profile' && (
          <ProfileView
            user={user}
            currentRole={currentRole}
            onSwitchRole={handleSwitchRole}
            onNavigateTab={(tab) => {
              if (tab === 'wallet') navigateTo('wallet');
              else handleTabChange(tab as TabKey);
            }}
            onUpdateProfile={handleUpdateProfile}
            onLogout={() => {
              setShowAuthModal(true);
            }}
            onOpenAuth={() => setShowAuthModal(true)}
            onBack={handleBack}
          />
        )}

        {currentView === 'all-routes' && (
          <AllRoutesView
            routes={routes}
            onSelectRoute={handleSelectRoute}
            onBack={handleBack}
          />
        )}

        {currentView === 'driver-portal' && (
          <DriverPortalView />
        )}

        {currentView === 'operator-portal' && (
          <OperatorPortalView />
        )}

        {currentView === 'admin-portal' && (
          <AdminPortalView />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Auth Modal (Login, Signup, Recovery) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
