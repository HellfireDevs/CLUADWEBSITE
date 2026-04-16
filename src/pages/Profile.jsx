import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, User, Key, Copy, CheckCircle, Shield, LogOut, ArrowLeft, Mail, Crown, CalendarDays, Zap, CreditCard, AlertTriangle, Trash2, X, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
};

// ==========================================
// 💣 DELETE ACCOUNT MODAL (OTP Verification)
// ==========================================
const DeleteAccountModal = ({ isOpen, onClose, apiKey, username, onLogout }) => {
  const [step, setStep] = useState(1); // 1: Confirm Request, 2: Enter OTP
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // 🔥 FIX: Modal close hone par states ko reset karna zaroori hai
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setOtp("");
      setMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requestDeleteOTP = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(`${API_URL}/api/account/request-delete-otp`, {}, {
        headers: { "x-api-key": apiKey }
      });
      if (response.data.status === "success") {
        setStep(2);
        setMessage("✅ OTP sent to your registered email address.");
      }
    } catch (err) {
      setMessage("❌ Failed to send OTP: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  const confirmDeleteAccount = async () => {
    const cleanOtp = otp.trim();
    
    if (!cleanOtp) {
      setMessage("⚠️ Please enter the OTP.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(`${API_URL}/api/account/confirm-delete`, {
        otp: cleanOtp 
      }, {
        headers: { "x-api-key": apiKey }
      });
      
      if (response.data.status === "success") {
        alert("Account permanently deleted. We are sorry to see you go.");
        onLogout(); 
      }
    } catch (err) {
      setMessage("❌ Failed to delete account: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0a0a0a] border border-red-500/30 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.15)] relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full z-10 transition-colors"><X size={20}/></button>
        
        <div className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-red-900/20 to-transparent">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertTriangle className="text-red-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Delete Account</h2>
          <p className="text-red-400/80 text-sm">This action is permanent and irreversible.</p>
        </div>

        <div className="p-6 bg-[#050505]">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={`p-3 rounded-lg text-sm mb-4 border font-medium text-center ${message.includes('❌') || message.includes('⚠️') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
              <p className="text-gray-400 text-sm leading-relaxed">
                Deleting your account will remove all your deployed applications, environment variables, and associated data from NEX CLOUD immediately.
              </p>
              <button 
                onClick={requestDeleteOTP} 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? "Requesting OTP..." : "Yes, Send OTP to Delete"}
              </button>
            </motion.div>
          ) : (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Please enter the 6-digit OTP sent to your email to confirm deletion.
                </p>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="• • • • • •"
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-center tracking-[1em] font-mono text-white focus:outline-none focus:border-red-500 mb-2 transition-colors"
                  maxLength={6}
                />
                <button 
                  onClick={confirmDeleteAccount} 
                  disabled={loading || otp.length < 5}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? "Deleting System Data..." : <><Trash2 size={18}/> Permanently Delete</>}
                </button>
             </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Commander");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // 🔥 Premium States
  const [isPremium, setIsPremium] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 🛡️ AUTH GUARD & LOAD DATA
  useEffect(() => {
    const key = localStorage.getItem("cloud_api_key");
    const user = localStorage.getItem("cloud_username");
    
    if (!key) {
      navigate('/login');
      return;
    }

    setApiKey(key);
    if (user) setUsername(user);
    
    fetchUserProfile(key);
  }, [navigate]);

  // 📡 FETCH USER DATA FROM BACKEND
  const fetchUserProfile = async (key) => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await axios.get(`${API_URL}/api/profile`, {
        headers: { "x-api-key": key }
      });

      if (response.data.status === "success") {
        const userData = response.data.data;
        setIsPremium(userData.is_premium);
        
        // Days left calculation
        if (userData.is_premium && userData.premium_expiry) {
          const expiryDate = new Date(userData.premium_expiry);
          const today = new Date();
          const diffTime = expiryDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysLeft(diffDays > 0 ? diffDays : 0);
          
          if(diffDays <= 0) setIsPremium(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.clear(); // Saara data saaf karo ek baar mein
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative selection:bg-purple-500/30 pb-20">
      <Background />
      
      {/* 🚀 TOP NAVBAR */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-xl tracking-widest hover:scale-105 transition-transform">
            <Server className="text-purple-500 w-6 h-6" /> NEX<span className="text-purple-500">CLOUD</span>
          </Link>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/dashboard" className="text-gray-400 hover:text-white font-bold text-sm transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            
            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black shrink-0 relative shadow-lg">
                {username.charAt(0).toUpperCase()}
                {isPremium && (
                  <div className="absolute -bottom-1 -right-1 bg-[#050505] rounded-full p-0.5">
                    <Crown size={12} className="text-yellow-400" />
                  </div>
                )}
              </div>
              <span className="hidden sm:inline text-white">{username}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 mt-10 relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} 
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] border-4 border-[#050505] relative shrink-0 ${isPremium ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'}`}
          >
            {username.charAt(0).toUpperCase()}
            {isPremium && (
              <div className="absolute -bottom-2 -right-2 bg-[#050505] rounded-full p-1.5 shadow-lg">
                <Crown size={20} className="text-yellow-400" />
              </div>
            )}
          </motion.div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 flex items-center justify-center sm:justify-start gap-3">
              Hello, {username}
            </h1>
            <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-3 text-sm">
              <p className="text-gray-400 flex items-center gap-1.5">
                <Shield size={16} className={isPremium ? "text-yellow-400" : "text-green-400"} /> 
                {isPremium ? 'Premium Overlord' : 'Standard User'}
              </p>
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20"></div>
              {/* 🔥 NEW: Active Status Badge */}
              <p className="text-green-400 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] bg-green-500/10 px-2.5 py-1 rounded-md border border-green-500/20">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Active
              </p>
            </div>
          </div>
        </div>

        <motion.div variants={{ visible: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible" className="space-y-6">
          
          {/* ================= SUBSCRIPTION / PLAN CARD ================= */}
          <motion.div variants={fadeInUp} className={`border backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden ${isPremium ? 'bg-yellow-500/[0.02] border-yellow-500/30' : 'bg-white/[0.02] border-white/10'}`}>
            {isPremium && <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 blur-[60px] -z-10 rounded-full"></div>}
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard size={20} className={isPremium ? "text-yellow-400" : "text-purple-400"} /> Active Subscription
            </h3>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h4 className="text-2xl font-black text-white flex items-center gap-2">
                  {isPremium ? <><Crown className="text-yellow-400" size={24}/> NEX Premium Plan</> : 'Free Basic Plan'}
                </h4>
                <p className="text-sm text-gray-400 mt-1">
                  {isPremium ? 'Unlimited deployments, priority servers, no limits.' : 'Limited deployments. Upgrade for production-ready performance.'}
                </p>
              </div>

              {/* Days Left UI */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 min-w-[160px] text-center shadow-inner">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center justify-center gap-1">
                  <CalendarDays size={12}/> {isPremium ? 'Time Remaining' : 'Status'}
                </p>
                {isLoading ? (
                   <p className="text-gray-400 animate-pulse text-sm py-1">Checking...</p>
                ) : isPremium ? (
                  <div className="text-white font-medium">
                    <span className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">{daysLeft}</span> Days
                  </div>
                ) : (
                  <div className="text-red-400 font-bold tracking-widest uppercase py-1">Expired</div>
                )}
              </div>
            </div>

            {/* Upgrade Button for Free Users */}
            {!isPremium && !isLoading && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <button onClick={() => navigate('/payment')} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2">
                  <Zap size={18} className="fill-white/20" /> Upgrade to Premium Now
                </button>
              </div>
            )}
          </motion.div>

          {/* ================= USER DETAILS CARD ================= */}
          <motion.div variants={fadeInUp} className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User size={20} className="text-purple-400" /> Account Identity
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 shadow-inner">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Username</p>
                <p className="text-white font-medium">{username}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex items-center justify-between opacity-50 cursor-not-allowed shadow-inner" title="Hidden for privacy">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5"><Mail size={12}/> Email Address</p>
                  <p className="text-gray-400 font-medium tracking-wide">••••••••@•••••.com</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= API KEY CARD ================= */}
          <motion.div variants={fadeInUp} className="bg-gradient-to-br from-purple-900/10 to-transparent border border-purple-500/20 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key size={20} className="text-purple-400" /> Master API Key
              </h3>
              <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                <Activity size={10} className="animate-pulse" /> Highly Confidential
              </span>
            </div>
            
            <p className="text-gray-400 text-sm mb-5">This key grants full access to your cloud deployments and settings. Never share it publicly.</p>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 font-mono text-sm tracking-[0.2em] overflow-x-auto whitespace-nowrap text-purple-300 shadow-inner">
                {showKey ? apiKey : '••••••••••••••••••••••••••••••••'}
              </div>
              
              <button onClick={() => setShowKey(!showKey)} className="p-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors border border-white/5">
                {showKey ? 'Hide' : 'Reveal'}
              </button>

              <button onClick={copyToClipboard} className="p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-2 font-bold min-w-[120px] justify-center">
                {copied ? <><CheckCircle size={18} /> Copied</> : <><Copy size={18} /> Copy</>}
              </button>
            </div>
          </motion.div>

          {/* ================= DANGER ZONE ================= */}
          <motion.div variants={fadeInUp} className="bg-red-500/[0.02] border border-red-500/20 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl mt-10 mb-10">
            <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle size={20} /> Danger Zone
            </h3>
            <p className="text-gray-400 text-sm mb-6">Take care of what you click here. Actions are permanent and irreversible.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleLogout} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                <LogOut size={18} /> Disconnect Session
              </button>
              
              <button onClick={() => setIsDeleteModalOpen(true)} className="flex-1 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white font-bold px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                <Trash2 size={18} /> Delete Account
              </button>
            </div>
          </motion.div>

        </motion.div>

      </div>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <DeleteAccountModal 
            isOpen={isDeleteModalOpen} 
            onClose={() => setIsDeleteModalOpen(false)} 
            apiKey={apiKey}
            username={username}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
  
