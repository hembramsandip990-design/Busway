import React, { useState, useEffect } from 'react';
import {
  Download,
  Shield,
  FileSpreadsheet,
  AlertCircle,
  X,
  History,
} from 'lucide-react';
import { api } from '../lib/api';

export const AdminPortalView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjAmount, setAdjAmount] = useState('84');
  const [adjReason, setAdjReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    api.getAdminAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjReason.trim() || adjReason.trim().length < 5) {
      alert('A clear reason of at least 5 characters is mandatory for financial adjustments.');
      return;
    }

    setAdjusting(true);
    try {
      await api.adminManualAdjustment(parseFloat(adjAmount), adjReason.trim());
      setShowAdjustmentModal(false);
      setAdjReason('');
      setNotice('Manual adjustment applied and recorded in platform audit log.');
      setTimeout(() => setNotice(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Adjustment failed');
    } finally {
      setAdjusting(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.recentBookings) return;
    const headers = ['BookingNumber,Passenger,Origin,Destination,Date,Time,Fare,Status,Vehicle'];
    const rows = data.recentBookings.map((b: any) =>
      `"${b.bookingNumber}","${b.userName}","${b.origin}","${b.destination}","${b.departureDate}","${b.departureTime}",${b.fare},"${b.bookingStatus}","${b.vehicleRegistration}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BUSWAY_Reconciliation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-6">
      {notice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Admin Dashboard Header */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#F28C28] uppercase tracking-wider block">
              BUSWAY Superadmin Console
            </span>
            <h2 className="text-base font-bold text-white">Operations & Compliance Control</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdjustmentModal(true)}
              className="bg-[#193a5c] hover:bg-[#224d7a] text-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
            >
              Manual Ledger Adj.
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-[#F28C28] hover:bg-[#e07b1a] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4-KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="bg-[#091523] border border-[#1a344f] rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Total Revenue</span>
            <span className="text-lg font-extrabold text-white font-mono">
              ₹{data?.kpis?.totalRevenue ? data.kpis.totalRevenue.toLocaleString() : '14,840'}
            </span>
          </div>
          <div className="bg-[#091523] border border-[#1a344f] rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Seat Occupancy</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">
              {data?.kpis?.avgSeatOccupancyPercent || 86.2}%
            </span>
          </div>
          <div className="bg-[#091523] border border-[#1a344f] rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">On-Time Rate</span>
            <span className="text-lg font-extrabold text-blue-400 font-mono">
              {data?.kpis?.onTimePerformanceRate || 98.4}%
            </span>
          </div>
          <div className="bg-[#091523] border border-[#1a344f] rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Active Bookings</span>
            <span className="text-lg font-extrabold text-amber-400 font-mono">
              {data?.kpis?.activeBookings || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Platform Bookings */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-[#3B82F6]" />
          Live Booking Ledger Stream
        </h3>

        {loading ? (
          <div className="h-28 bg-slate-800 rounded-xl animate-shimmer" />
        ) : (
          <div className="divide-y divide-[#173450] max-h-56 overflow-y-auto text-xs">
            {data?.recentBookings?.map((b: any) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#60a5fa] block">
                    {b.bookingNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {b.userName} • {b.origin} → {b.destination}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block">₹{b.fare.toFixed(2)}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      b.bookingStatus === 'CONFIRMED'
                        ? 'text-emerald-400'
                        : b.bookingStatus === 'CANCELLED'
                        ? 'text-rose-400'
                        : 'text-blue-300'
                    }`}
                  >
                    {b.bookingStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immutable Audit Log Inspector */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-amber-400" />
          Regulatory Audit Trail
        </h3>

        <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
          {data?.auditLogs?.map((log: any) => (
            <div key={log.id} className="p-2.5 bg-[#091523] border border-[#1a344f] rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white">{log.action}</span>
                <span className="text-slate-400">{log.actorEmail}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                <span className="text-slate-500">Reason:</span> {log.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Ledger Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0e2034] border border-[#214368] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Manual Financial Adjustment</h3>
              <button onClick={() => setShowAdjustmentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>All manual adjustments are permanently logged with timestamp and actor ID.</span>
            </div>

            <form onSubmit={handleManualAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Adjustment Amount (₹)</label>
                <input
                  type="number"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mandatory Business Reason</label>
                <textarea
                  rows={3}
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Good faith credit for mechanical delay on route BW-101"
                  className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl p-2.5 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 bg-[#F28C28] hover:bg-[#e07b1a] text-white font-bold py-2.5 px-4 rounded-xl text-xs"
                >
                  {adjusting ? 'Logging...' : 'Apply & Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
