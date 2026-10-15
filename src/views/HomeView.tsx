import React from 'react';
import { Search, Calendar, CreditCard, Wallet, HelpCircle, ChevronRight, Navigation } from 'lucide-react';
import { Booking } from '../types/busway';
import { VehicleBadge } from '../components/VehicleBadge';

interface HomeViewProps {
  onBookNewRide: () => void;
  onNavigateTab: (tab: 'bookings' | 'passes' | 'support' | 'profile' | 'wallet') => void;
  onSelectRoute: (origin: string, destination: string) => void;
  onViewAllRoutes: () => void;
  onViewTicket: (booking: Booking) => void;
  onTrackRide: (booking: Booking) => void;
  upcomingBooking?: Booking;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onBookNewRide,
  onNavigateTab,
  onSelectRoute,
  onViewAllRoutes,
  onViewTicket,
  onTrackRide,
  upcomingBooking,
}) => {
  const popularRoutes = [
    { origin: 'Bally', destination: 'Sector V', fare: '₹89' },
    { origin: 'Sonarpur', destination: 'New Town', fare: '₹79' },
    { origin: 'Garia', destination: 'Sector V', fare: '₹69' },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Hero Banner Card matching screenshot #1 */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#1d3d60] min-h-[160px] flex flex-col justify-end p-5">
        <img
          src="/src/assets/images/busway_hero_shuttle_1792093570454.jpg"
          alt="BUSWAY Luxury Commuter Shuttle on Kolkata Bridge"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091523] via-[#091523]/75 to-transparent" />
        <div className="relative z-10 space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
            Office Commute Made Easy
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-200 drop-shadow">
            Safe • Comfortable • Affordable
          </p>
        </div>
      </div>

      {/* Primary Orange CTA Button */}
      <button
        onClick={onBookNewRide}
        className="w-full bg-[#F28C28] hover:bg-[#e07b1a] active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-[#F28C28]/25 flex items-center justify-center gap-2.5 transition-all text-sm sm:text-base select-none"
      >
        <Search className="w-5 h-5 stroke-[2.5]" />
        <span>Book New Ride</span>
      </button>

      {/* Quick Action Navigation Grid (4 circular icon buttons) */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button
          onClick={() => onNavigateTab('bookings')}
          className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#102438] hover:bg-[#16304a] border border-[#1a3857] transition-all group"
        >
          <div className="w-11 h-11 rounded-full bg-[#1b3b5e] flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">My Bookings</span>
        </button>

        <button
          onClick={() => onNavigateTab('passes')}
          className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#102438] hover:bg-[#16304a] border border-[#1a3857] transition-all group"
        >
          <div className="w-11 h-11 rounded-full bg-[#1b3b5e] flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Passes</span>
        </button>

        <button
          onClick={() => onNavigateTab('wallet')}
          className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#102438] hover:bg-[#16304a] border border-[#1a3857] transition-all group"
        >
          <div className="w-11 h-11 rounded-full bg-[#1b3b5e] flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Wallet</span>
        </button>

        <button
          onClick={() => onNavigateTab('support')}
          className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#102438] hover:bg-[#16304a] border border-[#1a3857] transition-all group"
        >
          <div className="w-11 h-11 rounded-full bg-[#1b3b5e] flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Support</span>
        </button>
      </div>

      {/* Upcoming Active Trip Card if booked */}
      {upcomingBooking && (
        <div className="bg-gradient-to-r from-[#102a43] to-[#153454] border border-[#234b75] rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Active Upcoming Shuttle
            </span>
            <VehicleBadge registrationNumber={upcomingBooking.vehicleRegistration} size="sm" />
          </div>
          <div className="flex items-center justify-between text-sm font-semibold text-white">
            <span>{upcomingBooking.origin} → {upcomingBooking.destination}</span>
            <span className="text-xs text-blue-300 font-mono">{upcomingBooking.departureTime}</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onTrackRide(upcomingBooking)}
              className="flex-1 bg-[#3B82F6] hover:bg-[#2563eb] text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Track Shuttle</span>
            </button>
            <button
              onClick={() => onViewTicket(upcomingBooking)}
              className="flex-1 bg-[#1a385b] hover:bg-[#224873] text-blue-200 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Ticket</span>
            </button>
          </div>
        </div>
      )}

      {/* Popular Routes Section matching screenshot #1 */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">Popular Routes</h3>
          <button
            onClick={onViewAllRoutes}
            className="text-xs font-semibold text-[#60a5fa] hover:text-[#93c5fd] flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {popularRoutes.map((r, i) => (
            <button
              key={i}
              onClick={() => onSelectRoute(r.origin, r.destination)}
              className="w-full bg-[#102438] hover:bg-[#16304a] border border-[#1b3a5a] rounded-xl p-3.5 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {r.origin} <span className="text-slate-400 font-normal">→</span> {r.destination}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F28C28]">From {r.fare}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
