import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../lib/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  if (isInstallable) {
    return (
      <div className="bg-[#12283e] border border-[#234567] rounded-xl p-3 shadow-lg flex items-center justify-between gap-3 text-xs animate-in fade-in select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F28C28]/20 text-[#F28C28] flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Install BUSWAY App</span>
            <span className="text-[10px] text-slate-400">Fast access for your daily commute</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={install}
            className="bg-[#F28C28] hover:bg-[#e07b1a] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <div className="bg-[#12283e] border border-[#234567] rounded-xl p-3 shadow-lg flex items-center justify-between gap-3 text-xs select-none">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <div>
              <span className="font-bold text-white block">Install on iPhone</span>
              <span className="text-[10px] text-slate-400">Add to Home Screen for offline tickets</span>
            </div>
          </div>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="bg-[#1b3b5e] text-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            Instructions
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-[#0e2034] border border-[#214368] p-5 shadow-2xl text-xs space-y-3">
              <h3 className="text-sm font-bold text-white">Add BUSWAY to iPhone Home Screen</h3>
              <div className="space-y-2 text-slate-300">
                <p>1. Tap the <strong>Share</strong> button at the bottom of Safari.</p>
                <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                <p>3. Tap <strong>Add</strong> in the top right corner.</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full mt-2 bg-[#F28C28] text-white py-2 rounded-xl font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
