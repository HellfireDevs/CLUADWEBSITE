import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Terminal, RotateCw, Plus, Box, LogOut, Settings, X, Zap, Shield, Cpu, Crown, ArrowRight, Check } from 'lucide-react';
import { FaGithub } from 'react-icons/fa'; 
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

// ==========================================
// 📡 LIVE LOGS MODAL (WebSockets)
// ==========================================
const LiveLogsModal = ({ isOpen, onClose, appName, useDocker }) => {
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !appName) return;
    setLogs([]); 
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws'); 
    const ws = new WebSocket(`${wsBaseUrl}/ws/stream/${appName}?use_docker=${useDocker}`);

    ws.onmessage = (event) => setLogs((prev) => [...prev, event.data]);
    ws.onerror = () => setLogs((prev) => [...prev, "❌ WebSocket Connection Error. Backend zinda hai?"]);

    return () => ws.close(); 
  }, [isOpen, appName, useDocker]);

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[70vh] sm:h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/50">
          <div className="flex items-center gap-2 text-white font-bold tracking-widest">
            <Terminal size={18} className="text-purple-400"/> {appName.toUpperCase()} // LIVE STREAM
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 rounded-lg hover:bg-white/10">
            <X size={20}/>
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs sm:text-sm text-green-400 bg-black tracking-wide leading-relaxed">
          {logs.length === 0 ? <div className="animate-pulse">Connecting to live stream pipe...</div> : logs.map((log, i) => <div key={i}>{log}</div>)}
          <div ref={logsEndRef} /> 
        </div>
      </motion.div>
    </div>
  );
};


// ==========================================
// 💸 PAYWALL MODAL (Pricing Plans)
// ==========================================
const PaywallModal = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full z-10"><X size={20}/></button>
        
        <div className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-purple-900/20 to-transparent">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
            <Crown className="text-purple-400 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Upgrade to Deploy</h2>
          <p className="text-gray-400 max-w-lg mx-auto">You need an active subscription to deploy applications. Choose a plan that fits your high-performance needs.</p>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#050505]">
          {/* PLAN 1: PRO (₹49) */}
          <div className="bg-white/[0.02] border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 transition-all flex flex-col relative overflow-hidden group">
            <h3 className="text-xl font-bold text-white mb-1">NEX Pro</h3>
            <div className="text-gray-400 text-sm mb-4">Perfect for standard bots</div>
            <div className="text-4xl font-black text-white mb-6">₹49<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            
            <div className="space-y-3 mb-8 flex-1">
              {['8GB RAM Dedicated', 'No Downtime (24/7)', 'High Speed Network', 'Standard Support', '5 Active Deployments'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check size={16} className="text-purple-500" /> {feature}
                </div>
              ))}
            </div>
            
            <button onClick={() => navigate('/payment')} className="w-full bg-white/5 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all group-hover:bg-purple-600">
              Get Pro
            </button>
          </div>

          {/* PLAN 2: PRO ULTRA (₹89) */}
          <div className="bg-purple-900/10 border border-purple-500/50 rounded-2xl p-6 transition-all flex flex-col relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">
              Most Popular
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">Pro Ultra <Zap size={18} className="inline text-yellow-400 mb-1"/></h3>
            <div className="text-purple-300 text-sm mb-4">For heavy production workloads</div>
            <div className="text-4xl font-black text-white mb-6">₹89<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            
            <div className="space-y-3 mb-8 flex-1">
              {['16GB RAM Dedicated', '0% Downtime Guarantee', 'Ultra-Fast 10Gbps Network', 'DDoS Protection', 'Priority Support (24/7)', 'Unlimited Deployments'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check size={16} className="text-purple-400" /> {feature}
                </div>
              ))}
            </div>
            
            <button onClick={() => navigate('/payment')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              Get Pro Ultra
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


// ==========================================
// 🎛️ MAIN DASHBOARD COMPONENT
// ==========================================
export default function Dashboard() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("Commander");
  const [isPremium, setIsPremium] = useState(false); // 🔥 Premium Status State

  // Modals State
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false); // 🔥 Paywall State

  useEffect(() => {
    const apiKey = localStorage.getItem("cloud_api_key");
    const storedUser = localStorage.getItem("cloud_username");
    
    if (!apiKey) {
      navigate('/login'); 
      return;
    }

    if (storedUser) setUsername(storedUser);
    fetchDashboardData(apiKey);
  }, [navigate]);

  const fetchDashboardData = async (apiKey) => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await axios.get(`${API_URL}/api/services`, {
        headers: { "x-api-key": apiKey } 
      });

      if (response.data.status === "success") {
        setServices(response.data.data || []);
        // 🔥 Assume backend returns is_premium status. Agar nahi bhejta, toh false manega.
        setIsPremium(response.data.is_premium || false); 
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setServices([]); 
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cloud_api_key");
    localStorage.removeItem("cloud_username");
    navigate('/login');
  };

  const openLogs = (app) => {
    setSelectedApp(app);
    setIsLogsOpen(true);
  };

  // 🔥 DEPLOY BUTTON CLICK HANDLER
  const handleDeployClick = (e) => {
    if (!isPremium) {
      e.preventDefault(); // Stop navigation to /deploy
      setIsPaywallOpen(true); // Open Pricing Modal
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative selection:bg-purple-500/30 pb-20">
      <Background />
      
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
              {isPremium && <Crown size={14} className="text-yellow-400" title="Premium Active"/>}
            </Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors p-2 bg-white/5 rounded-xl hover:bg-red-500/10">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Your Applications</h1>
            <p className="text-gray-400 text-sm">Manage your deployed bots and containers.</p>
          </div>
          
          {/* 🔥 Deploy Button with Lock Logic */}
          <Link 
            to="/deploy" 
            onClick={handleDeployClick}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            {isPremium ? <Plus size={18} /> : <Crown size={18} className="text-yellow-300" />} 
            Deploy New App
          </Link>
        </div>

        {/* Apps Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse"></div>)}
          </div>
        ) : services.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/[0.02] border border-white/10 border-dashed rounded-3xl py-20 px-6">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Box className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Applications Found</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">You haven't deployed any code yet. Connect a GitHub repository to get started.</p>
            
            {/* Same Lock logic on empty state button */}
            <Link 
              to="/deploy" 
              onClick={handleDeployClick}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-xl transition-all border border-white/10 inline-flex items-center gap-2"
            >
               {isPremium ? "Create First Deployment" : <><Crown size={18} className="text-yellow-400"/> Upgrade to Deploy</>}
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((app) => (
              <motion.div key={app.id} variants={fadeUp} className="bg-white/[0.03] border border-white/10 hover:border-purple-500/50 rounded-3xl p-6 transition-all group flex flex-col h-full backdrop-blur-sm shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                {/* Same App Card code as before */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{app.pm2_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium bg-black/50 w-fit px-2 py-1 rounded-md border border-white/5">
                      <FaGithub size={12} /> {app.repo_name}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border ${app.status === 'online' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {app.status}
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-md">
                    Engine: {app.use_docker ? 'Docker' : 'PM2'}
                  </span>
                </div>

                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button title="Restart Process" className="p-2.5 bg-white/5 hover:bg-purple-600/20 text-gray-400 hover:text-purple-400 rounded-lg transition-colors border border-transparent hover:border-purple-500/30">
                      <RotateCw size={16} />
                    </button>
                    <button onClick={() => openLogs(app)} title="View Live Logs" className="p-2.5 bg-white/5 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/30">
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

      {/* 📡 INJECTING MODALS HERE */}
      <AnimatePresence>
        {isLogsOpen && selectedApp && (
          <LiveLogsModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} appName={selectedApp.pm2_name} useDocker={selectedApp.use_docker || false} />
        )}
        
        {/* 🔥 NEW PAYWALL MODAL */}
        {isPaywallOpen && (
          <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} navigate={navigate} />
        )}
      </AnimatePresence>
    </div>
  );
}
