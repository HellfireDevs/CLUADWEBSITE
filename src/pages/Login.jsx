import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Type karte waqt error hata do
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError("Bhai, username aur password dono daal!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // .env se backend ka URL uthayega
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: formData.username,
        password: formData.password
      });

      if (response.data.status === "success") {
        // API Key aur Username browser mein save kar lo
        localStorage.setItem("cloud_api_key", response.data.api_key);
        localStorage.setItem("cloud_username", formData.username);
        
        // Seedha Dashboard pe phek do
        navigate('/dashboard');
      }
    } catch (err) {
      // Backend se jo error aayega wo dikhayenge (e.g. "Incorrect Password")
      setError(err.response?.data?.detail || "Server down hai ya network error hai!");
    } finally {
      setIsLoading(false);
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
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold"
          >
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500 group-focus-within:text-purple-500 transition-colors">
                <User size={18} />
              </div>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
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

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-8 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>Initialize Login <ArrowRight size={18} /></>
            )}
          </button>
        </form>

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
