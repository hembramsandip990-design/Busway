import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  FileCheck,
  AlertTriangle,
  X,
  Compass,
} from 'lucide-react';
import { VehicleBadge } from '../components/VehicleBadge';
import { Vehicle } from '../types/busway';
import { api } from '../lib/api';

export const OperatorPortalView: React.FC = () => {
  const [fleetData, setFleetData] = useState<{ operator: any; vehicles: Vehicle[]; drivers: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showRouteProposalModal, setShowRouteProposalModal] = useState(false);

  // New vehicle form
  const [regNum, setRegNum] = useState('');
  const [model, setModel] = useState('Tata Starbus Ultra AC');
  const [capacity, setCapacity] = useState('32');
  const [submitting, setSubmitting] = useState(false);

  // Route proposal form
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [proposedFare, setProposedFare] = useState('85');
  const [proposalSuccess, setProposalSuccess] = useState(false);

  const loadFleet = () => {
    setLoading(true);
    api.getOperatorFleet()
      .then((data) => {
        setFleetData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFleet();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addVehicle(regNum, model, parseInt(capacity, 10));
      setShowAddVehicleModal(false);
      setRegNum('');
      loadFleet();
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposeRoute = (e: React.FormEvent) => {
    e.preventDefault();
    setProposalSuccess(true);
    setTimeout(() => {
      setProposalSuccess(false);
      setShowRouteProposalModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Operator Banner */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>WB RTO Verified Fleet Operator</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              {fleetData?.operator?.name || 'Bengal Transit Link Fleet Co.'}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Trade License: {fleetData?.operator?.tradeLicenseNumber || 'TL-WB-KOL-2024-89312'}
            </p>
          </div>
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="bg-[#F28C28] hover:bg-[#e07b1a] text-white p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Fleet Vehicles Compliance List */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Authorized Fleet Vehicles ({fleetData?.vehicles.length || 0})
          </h3>
          <button
            onClick={() => setShowRouteProposalModal(true)}
            className="text-xs font-semibold text-[#60a5fa] hover:text-white flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Propose Route</span>
          </button>
        </div>

        {loading ? (
          <div className="h-32 bg-slate-800 rounded-xl animate-shimmer" />
        ) : (
          <div className="space-y-3">
            {fleetData?.vehicles.map((veh) => {
              const fitnessExpiringSoon = new Date(veh.fitnessValidUntil).getTime() < Date.now() + 30 * 86400000;
              return (
                <div
                  key={veh.id}
                  className="bg-[#091523] border border-[#1a344f] rounded-xl p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <VehicleBadge registrationNumber={veh.registrationNumber} size="sm" />
                      <span className="font-bold text-white">{veh.model}</span>
                    </div>
                    <span className="text-slate-400 font-mono">{veh.totalCapacity} Seats</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Fitness Cert</span>
                      <span
                        className={`font-semibold flex items-center gap-1 ${
                          fitnessExpiringSoon ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        {fitnessExpiringSoon ? <AlertTriangle className="w-3 h-3 text-amber-400" /> : <FileCheck className="w-3 h-3 text-emerald-400" />}
                        {veh.fitnessValidUntil}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Insurance</span>
                      <span className="text-slate-300 font-semibold">{veh.insuranceValidUntil}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Permit</span>
                      <span className="text-emerald-400 font-semibold">Active</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0e2034] border border-[#214368] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add New Shuttle Vehicle</h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Registration Number</label>
                <input
                  type="text"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  placeholder="e.g. WB 25 9912"
                  className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3.5 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-[#3B82F6]"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Make & Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="Tata Starbus Ultra AC">Tata Starbus Ultra AC (32 Seats)</option>
                  <option value="Ashok Leyland Oyster AC">Ashok Leyland Oyster AC (36 Seats)</option>
                  <option value="Eicher Skyline Pro AC">Eicher Skyline Pro AC (28 Seats)</option>
                  <option value="Force Urbania Executive AC">Force Urbania Executive AC (17 Seats)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Seating Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min="12"
                  max="50"
                  className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#F28C28] hover:bg-[#e07b1a] text-white font-bold py-2.5 px-4 rounded-xl text-xs"
                >
                  {submitting ? 'Adding...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Propose Route Modal */}
      {showRouteProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0e2034] border border-[#214368] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Propose Route & Timetable</h3>
              <button onClick={() => setShowRouteProposalModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {proposalSuccess ? (
              <div className="p-4 bg-emerald-500/20 text-emerald-300 rounded-xl text-center text-xs font-bold">
                Proposal submitted to BUSWAY Operations for regulatory review.
              </div>
            ) : (
              <form onSubmit={handleProposeRoute} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Origin Node</label>
                  <input
                    type="text"
                    value={fromStop}
                    onChange={(e) => setFromStop(e.target.value)}
                    placeholder="e.g. Howrah Station"
                    className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Destination Tech Corridor</label>
                  <input
                    type="text"
                    value={toStop}
                    onChange={(e) => setToStop(e.target.value)}
                    placeholder="e.g. Sector V RDB Boulevard"
                    className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Proposed Fare (₹)</label>
                  <input
                    type="number"
                    value={proposedFare}
                    onChange={(e) => setProposedFare(e.target.value)}
                    className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#3B82F6] text-white py-2.5 rounded-xl font-bold mt-2"
                >
                  Submit Proposal
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
