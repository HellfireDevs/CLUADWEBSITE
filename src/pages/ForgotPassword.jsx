import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, User, Key, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, type: "spring", bounce: 0.3 } },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Identifier (User/Email), Step 2: OTP & New Password
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: '', // Ye variable backend ke payload ke hisaab se hai, isme email bhi aa sakta hai
    otp: '',
    new_password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); 
  };

  // STEP 1: Username ya Email bhej kar OTP mangwana
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!formData.username) {
      setError("Username ya Email toh daal bhai!");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        username: formData.username // Backend humara smart hai, handle kar lega
      });

      if (response.data.status === "success") {
        setSuccess(response.data.message);
        setTimeout(() => {
            setSuccess("");
            setStep(2); // Move to Step 2
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Account nahi mila ya network error hai!");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: OTP aur Naya Password set karna
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.otp || !formData.new_password) {
      setError("OTP aur Naya Password dono zaroori hain!");
      return;
    }

    if (formData.new_password.length < 6) {
      setError("Password kam se kam 6 characters ka hona chahiye!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        username: formData.username,
        otp: parseInt(formData.otp),
        new_password: formData.new_password
      });

      if (response.data.status === "success") {
        setSuccess("Password successfully reset! Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP or network error!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 🌌 Ambient Background Glow (Orange/Amber for Reset) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white font-black text-2xl tracking-widest mb-2 hover:scale-105 transition-transform">
            <Server className="text-orange-500 w-8 h-8" /> NEX<span className="text-orange-500">CLOUD</span>
          </Link>
          <p className="text-gray-400 text-sm font-medium">
            {step === 1 ? "Initiate password override protocol" : "Set your new security key"}
          </p>
        </div>

        {/* Global Alerts */}
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

        {/* Form Container */}
        <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* ================= STEP 1: REQUEST OTP ================= */}
            {step === 1 && (
              <motion.form 
                key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" 
                onSubmit={handleRequestReset} className="space-y-5"
              >
                <div className="text-center bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
                  <Lock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Enter your username or registered email to receive a password reset code.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username or Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-orange-500 transition-colors">
                      {/* 🔥 SMART ICON: Email type karega toh Mail icon, varna User icon */}
                      {formData.username.includes('@') ? <Mail size={18} /> : <User size={18} />}
                    </div>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="admin123 or user@gmail.com"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-orange-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all focus:shadow-[0_0_15px_rgba(249,115,22,0.2)]" />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full mt-8 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Request OTP <ArrowRight size={18} /></>}
                </button>
              </motion.form>
            )}

            {/* ================= STEP 2: VERIFY & RESET ================= */}
            {step === 2 && (
              <motion.form 
                key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" 
                onSubmit={handleResetPassword} className="space-y-5"
              >
                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">6-Digit Reset Code</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-orange-500 transition-colors">
                      <Key size={18} />
                    </div>
                    <input type="number" name="otp" value={formData.otp} onChange={handleChange} placeholder="123456" maxLength="6"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-orange-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all tracking-widest font-mono focus:shadow-[0_0_15px_rgba(249,115,22,0.2)] appearance-none" />
                  </div>
                </div>

                {/* New Password Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-orange-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input type={showPassword ? "text" : "password"} name="new_password" value={formData.new_password} onChange={handleChange} placeholder="••••••••"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-orange-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 pr-12 outline-none transition-all focus:shadow-[0_0_15px_rgba(249,115,22,0.2)]" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full mt-8 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Confirm New Password <CheckCircle size={18} /></>}
                </button>
                
                <button type="button" onClick={() => { setStep(1); setSuccess(""); setError(""); }} className="w-full text-center mt-4 text-xs font-bold text-gray-500 hover:text-white transition-colors">
                  Didn't receive code? Try again
                </button>
              </motion.form>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Remembered your password? <Link to="/login" className="text-white font-bold hover:text-orange-400 transition-colors ml-1">Return to Login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
