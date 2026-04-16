import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile'; // 🛡️ CLOUDFLARE TURNSTILE IMPORT
import axios from 'axios';

// --- ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring", bounce: 0.3 } }
};

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 🛡️ CAPTCHA STATE
  const [captchaToken, setCaptchaToken] = useState(null);

  const [formData, setFormData] = useState({
    username: '', // Backend payload ko yahi naam chahiye, par isme Email bhi aayega
    password: ''
  });

  // ==========================================
  // 🪄 OAUTH MAGIC (Catch tokens from URL)
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthApiKey = params.get("api_key");
    const oauthUsername = params.get("username");
    
    // 🔥 NEW: Check if backend sent status via URL
    const oauthIsPremium = params.get("is_premium");
    const oauthIsSuspended = params.get("is_suspended");

    if (oauthApiKey && oauthUsername) {
      localStorage.setItem("cloud_api_key", oauthApiKey);
      localStorage.setItem("cloud_username", oauthUsername);
      
      if (oauthIsPremium) localStorage.setItem("cloud_is_premium", oauthIsPremium);
      if (oauthIsSuspended) localStorage.setItem("cloud_is_suspended", oauthIsSuspended);
      
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); 
  };

  // ==========================================
  // 🔐 TRADITIONAL LOGIN (With Turnstile Check)
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError("Bhai, username/email aur password dono daal!");
      return;
    }

    // 🛡️ CAPTCHA VERIFICATION
    if (!captchaToken) {
      setError("Pehle verify kar ki tu robot nahi hai! 🤖");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: formData.username, // Ye email bhi ho sakta hai, backend smart hai
        password: formData.password,
        captcha_token: captchaToken 
      });

      if (response.data.status === "success") {
        // 🔥 FIX: Ab login hote hi saara data save ho jayega!
        localStorage.setItem("cloud_api_key", response.data.api_key);
        localStorage.setItem("cloud_username", response.data.username || formData.username);
        localStorage.setItem("cloud_is_premium", response.data.is_premium || false);
        localStorage.setItem("cloud_is_suspended", response.data.is_suspended || false);
        
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Server down hai ya network error hai!");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🌐 GOOGLE OAUTH
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

  // ==========================================
  // 🐙 GITHUB OAUTH
  // ==========================================
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
      
      {/* 🌌 Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white font-black text-2xl tracking-widest mb-2 hover:scale-105 transition-transform">
            <Server className="text-purple-500 w-8 h-8" /> NEX<span className="text-purple-500">CLOUD</span>
          </Link>
          <p className="text-gray-400 text-sm font-medium">Access your deployment engine</p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg"
            >
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* 🔥 SMART Username/Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username or Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-purple-500 transition-colors">
                {/* 🪄 JADOO: @ type karte hi Mail icon ban jayega */}
                {formData.username.includes('@') ? <Mail size={18} /> : <User size={18} />}
              </div>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="admin123 or user@gmail.com"
                className="w-full bg-[#0a0a0a] border border-white/10 focus:border-purple-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors">Forgot Password?</Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-purple-500 transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#0a0a0a] border border-white/10 focus:border-purple-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 pr-12 outline-none transition-all focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 🛡️ CLOUDFLARE TURNSTILE WIDGET */}
          <div className="flex justify-center mt-4">
            <Turnstile
              siteKey="0x4AAAAAAC9_4Z66YP-JuWh-"
              options={{ theme: 'dark' }}
              onSuccess={(token) => setCaptchaToken(token)}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>Initialize Login <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        {/* ========================================== */}
        {/* 🔥 SOCIAL LOGIN BUTTONS */}
        {/* ========================================== */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#111111] text-gray-500 rounded-full font-medium">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {/* Google Button */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg"
            >
              <FaGoogle size={18} className="text-red-400" /> Google
            </button>
            
            {/* GitHub Button */}
            <button 
              type="button"
              onClick={handleGithubLogin}
              className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg"
            >
              <FaGithub size={18} className="text-gray-200" /> GitHub
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-gray-400 text-sm">
            Don't have a command center? <br className="sm:hidden" />
            <Link to="/register" className="text-white font-bold hover:text-purple-400 transition-colors ml-1">Deploy a new account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
