import React, { useState, useEffect } from 'react';
import {
  Truck,
  QrCode,
  CheckCircle,
  Users,
  Compass,
  AlertCircle,
  Play,
  Check,
  Camera,
} from 'lucide-react';
import { VehicleBadge } from '../components/VehicleBadge';
import { ScannerView } from '../components/ScannerView';
import { api } from '../lib/api';

export const DriverPortalView: React.FC = () => {
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanToken, setScanToken] = useState('');
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    message: string;
    passenger?: string;
  } | null>(null);
  const [tripStarted, setTripStarted] = useState(false);
  const [gpsSimulating, setGpsSimulating] = useState(true);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  const tripId = 'trip_bally_0830';

  const loadManifest = () => {
    setLoading(true);
    api.getDriverManifest(tripId)
      .then((data) => {
        setManifest(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadManifest();
  }, []);

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanToken.trim()) return;

    try {
      const res = await api.verifyTicket(scanToken.trim());
      setScanResult({
        valid: res.valid,
        message: res.message,
        passenger: `${res.passengerName} (Seat ${res.seatNumbers.join(', ')})`,
      });
      setScanToken('');
      loadManifest();
    } catch (err: any) {
      setScanResult({
        valid: false,
        message: err.message || 'Ticket verification failed',
      });
    }
  };

  const handleQuickCheckIn = async (qrToken: string) => {
    try {
      const res = await api.verifyTicket(qrToken);
      setScanResult({
        valid: res.valid,
        message: res.message,
        passenger: `${res.passengerName} (Seat ${res.seatNumbers.join(', ')})`,
      });
      loadManifest();
    } catch (err: any) {
      setScanResult({
        valid: false,
        message: err.message || 'Verification failed',
      });
    }
  };

  const handleScannerSuccess = (result: any) => {
    setScanResult({
      valid: result.valid,
      message: result.message,
      passenger: `${result.passengerName} (Seat ${result.seatNumbers?.join(', ')})`,
    });
    loadManifest();
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Driver Header Card */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Duty
              </span>
              <h2 className="text-sm font-bold text-white">Ramesh Kumar</h2>
            </div>
          </div>
          <VehicleBadge registrationNumber="WB 25 3751" size="md" />
        </div>

        {/* Assigned Trip Snapshot */}
        <div className="bg-[#091523] border border-[#1a344f] rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Current Route</span>
            <span className="font-bold text-white">Bally Khal → Sector V (08:30 AM)</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Passenger Load</span>
            <span className="font-bold text-emerald-400">
              {manifest ? `${manifest.boardedCount}/${manifest.totalBooked} Boarded` : 'Loading...'}
            </span>
          </div>
        </div>

        {/* Live Trip Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setTripStarted(!tripStarted)}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
              tripStarted
                ? 'bg-emerald-600 text-white'
                : 'bg-[#F28C28] hover:bg-[#e07b1a] text-white'
            }`}
          >
            {tripStarted ? (
              <>
                <Check className="w-4 h-4" />
                <span>Trip In Progress</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Trip</span>
              </>
            )}
          </button>

          <button
            onClick={() => setGpsSimulating(!gpsSimulating)}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
              gpsSimulating
                ? 'bg-[#1b3d63] border-blue-400/40 text-blue-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Compass className={`w-4 h-4 ${gpsSimulating ? 'animate-spin' : ''}`} />
            <span>GPS: {gpsSimulating ? 'Broadcasting' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* QR Ticket Validation Desk with Camera Scanner Trigger */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#F28C28]" />
            Ticket Validation Desk
          </h3>
          <span className="text-[10px] text-slate-400">Camera QR or manual lookup</span>
        </div>

        {/* Primary Camera Scanner Button */}
        <button
          onClick={() => setShowCameraScanner(true)}
          className="w-full bg-gradient-to-r from-[#F28C28] to-[#e67e17] hover:from-[#e07b1a] hover:to-[#d46d0a] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#F28C28]/25 transition-all active:scale-[0.98]"
        >
          <Camera className="w-5 h-5 stroke-[2.2]" />
          <span>Open Camera QR Scanner</span>
        </button>

        {/* Manual Input Fallback */}
        <form onSubmit={handleVerifyToken} className="flex gap-2 pt-1">
          <input
            type="text"
            value={scanToken}
            onChange={(e) => setScanToken(e.target.value)}
            placeholder="Paste / enter ticket token..."
            className="flex-1 bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
          />
          <button
            type="submit"
            className="bg-[#3B82F6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors"
          >
            Verify
          </button>
        </form>

        {scanResult && (
          <div
            className={`p-3 rounded-xl text-xs border flex items-start gap-2.5 animate-in fade-in ${
              scanResult.valid
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            {scanResult.valid ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <div>
              <p className="font-bold">{scanResult.message}</p>
              {scanResult.passenger && <p className="text-[11px] mt-0.5">{scanResult.passenger}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Trip Passenger Manifest Table */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#3B82F6]" />
            Passenger Manifest
          </h3>
          <button
            onClick={loadManifest}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="h-20 bg-slate-800 rounded-xl animate-shimmer" />
        ) : manifest?.passengers?.length === 0 ? (
          <p className="text-xs text-slate-400 p-4 text-center">No bookings on this manifest yet.</p>
        ) : (
          <div className="divide-y divide-[#17334e]">
            {manifest?.passengers.map((p: any, idx: number) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{p.passengerName}</span>
                  <span className="text-[11px] text-slate-400">
                    Seat: <strong className="text-amber-400">{p.seatNumbers.join(', ')}</strong> • {p.pickupStop}
                  </span>
                </div>

                <div>
                  {p.isCheckedIn ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" /> Boarded
                    </span>
                  ) : (
                    <button
                      onClick={() => handleQuickCheckIn(p.ticketQrToken)}
                      className="bg-[#193a5c] hover:bg-[#234d7a] text-blue-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      Check-in
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Camera QR Scanner Modal Overlay */}
      {showCameraScanner && (
        <ScannerView
          onScanSuccess={handleScannerSuccess}
          onClose={() => setShowCameraScanner(false)}
          activePassengers={manifest?.passengers || []}
        />
      )}
    </div>
  );
};
