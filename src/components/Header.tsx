import React, { useState } from 'react';
import { Bell, ArrowLeft, Shield, Users, Truck, Compass, CheckCircle } from 'lucide-react';
import { UserProfile, UserRole } from '../types/busway';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  user: UserProfile;
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  user,
  currentRole,
  onSwitchRole,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: '1', title: 'Shuttle on the way', time: '8:22 AM', desc: 'WB 25 3751 arriving at Bally in 8 mins.', read: false },
    { id: '2', title: 'Booking Confirmed', time: 'Yesterday', desc: 'Your seat 14A for Sector V is locked.', read: true },
    { id: '3', title: 'Pass Renewed', time: '3 days ago', desc: 'Bally ↔ Sector V Monthly Pass is active.', read: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0d1c2d]/95 backdrop-blur-md border-b border-[#1b344e] px-4 py-3 select-none">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        {showBack ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Go back"
              className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white font-sans flex items-center">
                BUS<span className="text-[#F28C28]">WAY</span>
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 tracking-wide">
              Your Smart Shuttle Partner
            </span>
          </div>
        )}

        {/* Right Action Icons: Notification bell, Role Pill, and Avatar */}
        <div className="flex items-center gap-2.5">
          {/* Role badge switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="px-2 py-1 rounded-md text-[11px] font-medium tracking-wide bg-[#152e47] border border-[#234567] text-slate-200 hover:border-[#F28C28]/60 flex items-center gap-1 transition-colors"
              title="Switch Platform Persona"
            >
              {currentRole === 'passenger' && <Users className="w-3 h-3 text-[#3B82F6]" />}
              {currentRole === 'driver' && <Truck className="w-3 h-3 text-amber-400" />}
              {currentRole === 'operator' && <Compass className="w-3 h-3 text-emerald-400" />}
              {currentRole === 'superadmin' && <Shield className="w-3 h-3 text-[#F28C28]" />}
              <span className="capitalize">{currentRole === 'superadmin' ? 'Admin' : currentRole}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0b1827] border border-[#234567] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Switch Portal
                </div>
                {(['passenger', 'driver', 'operator', 'superadmin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onSwitchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      currentRole === r
                        ? 'bg-[#F28C28]/15 text-[#F28C28]'
                        : 'text-slate-300 hover:bg-[#152e47] hover:text-white'
                    }`}
                  >
                    <span className="capitalize">{r === 'superadmin' ? 'Operations Admin' : `${r} Portal`}</span>
                    {currentRole === r && <CheckCircle className="w-3.5 h-3.5 text-[#F28C28]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bell Icon with notification badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800/60 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0d1c2d]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0b1827] border border-[#234567] rounded-xl shadow-2xl p-2 z-50">
                <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-200 border-b border-slate-800">
                  <span>Notifications</span>
                  <span className="text-[10px] text-[#F28C28]">Mark all read</span>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 hover:bg-[#152e47]/40 rounded-lg transition-colors">
                      <div className="flex justify-between items-center text-xs font-semibold text-white">
                        <span>{n.title}</span>
                        <span className="text-[10px] font-normal text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full border border-slate-600 overflow-hidden bg-slate-800 shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white bg-[#102A43]">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
