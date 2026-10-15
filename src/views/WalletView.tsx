import React, { useState } from 'react';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, ShieldCheck, X } from 'lucide-react';
import { WalletAccount } from '../types/busway';

interface WalletViewProps {
  wallet: WalletAccount;
  onTopup: (amount: number) => Promise<void>;
  onBack: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ wallet, onTopup }) => {
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [amountInput, setAmountInput] = useState('100');
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const quickAmounts = [84, 100, 200, 500, 1000];

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0) return;

    setLoading(true);
    try {
      await onTopup(val);
      setShowAddMoneyModal(false);
      setSuccessNotice(`₹${val.toFixed(2)} added to your BUSWAY wallet successfully!`);
      setTimeout(() => setSuccessNotice(null), 3500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {successNotice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Wallet Card matching screenshot #5 */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Available Balance</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                ₹ {wallet.availableBalance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1a3552]">
          <div>
            <span className="text-[11px] text-slate-400">Promotional Credits</span>
            <p className="text-xs font-semibold text-slate-300">
              ₹ {wallet.promotionalCredit.toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => setShowAddMoneyModal(true)}
            className="bg-[#3B82F6] hover:bg-[#2563eb] text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#3B82F6]/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Money</span>
          </button>
        </div>
      </div>

      {/* Transaction History Section matching screenshot #5 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Transaction History</h3>

        <div className="space-y-2">
          {wallet.transactions.map((tx) => {
            const isDebit = tx.type === 'RIDE_DEBIT';
            return (
              <div
                key={tx.id}
                className="bg-[#102438] border border-[#1b3a5a] rounded-xl p-3.5 flex items-center justify-between hover:border-[#234b75] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isDebit
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isDebit ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-snug">
                      {tx.description}
                    </span>
                    <span className="text-[11px] text-slate-400">{tx.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-xs sm:text-sm ${
                      isDebit ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isDebit ? `- ₹ ${tx.amount.toFixed(2)}` : `+ ₹ ${tx.amount.toFixed(2)}`}
                  </span>
                  {tx.referenceId && (
                    <span className="text-[10px] text-slate-500 block truncate max-w-[90px]">
                      {tx.referenceId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0e2034] border border-[#214368] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Top Up Wallet</h3>
              <button
                onClick={() => setShowAddMoneyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMoney} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Enter Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    min="10"
                    max="10000"
                    placeholder="100"
                    className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl pl-8 pr-4 py-2 text-base font-bold text-white focus:outline-none focus:border-[#3B82F6]"
                    required
                  />
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmountInput(q.toString())}
                    className="bg-[#142a42] hover:bg-[#1e3c5e] border border-[#204064] text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    +₹{q}
                  </button>
                ))}
              </div>

              <div className="p-2.5 bg-[#091523] border border-[#1b344e] rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sandbox Payment Gateway verified with 256-bit encryption.</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMoneyModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#3B82F6] hover:bg-[#2563eb] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-[#3B82F6]/25 transition-all"
                >
                  {loading ? 'Processing...' : `Pay ₹${amountInput}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
