import React from 'react';
import { RotateCw, ChevronRight, MapPin } from 'lucide-react';
import { Booking } from '../types/busway';
import { VehicleBadge } from './VehicleBadge';
import { StatusBadge } from './StatusBadge';

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onRepeatBooking: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onViewDetails,
  onRepeatBooking,
}) => {
  return (
    <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-lg transition-all hover:border-[#275380]">
      {/* Top Header: Date/Time Pill + Yellow Vehicle Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="bg-[#1b3b5e]/90 text-blue-200 text-[11px] font-semibold px-2.5 py-1 rounded-md tracking-wider uppercase">
          {booking.departureDate} {booking.departureTime}
        </div>
        <VehicleBadge registrationNumber={booking.vehicleRegistration} size="sm" />
      </div>

      {/* Booking Reference */}
      <div className="mb-3">
        <span className="text-[11px] text-slate-400 block font-normal">Booking No.</span>
        <button
          onClick={() => onViewDetails(booking)}
          className="font-mono text-xs font-semibold text-[#60a5fa] hover:text-[#93c5fd] tracking-wider text-left transition-colors"
        >
          {booking.bookingNumber}
        </button>
      </div>

      {/* Route Timeline & Status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-2.5">
          <div className="flex flex-col items-center mt-1">
            <span className="w-2 h-2 rounded-full bg-white ring-2 ring-[#102438]" />
            <div className="w-[1.5px] h-6 bg-slate-600 my-0.5" />
            <MapPin className="w-3 h-3 text-[#F28C28]" />
          </div>
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-slate-100">{booking.origin}</p>
            <p className="font-semibold text-slate-100">{booking.destination}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={booking.bookingStatus} />
          <button
            onClick={() => onViewDetails(booking)}
            className="text-[11px] text-[#60a5fa] hover:text-white flex items-center gap-0.5 mt-1 transition-colors"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Action: Repeat Booking */}
      <div className="pt-3 border-t border-[#1a344f] flex items-center justify-center">
        <button
          onClick={() => onRepeatBooking(booking)}
          className="text-xs font-semibold text-[#60a5fa] hover:text-white flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-[#1a385b] transition-all"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Repeat Booking</span>
        </button>
      </div>
    </div>
  );
};
