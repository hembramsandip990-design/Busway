import React, { useState } from 'react';
import { Booking } from '../types/busway';
import { BookingCard } from '../components/BookingCard';

interface MyBookingsViewProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  onRepeatBooking: (booking: Booking) => void;
  onTrackRide: (booking: Booking) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onViewDetails,
  onRepeatBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'history'>('bookings');

  // Filter Bookings vs History
  const activeBookings = bookings.filter(
    (b) => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'PENDING_PAYMENT'
  );

  const historyBookings = bookings.filter(
    (b) => b.bookingStatus === 'COMPLETED' || b.bookingStatus === 'CANCELLED'
  );

  const displayedList = activeTab === 'bookings' ? activeBookings : historyBookings;

  return (
    <div className="space-y-4 pb-6">
      {/* Segmented Tab Controls matching screenshot #3 */}
      <div className="bg-[#102438] p-1 rounded-xl flex items-center border border-[#1b3a5a]">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'bookings'
              ? 'bg-[#1a3b5c] text-white shadow-sm border border-[#2a5580]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Bookings ({activeBookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-[#1a3b5c] text-white shadow-sm border border-[#2a5580]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ride History ({historyBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {displayedList.length === 0 ? (
        <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-300">
            {activeTab === 'bookings' ? 'No active upcoming bookings' : 'No past ride history yet'}
          </p>
          <p className="text-xs text-slate-400">
            {activeTab === 'bookings'
              ? 'Book a seat on your preferred commuter corridor to see it here.'
              : 'Completed and cancelled rides will appear in your ride history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedList.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewDetails={onViewDetails}
              onRepeatBooking={onRepeatBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
};
