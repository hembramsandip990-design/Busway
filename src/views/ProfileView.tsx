import React, { useState } from 'react';
import {
  Calendar,
  CreditCard,
  Wallet,
  MapPin,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit2,
  Shield,
  Truck,
  Check,
  X,
  DownloadCloud,
  Trash2,
  FileText,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/busway';
import { LegalPoliciesModal } from '../components/LegalPoliciesModal';
import { api } from '../lib/api';

interface ProfileViewProps {
  user: UserProfile;
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onNavigateTab: (tab: 'bookings' | 'passes' | 'wallet' | 'support') => void;
  onUpdateProfile: (name: string, phone: string, email: string) => Promise<void>;
  onLogout: () => void;
  onOpenAuth: () => void;
  onBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  currentRole,
  onSwitchRole,
  onNavigateTab,
  onUpdateProfile,
  onLogout,
  onOpenAuth,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);

  // Modals
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSavedLocationsModal, setShowSavedLocationsModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalDefaultTab, setLegalDefaultTab] = useState<'terms' | 'privacy' | 'refund' | 'grievance'>('terms');

  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifySMS, setNotifySMS] = useState(true);
  const [notifyLiveETA, setNotifyLiveETA] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateProfile(name, phone, email);
      setEditing(false);
      setActionNotice('Profile updated successfully!');
      setTimeout(() => setActionNotice(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.exportUserData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BUSWAY_UserData_${user.name.replace(/\s+/g, '_')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setActionNotice('Personal data exported successfully (DPDP compliant).');
      setTimeout(() => setActionNotice(null), 3500);
    } catch {
      alert('Data export failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your BUSWAY account? All your personal identification records will be permanently erased in accordance with the Digital Personal Data Protection Act, 2023.'
      )
    ) {
      try {
        await api.deleteUserAccount();
        alert('Your account and personal data have been deleted.');
        onLogout();
      } catch {
        alert('Account deletion failed');
      }
    }
  };

  const menuItems = [
    { label: 'My Bookings', icon: Calendar, action: () => onNavigateTab('bookings') },
    { label: 'Passes & Subscriptions', icon: CreditCard, action: () => onNavigateTab('passes') },
    { label: 'Wallet & Transactions', icon: Wallet, action: () => onNavigateTab('wallet') },
    { label: 'Saved Locations', icon: MapPin, action: () => setShowSavedLocationsModal(true) },
    { label: 'Notification Settings', icon: Bell, action: () => setShowNotificationModal(true) },
    {
      label: 'Legal, Privacy & Policies',
      icon: FileText,
      action: () => {
        setLegalDefaultTab('terms');
        setShowLegalModal(true);
      },
    },
    { label: 'Help & Support', icon: HelpCircle, action: () => onNavigateTab('support') },
  ];

  return (
    <div className="space-y-4 pb-6">
      {actionNotice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Profile Card matching screenshot #9 */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full border-2 border-slate-600 bg-slate-800 overflow-hidden shrink-0">
            <img
              src="/src/assets/images/busway_driver_avatar_1792093570306.jpg"
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">{user.name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            <p className="text-xs text-slate-400 font-mono">{user.phone}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setEditing(true)}
            className="bg-[#193554] hover:bg-[#234b75] text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-[#2b5480]"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            onClick={onOpenAuth}
            className="text-[10px] text-[#60a5fa] hover:underline text-center"
          >
            Switch Account
          </button>
        </div>
      </div>

      {/* Role Selection Segment */}
      <div className="bg-[#0b1827] border border-[#1b344e] rounded-2xl p-3.5 space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Platform Persona View
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSwitchRole('passenger')}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
              currentRole === 'passenger'
                ? 'border-[#F28C28] bg-[#F28C28]/15 text-[#F28C28]'
                : 'border-[#1b344e] bg-[#102438] text-slate-300'
            }`}
          >
            <span>Passenger App</span>
            {currentRole === 'passenger' && <Check className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onSwitchRole('driver')}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
              currentRole === 'driver'
                ? 'border-amber-400 bg-amber-500/15 text-amber-400'
                : 'border-[#1b344e] bg-[#102438] text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Driver Portal</span>
            </div>
            {currentRole === 'driver' && <Check className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onSwitchRole('operator')}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
              currentRole === 'operator'
                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-400'
                : 'border-[#1b344e] bg-[#102438] text-slate-300'
            }`}
          >
            <span>Fleet Operator</span>
            {currentRole === 'operator' && <Check className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onSwitchRole('superadmin')}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
              currentRole === 'superadmin'
                ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-[#3B82F6]'
                : 'border-[#1b344e] bg-[#102438] text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </div>
            {currentRole === 'superadmin' && <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Menu List matching screenshot #9 */}
      <div className="bg-[#102438] border border-[#1b3a5a] rounded-2xl divide-y divide-[#183450] overflow-hidden shadow-lg">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="w-full p-4 flex items-center justify-between hover:bg-[#16304a] transition-colors text-left group"
            >
              <div className="flex items-center gap-3.5">
                <Icon className="w-4 h-4 text-[#3B82F6] group-hover:text-[#60a5fa] transition-colors" />
                <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}

        {/* DPDP Act: Export Data Button */}
        <button
          onClick={handleExportData}
          className="w-full p-4 flex items-center justify-between hover:bg-[#16304a] transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <DownloadCloud className="w-4 h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white">
              Export My Data (JSON)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* DPDP Act: Delete Account Button */}
        <button
          onClick={handleDeleteAccount}
          className="w-full p-4 flex items-center justify-between hover:bg-rose-950/20 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="text-xs sm:text-sm font-semibold text-rose-300">
              Delete Account & Personal Data
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>

        {/* Logout item matching screenshot #9 */}
        <button
          onClick={onLogout}
          className="w-full p-4 flex items-center justify-between hover:bg-rose-950/20 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <LogOut className="w-4 h-4 text-rose-500" />
            <span className="text-xs sm:text-sm font-bold text-rose-400">Logout</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-500" />
        </button>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0e2034] border border-[#214368] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit Profile</h3>
              <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#3B82F6]"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#3B82F6]"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a1827] border border-[#1b344e] rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#3B82F6]"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#F28C28] hover:bg-[#e07b1a] text-white font-bold py-2.5 px-4 rounded-xl text-xs"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saved Locations Modal */}
      {showSavedLocationsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0e2034] border border-[#214368] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Saved Pickup Locations</h3>
              <button
                onClick={() => setShowSavedLocationsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              {user.savedLocations.map((loc, i) => (
                <div key={i} className="p-3 bg-[#0a1827] border border-[#1b344e] rounded-xl space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F28C28]" />
                    {loc.label}
                  </span>
                  <p className="text-slate-400">{loc.address}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowSavedLocationsModal(false)}
              className="w-full bg-[#1c3e63] text-white py-2.5 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#0e2034] border border-[#214368] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Notification Preferences</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 bg-[#0a1827] rounded-xl cursor-pointer">
                <span className="font-semibold text-white">WhatsApp Updates & QR Ticket</span>
                <input
                  type="checkbox"
                  checked={notifyWhatsApp}
                  onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                  className="w-4 h-4 accent-[#F28C28]"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-[#0a1827] rounded-xl cursor-pointer">
                <span className="font-semibold text-white">SMS Booking Confirmations</span>
                <input
                  type="checkbox"
                  checked={notifySMS}
                  onChange={(e) => setNotifySMS(e.target.checked)}
                  className="w-4 h-4 accent-[#F28C28]"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-[#0a1827] rounded-xl cursor-pointer">
                <span className="font-semibold text-white">Live Arrival & ETA Alerts</span>
                <input
                  type="checkbox"
                  checked={notifyLiveETA}
                  onChange={(e) => setNotifyLiveETA(e.target.checked)}
                  className="w-4 h-4 accent-[#F28C28]"
                />
              </label>
            </div>
            <button
              onClick={() => setShowNotificationModal(false)}
              className="w-full bg-[#F28C28] text-white py-2.5 rounded-xl text-xs font-bold"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Legal & Policies Modal */}
      <LegalPoliciesModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        defaultTab={legalDefaultTab}
      />
    </div>
  );
};
