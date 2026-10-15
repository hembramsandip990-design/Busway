import React, { useState } from 'react';
import { X, Shield, FileText, Phone, Mail, MapPin } from 'lucide-react';

interface LegalPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'privacy' | 'refund' | 'grievance';
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund' | 'grievance'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in select-none">
      <div className="bg-[#0e2034] border border-[#214368] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b3552] pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#F28C28]" />
            <h3 className="text-base font-bold text-white">Legal, Regulatory & Policies</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented policy tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'terms'
                ? 'bg-[#F28C28] text-white shadow'
                : 'bg-[#091523] text-slate-400 hover:text-white border border-[#1b344e]'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'privacy'
                ? 'bg-[#F28C28] text-white shadow'
                : 'bg-[#091523] text-slate-400 hover:text-white border border-[#1b344e]'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'refund'
                ? 'bg-[#F28C28] text-white shadow'
                : 'bg-[#091523] text-slate-400 hover:text-white border border-[#1b344e]'
            }`}
          >
            Refund Policy
          </button>
          <button
            onClick={() => setActiveTab('grievance')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'grievance'
                ? 'bg-[#F28C28] text-white shadow'
                : 'bg-[#091523] text-slate-400 hover:text-white border border-[#1b344e]'
            }`}
          >
            Grievance Officer
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-300 leading-relaxed pr-1">
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">1. Platform Services & Operating Framework</h4>
              <p>
                BUSWAY acts as a smart commuter transit technology platform connecting verified office commuters in Kolkata with authorized, commercial passenger fleet operators operating under West Bengal Motor Vehicles Department permits.
              </p>
              <h4 className="text-sm font-bold text-white">2. Automatic Seat Allocation</h4>
              <p>
                To eliminate station crowding and boarding disputes, seats are allocated atomically by the BUSWAY allocation engine upon confirmed payment. Commuters must occupy the designated seat number shown on their digital ticket.
              </p>
              <h4 className="text-sm font-bold text-white">3. Boarding Discipline & Safety</h4>
              <p>
                Passengers must arrive at their designated pickup node at least 5 minutes prior to scheduled departure. Passengers must present their scannable QR ticket to authorized vehicle conductors.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Digital Personal Data Protection (DPDP) Compliance</h4>
              <p>
                BUSWAY complies with the Digital Personal Data Protection Act, 2023. We collect only necessary operational data: commuter name, phone number, work email, and pickup coordinates.
              </p>
              <h4 className="text-sm font-bold text-white">Data Retention & Deletion</h4>
              <p>
                Trip history and transaction records are retained for financial audit compliance. You have the right to request a complete JSON export of your personal data or request account deletion at any time via your Profile menu.
              </p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Cancellation & Instant Wallet Refund Policy</h4>
              <div className="p-3 bg-[#091523] border border-[#1b344e] rounded-xl space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>Cancellation Time</span>
                  <span>Refund Percentage</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>≥ 30 mins before scheduled departure</span>
                  <span className="text-emerald-400 font-bold">100% Instant Refund</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>&lt; 30 mins before scheduled departure</span>
                  <span className="text-amber-400 font-bold">50% Credit Voucher</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Service cancelled by Operator / Weather</span>
                  <span className="text-emerald-400 font-bold">100% Automatic Refund</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                All refunds are credited instantaneously to your BUSWAY digital wallet and recorded in the double-entry ledger.
              </p>
            </div>
          )}

          {activeTab === 'grievance' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Statutory Grievance Redressal (IT Rules, 2021)</h4>
              <p>
                In accordance with Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the contact details of the Grievance Officer are:
              </p>
              <div className="p-3 bg-[#091523] border border-[#1b344e] rounded-xl space-y-2">
                <p className="font-bold text-white">Mr. Kaushik Sen, Grievance Redressal Officer</p>
                <p className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>grievance@busway.in</span>
                </p>
                <p className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+91 33 2357 8820 (Kolkata Operations Desk)</span>
                </p>
                <p className="flex items-start gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-[#F28C28] shrink-0 mt-0.5" />
                  <span>BUSWAY Mobility Labs, Block EP & GP, Sector V, Bidhannagar, Kolkata 700091, West Bengal</span>
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                All grievances are acknowledged within 24 hours and redressed within 15 days as required by Indian law.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1b3552] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1b3d63] hover:bg-[#234d7d] text-white py-2 px-5 rounded-xl font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
