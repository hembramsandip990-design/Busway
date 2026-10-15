import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Wallet, CreditCard } from 'lucide-react';
import { TripInstance, BookingHold, Booking, WalletAccount } from '../types/busway';
import { VehicleBadge } from '../components/VehicleBadge';
import { api } from '../lib/api';

interface SearchResultsViewProps {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
  wallet: WalletAccount;
  onBookingSuccess: (booking: Booking) => void;
  onTopupWallet: (amount: number) => void;
  onBack: () => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  origin,
  destination,
  passengers,
  wallet,
  onBookingSuccess,
  onTopupWallet,
  onBack,
}) => {
  const [trips, setTrips] = useState<TripInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Hold State
  const [activeHold, setActiveHold] = useState<(BookingHold & { trip: TripInstance }) | null>(null);
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number>(300);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'RAZORPAY_SANDBOX'>('WALLET');
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load Trips
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.searchTrips(origin, destination)
      .then((data) => {
        if (isMounted) {
          // If no direct matches, fallback to all active trips for testing convenience
          if (data.length === 0) {
            api.searchTrips().then(all => {
              if (isMounted) {
                setTrips(all);
                setLoading(false);
              }
            });
          } else {
            setTrips(data);
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to search shuttles');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [origin, destination]);

  // Hold Countdown Timer
  useEffect(() => {
    if (!activeHold) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(activeHold.expiresAt).getTime() - Date.now()) / 1000));
      setHoldSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setActiveHold(null);
        setActionError('Seat hold expired. Please select a shuttle again.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeHold]);

  const handleSelectTrip = async (trip: TripInstance) => {
    setActionError(null);
    try {
      const hold = await api.createHold(trip.id, passengers);
      setActiveHold({
        ...hold,
        trip,
      });
      setHoldSecondsRemaining(300);
    } catch (err: any) {
      setActionError(err.message || 'Failed to hold seat. Shuttle may be full.');
    }
  };

  const handleConfirmBooking = async () => {
    if (!activeHold) return;
    setActionError(null);
    setConfirming(true);

    try {
      // If paying via wallet and balance is insufficient, check if user needs to top up
      if (paymentMethod === 'WALLET' && wallet.availableBalance < activeHold.totalFare) {
        const diff = activeHold.totalFare - wallet.availableBalance;
        // Prompt or auto topup
        await onTopupWallet(Math.ceil(diff));
      }

      const booking = await api.confirmBooking(
        activeHold.holdToken,
        paymentMethod,
        `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      );

      setActiveHold(null);
      onBookingSuccess(booking);
    } catch (err: any) {
      setActionError(err.message || 'Booking confirmation failed.');
    } finally {
      setConfirming(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Route Header Info */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-xl p-3.5 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2 text-white">
          <span className="font-bold text-sm">{origin}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
          <span className="font-bold text-sm">{destination}</span>
        </div>
        <div className="text-slate-400">
          <span>{passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}</span>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#102438] animate-shimmer" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="p-8 text-center bg-[#102438] rounded-2xl border border-[#1b3a5a] space-y-2">
          <p className="text-sm font-semibold text-slate-300">No active shuttles found for this route</p>
          <p className="text-xs text-slate-400">Try searching Bally to Sector V or Sonarpur to New Town.</p>
          <button
            onClick={onBack}
            className="mt-3 px-4 py-2 bg-[#F28C28] text-white rounded-lg text-xs font-bold"
          >
            Change Route
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => {
            const isFewSeats = trip.availableCapacity < 8;
            return (
              <div
                key={trip.id}
                className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-lg hover:border-[#2b5683] transition-all space-y-3"
              >
                {/* Shuttle Header: Time and Vehicle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono">{trip.departureTime}</span>
                    <span className="text-xs text-slate-400">→</span>
                    <span className="text-xs text-slate-300 font-mono">{trip.estimatedArrivalTime}</span>
                  </div>
                  <VehicleBadge registrationNumber={trip.vehicleRegistration} size="sm" />
                </div>

                {/* Route stops snippet */}
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{trip.origin} to {trip.destination}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-semibold ${isFewSeats ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {trip.availableCapacity} seats left
                    </span>
                  </div>
                </div>

                {/* Fare & CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1a344f]">
                  <div>
                    <span className="text-xs text-slate-400">Fare per seat</span>
                    <div className="text-base font-extrabold text-white">
                      ₹{trip.fare.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectTrip(trip)}
                    disabled={trip.availableCapacity < passengers}
                    className="bg-[#F28C28] hover:bg-[#e07b1a] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-[#F28C28]/20"
                  >
                    <span>Hold & Book</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Hold Confirmation Modal / Drawer */}
      {activeHold && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0e2034] border border-[#214368] rounded-t-3xl sm:rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            {/* Hold countdown header */}
            <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">Seat Capacity Held</span>
              </div>
              <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                {formatTimer(holdSecondsRemaining)}
              </span>
            </div>

            {/* Trip Details Summary */}
            <div className="bg-[#091523] border border-[#1b344e] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Route:</span>
                <span className="font-bold text-white">{activeHold.trip.origin} → {activeHold.trip.destination}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Departure:</span>
                <span className="font-mono text-white">{activeHold.trip.departureTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Vehicle:</span>
                <VehicleBadge registrationNumber={activeHold.trip.vehicleRegistration} size="sm" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Seat Allocation:</span>
                <span className="text-emerald-400 font-medium">Automatic system assignment</span>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="space-y-1.5 text-xs border-y border-[#1b344e] py-2.5">
              <div className="flex justify-between text-slate-300">
                <span>Base Fare ({passengers} {passengers === 1 ? 'seat' : 'seats'})</span>
                <span>₹{(activeHold.trip.fare * passengers).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform GST (Included)</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1">
                <span>Total Payable</span>
                <span className="text-[#F28C28]">₹{activeHold.totalFare.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Select Payment Method</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('WALLET')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'WALLET'
                      ? 'border-[#F28C28] bg-[#F28C28]/10 text-white'
                      : 'border-[#1b344e] bg-[#0a1827] text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    {paymentMethod === 'WALLET' && <CheckCircle2 className="w-3.5 h-3.5 text-[#F28C28]" />}
                  </div>
                  <span className="text-xs font-bold text-white">BUSWAY Wallet</span>
                  <span className="text-[10px] text-slate-400">Bal: ₹{wallet.availableBalance.toFixed(2)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY_SANDBOX')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'RAZORPAY_SANDBOX'
                      ? 'border-[#F28C28] bg-[#F28C28]/10 text-white'
                      : 'border-[#1b344e] bg-[#0a1827] text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <CreditCard className="w-4 h-4 text-[#3B82F6]" />
                    {paymentMethod === 'RAZORPAY_SANDBOX' && <CheckCircle2 className="w-3.5 h-3.5 text-[#F28C28]" />}
                  </div>
                  <span className="text-xs font-bold text-white">Razorpay Test</span>
                  <span className="text-[10px] text-slate-400">UPI / Cards / NetBanking</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveHold(null)}
                className="flex-1 py-3 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={confirming}
                className="flex-[2] bg-[#F28C28] hover:bg-[#e07b1a] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#F28C28]/25 transition-all"
              >
                {confirming ? (
                  <span>Securing Ticket...</span>
                ) : (
                  <span>Confirm & Pay ₹{activeHold.totalFare.toFixed(2)}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
