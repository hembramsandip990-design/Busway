import React from 'react';
import { BookingStatus } from '../types/busway';

interface StatusBadgeProps {
  status: BookingStatus | 'Booked' | 'Cancelled' | 'Completed' | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = status.toUpperCase();

  let bgClass = 'bg-slate-700 text-slate-200';
  let label = status;

  if (norm === 'CONFIRMED' || norm === 'BOOKED') {
    bgClass = 'bg-[#00c853]/20 border border-[#00c853]/40 text-[#00e676] font-medium';
    label = 'Booked';
  } else if (norm === 'COMPLETED') {
    bgClass = 'bg-[#00c853]/20 border border-[#00c853]/40 text-[#00e676] font-medium';
    label = 'Completed';
  } else if (norm === 'CANCELLED') {
    bgClass = 'bg-rose-500/20 border border-rose-500/40 text-rose-400 font-medium';
    label = 'Cancelled';
  } else if (norm === 'PENDING_PAYMENT') {
    bgClass = 'bg-amber-500/20 border border-amber-500/40 text-amber-400 font-medium';
    label = 'Pending';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs tracking-wide select-none ${bgClass} ${className}`}
    >
      {label}
    </span>
  );
};
