import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { CommuterPass, WalletAccount } from '../types/busway';

interface PassesViewProps {
  passes: CommuterPass[];
  wallet: WalletAccount;
  onBuyPass: (passId: string) => Promise<void>;
  onBack: () => void;
}

export const PassesView: React.FC<PassesViewProps> = ({
  passes,
  wallet,
  onBuyPass,
}) => {
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const activePass = passes.find((p) => p.isActive);

  const handlePurchase = async (pass: CommuterPass) => {
    if (wallet.availableBalance < pass.price) {
      setNotice(`Insufficient wallet balance (₹${wallet.availableBalance.toFixed(2)}). Please add money to your wallet.`);
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    setBuyingId(pass.id);
    try {
      await onBuyPass(pass.id);
      setNotice(`Successfully activated ${pass.title}!`);
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {notice && (
        <div className="p-3 bg-blue-500/20 border border-blue-500/40 rounded-xl text-xs text-blue-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Passes Banner */}
      <div className="bg-gradient-to-r from-[#17385c] to-[#0f243a] border border-[#234b75] rounded-2xl p-4 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-[#F28C28]">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Smart Office Passes</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white">
          Save up to 60% with Monthly & Weekly Passes
        </h2>
        <p className="text-xs text-slate-300">
          Guaranteed priority seat reservations on peak Kolkata IT tech corridors.
        </p>
      </div>

      {/* Active Pass Status if present */}
      {activePass && (
        <div className="bg-[#102438] border-2 border-emerald-500/40 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Pass
            </span>
            <span className="text-xs font-mono text-slate-400">Valid till {activePass.validUntil}</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{activePass.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{activePass.origin} ↔ {activePass.destination}</p>
          </div>
          <div className="bg-[#0a1827] rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Rides Balance</span>
              <span className="text-base font-extrabold text-white font-mono">
                {activePass.remainingRides} / {activePass.totalRides} left
              </span>
            </div>
            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${(activePass.remainingRides / activePass.totalRides) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Available Passes Catalog */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Available Commuter Plans
        </h3>

        {passes.map((pass) => (
          <div
            key={pass.id}
            className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-lg space-y-3 hover:border-[#275380] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#F28C28] uppercase tracking-wider bg-[#F28C28]/15 px-2 py-0.5 rounded">
                  {pass.discountPercentage}% OFF
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">{pass.title}</h4>
                <p className="text-xs text-slate-400">{pass.totalRides} Shuttle Rides • {pass.validDays} Days Validity</p>
              </div>

              <div className="text-right">
                <span className="text-base font-extrabold text-white font-mono">₹{pass.price}</span>
                <span className="text-[10px] text-slate-400 block">All taxes included</span>
              </div>
            </div>

            <button
              onClick={() => handlePurchase(pass)}
              disabled={buyingId === pass.id || pass.isActive}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                pass.isActive
                  ? 'bg-[#183654] text-slate-400 cursor-not-allowed'
                  : 'bg-[#F28C28] hover:bg-[#e07b1a] text-white active:scale-95'
              }`}
            >
              {pass.isActive ? (
                <span>Currently Active</span>
              ) : buyingId === pass.id ? (
                <span>Activating Pass...</span>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Buy Pass for ₹{pass.price}</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
