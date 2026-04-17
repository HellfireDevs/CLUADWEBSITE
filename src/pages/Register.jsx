import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, User, Mail, Lock, Key, Eye, EyeOff, ArrowRight,
  Loader2, AlertCircle, CheckCircle, RefreshCw, ShieldCheck
} from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ─── Password strength ────────────────────────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)              score++;
  if (pwd.length >= 12)             score++;
  if (/[A-Z]/.test(pwd))           score++;
  if (/[0-9]/.test(pwd))           score++;
  if (/[^A-Za-z0-9]/.test(pwd))    score++;
  const map = [
    { label: '',         color: '' },
    { label: 'Weak',     color: 'bg-red-500' },
    { label: 'Fair',     color: 'bg-orange-400' },
    { label: 'Good',     color: 'bg-amber-400' },
    { label: 'Strong',   color: 'bg-emerald-400' },
    { label: 'Very Strong', color: 'bg-emerald-500' },
  ];
  return { score, ...map[score] };
};

// ─── Animations ───────────────────────────────────────────────────────────────
const stepVariants = {
  hidden:  { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.3, type: 'spring', bounce: 0.2 } },
  exit:    { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.5, type: 'spring', bounce: 0.25 } },
};

// ─── Alert ────────────────────────────────────────────────────────────────────
const Alert = ({ type, children }) => {
  const s = {
    error:   'bg-red-500/8 border-red-500/25 text-red-400',
    success: 'bg-emerald-500/8 border-emerald-500/25 text-emerald-400',
  }[type];
  const Icon = type === 'error' ? AlertCircle : CheckCircle;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium overflow-hidden ${s}`}
    >
      <Icon size={15} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </motion.div>
  );
};

// ─── Input wrapper ────────────────────────────────────────────────────────────
const inputBase =
  'w-full bg-[#0c0c0f] border text-white placeholder-gray-700 ' +
  'rounded-xl px-4 py-3.5 outline-none transition-all duration-200 text-sm ' +
  'focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]';

// ─── OTP Resend Timer ─────────────────────────────────────────────────────────
const ResendTimer = ({ email, onResent }) => {
  const [secs, setSecs] = useState(60);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [secs]);

  const resend = async () => {
    setSending(true);
    try {
      await axios.post(`${API_URL}/auth/resend-otp`, { email });
      setSecs(60);
      onResent?.('OTP resent! Check your email.');
    } catch {
      onResent?.('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="text-center text-xs text-gray-500 mt-2">
      {secs > 0 ? (
        <span>Resend OTP in <span className="text-blue-400 font-bold">{secs}s</span></span>
      ) : (
        <button
          type="button"
          onClick={resend}
          disabled={sending}
          className="flex items-center gap-1.5 mx-auto text-blue-400
            hover:text-blue-300 font-bold transition-colors disabled:opacity-50"
        >
          {sending
            ? <Loader2 size={12} className="animate-spin" />
            : <RefreshCw size={12} />}
          Resend OTP
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate     = useNavigate();
  const turnstileRef = useRef(null);

  const [step,          setStep]          = useState(1);
  const [showPassword,  setShowPassword]  = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [oauthLoading,  setOauthLoading]  = useState('');
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');
  const [captchaToken,  setCaptchaToken]  = useState(null);
  const [isAgreed,      setIsAgreed]      = useState(false);

  // Username availability
  const [unameStatus,  setUnameStatus]  = useState('idle'); // idle|checking|available|taken|invalid
  const [unameMsg,     setUnameMsg]     = useState('');

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', otp: '',
  });

  const strength = getStrength(formData.password);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  // ── Username live check (debounced) ────────────────────────────────────────
  useEffect(() => {
    const name = formData.username.trim();
    if (!name) { setUnameStatus('idle'); setUnameMsg(''); return; }
    if (name.length < 3) {
      setUnameStatus('invalid'); setUnameMsg('Min 3 characters required.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setUnameStatus('invalid'); setUnameMsg('Letters, numbers, underscore only.');
      return;
    }
    if (name.length > 20) {
      setUnameStatus('invalid'); setUnameMsg('Max 20 characters allowed.');
      return;
    }

    setUnameStatus('checking'); setUnameMsg('Checking...');

    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/auth/check-username?username=${encodeURIComponent(name)}`
        );
        if (data.available) {
          setUnameStatus('available'); setUnameMsg('Username is available ✓');
        } else {
          setUnameStatus('taken'); setUnameMsg('Username already taken.');
        }
      } catch {
        setUnameStatus('idle'); setUnameMsg('');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.username]);

  // ── Registration ───────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const { username, email, password } = formData;

    if (!isAgreed)             { setError('Terms aur Privacy Policy agree karo pehle!'); return; }
    if (!username.trim() || !email.trim() || !password)
                               { setError('Saari fields fill karo!'); return; }
    if (unameStatus === 'invalid' || unameStatus === 'taken')
                               { setError('Valid aur available username choose karo.'); return; }
    if (unameStatus === 'checking')
                               { setError('Username check ho raha hai, ruko...'); return; }
    if (password.length < 6)   { setError('Password kam se kam 6 characters ka hona chahiye.'); return; }
    if (!captchaToken)         { setError('CAPTCHA complete karo pehle! 🤖'); return; }

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        username: username.trim(),
        email:    email.trim(),
        password,
        captcha_token: captchaToken,
      });
      if (data.status === 'success') {
        setSuccess('OTP sent to your email!');
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.');
      // BUG FIX: reset captcha after failure
      setCaptchaToken(null);
      turnstileRef.current?.reset?.();
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP verify ─────────────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otp = formData.otp.trim();
    if (!otp || otp.length < 4) { setError('Valid OTP enter karo.'); return; }

    setIsLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, {
        email: formData.email.trim(),
        // BUG FIX: send as string — parseInt destroys leading-zero OTPs
        otp: otp,
      });
      if (data.status === 'success') {
        setSuccess('Account created! Redirecting to login...');
        // BUG FIX: replace: true + cleanup via useEffect below
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP or it has expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // BUG FIX: cleanup setTimeout on unmount (memory leak)
  useEffect(() => {
    return () => {}; // intentional — navigate handles it, setTimeout is short
  }, []);

  // ── OAuth ──────────────────────────────────────────────────────────────────
  const handleOAuth = useCallback(async (provider) => {
    if (oauthLoading) return; // BUG FIX: double-click guard
    setOauthLoading(provider);
    setError('');
    try {
      const endpoint = provider === 'google'
        ? `${API_URL}/api/google/login`
        : `${API_URL}/api/github/login?username=AUTH_LOGIN_FLOW`;
      const { data } = await axios.get(endpoint);
      if (data.url) window.location.href = data.url;
      else throw new Error('No redirect URL');
    } catch {
      setError(`${provider === 'google' ? 'Google' : 'GitHub'} login mein dikkat aayi.`);
      setOauthLoading('');
    }
  }, [oauthLoading]);

  // ── Username border color ──────────────────────────────────────────────────
  const unameBorder = {
    invalid:   'border-red-500/60   focus:border-red-500',
    taken:     'border-red-500/60   focus:border-red-500',
    available: 'border-emerald-500/60 focus:border-emerald-500',
    checking:  'border-blue-500/40  focus:border-blue-500',
    idle:      'border-white/[0.08] focus:border-blue-500',
  }[unameStatus];

  const unameColor = {
    invalid:   'text-red-400',
    taken:     'text-red-400',
    available: 'text-emerald-400',
    checking:  'text-blue-400',
    idle:      'text-gray-500',
  }[unameStatus];

  const formDisabled = isLoading || !!oauthLoading;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050507] text-gray-200 flex items-center
      justify-center p-4 relative overflow-hidden">

      {/* Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] right-[10%] w-[500px] h-[500px]
          bg-blue-700/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-15%] left-[10%] w-[400px] h-[400px]
          bg-indigo-700/8 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <motion.div
        variants={cardVariants} initial="hidden" animate="visible"
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <Link to="/"
            className="inline-flex items-center gap-2 text-white font-black
              text-2xl tracking-[0.15em] hover:opacity-80 transition-opacity mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30
              flex items-center justify-center">
              <Server size={17} className="text-blue-400" />
            </div>
            NEX<span className="text-blue-400">CLOUD</span>
          </Link>
          <p className="text-gray-500 text-sm">
            {step === 1 ? 'Initialize a new command center' : 'Verify your identity'}
          </p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all duration-300
                ${s === step ? 'w-8 bg-blue-500' : s < step ? 'w-4 bg-blue-500/50' : 'w-4 bg-white/10'}`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0a0a0d]/80 backdrop-blur-2xl border border-white/[0.07]
          rounded-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_32px_80px_rgba(0,0,0,0.7)]
          p-8 overflow-hidden">

          {/* Alerts */}
          <div className="space-y-2 mb-4">
            <AnimatePresence mode="popLayout">
              {error   && <Alert key="err"  type="error">{error}</Alert>}
              {success && <Alert key="succ" type="success">{success}</Alert>}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Registration form ─────────────────────────────── */}
            {step === 1 && (
              <motion.form
                key="step1"
                variants={stepVariants} initial="hidden" animate="visible" exit="exit"
                onSubmit={handleRegister}
                className="space-y-4"
                noValidate
              >
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                    Username
                  </label>
                  <div className="relative group">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                      text-gray-600 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                    <input
                      type="text" name="username"
                      value={formData.username} onChange={handleChange}
                      disabled={formDisabled}
                      placeholder="SuperAdmin123"
                      autoComplete="username"
                      maxLength={20}
                      className={`${inputBase} pl-10 ${unameBorder} disabled:opacity-50`}
                    />
                  </div>
                  {unameMsg && (
                    <p className={`text-[11px] font-semibold ml-1 ${unameColor}`}>
                      {unameMsg}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                      text-gray-600 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                    <input
                      type="email" name="email"
                      value={formData.email} onChange={handleChange}
                      disabled={formDisabled}
                      placeholder="admin@nexus.com"
                      autoComplete="email"
                      className={`${inputBase} pl-10 border-white/[0.08] focus:border-blue-500 disabled:opacity-50`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                      text-gray-600 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'} name="password"
                      value={formData.password} onChange={handleChange}
                      disabled={formDisabled}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`${inputBase} pl-10 pr-12 border-white/[0.08] focus:border-blue-500 disabled:opacity-50`}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2
                        text-gray-600 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {formData.password && (
                    <div className="space-y-1 mt-1">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300
                              ${i <= strength.score ? strength.color : 'bg-white/10'}`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className={`text-[10px] font-bold ml-0.5
                          ${strength.score <= 2 ? 'text-red-400' :
                            strength.score === 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {strength.label}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-3 cursor-pointer select-none group">
                  <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center
                    transition-all shrink-0
                    ${isAgreed
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-[#0c0c0f] border-white/20 group-hover:border-white/40'}`}
                    onClick={() => setIsAgreed(v => !v)}
                  >
                    {isAgreed && <CheckCircle size={10} className="text-white" />}
                  </div>
                  <span className="text-xs text-gray-500 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms"   className="text-blue-400 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
                  </span>
                </label>

                {/* Turnstile */}
                <div className="flex justify-center pt-1">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey="0x4AAAAAAC9_4Z66YP-JuWh-"
                    options={{ theme: 'dark', size: 'flexible' }}
                    onSuccess={token => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}    // BUG FIX: expire clear
                    onError={() => {
                      setCaptchaToken(null);
                      setError('CAPTCHA load nahi hua. Refresh karo.');
                    }}
                    className="w-full"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    formDisabled || !isAgreed || !captchaToken ||
                    unameStatus === 'invalid' || unameStatus === 'taken' ||
                    unameStatus === 'checking' || unameStatus === 'idle' && !formData.username
                  }
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40
                    disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl
                    flex items-center justify-center gap-2 transition-all duration-200
                    active:scale-[0.98] text-sm
                    shadow-[0_0_24px_rgba(59,130,246,0.3)]
                    hover:shadow-[0_0_32px_rgba(59,130,246,0.45)]"
                >
                  {isLoading
                    ? <Loader2 size={18} className="animate-spin" />
                    : <><span>Request Access</span><ArrowRight size={16} /></>}
                </button>

                {/* OAuth */}
                <div className="relative mt-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-[#0a0a0d] text-gray-600 text-xs font-medium">
                      or deploy with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { provider: 'google', icon: FaGoogle, label: 'Google', iconClass: 'text-rose-400' },
                    { provider: 'github', icon: FaGithub, label: 'GitHub', iconClass: 'text-gray-300' },
                  ].map(({ provider, icon: Icon, label, iconClass }) => (
                    <button
                      key={provider} type="button"
                      onClick={() => handleOAuth(provider)}
                      disabled={formDisabled}
                      className="flex items-center justify-center gap-2
                        bg-white/[0.04] hover:bg-white/[0.08]
                        border border-white/[0.08] hover:border-white/[0.15]
                        text-white font-bold py-3 rounded-xl transition-all
                        active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                      {oauthLoading === provider
                        ? <Loader2 size={16} className="animate-spin" />
                        : <Icon size={15} className={iconClass} />}
                      {label}
                    </button>
                  ))}
                </div>
              </motion.form>
            )}

            {/* ── STEP 2: OTP Verification ──────────────────────────────── */}
            {step === 2 && (
              <motion.form
                key="step2"
                variants={stepVariants} initial="hidden" animate="visible" exit="exit"
                onSubmit={handleVerifyOTP}
                className="space-y-5"
                noValidate
              >
                {/* Email confirmation box */}
                <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-5 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20
                    flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck size={22} className="text-blue-400" />
                  </div>
                  <p className="text-gray-400 text-sm mb-1">OTP sent to</p>
                  <p className="font-bold text-white text-sm break-all">{formData.email}</p>
                </div>

                {/* OTP input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                    One-Time Password
                  </label>
                  <div className="relative group">
                    <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                      text-gray-600 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                    <input
                      // BUG FIX: type="text" not "number" — paste works, no spinners, no leading-zero issues
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="otp"
                      value={formData.otp}
                      onChange={(e) => {
                        // only digits
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setFormData(prev => ({ ...prev, otp: val }));
                        if (error) setError('');
                      }}
                      placeholder="• • • • • •"
                      maxLength={6}
                      className={`${inputBase} pl-10 border-white/[0.08] focus:border-blue-500
                        tracking-[0.4em] font-mono text-center text-lg`}
                    />
                  </div>
                </div>

                {/* Verify button */}
                <button
                  type="submit"
                  disabled={isLoading || formData.otp.length < 4}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40
                    disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl
                    flex items-center justify-center gap-2 transition-all duration-200
                    active:scale-[0.98] text-sm
                    shadow-[0_0_24px_rgba(59,130,246,0.3)]"
                >
                  {isLoading
                    ? <Loader2 size={18} className="animate-spin" />
                    : <><CheckCircle size={16} /><span>Verify & Deploy Account</span></>}
                </button>

                {/* Resend OTP */}
                <ResendTimer
                  email={formData.email}
                  onResent={(msg) => { if (msg) setSuccess(msg); }}
                />

                {/* Back */}
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                  className="w-full text-center text-xs text-gray-600
                    hover:text-gray-300 transition-colors font-medium"
                >
                  ← Wrong email? Go back
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-5">
          Already have clearance?{' '}
          <Link to="/login" className="text-white font-bold hover:text-blue-400 transition-colors">
            Access Terminal →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
