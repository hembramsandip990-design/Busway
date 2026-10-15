import React, { useState } from 'react';
import { MapPin, Calendar, Users, ArrowUpDown, Minus, Plus } from 'lucide-react';

interface BookRideViewProps {
  onSearch: (params: {
    origin: string;
    destination: string;
    date: string;
    passengers: number;
    tripType: 'one-way' | 'return';
  }) => void;
  initialOrigin?: string;
  initialDestination?: string;
}

export const BookRideView: React.FC<BookRideViewProps> = ({
  onSearch,
  initialOrigin = 'Bally',
  initialDestination = 'Sector V',
}) => {
  const [tripType, setTripType] = useState<'one-way' | 'return'>('one-way');
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState('2026-10-16');
  const [passengers, setPassengers] = useState(1);

  const popularRouteChips = [
    { from: 'Bally', to: 'Sector V' },
    { from: 'Sonarpur', to: 'New Town' },
    { from: 'Barrackpore', to: 'Sector V' },
    { from: 'Garia', to: 'Sector V' },
    { from: 'Serampore', to: 'Ecospace' },
  ];

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      origin,
      destination,
      date,
      passengers,
      tripType,
    });
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Trip Type Segmented Toggle */}
      <div className="bg-[#102438] p-1 rounded-xl flex items-center border border-[#1b3a5a]">
        <button
          type="button"
          onClick={() => setTripType('one-way')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
            tripType === 'one-way'
              ? 'bg-[#F28C28] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          One Way
        </button>
        <button
          type="button"
          onClick={() => setTripType('return')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
            tripType === 'return'
              ? 'bg-[#F28C28] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Return
        </button>
      </div>

      {/* Main Search Inputs Card matching screenshot #2 */}
      <form onSubmit={handleSubmit} className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-4">
        {/* Origin / From Field */}
        <div className="relative">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            From
          </label>
          <div className="flex items-center gap-2.5 bg-[#0a1827] border border-[#1b354f] rounded-xl px-3.5 py-2.5 focus-within:border-[#3B82F6] transition-colors">
            <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Enter pickup stop or area"
              className="w-full bg-transparent text-sm font-semibold text-white placeholder-slate-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Swap Button Divider */}
        <div className="relative flex justify-center -my-2 z-10">
          <button
            type="button"
            onClick={handleSwap}
            className="w-8 h-8 rounded-full bg-[#1c3e63] border border-[#2d5684] text-slate-200 hover:text-white flex items-center justify-center shadow-md active:rotate-180 transition-transform"
            title="Swap Origin & Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination / To Field */}
        <div className="relative">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            To
          </label>
          <div className="flex items-center gap-2.5 bg-[#0a1827] border border-[#1b354f] rounded-xl px-3.5 py-2.5 focus-within:border-[#3B82F6] transition-colors">
            <MapPin className="w-4 h-4 text-[#F28C28] shrink-0" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter dropoff corridor or office"
              className="w-full bg-transparent text-sm font-semibold text-white placeholder-slate-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Travel Date */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Travel Date
          </label>
          <div className="flex items-center gap-2.5 bg-[#0a1827] border border-[#1b354f] rounded-xl px-3.5 py-2.5 focus-within:border-[#3B82F6] transition-colors">
            <Calendar className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none [color-scheme:dark]"
              required
            />
          </div>
        </div>

        {/* Passengers Stepper */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Passengers
          </label>
          <div className="flex items-center justify-between bg-[#0a1827] border border-[#1b354f] rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-white">Seats</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                disabled={passengers <= 1}
                className="w-8 h-8 rounded-lg bg-[#14283d] text-slate-200 hover:bg-[#1b3652] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-base text-white w-4 text-center">
                {passengers}
              </span>
              <button
                type="button"
                onClick={() => setPassengers(Math.min(6, passengers + 1))}
                disabled={passengers >= 6}
                className="w-8 h-8 rounded-lg bg-[#F28C28] text-white hover:bg-[#e07b1a] flex items-center justify-center transition-colors shadow"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Primary Orange Search Button */}
        <button
          type="submit"
          className="w-full mt-2 bg-[#F28C28] hover:bg-[#e07b1a] active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-[#F28C28]/25 text-sm sm:text-base transition-all"
        >
          Search Shuttle
        </button>
      </form>

      {/* Popular Routes Chips matching screenshot #2 */}
      <div className="space-y-2.5 pt-2">
        <h4 className="text-xs font-bold text-slate-300">Popular Routes</h4>
        <div className="flex flex-wrap gap-2">
          {popularRouteChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setOrigin(chip.from);
                setDestination(chip.to);
              }}
              className="bg-[#102438] hover:bg-[#193959] border border-[#1c3854] text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              {chip.from} → {chip.to}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
