import React, { useState } from 'react';
import {
  AlertTriangle,
  Receipt,
  Luggage,
  MessageCircle,
  HelpCircle,
  Headphones,
  ChevronRight,
  Send,
  X,
  CheckCircle,
  Phone,
  Mail,
} from 'lucide-react';
import { api } from '../lib/api';

interface SupportViewProps {
  onBack: () => void;
}

export const SupportView: React.FC<SupportViewProps> = () => {
  const [activeModal, setActiveModal] = useState<
    'ISSUE' | 'REFUND' | 'LOST' | 'FEEDBACK' | 'FAQS' | 'CONTACT' | null
  >(null);

  // Form states
  const [bookingNumber, setBookingNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const handleSubmitTicket = async (category: string) => {
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await api.createSupportTicket({
        category,
        title: title || `${category} Report`,
        description,
        bookingNumber: bookingNumber || undefined,
      });
      setActiveModal(null);
      setTitle('');
      setDescription('');
      setBookingNumber('');
      setSubmittedNotice(`Your ticket has been received. Our support desk will reach out shortly.`);
      setTimeout(() => setSubmittedNotice(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const supportItems = [
    {
      id: 'ISSUE' as const,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/15 border-amber-500/30',
      title: 'Report an Issue',
      desc: 'Booking, payment or ride related issue',
    },
    {
      id: 'REFUND' as const,
      icon: Receipt,
      color: 'text-blue-400',
      bg: 'bg-blue-500/15 border-blue-500/30',
      title: 'Refund Request',
      desc: 'Request a refund for cancelled ride',
    },
    {
      id: 'LOST' as const,
      icon: Luggage,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/15 border-yellow-500/30',
      title: 'Lost Item',
      desc: 'Report lost belongings',
    },
    {
      id: 'FEEDBACK' as const,
      icon: MessageCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15 border-emerald-500/30',
      title: 'Give Feedback',
      desc: 'Help us improve Busway',
    },
    {
      id: 'FAQS' as const,
      icon: HelpCircle,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/15 border-cyan-500/30',
      title: 'FAQs',
      desc: 'Find answers to common questions',
    },
    {
      id: 'CONTACT' as const,
      icon: Headphones,
      color: 'text-amber-400',
      bg: 'bg-amber-500/15 border-amber-500/30',
      title: 'Contact Support',
      desc: 'Chat or call with our team',
    },
  ];

  const faqs = [
    {
      q: 'How does automatic seat allocation work?',
      a: 'When you confirm a booking, the BUSWAY allocation engine assigns you the best available seat atomically to guarantee you never have to scramble for boarding.',
    },
    {
      q: 'Can I cancel my ride and get a refund?',
      a: 'Yes. Rides cancelled at least 30 minutes before departure are eligible for 100% instant refund directly credited to your BUSWAY wallet ledger.',
    },
    {
      q: 'How do I board using the digital ticket?',
      a: 'Simply show the scannable QR code on your Ticket Details screen to the shuttle conductor or driver upon boarding.',
    },
    {
      q: 'Are BUSWAY shuttles air-conditioned?',
      a: 'Yes, 100% of BUSWAY fleet vehicles are modern AC coaches with high-back pushback seating and verified GPS tracking.',
    },
  ];

  return (
    <div className="space-y-4 pb-6">
      {submittedNotice && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{submittedNotice}</span>
        </div>
      )}

      {/* Support Action Cards matching screenshot #8 */}
      <div className="space-y-2.5">
        {supportItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModal(item.id)}
              className="w-full bg-[#102438] hover:bg-[#16304a] border border-[#1b3a5a] rounded-2xl p-4 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#F28C28] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>

      {/* Support Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0e2034] border border-[#214368] rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1b3552] pb-3">
              <h3 className="text-base font-bold text-white">
                {activeModal === 'ISSUE' && 'Report an Issue'}
                {activeModal === 'REFUND' && 'Submit Refund Request'}
                {activeModal === 'LOST' && 'Report Lost Item on Shuttle'}
                {activeModal === 'FEEDBACK' && 'Send Feedback'}
                {activeModal === 'FAQS' && 'Frequently Asked Questions'}
                {activeModal === 'CONTACT' && 'Contact Support Desk'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {activeModal === 'FAQS' ? (
              <div className="space-y-3 text-xs">
                {faqs.map((f, i) => (
                  <div key={i} className="p-3 bg-[#0a1827] border border-[#1b344e] rounded-xl space-y-1">
                    <p className="font-bold text-white">{f.q}</p>
                    <p className="text-slate-400 leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            ) : activeModal === 'CONTACT' ? (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-[#0a1827] border border-[#1b344e] rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Kolkata Operations Helpline</p>
                      <p className="text-slate-400">+91 1800 258 7929 (Toll-Free, 6 AM - 10 PM)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Email Desk</p>
                      <p className="text-slate-400">support@busway.in</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitTicket(activeModal);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Booking Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookingNumber}
                    onChange={(e) => setBookingNumber(e.target.value)}
                    placeholder="e.g. BW02NDE0MUZN6R67U6GB"
                    className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Subject / Summary
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your issue"
                    className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Description & Details
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide details (date, bus number, or item description)..."
                    className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#F28C28] hover:bg-[#e07b1a] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
