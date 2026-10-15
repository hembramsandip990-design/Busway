import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../lib/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-bold shadow-xl border border-amber-300 animate-pulse select-none">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Cached tickets and schedules accessible</span>
    </div>
  );
};
