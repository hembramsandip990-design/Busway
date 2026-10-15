import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Phone,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Form fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email || phone, password);
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.signup({ name, email, phone, password });
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.forgotPassword(email || phone);
      setInfoNotice('A 6-digit recovery OTP has been sent. Use test OTP: 123456');
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.resetPassword(email || phone, otp, newPassword);
      setInfoNotice('Password updated successfully! Please log in.');
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in select-none">
      <div className="bg-[#0e2034] border border-[#214368] rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4">
        {/* Header with Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold text-white">
              BUS<span className="text-[#F28C28]">WAY</span>
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">Account</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {mode !== 'forgot' && (
          <div className="bg-[#091523] p-1 rounded-xl flex items-center border border-[#1b344e]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#F28C28] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-[#F28C28] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              New Account
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {infoNotice && (
          <div className="p-3 bg-blue-500/15 border border-blue-500/40 rounded-xl text-xs text-blue-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-blue-400" />
            <span>{infoNotice}</span>
          </div>
        )}

        {/* 1. Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Email or Phone Number</label>
              <div className="flex items-center gap-2 bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2.5 focus-within:border-[#3B82F6]">
                <Mail className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hembramsandip990@gmail.com"
                  className="w-full bg-transparent text-white focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                  }}
                  className="text-[11px] text-[#60a5fa] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="flex items-center gap-2 bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2.5 focus-within:border-[#3B82F6]">
                <Lock className="w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-white focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F28C28] hover:bg-[#e07b1a] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#F28C28]/25 transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to BUSWAY'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Full Name</label>
              <div className="flex items-center gap-2 bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2.5 focus-within:border-[#3B82F6]">
                <User className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sandip Hembram"
                  className="w-full bg-transparent text-white focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Work or Personal Email</label>
              <div className="flex items-center gap-2 bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2.5 focus-within:border-[#3B82F6]">
                <Mail className="w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-transparent text-white focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Mobile Number (+91)</label>
              <div className="flex items-center gap-2 bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2.5 focus-within:border-[#3B82F6]">
                <Phone className="w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98323 82762"
                  className="w-full bg-transparent text-white focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Create Secure Password</label>
              <div className="flex items-center gap-2 bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2.5 focus-within:border-[#3B82F6]">
                <Lock className="w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-transparent text-white focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              By creating an account, you agree to BUSWAY&apos;s Terms of Service and Privacy Policy. Personal data is securely processed in India.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F28C28] hover:bg-[#e07b1a] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#F28C28]/25 transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. Forgot Password / OTP Reset Form */}
        {mode === 'forgot' && (
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white">Reset Account Password</h4>
            {!infoNotice ? (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-slate-400">
                  Enter your registered email address or mobile number to receive a verification OTP.
                </p>
                <div className="flex items-center gap-2 bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email or phone"
                    className="w-full bg-transparent text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 py-2.5 rounded-xl text-slate-400 font-bold"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#3B82F6] hover:bg-[#2563eb] text-white py-2.5 rounded-xl font-bold"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2 text-white font-mono text-center tracking-widest text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#091523] border border-[#1b344e] rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 py-2.5 rounded-xl text-slate-400 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#F28C28] text-white py-2.5 rounded-xl font-bold"
                  >
                    {loading ? 'Updating...' : 'Set Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security Trust Badge */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protected by AES-256 Auth & Indian DPDP Act Compliance</span>
        </div>
      </div>
    </div>
  );
};
