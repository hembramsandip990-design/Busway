import React, { useState } from 'react';
import { Search, ChevronRight, Clock } from 'lucide-react';
import { BusRoute } from '../types/busway';

interface AllRoutesViewProps {
  routes: BusRoute[];
  onSelectRoute: (origin: string, destination: string) => void;
  onBack: () => void;
}

export const AllRoutesView: React.FC<AllRoutesViewProps> = ({
  routes,
  onSelectRoute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('All');

  const corridors = ['All', 'Sector V', 'New Town', 'Ecospace'];

  // Route schedule timetable mapping
  const timetableMap: Record<string, string> = {
    'rt_bally_secv': '07:20 AM',
    'rt_sonarpur_newtown': '07:15 AM',
    'rt_barrackpore_secv': '06:55 AM',
    'rt_serampore_ecospace': '06:55 AM',
    'rt_barasat_newtown': '07:10 AM',
    'rt_naihati_secv': '06:40 AM',
    'rt_garia_secv': '08:20 AM',
  };

  const filteredRoutes = routes.filter((r) => {
    const matchCorridor =
      selectedCorridor === 'All' || r.corridor.toLowerCase() === selectedCorridor.toLowerCase();
    const matchSearch =
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.corridor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCorridor && matchSearch;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Search Input Bar matching screenshot #10 */}
      <div className="relative">
        <div className="flex items-center gap-2.5 bg-[#102438] border border-[#1b3a5a] rounded-2xl px-4 py-3 shadow-md focus-within:border-[#3B82F6] transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search route, location or office"
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Chips matching screenshot #10 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {corridors.map((corridor) => (
          <button
            key={corridor}
            onClick={() => setSelectedCorridor(corridor)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedCorridor === corridor
                ? 'bg-[#F28C28] text-white shadow-md'
                : 'bg-[#102438] border border-[#1b3a5a] text-slate-400 hover:text-slate-200'
            }`}
          >
            {corridor}
          </button>
        ))}
      </div>

      {/* Routes List matching screenshot #10 */}
      <div className="space-y-2.5">
        {filteredRoutes.map((route) => {
          const departure = timetableMap[route.id] || '07:30 AM';
          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route.origin, route.destination)}
              className="w-full bg-[#102438] hover:bg-[#16304a] border border-[#1b3a5a] rounded-2xl p-4 flex items-center justify-between transition-all group text-left shadow-lg"
            >
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#F28C28] transition-colors">
                  {route.origin} <span className="text-slate-400 font-normal">→</span> {route.destination}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Depart {departure}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">From</span>
                  <span className="text-sm font-bold text-[#F28C28]">
                    ₹{route.baseFare.toFixed(0)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
