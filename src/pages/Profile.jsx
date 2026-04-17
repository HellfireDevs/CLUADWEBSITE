import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, User, Key, Copy, CheckCircle, Shield, LogOut, ArrowLeft,
  Mail, Crown, CalendarDays, Zap, CreditCard, AlertTriangle, Trash2,
  X, Activity, Eye, EyeOff, Loader2, RefreshCw, Clock, ChevronRight,
  AlertCircle, Info,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────
// ANIMATIONS
// ─────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.3, duration: 0.5 } },
};
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
};
const scaleIn = {
  hidden:  { opacity: 0, scale: 0.93, y: 16 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { type: 'spring', bounce: 0.22 } },
  exit:    { opacity: 0, scale: 0.93, y: 16, transition: { duration: 0.18 } },
};

// ─────────────────────────────────────────
// TOAST SYSTEM
// ─────────────────────────────────────────
let _pushToast = null;
const toast = {
  success: (m) => _pushToast?.({ type: 'success', m }),
  error:   (m) => _pushToast?.({ type: 'error',   m }),
  info:    (m) => _pushToast?.({ type: 'info',     m }),
};

const TSTYLE = {
  success: 'bg-green-500/10 border-green-500/30 text-green-300',
  error:   'bg-red-500/10   border-red-500/30   text-red-300',
  info:    'bg-blue-500/10  border-blue-500/30  text-blue-300',
};
const TICON = {
  success: <CheckCircle  size={15} className="text-green-400 shrink-0" />,
  error:   <AlertCircle  size={15} className="text-red-400   shrink-0" />,
  info:    <Info         size={15} className="text-blue-400  shrink-0" />,
};

const ToastContainer = () => {
  const [list, setList] = useState([]);
  useEffect(() => {
    _pushToast = ({ type, m }) => {
      const id = Date.now() + Math.random();
      setList((l) => [...l, { id, type, m }]);
      setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4000);
    };
    return () => { _pushToast = null; };
  }, []);

  return (
    <div className="fixed bottom-6 right-4 z-[300] flex flex-col gap-2 max-w-xs w-full pointer-events-none px-4">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0,  scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl backdrop-blur-md ${TSTYLE[t.type]}`}
          >
            {TICON[t.type]}
            <span className="leading-relaxed">{t.m}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────
// OTP INPUT — 6 individual boxes
// ─────────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const inputs = useRef([]);
  const digits  = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      if (i > 0) inputs.current[i - 1]?.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = value.slice(0, i) + e.key + value.slice(i + 1);
    onChange(next.slice(0, 6));
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onChange={() => {}} // controlled via onKeyDown
          className={`w-11 h-13 text-center text-lg font-bold font-mono rounded-xl border transition-all outline-none
            bg-black text-white
            ${d ? 'border-red-500/60 text-red-300' : 'border-white/10'}
            focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]`}
          style={{ height: 52 }}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
// DELETE ACCOUNT MODAL
// ─────────────────────────────────────────
const DeleteModal = ({ onClose, apiKey, onLogout }) => {
  const [step, setStep]       = useState(1);
  const [otp,  setOtp]        = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCd, setResendCd] = useState(0); // resend cooldown seconds
  const cdRef = useRef(null);

  // Cooldown ticker
  const startCooldown = (secs = 60) => {
    setResendCd(secs);
    clearInterval(cdRef.current);
    cdRef.current = setInterval(() => {
      setResendCd((s) => {
        if (s <= 1) { clearInterval(cdRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };
  useEffect(() => () => clearInterval(cdRef.current), []);

  const requestOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/account/request-delete-otp`, {}, {
        headers: { 'x-api-key': apiKey },
      });
      toast.info('OTP sent to your registered email.');
      setStep(2);
      startCooldown(60);
    } catch (err) {
      toast.error('Failed to send OTP: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    // BUG FIX: was otp.length < 5, should be exactly 6
    if (otp.trim().length < 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/account/confirm-delete`, { otp: otp.trim() }, {
        headers: { 'x-api-key': apiKey },
      });
      // BUG FIX: no alert() — use toast then logout
      toast.success('Account deleted. Goodbye 👋');
      setTimeout(onLogout, 1500);
    } catch (err) {
      toast.error('Delete failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        variants={scaleIn} initial="hidden" animate="visible" exit="exit"
        className="bg-[#0a0a0a] border border-red-500/25 w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.12)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-black/50 p-1.5 rounded-full z-10 transition-colors">
          <X size={17} />
        </button>

        {/* Header */}
        <div className="p-7 text-center border-b border-white/5 bg-gradient-to-b from-red-900/15 to-transparent">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/20">
            <AlertTriangle className="text-red-500 w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white mb-1">Delete Account</h2>
          <p className="text-red-400/70 text-xs">This action is permanent and irreversible.</p>
        </div>

        <div className="p-6 bg-[#050505]">
          <AnimatePresence mode="wait">

            {/* Step 1 — Confirm intent */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 text-sm text-red-300/80 leading-relaxed">
                  Deleting your account will <strong className="text-red-400">permanently remove</strong> all deployed apps,
                  environment variables, logs, and associated data. This cannot be undone.
                </div>
                <button
                  onClick={requestOTP}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 text-sm"
                  style={{ boxShadow: '0 0 18px rgba(220,38,38,0.28)' }}
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Sending OTP...</>
                    : 'Send Verification OTP to Email'}
                </button>
              </motion.div>
            )}

            {/* Step 2 — OTP entry */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <p className="text-gray-400 text-sm text-center leading-relaxed">
                  Enter the 6-digit OTP sent to your registered email.
                </p>

                <OtpInput value={otp} onChange={setOtp} />

                <button
                  onClick={confirmDelete}
                  disabled={loading || otp.length < 6}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 text-sm"
                  style={{ boxShadow: otp.length === 6 ? '0 0 18px rgba(220,38,38,0.28)' : 'none' }}
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Deleting...</>
                    : <><Trash2 size={15} /> Permanently Delete Account</>}
                </button>

                {/* Resend */}
                <div className="text-center">
                  {resendCd > 0 ? (
                    <p className="text-gray-600 text-xs flex items-center justify-center gap-1.5">
                      <Clock size={11} /> Resend in {resendCd}s
                    </p>
                  ) : (
                    <button
                      onClick={requestOTP}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 mx-auto transition-colors"
                    >
                      <RefreshCw size={11} /> Resend OTP
                    </button>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────
// DAYS LEFT RING
// ─────────────────────────────────────────
const DaysRing = ({ days, total = 30 }) => {
  const pct     = Math.min(days / total, 1);
  const r       = 28;
  const circ    = 2 * Math.PI * r;
  const offset  = circ * (1 - pct);
  const color   = days > 10 ? '#facc15' : days > 3 ? '#f97316' : '#ef4444';

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-black text-white leading-none">{days}</div>
        <div className="text-[9px] text-gray-500 uppercase tracking-wide">days</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// INFO ROW COMPONENT
// ─────────────────────────────────────────
const InfoRow = ({ label, value, mono = false, blur = false }) => (
  <div className="bg-black/40 border border-white/6 rounded-xl p-4">
    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-1">{label}</p>
    <p className={`text-white font-medium text-sm ${mono ? 'font-mono' : ''} ${blur ? 'blur-sm select-none hover:blur-none transition-all duration-300 cursor-pointer' : ''}`}>
      {value}
    </p>
  </div>
);

// ─────────────────────────────────────────
// MAIN PROFILE PAGE
// ─────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();

  const [username,   setUsername]   = useState('Commander');
  const [email,      setEmail]      = useState('');
  const [apiKey,     setApiKey]     = useState('');
  const [showKey,    setShowKey]    = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [isPremium,  setIsPremium]  = useState(() => localStorage.getItem('cloud_is_premium') === 'true');
  const [daysLeft,   setDaysLeft]   = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [planLabel,  setPlanLabel]  = useState('Free Basic Plan');
  const [isLoading,  setIsLoading]  = useState(true);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [refreshing,   setRefreshing] = useState(false);

  // ── Load profile
  const fetchProfile = useCallback(async (key, silent = false) => {
    if (!silent) setIsLoading(true);
    else setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/api/profile`, {
        headers: { 'x-api-key': key },
      });
      if (res.data.status === 'success') {
        const d = res.data.data;

        setUsername(d.username || localStorage.getItem('cloud_username') || 'Commander');
        // BUG FIX: email from backend — no longer hidden permanently
        if (d.email) setEmail(d.email);

        const premium = Boolean(d.is_premium);
        setIsPremium(premium);
        localStorage.setItem('cloud_is_premium', String(premium));

        if (premium && d.premium_expiry) {
          const expiry = new Date(d.premium_expiry);
          const now    = new Date();
          const diff   = Math.ceil((expiry - now) / 86_400_000);
          // BUG FIX: don't set isPremium false here — let backend be source of truth
          // if expiry passed, backend should have already set is_premium = false
          setDaysLeft(Math.max(diff, 0));
          setExpiryDate(expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
          setPlanLabel(d.plan_label || 'NEX Premium Plan');
        } else {
          setPlanLabel('Free Basic Plan');
          setDaysLeft(0);
        }
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      if (!silent) toast.error('Could not load profile. Check your connection.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const key  = localStorage.getItem('cloud_api_key');
    const user = localStorage.getItem('cloud_username');
    if (!key) { navigate('/login'); return; }
    setApiKey(key);
    if (user) setUsername(user);
    fetchProfile(key);
  }, [navigate, fetchProfile]);

  // ── Copy API key — BUG FIX: fallback for non-HTTPS / blocked clipboard
  const copyKey = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(apiKey);
      } else {
        // Fallback: textarea trick
        const ta = document.createElement('textarea');
        ta.value = apiKey;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success('API key copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy. Please copy manually.');
      setShowKey(true); // reveal so they can copy manually
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // ── Plan color
  const planAccent = isPremium ? 'yellow' : 'purple';
  const accentMap  = {
    yellow: { border: 'border-yellow-500/25', bg: 'bg-yellow-500/[0.02]', glow: 'bg-yellow-500/10', text: 'text-yellow-400', icon: Crown },
    purple: { border: 'border-purple-500/20', bg: 'bg-purple-500/[0.02]', glow: 'bg-purple-500/10', text: 'text-purple-400', icon: Zap },
  };
  const accent = accentMap[planAccent];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative selection:bg-purple-500/30 pb-24">
      <Background />
      <ToastContainer />

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteOpen && (
          <DeleteModal
            key="del"
            onClose={() => setDeleteOpen(false)}
            apiKey={apiKey}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>

      {/* ── Navbar */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-lg tracking-widest hover:scale-105 transition-transform">
            <Server className="text-purple-500 w-5 h-5" /> NEX<span className="text-purple-500">CLOUD</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            {/* Refresh button */}
            <button
              onClick={() => fetchProfile(apiKey, true)}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-white bg-white/4 hover:bg-white/8 rounded-lg transition-colors"
              title="Refresh profile"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 mt-8 relative z-10">

        {/* ── Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.25 }}
          className="flex flex-col sm:flex-row items-center sm:items-end gap-5 mb-8"
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white
              ${isPremium
                ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_28px_rgba(251,191,36,0.35)]'
                : 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-[0_0_28px_rgba(168,85,247,0.3)]'}
              border-2 border-white/10`}
            >
              {username.charAt(0).toUpperCase()}
            </div>
            {isPremium && (
              <div className="absolute -bottom-2 -right-2 bg-[#050505] rounded-lg p-1 border border-yellow-500/20">
                <Crown size={14} className="text-yellow-400" />
              </div>
            )}
          </div>

          {/* Name & status */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {username}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5
                ${isPremium
                  ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400'
                  : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}
              >
                <Shield size={11} />
                {isPremium ? 'Premium Overlord' : 'Standard User'}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Cards */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">

          {/* ── SUBSCRIPTION CARD */}
          <motion.div variants={fadeUp}
            className={`${accent.bg} ${accent.border} border backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden`}
          >
            {/* glow blob */}
            <div className={`absolute top-0 right-0 w-48 h-48 ${accent.glow} blur-[70px] -z-10 rounded-full opacity-60`} />

            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-1">Active Subscription</p>
                <h3 className={`text-xl font-black ${accent.text} flex items-center gap-2`}>
                  {isPremium ? <Crown size={20} /> : <Zap size={20} />}
                  {isLoading ? <span className="h-5 w-36 bg-white/8 rounded-lg animate-pulse block" /> : planLabel}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  {isPremium
                    ? `Unlimited deployments. Expires ${expiryDate || '—'}.`
                    : 'Limited deployments. Upgrade for full performance.'}
                </p>
              </div>

              {/* Days ring or expired */}
              {isLoading ? (
                <div className="w-20 h-20 rounded-full bg-white/5 animate-pulse" />
              ) : isPremium ? (
                <DaysRing days={daysLeft} total={30} />
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
                  <p className="text-red-400 font-black text-xs uppercase tracking-wider">Expired</p>
                </div>
              )}
            </div>

            {/* Upgrade CTA for free */}
            {!isPremium && !isLoading && (
              <button
                onClick={() => navigate('/payment')}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm flex items-center gap-2"
                style={{ boxShadow: '0 0 18px rgba(168,85,247,0.3)' }}
              >
                <Zap size={15} /> Upgrade to Premium
                <ChevronRight size={14} className="ml-auto" />
              </button>
            )}

            {/* Renew CTA for expiring premium */}
            {isPremium && daysLeft <= 7 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-yellow-500/15"
              >
                <div className="flex items-center gap-2 text-xs text-yellow-400/80 mb-3">
                  <AlertTriangle size={12} /> Expiring in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. Renew to avoid interruption.
                </div>
                <button
                  onClick={() => navigate('/payment')}
                  className="w-full sm:w-auto bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold px-5 py-2 rounded-xl transition-all text-sm flex items-center gap-2"
                >
                  <RefreshCw size={13} /> Renew Subscription
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* ── ACCOUNT IDENTITY */}
          <motion.div variants={fadeUp}
            className="bg-white/[0.02] border border-white/8 backdrop-blur-xl p-6 rounded-2xl"
          >
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <User size={16} className="text-purple-400" /> Account Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow label="Username" value={username} />
              {/* BUG FIX: show actual email from backend, blur by default for privacy */}
              <InfoRow
                label="Email Address"
                value={email || '••••••@•••••.com'}
                blur={Boolean(email)}
              />
            </div>
          </motion.div>

          {/* ── API KEY CARD */}
          <motion.div variants={fadeUp}
            className="bg-gradient-to-br from-purple-900/8 to-transparent border border-purple-500/18 backdrop-blur-xl p-6 rounded-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key size={16} className="text-purple-400" /> Master API Key
                </h3>
                <p className="text-gray-600 text-xs mt-0.5">Never share this key publicly.</p>
              </div>
              <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Activity size={9} className="animate-pulse" /> Confidential
              </span>
            </div>

            {/* Key display */}
            <div className="bg-black/60 border border-white/8 rounded-xl p-3.5 font-mono text-sm mb-3 flex items-center gap-3 overflow-hidden">
              <span className={`flex-1 truncate transition-all duration-300 select-all
                ${showKey ? 'text-purple-300' : 'text-gray-600 blur-sm select-none'}`}>
                {showKey ? apiKey : '••••••••••••••••••••••••••••••••••••••••'}
              </span>
            </div>

            <div className="flex gap-2">
              {/* Reveal/Hide */}
              <button
                onClick={() => setShowKey(!showKey)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/8 border border-white/8 text-gray-400 hover:text-white rounded-xl transition-all text-sm font-medium"
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                {showKey ? 'Hide' : 'Reveal'}
              </button>

              {/* Copy — BUG FIX: has clipboard fallback */}
              <button
                onClick={copyKey}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all text-sm font-bold"
                style={{ boxShadow: '0 0 14px rgba(168,85,247,0.28)' }}
              >
                {copied ? <><CheckCircle size={15} /> Copied!</> : <><Copy size={15} /> Copy Key</>}
              </button>
            </div>
          </motion.div>

          {/* ── DANGER ZONE */}
          <motion.div variants={fadeUp}
            className="bg-red-500/[0.02] border border-red-500/18 backdrop-blur-xl p-6 rounded-2xl"
          >
            <h3 className="text-sm font-bold text-red-400 mb-1 flex items-center gap-2">
              <AlertTriangle size={15} /> Danger Zone
            </h3>
            <p className="text-gray-600 text-xs mb-5">Actions here are permanent. Proceed carefully.</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-white/4 hover:bg-white/8 border border-white/8 text-gray-300 hover:text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <LogOut size={15} /> Sign Out
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="flex-1 bg-red-500/8 hover:bg-red-600 border border-red-500/25 hover:border-red-500 text-red-400 hover:text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                style={{ transition: 'all 0.25s ease' }}
              >
                <Trash2 size={15} /> Delete Account
              </button>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
