import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Compass, MapPin, Bus, ShieldCheck } from 'lucide-react';
import { Booking } from '../types/busway';
import { VehicleBadge } from '../components/VehicleBadge';

interface TrackRideViewProps {
  booking: Booking;
  onBack: () => void;
}

export const TrackRideView: React.FC<TrackRideViewProps> = ({ booking }) => {
  const [progressPercent, setProgressPercent] = useState<number>(45);
  const [estimatedMins, setEstimatedMins] = useState<number>(8);
  const [callAlert, setCallAlert] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'driver' | 'user'; text: string; time: string }[]>([
    { sender: 'driver', text: 'Namaste! I have just crossed Belgharia Expressway. Arriving at Bally Halt in 8 mins.', time: '8:22 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Simulate smooth bus progress movement
  useEffect(() => {
    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 90) return 90;
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleCall = () => {
    setCallAlert(`Connecting secure call to driver ${booking.driverName} (+91 98310 99412)...`);
    setTimeout(() => setCallAlert(null), 4000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = {
      sender: 'user' as const,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');

    // Driver auto-reply simulation
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'driver',
          text: 'Understood sir, AC is on and shuttle is at boarding bay.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Live Tracking Header Info matching screenshot #7 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Your shuttle is on the way</h2>
          <p className="text-xs text-slate-400">
            Arriving in <span className="text-[#F28C28] font-bold">{estimatedMins} mins</span> (approx)
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-full flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Tracking
        </span>
      </div>

      {callAlert && (
        <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl text-xs text-blue-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{callAlert}</span>
        </div>
      )}

      {/* Interactive Kolkata Route Map Container */}
      <div className="relative rounded-3xl overflow-hidden border border-[#234567] bg-[#0c1827] h-72 sm:h-80 shadow-2xl">
        {/* Map stylized background */}
        <img
          src="/src/assets/images/busway_kolkata_map_bg_1792093570840.jpg"
          alt="Kolkata Transit Corridor Map"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[#08121f]/40 backdrop-contrast-125" />

        {/* Vector Route Line Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Dotted background path */}
          <path
            d="M 90 60 Q 140 130, 200 160 T 320 230"
            fill="none"
            stroke="#1e3a5f"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Solid Glowing Active Route Path */}
          <path
            d="M 90 60 Q 140 130, 200 160 T 320 230"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#glow)"
          />
        </svg>

        {/* Pickup Pin: Bally */}
        <div className="absolute top-12 left-16 z-20 flex items-center gap-1.5 -translate-x-1/2 -translate-y-1/2">
          <div className="w-7 h-7 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg ring-4 ring-rose-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="bg-[#0b1726]/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow border border-slate-700">
            {booking.origin}
          </span>
        </div>

        {/* Dropoff Pin: Sector V */}
        <div className="absolute bottom-14 right-16 z-20 flex items-center gap-1.5 translate-x-1/4">
          <div className="w-7 h-7 rounded-full bg-[#F28C28] text-white flex items-center justify-center shadow-lg ring-4 ring-[#F28C28]/25">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="bg-[#0b1726]/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow border border-slate-700">
            {booking.destination}
          </span>
        </div>

        {/* Animated Moving Shuttle Marker */}
        <div
          className="absolute z-30 transition-all duration-700 flex flex-col items-center pointer-events-none"
          style={{
            top: `${20 + progressPercent * 0.65}%`,
            left: `${22 + progressPercent * 0.6}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-9 h-9 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shadow-2xl ring-4 ring-white/60 animate-bounce">
            <Bus className="w-5 h-5" />
          </div>
          <span className="bg-[#0b1726] text-[10px] text-blue-200 font-mono font-bold px-1.5 py-0.5 rounded shadow border border-blue-500/40 mt-1 whitespace-nowrap">
            BUSWAY Shuttle
          </span>
        </div>

        {/* Re-center Map Floating Action Button */}
        <button
          onClick={() => {
            setProgressPercent(45);
            setEstimatedMins(8);
          }}
          className="absolute bottom-3 right-3 z-30 bg-[#0d1f33]/90 hover:bg-[#163454] border border-[#20446b] text-slate-200 text-xs font-semibold py-1.5 px-3 rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Compass className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Re-center</span>
        </button>
      </div>

      {/* Driver Card matching screenshot #7 */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl space-y-3">
        {/* Registration & Vehicle details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VehicleBadge registrationNumber={booking.vehicleRegistration} size="sm" />
            <span className="text-xs text-slate-300 font-medium">White • Tata Starbus</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
            AC Commuter
          </span>
        </div>

        {/* Driver Profile row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-slate-600 bg-slate-800">
              <img
                src="/src/assets/images/busway_driver_avatar_1792093570306.jpg"
                alt={booking.driverName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">{booking.driverName}</h3>
              <p className="text-xs text-amber-400 font-medium mt-0.5">
                ★ {booking.driverRating} <span className="text-slate-400 font-normal">(320 rides)</span>
              </p>
            </div>
          </div>

          {/* Action buttons: Phone and Chat */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCall}
              className="w-10 h-10 rounded-full bg-[#1e3b5e] hover:bg-[#2b5282] text-[#60a5fa] hover:text-white flex items-center justify-center shadow transition-all active:scale-90"
              title="Call Driver"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="w-10 h-10 rounded-full bg-[#1e3b5e] hover:bg-[#2b5282] text-[#60a5fa] hover:text-white flex items-center justify-center shadow transition-all active:scale-90"
              title="Chat with Driver"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* In-app Driver Chat Drawer */}
        {chatOpen && (
          <div className="mt-3 pt-3 border-t border-[#1a3550] space-y-2">
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-[#0a1827] rounded-xl text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-2 rounded-xl max-w-[85%] ${
                      m.sender === 'user'
                        ? 'bg-[#3B82F6] text-white rounded-br-none'
                        : 'bg-[#162e49] text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-0.5">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message driver (e.g. Waiting at bus stop)..."
                className="flex-1 bg-[#0a1827] border border-[#1e3956] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#F28C28] text-white px-3 py-2 rounded-xl text-xs font-bold"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
