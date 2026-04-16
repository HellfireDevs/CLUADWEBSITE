import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, User, Mail, Lock, Key, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile'; 
import axios from 'axios';

// --- ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, type: "spring", bounce: 0.3 } },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // 🔥 MAGIC TOOL: Turnstile ko control karne ke liye ref
  const turnstileRef = useRef(null);
  
  // 🛡️ CAPTCHA STATE
  const [captchaToken, setCaptchaToken] = useState(null);
  
  // 📜 TERMS & PRIVACY STATE
  const [isAgreed, setIsAgreed] = useState(false);

  // 🔍 USERNAME LIVE CHECK STATES
  const [usernameStatus, setUsernameStatus] = useState('idle'); 
  const [usernameMessage, setUsernameMessage] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); 
  };

  // ==========================================
  // 🪄 LIVE USERNAME CHECK (Debounced)
  // ==========================================
  useEffect(() => {
    const checkUsername = async () => {
      const uname = formData.username;
      
      if (!uname) {
        setUsernameStatus('idle');
        setUsernameMessage('');
        return;
      }
      
      if (uname.length < 3) {
        setUsernameStatus('invalid');
        setUsernameMessage('⚠️ Username must be at least 3 characters.');
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(uname)) {
        setUsernameStatus('invalid');
        setUsernameMessage('⚠️ Only letters, numbers, and underscore (_) allowed.');
        return;
      }

      setUsernameStatus('checking');
      setUsernameMessage('⏳ Checking availability...');

      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const response = await axios.get(`${API_URL}/auth/check-username?username=${uname}`);
        
        if (response.data.available) {
          setUsernameStatus('available');
          setUsernameMessage('✅ Username is available!');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage('❌ Username is already taken!');
        }
      } catch (err) {
        setUsernameStatus('idle');
        setUsernameMessage('');
      }
    };

    const timeoutId = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  // ==========================================
  // 1️⃣ TRADITIONAL REGISTER
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!isAgreed) {
      setError("Bhai, pehle Terms aur Privacy Policy toh maan le! 😂");
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      setError("Bhai, saari details bharni padengi!");
      return;
    }

    if (usernameStatus === 'invalid' || usernameStatus === 'taken') {
      setError("Pehle ek valid aur available username toh chun le bhai!");
      return;
    }

    if (!captchaToken) {
      setError("Pehle verify kar ki tu robot nahi hai! 🤖");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await axios.post(`${API_URL}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        captcha_token: captchaToken
      });

      if (response.data.status === "success") {
        setSuccess("OTP has been sent to your email!");
        setStep(2); 
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Network error hai bhai!");
      
      // 🔥 THE FIX: Error aate hi Turnstile ko RESET maro
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
      setCaptchaToken(null); // Purana token delete kar do taaki naya generate ho sake
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 2️⃣ OTP VERIFICATION
  // ==========================================
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError("OTP kaun dalega? 🌚");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email: formData.email, 
        otp: parseInt(formData.otp) 
      });

      if (response.data.status === "success") {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP or network error!");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🌐 SOCIAL LOGINS
  // ==========================================
  const handleGoogleLogin = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await axios.get(`${API_URL}/api/google/login`);
      if (response.data.url) {
        window.location.href = response.data.url; 
      }
    } catch (err) {
      setError("Google Login connect hone me dikkat aayi.");
    }
  };

  const handleGithubLogin = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await axios.get(`${API_URL}/api/github/login?username=AUTH_LOGIN_FLOW`);
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError("GitHub Login connect hone me dikkat aayi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white font-black text-2xl tracking-widest mb-2 hover:scale-105 transition-transform">
            <Server className="text-blue-500 w-8 h-8" /> NEX<span className="text-blue-500">CLOUD</span>
          </Link>
          <p className="text-gray-400 text-sm font-medium">
            {step === 1 ? "Initialize a new command center" : "Verify your identity"}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg"
            >
              <AlertCircle size={18} className="shrink-0" /> <p>{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg"
            >
              <CheckCircle size={18} className="shrink-0" /> <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* ================= STEP 1: REGISTRATION FORM ================= */}
            {step === 1 && (
              <motion.form 
                key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" 
                onSubmit={handleRegister} className="space-y-5"
              >
                {/* Username Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="SuperAdmin123"
                      className={`w-full bg-[#0a0a0a] border focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all 
                        ${usernameStatus === 'invalid' || usernameStatus === 'taken' ? 'border-red-500 focus:border-red-500' : 
                          usernameStatus === 'available' ? 'border-green-500 focus:border-green-500' : 'border-white/10 focus:border-blue-500'}`} />
                  </div>
                  {/* Live Username Feedback */}
                  {usernameMessage && (
                    <p className={`text-[11px] font-bold mt-1 ml-1 ${usernameStatus === 'invalid' || usernameStatus === 'taken' ? 'text-red-400' : usernameStatus === 'available' ? 'text-green-400' : 'text-blue-400'}`}>
                      {usernameMessage}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@nexus.com"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-blue-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-blue-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 pr-12 outline-none transition-all focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 📜 PRIVACY POLICY CHECKBOX */}
                <div className="flex items-start gap-3 px-1 mt-2 mb-2">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-[#0a0a0a] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                    />
                  </div>
                  <label htmlFor="terms" className="text-xs text-gray-400 leading-tight cursor-pointer select-none">
                    I agree to the <Link to="/terms" className="text-blue-400 hover:underline">Terms of Service</Link> and 
                    <Link to="/privacy" className="text-blue-400 hover:underline ml-1">Privacy Policy</Link>. 
                    I understand my data will be used for deployment logs.
                  </label>
                </div>

                {/* 🛡️ CLOUDFLARE TURNSTILE WIDGET */}
                <div className="flex justify-center mt-4">
                  <Turnstile
                    ref={turnstileRef} // 🔥 YAHAN PE REF ATTACH HUA
                    siteKey="0x4AAAAAAC9_4Z66YP-JuWh-"
                    options={{ theme: 'dark' }}
                    onSuccess={(token) => setCaptchaToken(token)}
                  />
                </div>

                <button type="submit" disabled={isLoading || !isAgreed || usernameStatus === 'invalid' || usernameStatus === 'taken' || usernameStatus === 'checking'} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Request Access <ArrowRight size={18} /></>}
                </button>

                {/* ================= SOCIAL LOGIN BUTTONS ================= */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-[#111111] text-gray-500 rounded-full font-medium">Or deploy with</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <button type="button" onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg">
                      <FaGoogle size={18} className="text-red-400" /> Google
                    </button>
                    <button type="button" onClick={handleGithubLogin} className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg">
                      <FaGithub size={18} className="text-gray-200" /> GitHub
                    </button>
                  </div>
                </div>

              </motion.form>
            )}

            {/* ================= STEP 2: OTP VERIFICATION ================= */}
            {step === 2 && (
              <motion.form 
                key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" 
                onSubmit={handleVerifyOTP} className="space-y-5"
              >
                <div className="text-center bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                  <Mail className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">We've sent a 6-digit verification code to</p>
                  <p className="font-bold text-white">{formData.email}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">One-Time Password (OTP)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                      <Key size={18} />
                    </div>
                    <input type="number" name="otp" value={formData.otp} onChange={handleChange} placeholder="123456" maxLength="6"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-blue-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all tracking-widest font-mono focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] appearance-none" />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full mt-8 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Verify & Deploy Account <CheckCircle size={18} /></>}
                </button>
                
                <button type="button" onClick={() => { setStep(1); setSuccess(""); setError(""); }} className="w-full text-center mt-4 text-xs font-bold text-gray-500 hover:text-white transition-colors">
                  Wrong email? Go back
                </button>
              </motion.form>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Already have clearance? <Link to="/login" className="text-white font-bold hover:text-blue-400 transition-colors ml-1">Access Terminal</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
