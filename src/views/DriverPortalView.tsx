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
  List,
} from 'lucide-react';
import { VehicleBadge } from '../components/VehicleBadge';
import { ScannerView } from '../components/ScannerView';
import { api } from '../lib/api';

export const DriverPortalView: React.FC = () => {
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanToken, setScanToken] = useState('');
  const [activeTab, setActiveTab] = useState<'manifest' | 'scanner'>('scanner');
  const [tripStarted, setTripStarted] = useState(false);
  const [gpsSimulating, setGpsSimulating] = useState(true);

  // Recent validation banner
  const [recentScanResult, setRecentScanResult] = useState<{
    valid: boolean;
    message: string;
    passenger?: string;
    timestamp?: string;
  } | null>(null);

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

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanToken.trim()) return;

    try {
      const res = await api.verifyTicket(scanToken.trim());
      setRecentScanResult({
        valid: res.valid,
        message: res.message,
        passenger: `${res.passengerName} (Seat ${res.seatNumbers.join(', ')})`,
        timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      });
      setScanToken('');
      loadManifest();
    } catch (err: any) {
      setRecentScanResult({
        valid: false,
        message: err.message || 'Ticket verification failed on server',
        timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      });
    }
  };

  const handleQuickCheckIn = async (qrToken: string) => {
    try {
      const res = await api.verifyTicket(qrToken);
      setRecentScanResult({
        valid: res.valid,
        message: res.message,
        passenger: `${res.passengerName} (Seat ${res.seatNumbers.join(', ')})`,
        timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      });
      loadManifest();
    } catch (err: any) {
      setRecentScanResult({
        valid: false,
        message: err.message || 'Verification failed on server',
        timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      });
    }
  };

  const handleScannerSuccess = (result: any) => {
    setRecentScanResult({
      valid: result.valid,
      message: result.message,
      passenger: `${result.passengerName} (Seat ${result.seatNumbers?.join(', ')})`,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });
    loadManifest();
  };

  const handleScannerFail = (result: any) => {
    setRecentScanResult({
      valid: false,
      message: result.message || 'Boarding ticket rejected',
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });
  };

  const boardedCount = manifest?.boardedCount || 0;
  const totalBooked = manifest?.totalBooked || 0;

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
              {loading ? 'Loading...' : `${boardedCount}/${totalBooked} Boarded`}
            </span>
          </div>
        </div>

        {/* Live Trip Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
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
            type="button"
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

      {/* Persistent Scan Result Feedback Notice if present */}
      {recentScanResult && (
        <div
          className={`p-3 rounded-xl text-xs border flex items-start justify-between gap-2.5 animate-in fade-in ${
            recentScanResult.valid
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {recentScanResult.valid ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <div>
              <p className="font-bold">{recentScanResult.message}</p>
              {recentScanResult.passenger && (
                <p className="text-[11px] mt-0.5 font-semibold text-white">
                  {recentScanResult.passenger}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setRecentScanResult(null)}
            className="text-slate-400 hover:text-white p-0.5"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOGGLE BAR: Replace Manifest List with ScannerView                        */}
      {/* ========================================================================= */}
      <div className="bg-[#102438] p-1 rounded-xl flex items-center border border-[#1b3a5a] shadow-md">
        <button
          type="button"
          onClick={() => setActiveTab('scanner')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'scanner'
              ? 'bg-[#F28C28] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Camera Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manifest')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'manifest'
              ? 'bg-[#1b3b5e] text-white shadow-md border border-[#2a5580]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Manifest List ({boardedCount}/{totalBooked})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA: Switch between ScannerView and Manifest List           */}
      {/* ========================================================================= */}
      {activeTab === 'scanner' ? (
        <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-3">
          {/* Embedded ScannerView with live camera & instant UI overlay */}
          <ScannerView
            isInline={true}
            onScanSuccess={handleScannerSuccess}
            onScanFail={handleScannerFail}
            activePassengers={manifest?.passengers || []}
          />

          {/* Quick Manual Token Input Option */}
          <div className="pt-2 border-t border-[#17334e] space-y-1.5">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              Manual Token Lookup
            </span>
            <form onSubmit={handleManualVerify} className="flex gap-2">
              <input
                type="text"
                value={scanToken}
                onChange={(e) => setScanToken(e.target.value)}
                placeholder="Paste / enter booking or ticket token..."
                className="flex-1 bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
              />
              <button
                type="submit"
                className="bg-[#3B82F6] hover:bg-[#2563eb] text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Manifest List View */
        <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#3B82F6]" />
              Passenger Manifest Roster
            </h3>
            <button
              onClick={loadManifest}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="h-28 bg-slate-800 rounded-xl animate-shimmer" />
          ) : manifest?.passengers?.length === 0 ? (
            <p className="text-xs text-slate-400 p-6 text-center">
              No bookings confirmed on this shuttle manifest yet.
            </p>
          ) : (
            <div className="divide-y divide-[#17334e]">
              {manifest?.passengers.map((p: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block text-sm">{p.passengerName}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Seat: <strong className="text-amber-400 font-mono">{p.seatNumbers.join(', ')}</strong> • Pickup: {p.pickupStop}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Ref: {p.bookingNumber}
                    </span>
                  </div>

                  <div>
                    {p.isCheckedIn ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg">
                        <Check className="w-3.5 h-3.5" /> Boarded
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleQuickCheckIn(p.ticketQrToken)}
                        className="bg-[#193a5c] hover:bg-[#234d7a] active:scale-95 text-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow"
                      >
                        Board Passenger
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
