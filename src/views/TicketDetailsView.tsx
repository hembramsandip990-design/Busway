import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  CheckCircle,
  Download,
  Share2,
  Calendar,
  Clock,
  Truck,
  Armchair,
  IndianRupee,
  Navigation,
  Ban,
  Check,
} from 'lucide-react';
import { Booking } from '../types/busway';
import { VehicleBadge } from '../components/VehicleBadge';

interface TicketDetailsViewProps {
  booking: Booking;
  onTrackRide: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => Promise<void>;
  onBack: () => void;
}

export const TicketDetailsView: React.FC<TicketDetailsViewProps> = ({
  booking,
  onTrackRide,
  onCancelBooking,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [cancelling, setCancelling] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    // Generate high-resolution QR code
    QRCode.toDataURL(booking.ticketQrToken || booking.bookingNumber, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0a1929',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [booking]);

  const handleDownload = () => {
    // Simulated ticket receipt download
    const link = document.createElement('a');
    link.href = qrDataUrl || '';
    link.download = `BUSWAY-Ticket-${booking.bookingNumber}.png`;
    link.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `BUSWAY Ticket - ${booking.origin} to ${booking.destination}`,
          text: `Here is my BUSWAY shuttle ticket (${booking.bookingNumber}) for ${booking.departureDate} at ${booking.departureTime}. Seat: ${booking.seatNumbers.join(', ')}`,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `BUSWAY Ticket: ${booking.bookingNumber} | ${booking.origin} → ${booking.destination} on ${booking.departureDate} at ${booking.departureTime}`
      );
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  const handleCancelClick = async () => {
    if (window.confirm('Are you sure you want to cancel this booking? The full fare will be refunded to your BUSWAY wallet immediately.')) {
      setCancelling(true);
      await onCancelBooking(booking.id);
      setCancelling(false);
    }
  };

  const isConfirmed = booking.bookingStatus === 'CONFIRMED';
  const isCancelled = booking.bookingStatus === 'CANCELLED';

  return (
    <div className="space-y-4 pb-8">
      {/* Green Header Banner matching screenshot #6 */}
      <div
        className={`rounded-2xl p-4 flex items-center gap-3.5 shadow-lg ${
          isCancelled
            ? 'bg-rose-900/60 border border-rose-700/60 text-white'
            : 'bg-[#00c853]/90 text-slate-950 font-bold'
        }`}
      >
        {isCancelled ? (
          <Ban className="w-8 h-8 text-rose-300 shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-[#00c853]" />
          </div>
        )}
        <div>
          <h2 className="text-base font-extrabold tracking-tight">
            {isCancelled ? 'Booking Cancelled' : 'Booking Confirmed'}
          </h2>
          <p className={`text-xs ${isCancelled ? 'text-rose-200' : 'text-slate-900'} font-medium`}>
            {booking.departureDate} • {booking.departureTime}
          </p>
        </div>
      </div>

      {/* White Ticket Cutout Card */}
      <div className="bg-white rounded-3xl p-5 text-slate-900 shadow-2xl relative overflow-hidden">
        {/* Decorative notch cutouts */}
        <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#08111e]" />
        <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-[#08111e]" />

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative p-2 bg-white rounded-2xl shadow-inner border border-slate-200 flex flex-col items-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Digital Ticket QR Code"
                className="w-44 h-44 object-contain"
              />
            ) : (
              <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
            <div className="text-[11px] font-extrabold text-[#F28C28] -mt-2 uppercase tracking-widest font-sans">
              BUSWAY
            </div>
          </div>
          <span className="font-mono text-[11px] text-slate-500 font-semibold tracking-wider mt-2">
            {booking.bookingNumber}
          </span>
        </div>

        {/* Dashed separator */}
        <div className="border-b-2 border-dashed border-slate-200 my-4" />

        {/* Ticket Details Rows matching screenshot #6 */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Navigation className="w-3.5 h-3.5 text-slate-400" />
              Route
            </span>
            <span className="font-bold text-slate-900">
              {booking.origin} → {booking.destination}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date
            </span>
            <span className="font-bold text-slate-900">{booking.departureDate}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Pickup Time
            </span>
            <span className="font-bold text-slate-900 font-mono">{booking.departureTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Drop Time
            </span>
            <span className="font-bold text-slate-900 font-mono">{booking.arrivalTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              Vehicle No.
            </span>
            <VehicleBadge registrationNumber={booking.vehicleRegistration} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Armchair className="w-3.5 h-3.5 text-slate-400" />
              Seat No.
            </span>
            <span className="font-bold text-slate-900">
              {booking.seatNumbers.join(', ')} (Automatically Assigned)
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
              Fare
            </span>
            <span className="font-extrabold text-slate-900 text-sm">
              ₹ {booking.fare.toFixed(2)} ({booking.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Paid'})
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons matching screenshot #6 */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleDownload}
          className="bg-[#102438] hover:bg-[#193a5c] border border-[#1d3d60] text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all active:scale-95"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-slate-300" />
              <span>Download</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          className="bg-[#3B82F6] hover:bg-[#2563eb] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#3B82F6]/25 transition-all active:scale-95"
        >
          {shareSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-white" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Additional Actions: Track Shuttle Live & Cancel Option */}
      {isConfirmed && (
        <div className="space-y-2 pt-2">
          <button
            onClick={() => onTrackRide(booking)}
            className="w-full bg-[#1b3d63] hover:bg-[#234d7d] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all"
          >
            <Navigation className="w-4 h-4 text-[#3B82F6]" />
            <span>Track Live Shuttle Location</span>
          </button>

          <button
            onClick={handleCancelClick}
            disabled={cancelling}
            className="w-full text-xs font-semibold text-rose-400 hover:text-rose-300 py-2 transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Processing Refund...' : 'Cancel Booking & Instant Refund to Wallet'}
          </button>
        </div>
      )}
    </div>
  );
};
