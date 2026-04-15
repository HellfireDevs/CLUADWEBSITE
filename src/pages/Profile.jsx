import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, User, Key, Copy, CheckCircle, Shield, LogOut, ArrowLeft, Mail, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Background from '../components/Background';

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
};

export default function Profile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Commander");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

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
  }, [navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("cloud_api_key");
    localStorage.removeItem("cloud_username");
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
          <Link to="/dashboard" className="text-gray-400 hover:text-white font-bold text-sm transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 mt-10 relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} 
            className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] border-4 border-[#050505]"
          >
            {username.charAt(0).toUpperCase()}
          </motion.div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">Hello, {username}</h1>
            <p className="text-gray-400 flex items-center justify-center sm:justify-start gap-2">
              <Shield size={16} className="text-green-400" /> Admin Clearance Level: Maximum
            </p>
          </div>
        </div>

        <motion.div variants={{ visible: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible" className="space-y-6">
          
          {/* ================= USER DETAILS CARD ================= */}
          <motion.div variants={fadeInUp} className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User size={20} className="text-purple-400" /> Account Identity
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Username</p>
                <p className="text-white font-medium">{username}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Mail size={12}/> Email Address</p>
                  <p className="text-gray-400 font-medium">Hidden for security</p>
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
              <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Highly Confidential</span>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">This key grants full access to your cloud deployments. Never share it, not even with the Bhaichara boys.</p>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 font-mono text-sm tracking-wider overflow-x-auto whitespace-nowrap text-purple-300">
                {showKey ? apiKey : '••••••••••••••••••••••••••••••••••••••••••••'}
              </div>
              
              <button onClick={() => setShowKey(!showKey)} className="p-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors border border-white/5">
                {showKey ? 'Hide' : 'Reveal'}
              </button>

              <button onClick={copyToClipboard} className="p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-lg flex items-center gap-2 font-bold min-w-[120px] justify-center">
                {copied ? <><CheckCircle size={18} /> Copied</> : <><Copy size={18} /> Copy</>}
              </button>
            </div>
          </motion.div>

          {/* ================= DANGER ZONE ================= */}
          <motion.div variants={fadeInUp} className="bg-red-500/[0.02] border border-red-500/20 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl mt-10">
            <h3 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-gray-400 text-sm mb-6">Take care of what you click here. Actions are irreversible.</p>
            
            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2">
              <LogOut size={18} /> Disconnect from Server
            </button>
          </motion.div>

        </motion.div>

      </div>
    </div>
  );
}
