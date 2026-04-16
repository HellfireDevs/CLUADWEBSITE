import React from 'react';
import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Background from '../components/Background'; // Path check kar lena apne hisaab se

export default function Suspended() {
  const navigate = useNavigate();

  // Log Out Function
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Particles/Glow */}
      <Background />
      
      {/* Main Suspended Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
        className="bg-red-950/20 border border-red-500/30 p-8 sm:p-10 rounded-3xl max-w-md w-full text-center backdrop-blur-xl z-10 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden"
      >
        {/* Top Danger Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900"></div>

        {/* Pulsing Shield Icon */}
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 relative">
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} 
            transition={{ repeat: Infinity, duration: 2 }} 
            className="absolute inset-0 bg-red-500/30 rounded-full blur-xl"
          />
          <ShieldAlert className="w-12 h-12 text-red-500 relative z-10" />
        </div>
        
        <h1 className="text-3xl font-black text-white mb-3 tracking-wide">Account Suspended</h1>
        
        {/* Message Box */}
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-8">
          <p className="text-red-400/90 text-sm leading-relaxed text-center">
            Your account has been restricted due to a violation of our terms of service or a pending administrative review. You cannot deploy or manage applications at this time.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link 
            to="/support" 
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          >
            Contact Support <ArrowRight size={18} />
          </Link>
          
          <button 
            onClick={handleLogout} 
            className="w-full bg-[#0a0a0a] hover:bg-white/5 text-gray-400 hover:text-white font-bold py-3.5 px-6 rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
