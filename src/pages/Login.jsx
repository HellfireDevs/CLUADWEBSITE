import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, User, Mail, Lock, Eye, EyeOff,
  ArrowRight, Loader2, AlertCircle, CheckSquare, Square
} from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// BUG FIX: boolean ko string "true"/"false" pe store karo explicitly
const saveBool = (key, val) => localStorage.setItem(key, val ? 'true' : 'false');

// ─── Animation variants ───────────────────────────────────────────────────────
const cardVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.5, type: 'spring', bounce: 0.25 } },
};

const errorVariants = {
  hidden:  { opacity: 0, height: 0, marginBottom: 0 },
  visible: { opacity: 1, height: 'auto', marginBottom: 24,
    transition: { duration: 0.25 } },
  exit:    { opacity: 0, height: 0, marginBottom: 0,
    transition: { duration: 0.2 } },
};

// ─── Input field ──────────────────────────────────────────────────────────────
const Field = ({ label, right, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
        {label}
      </label>
      {right}
    </div>
    {children}
  </div>
);

const inputBase =
  'w-full bg-[#0c0c0f] border border-white/[0.08] focus:border-violet-500/60 ' +
  'text-white placeholder-gray-700 rounded-xl px-4 py-3.5 outline-none ' +
  'transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] ' +
  'text-sm';

// ─────────────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate     = useNavigate();
  const turnstileRef = useRef(null);

  const [showPassword,  setShowPassword]  = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [oauthLoading,  setOauthLoading]  = useState(''); // 'google' | 'github' | ''
  const [error,         setError]         = useState('');
  const [captchaToken,  setCaptchaToken]  = useState(null);
  const [rememberMe,    setRememberMe]    = useState(
    () => localStorage.getItem('nex_remember_me') === 'true'
  );

  const [formData, setFormData] = useState({
    username: rememberMe ? (localStorage.getItem('nex_saved_username') || '') : '',
    password: '',
  });

  // ── OAuth: catch tokens from URL ───────────────────────────────────────────
  useEffect(() => {
    const params       = new URLSearchParams(window.location.search);
    const oauthApiKey  = params.get('api_key');
    const oauthUser    = params.get('username');

    if (oauthApiKey && oauthUser) {
      // BUG FIX: clear URL immediately using replaceState BEFORE storing —
      // browser history mein sensitive token nahi rahega
      window.history.replaceState({}, document.title, window.location.pathname);

      localStorage.setItem('cloud_api_key',   oauthApiKey);
      localStorage.setItem('cloud_username',  oauthUser);
      // BUG FIX: saveBool so these are never the string "false" which is truthy
      saveBool('cloud_is_premium',   params.get('is_premium')   === 'true');
      saveBool('cloud_is_suspended', params.get('is_suspended') === 'true');

      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // BUG FIX: trim() — spaces-only username silently failed before
    const username = formData.username.trim();
    const password = formData.password;

    if (!username || !password) {
      setError('Username/email aur password dono required hain.');
      return;
    }
    if (password.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }
    if (!captchaToken) {
      setError('Pehle CAPTCHA complete karo! 🤖');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
        captcha_token: captchaToken,
      });

      if (data.status === 'success') {
        localStorage.setItem('cloud_api_key',  data.api_key);
        localStorage.setItem('cloud_username', data.username || username);
        // BUG FIX: explicit boolean → string conversion
        saveBool('cloud_is_premium',   data.is_premium);
        saveBool('cloud_is_suspended', data.is_suspended);

        // Remember Me logic
        localStorage.setItem('nex_remember_me', rememberMe ? 'true' : 'false');
        if (rememberMe) {
          localStorage.setItem('nex_saved_username', username);
        } else {
          localStorage.removeItem('nex_saved_username');
        }

        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Server ya network check karo.');
      // BUG FIX: captcha reset after failure — expired token re-use blocked
      setCaptchaToken(null);
      turnstileRef.current?.reset?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    if (oauthLoading) return; // BUG FIX: double-click guard
    setOauthLoading(provider);
    setError('');
    try {
      const endpoint = provider === 'google'
        ? `${API_URL}/api/google/login`
        : `${API_URL}/api/github/login?username=AUTH_LOGIN_FLOW`;
      const { data } = await axios.get(endpoint);
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch {
      setError(`${provider === 'google' ? 'Google' : 'GitHub'} login mein dikkat aayi. Retry karo.`);
      setOauthLoading('');
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const isEmail       = formData.username.includes('@');
  const formDisabled  = isLoading || !!oauthLoading;

  return (
    <div className="min-h-screen bg-[#050507] text-gray-200 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px]
          bg-violet-700/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px]
          bg-indigo-700/10 blur-[120px] rounded-full" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Card */}
        <div className="bg-[#0a0a0d]/80 backdrop-blur-2xl border border-white/[0.07]
          rounded-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_32px_80px_rgba(0,0,0,0.7)]
          p-8 sm:p-10">

          {/* Logo */}
          <div className="text-center mb-9">
            <Link to="/"
              className="inline-flex items-center gap-2 text-white font-black
                text-2xl tracking-[0.15em] hover:opacity-90 transition-opacity mb-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30
                flex items-center justify-center">
                <Server size={18} className="text-violet-400" />
              </div>
              NEX<span className="text-violet-400">CLOUD</span>
            </Link>
            <p className="text-gray-500 text-sm">
              Access your deployment engine
            </p>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-red-500/8 border border-red-500/25 text-red-400
                  px-4 py-3 rounded-xl flex items-start gap-3 text-sm overflow-hidden"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="font-medium leading-snug">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>

            {/* Username / Email */}
            <Field label="Username or Email">
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center
                  pointer-events-none text-gray-600
                  group-focus-within:text-violet-400 transition-colors">
                  {isEmail ? <Mail size={16} /> : <User size={16} />}
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={formDisabled}
                  placeholder="admin123 or you@gmail.com"
                  autoComplete="username"
                  className={`${inputBase} pl-10 disabled:opacity-50`}
                />
              </div>
            </Field>

            {/* Password */}
            <Field
              label="Password"
              right={
                <Link to="/forgot-password"
                  className="text-[10px] text-violet-400 hover:text-violet-300
                    font-bold tracking-wide transition-colors">
                  Forgot?
                </Link>
              }
            >
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center
                  pointer-events-none text-gray-600
                  group-focus-within:text-violet-400 transition-colors">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={formDisabled}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${inputBase} pl-10 pr-12 disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center
                    text-gray-600 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {/* Remember me */}
            <button
              type="button"
              onClick={() => setRememberMe(v => !v)}
              className="flex items-center gap-2 text-xs text-gray-500
                hover:text-gray-300 transition-colors select-none"
            >
              {rememberMe
                ? <CheckSquare size={15} className="text-violet-400" />
                : <Square size={15} />}
              Remember me
            </button>

            {/* Turnstile CAPTCHA */}
            <div className="flex justify-center pt-1">
              <Turnstile
                ref={turnstileRef}
                siteKey="0x4AAAAAAC9_4Z66YP-JuWh-"
                options={{ theme: 'dark', size: 'flexible' }}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}   // BUG FIX: expired token clear
                onError={() => {
                  setCaptchaToken(null);
                  setError('CAPTCHA load nahi hua. Page refresh karo.');
                }}
                className="w-full"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={formDisabled || !captchaToken}
              className="w-full bg-violet-600 hover:bg-violet-500
                disabled:opacity-40 disabled:cursor-not-allowed
                text-white font-bold py-3.5 rounded-xl
                flex items-center justify-center gap-2
                transition-all duration-200 active:scale-[0.98]
                shadow-[0_0_24px_rgba(124,58,237,0.3)]
                hover:shadow-[0_0_32px_rgba(124,58,237,0.45)]
                text-sm tracking-wide"
            >
              {isLoading
                ? <Loader2 size={18} className="animate-spin" />
                : <><span>Initialize Login</span><ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#0a0a0d] text-gray-600 text-xs font-medium">
                or continue with
              </span>
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { provider: 'google', icon: FaGoogle, label: 'Google',  iconClass: 'text-rose-400' },
              { provider: 'github', icon: FaGithub, label: 'GitHub',  iconClass: 'text-gray-300' },
            ].map(({ provider, icon: Icon, label, iconClass }) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleOAuth(provider)}
                disabled={formDisabled}
                className="flex items-center justify-center gap-2
                  bg-white/[0.04] hover:bg-white/[0.08]
                  border border-white/[0.08] hover:border-white/[0.15]
                  text-white font-bold py-3 rounded-xl
                  transition-all duration-200 active:scale-[0.97]
                  disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {oauthLoading === provider
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Icon size={16} className={iconClass} />}
                {label}
              </button>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-gray-600 text-xs leading-relaxed
            border-t border-white/[0.05] pt-6">
            No account yet?{' '}
            <Link to="/register"
              className="text-white font-bold hover:text-violet-400 transition-colors ml-0.5">
              Create one →
            </Link>
          </p>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-gray-700 text-[11px] mt-4 tracking-wide">
          Secured by Cloudflare Turnstile · NEX CLOUD
        </p>
      </motion.div>
    </div>
  );
}
