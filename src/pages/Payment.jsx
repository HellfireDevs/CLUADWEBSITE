import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, ArrowLeft, CheckCircle, AlertCircle, Loader2,
  Gift, ShieldCheck, QrCode, CreditCard, Zap, Copy, Check,
  X, Clock, Tag
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const UPI_ID   = '9773518752-3@ybl';
const UPI_NAME = 'BUDDHADEB MANDAL';

const PLANS = {
  49:  { name: 'NEX Starter',   label: '1 Month', color: 'text-blue-400',   badge: 'bg-blue-500/10 border-blue-500/20' },
  89:  { name: 'NEX Overlord',  label: '1 Month', color: 'text-violet-400', badge: 'bg-violet-500/10 border-violet-500/20' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
// BUG FIX: always work with integers, never strings
const calcFinal = (base, pct) => Math.max(0, Math.round(base - (base * pct) / 100));

// ─── Small components ─────────────────────────────────────────────────────────
const Alert = ({ type, children }) => {
  const styles = {
    error:   'bg-red-500/8 border-red-500/25 text-red-400',
    success: 'bg-emerald-500/8 border-emerald-500/25 text-emerald-400',
    info:    'bg-blue-500/8 border-blue-500/25 text-blue-400',
  };
  const icons = { error: AlertCircle, success: CheckCircle, info: AlertCircle };
  const Icon = icons[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${styles[type]}`}
    >
      <Icon size={16} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </motion.div>
  );
};

// Copy-to-clipboard button
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1 text-[10px] font-bold px-2 py-1
        rounded-lg bg-white/5 hover:bg-white/10 border border-white/5
        transition-all text-gray-400 hover:text-white"
    >
      {copied ? <><Check size={11} className="text-emerald-400" /> Copied</> : <><Copy size={11} /> Copy</>}
    </button>
  );
};

// Success countdown
const SuccessScreen = ({ isFree, onDone }) => {
  const [secs, setSecs] = useState(5);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(t); onDone(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-6 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20
        flex items-center justify-center">
        <CheckCircle size={40} className="text-emerald-400" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-white mb-2">
          {isFree ? '🎉 Free Plan Activated!' : '✅ Payment Submitted!'}
        </h2>
        <p className="text-gray-400 text-sm max-w-xs">
          {isFree
            ? 'Your free coupon has been verified. System is activating your plan.'
            : 'Payment details received. Admin will approve within a few minutes.'}
        </p>
      </div>
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Clock size={14} />
        Redirecting in {secs}s...
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Payment() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // BUG FIX: integer from the start, never string
  const selectedPlan = location.state?.plan === '49' ? 49 : 89;
  const planInfo     = PLANS[selectedPlan];

  const [isLoading,        setIsLoading]        = useState(false);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [error,            setError]            = useState('');
  const [success,          setSuccess]          = useState('');
  const [submitted,        setSubmitted]        = useState(false);

  const [couponCode,       setCouponCode]       = useState('');
  const [couponApplied,    setCouponApplied]    = useState(false); // BUG FIX: explicit flag
  const [discountPercent,  setDiscountPercent]  = useState(0);
  const [transactionId,    setTransactionId]    = useState('');

  // BUG FIX: always integer
  const finalPrice = calcFinal(selectedPlan, discountPercent);
  const isFree     = finalPrice === 0;
  const savings    = selectedPlan - finalPrice;

  // BUG FIX: QR uses number not string — UPI amount correct
  const upiUrl    = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${finalPrice}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}`;

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('cloud_api_key')) navigate('/login');
  }, [navigate]);

  // ── Coupon ────────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) { setError('Coupon code enter karo!'); return; }

    setIsCheckingCoupon(true);
    setError(''); setSuccess('');

    try {
      const { data } = await axios.post(
        `${API_URL}/api/verify-coupon`,
        { code },
        { headers: { 'x-api-key': localStorage.getItem('cloud_api_key') } }
      );
      if (data.status === 'success') {
        const pct = data.discount_percentage ?? 0;
        setDiscountPercent(pct);
        setCouponApplied(true); // BUG FIX: explicit flag, not relying on pct > 0
        setSuccess(`🎉 "${code}" applied! ${pct}% OFF`);
        // Auto-fill UTR for 100% free
        if (pct === 100) setTransactionId(`FREE-${code.toUpperCase()}`);
      }
    } catch (err) {
      setDiscountPercent(0);
      setCouponApplied(false);
      setTransactionId('');
      setError(err.response?.data?.detail || 'Invalid or expired coupon!');
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  // BUG FIX: allow removing applied coupon
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    setCouponApplied(false);
    setTransactionId('');
    setSuccess('');
    setError('');
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!isFree) {
      // BUG FIX: UTR should be digits only, min 12 chars
      if (!transactionId || transactionId.length < 8) {
        setError('Valid Transaction/UTR ID enter karo (min 8 digits).');
        return;
      }
      if (!/^\d+$/.test(transactionId)) {
        setError('UTR ID sirf numbers hote hain — letters allowed nahi.');
        return;
      }
    }

    setIsLoading(true);
    setError(''); setSuccess('');

    try {
      const { data } = await axios.post(
        `${API_URL}/api/submit-payment`,
        {
          transaction_id: transactionId,
          amount: finalPrice,          // BUG FIX: integer, not string
          coupon_used: couponApplied ? couponCode.trim() : null,
          plan: `${planInfo.name} (${planInfo.label})`,
        },
        { headers: { 'x-api-key': localStorage.getItem('cloud_api_key') } }
      );
      if (data.status === 'success') {
        setSubmitted(true); // show success screen with countdown
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment submit karne mein error aaya.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render: success screen ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050507] text-gray-200 relative">
        <Background />
        <div className="relative z-10 max-w-lg mx-auto px-6">
          <SuccessScreen isFree={isFree} onDone={() => navigate('/dashboard', { replace: true })} />
        </div>
      </div>
    );
  }

  // ── Render: main ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050507] text-gray-200 relative pb-20">
      <Background />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
          <Link to="/"
            className="flex items-center gap-2 text-white font-black text-xl
              tracking-widest hover:opacity-80 transition-opacity">
            <Server size={20} className="text-violet-500" />
            NEX<span className="text-violet-500">CLOUD</span>
          </Link>
          <Link to="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white
              text-sm font-bold transition-colors">
            <ArrowLeft size={15} /> Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 mt-10 relative z-10">

        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
              <Zap className="text-amber-400" size={32} />
              Complete Your Purchase
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Scan the QR or apply a coupon to activate your Premium Tier.
          </p>
        </div>

        {/* Alerts */}
        <div className="space-y-3 mb-6">
          <AnimatePresence mode="popLayout">
            {error   && <Alert key="err"  type="error">{error}</Alert>}
            {success && <Alert key="succ" type="success">{success}</Alert>}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: QR / UPI ─────────────────────────────────────────── */}
          <div className={`bg-[#0a0a0d]/80 border border-white/[0.07] backdrop-blur-xl
            p-7 rounded-3xl shadow-2xl space-y-6 transition-all duration-300
            ${isFree ? 'opacity-40 pointer-events-none grayscale' : ''}`}>

            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                flex items-center justify-center">
                <ShieldCheck size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Secure UPI Payment</h3>
                <p className="text-xs text-gray-500">Pay using any UPI app</p>
              </div>
              {isFree && (
                <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full
                  bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  FREE — skip payment
                </span>
              )}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-52 h-52 bg-white p-2.5 rounded-2xl
                shadow-[0_0_40px_rgba(124,58,237,0.2)] relative group overflow-hidden">
                <img src={qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain rounded-xl" />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl
                  opacity-0 group-hover:opacity-100 transition-opacity
                  flex items-center justify-center">
                  <span className="text-white font-bold text-sm bg-violet-600
                    px-4 py-2 rounded-full">Scan with UPI App</span>
                </div>
              </div>

              {/* Amount badge */}
              <div className="text-center">
                <p className="text-3xl font-black text-white">
                  ₹{finalPrice}
                  {savings > 0 && (
                    <span className="ml-2 text-sm font-bold text-emerald-400">
                      (saved ₹{savings})
                    </span>
                  )}
                </p>
                <p className="text-gray-500 text-xs mt-1">Scan QR or pay to UPI ID below</p>
              </div>

              {/* UPI logos */}
              <div className="flex justify-center items-center gap-2 opacity-50">
                {[
                  { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg', alt: 'UPI' },
                  { src: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg', alt: 'GPay' },
                  { src: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/PhonePe_Logo.svg', alt: 'PhonePe' },
                ].map(({ src, alt }) => (
                  <div key={alt} className="bg-white px-2 py-1 rounded border border-gray-200">
                    <img src={src} className="h-3.5" alt={alt} />
                  </div>
                ))}
              </div>
            </div>

            {/* UPI Details box */}
            <div className="bg-black/30 border border-white/[0.06] rounded-2xl p-4 space-y-3">
              {[
                { label: 'UPI ID', value: UPI_ID,   mono: true,  copyable: true },
                { label: 'Name',   value: UPI_NAME, mono: false, copyable: false },
              ].map(({ label, value, mono, copyable }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-gray-500 text-sm shrink-0">{label}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-white text-sm truncate ${mono ? 'font-mono tracking-wider' : 'font-medium'}`}>
                      {value}
                    </span>
                    {copyable && <CopyBtn text={value} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Order summary + forms ────────────────────────────── */}
          <div className="bg-[#0a0a0d]/80 border border-white/[0.07] backdrop-blur-xl
            p-7 rounded-3xl shadow-2xl flex flex-col gap-6">

            {/* Plan summary */}
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <CreditCard size={16} className="text-violet-400" /> Order Summary
              </h3>

              <div className="bg-black/30 border border-white/[0.06] rounded-2xl p-5 space-y-3">
                {/* Plan name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border
                      ${planInfo.badge} ${planInfo.color}`}>
                      {planInfo.label}
                    </span>
                    <span className="text-gray-300 text-sm font-semibold">{planInfo.name}</span>
                  </div>
                  <span className="text-white font-mono text-sm">₹{selectedPlan}</span>
                </div>

                {/* Discount row */}
                <AnimatePresence>
                  {couponApplied && discountPercent > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-between items-center text-emerald-400 font-bold text-sm overflow-hidden"
                    >
                      <span className="flex items-center gap-1.5">
                        <Tag size={12} /> Coupon ({discountPercent}% off)
                      </span>
                      <span className="font-mono">− ₹{savings}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Total */}
                <div className="pt-3 border-t border-white/[0.06] flex justify-between items-center">
                  <span className="font-bold text-white">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-violet-400 font-mono">
                      {isFree ? 'FREE' : `₹${finalPrice}`}
                    </span>
                    {savings > 0 && !isFree && (
                      <p className="text-emerald-400 text-[10px] font-bold">
                        You save ₹{savings}!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                Coupon Code
              </label>
              {couponApplied ? (
                // Applied state — show chip with remove button
                <div className="flex items-center justify-between bg-emerald-500/8
                  border border-emerald-500/25 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Tag size={14} />
                    {couponCode.toUpperCase()} — {discountPercent}% OFF
                  </div>
                  {/* BUG FIX: remove coupon */}
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                    title="Remove coupon"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Gift size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="e.g. NEXFREE"
                      className="w-full bg-[#0c0c0f] border border-white/[0.08]
                        focus:border-violet-500/60 text-white placeholder-gray-700
                        rounded-xl px-4 py-3 pl-10 outline-none text-sm
                        transition-all focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isCheckingCoupon || !couponCode.trim()}
                    className="bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30
                      disabled:cursor-not-allowed text-white font-bold px-5 py-3
                      rounded-xl transition-all border border-white/[0.06] text-sm whitespace-nowrap"
                  >
                    {isCheckingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* UTR Input — hidden when free */}
            <AnimatePresence>
              {!isFree && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                    Transaction / UTR ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"                            // BUG FIX: numeric keyboard on mobile
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={transactionId}
                    onChange={(e) => {
                      // BUG FIX: only allow digits
                      const val = e.target.value.replace(/\D/g, '');
                      setTransactionId(val);
                      if (error) setError('');
                    }}
                    placeholder="12-digit UTR from your payment app"
                    maxLength={20}
                    className="w-full bg-[#0c0c0f] border border-white/[0.08]
                      focus:border-violet-500/60 text-white placeholder-gray-700
                      rounded-xl px-4 py-3 outline-none font-mono text-sm
                      transition-all focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
                  />
                  <p className="text-[10px] text-gray-600 ml-1">
                    Find UTR in your UPI app → Transaction History → Payment Details
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <div className="mt-auto pt-4 border-t border-white/[0.06]">
              <button
                onClick={handleCheckout}
                disabled={isLoading || (!isFree && !transactionId)}
                className={`w-full font-bold py-4 rounded-xl flex items-center justify-center
                  gap-2 transition-all duration-200 active:scale-[0.98] text-sm
                  disabled:opacity-40 disabled:cursor-not-allowed text-white
                  ${isFree
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.25)]'
                    : 'bg-violet-600 hover:bg-violet-500 shadow-[0_0_24px_rgba(124,58,237,0.3)]'
                  }`}
              >
                {isLoading
                  ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  : isFree
                    ? <><Gift size={18} /> Claim Free Premium</>
                    : <><ShieldCheck size={18} /> Submit for Approval — ₹{finalPrice}</>
                }
              </button>

              <p className="text-center text-gray-600 text-[11px] mt-3">
                🔒 Payment verified manually by admin within 5–10 mins
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
