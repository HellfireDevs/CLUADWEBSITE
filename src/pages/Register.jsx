import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, User, Mail, Lock, Key, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, type: "spring", bounce: 0.3 } },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Details, Step 2: OTP
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // STEP 1: Register request bhejna aur OTP mangwana
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError("Bhai, saari details bharni padengi!");
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
        password: formData.password
      });

      if (response.data.status === "success") {
        setSuccess("OTP has been sent to your email!");
        setStep(2); // Smoothly OTP form pe switch karo
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Network error hai bhai!");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: OTP Verify karna aur Account Create karna
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
        email: formData.email, // Original email send karni zaroori hai backend ko
        otp: parseInt(formData.otp) // Backend ko integer chahiye
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

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 🌌 Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header (Always Visible) */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white font-black text-2xl tracking-widest mb-2 hover:scale-105 transition-transform">
            <Server className="text-blue-500 w-8 h-8" /> NEX<span className="text-blue-500">CLOUD</span>
          </Link>
          <p className="text-gray-400 text-sm font-medium">
            {step === 1 ? "Initialize a new command center" : "Verify your identity"}
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
            
            {/* ================= STEP 1: REGISTRATION FORM ================= */}
            {step === 1 && (
              <motion.form 
                key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" 
                onSubmit={handleRegister} className="space-y-5"
              >
                {/* Username Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="SuperAdmin123"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-blue-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                  </div>
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

                <button type="submit" disabled={isLoading} className="w-full mt-8 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Request Access <ArrowRight size={18} /></>}
                </button>
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
