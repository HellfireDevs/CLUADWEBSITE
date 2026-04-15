import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Activity, Terminal, Play, RotateCw, Plus, Box, Github, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

// --- ANIMATIONS ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3 } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("Commander");

  // 🛡️ AUTH GUARD & DATA FETCHING
  useEffect(() => {
    const apiKey = localStorage.getItem("cloud_api_key");
    const storedUser = localStorage.getItem("cloud_username");
    
    if (!apiKey) {
      navigate('/login'); // Login nahi kiya toh nikal bahar!
      return;
    }

    if (storedUser) setUsername(storedUser);

    fetchDashboardData(apiKey);
  }, [navigate]);

  const fetchDashboardData = async (apiKey) => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      // Assuming you have an endpoint that returns user's bots. 
      // Agar nahi hai, toh backend me ek choti si GET API bana lenge baad me.
      const response = await axios.get(`${API_URL}/api/services`, {
        headers: { "x-api-key": apiKey } // Teri API key auth ke hisaab se
      });

      if (response.data.status === "success") {
        setServices(response.data.data || []);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      // Agar API error de rahi hai abhi (kyunki humne services.py puri nahi likhi shayad), 
      // toh hum testing ke liye dummy data daal dete hain taaki UI dekh sakein.
      setServices([
        { id: 1, pm2_name: "yuki_music", repo_name: "YUKIMUSICS", type: "PM2", status: "online" },
        { id: 2, pm2_name: "nex_core", repo_name: "NEX-Security", type: "Docker", status: "offline" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cloud_api_key");
    localStorage.removeItem("cloud_username");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative selection:bg-purple-500/30">
      <Background />
      
      {/* 🚀 TOP NAVBAR */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-xl tracking-widest hover:scale-105 transition-transform">
            <Server className="text-purple-500 w-6 h-6" /> NEX<span className="text-purple-500">CLOUD</span>
          </Link>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/profile" className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black">
                {username.charAt(0).toUpperCase()}
              </div>
              {username}
            </Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors p-2 bg-white/5 rounded-xl hover:bg-red-500/10">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* 🎛️ MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Your Applications</h1>
            <p className="text-gray-400 text-sm">Manage your deployed bots and containers.</p>
          </div>
          <Link to="/deploy" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Plus size={18} /> Deploy New App
          </Link>
        </div>

        {/* Apps Grid */}
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : services.length === 0 ? (
          // Empty State (Agar koi bot nahi hai)
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/[0.02] border border-white/10 border-dashed rounded-3xl py-20 px-6">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Box className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Applications Found</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">You haven't deployed any code yet. Connect a GitHub repository to get started.</p>
            <Link to="/deploy" className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-xl transition-all border border-white/10">
              Create First Deployment
            </Link>
          </motion.div>
        ) : (
          // Apps List (Heroku Style Cards)
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((app) => (
              <motion.div key={app.id} variants={fadeUp} className="bg-white/[0.03] border border-white/10 hover:border-purple-500/50 rounded-3xl p-6 transition-all group flex flex-col h-full backdrop-blur-sm shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                
                {/* Status & Name */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{app.pm2_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium bg-black/50 w-fit px-2 py-1 rounded-md border border-white/5">
                      <Github size={12} /> {app.repo_name}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border ${app.status === 'online' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {app.status}
                  </div>
                </div>

                {/* Tech Tag */}
                <div className="mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-md">
                    Engine: {app.type || 'PM2'}
                  </span>
                </div>

                {/* Actions (Bottom) */}
                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button title="Restart Process" className="p-2.5 bg-white/5 hover:bg-purple-600/20 text-gray-400 hover:text-purple-400 rounded-lg transition-colors border border-transparent hover:border-purple-500/30">
                      <RotateCw size={16} />
                    </button>
                    <button title="View Live Logs" className="p-2.5 bg-white/5 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/30">
                      <Terminal size={16} />
                    </button>
                  </div>
                  <button className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <Settings size={14} /> Manage
                  </button>
                </div>
                
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
