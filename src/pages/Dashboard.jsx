import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Terminal, RotateCw, Plus, Box, LogOut, Settings, X, Zap, Check, Crown, AlertTriangle, Trash2, Save, FolderGit2, FileCode2, MoreVertical, Cpu, Shield, ZapOff } from 'lucide-react';
import { FaGithub } from 'react-icons/fa'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
// 💸 PAYWALL MODAL (Pricing Plans - ₹49 vs ₹89)
// ==========================================
const PaywallModal = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] relative max-h-[90vh] flex flex-col">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full z-20"><X size={20}/></button>
        
        {/* Header */}
        <div className="p-6 sm:p-8 text-center border-b border-white/5 bg-gradient-to-b from-purple-900/20 to-transparent shrink-0">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
            <Crown className="text-purple-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Upgrade to Deploy</h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">Select a high-performance cloud engine to deploy and scale your applications instantly.</p>
        </div>

        {/* Pricing Cards */}
        <div className="p-4 sm:p-8 bg-[#050505] overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* 🔥 PLAN 1: ₹49 (Basic Pro) */}
            <div className="bg-white/[0.02] border border-white/10 hover:border-purple-500/30 rounded-2xl p-6 sm:p-8 flex flex-col transition-all">
              <h3 className="text-xl font-bold text-white mb-2">NEX Starter</h3>
              <p className="text-gray-400 text-sm mb-6">Perfect for small bots and personal projects.</p>
              <div className="text-4xl font-black text-white mb-6">₹49<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              
              <div className="space-y-4 mb-8 flex-1">
                {[
                  '2 Core High-Speed CPU', 
                  '8 GB Dedicated RAM', 
                  'Unlimited Bandwidth', 
                  'Zero Downtime (24/7)', 
                  'Standard Network Speed'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={18} className="text-purple-400 shrink-0" /> {feature}
                  </div>
                ))}
              </div>
              
              <button onClick={() => navigate('/payment', { state: { plan: '49' } })} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all">
                Select Starter
              </button>
            </div>

            {/* 🔥 PLAN 2: ₹89 (Pro Ultra - Highlighted) */}
            <div className="bg-purple-900/10 border border-purple-500/50 rounded-2xl p-6 sm:p-8 flex flex-col relative shadow-[0_0_30px_rgba(168,85,247,0.15)] transform md:-translate-y-2">
              {/* Highlight Badge */}
              <div className="absolute top-0 inset-x-0 flex justify-center">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-b-lg shadow-lg">Most Popular</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 mt-2 flex items-center gap-2">NEX Overlord <Zap size={18} className="text-yellow-400 fill-yellow-400/20"/></h3>
              <p className="text-purple-300/70 text-sm mb-6">Extreme power for production-grade applications.</p>
              <div className="text-4xl font-black text-white mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">₹89<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              
              <div className="space-y-4 mb-8 flex-1">
                {[
                  '4 Core Ultra-Fast CPU', 
                  '16 GB DDR4 RAM', 
                  'Unlimited Deployments', 
                  'Advanced DDoS Protection', 
                  'Priority Support Desk',
                  '10 Gbps Uplink Speed'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                    <Zap size={18} className="text-yellow-400 shrink-0" /> {feature}
                  </div>
                ))}
              </div>
              
              <button onClick={() => navigate('/payment', { state: { plan: '89' } })} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                Deploy with Overlord
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// ⚙️ MANAGE APP MODAL (Env, Repo, Delete)
// ==========================================
const ManageAppModal = ({ isOpen, onClose, app, apiKey, refreshDashboard }) => {
  const [activeTab, setActiveTab] = useState('env');
  const [loading, setLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const [envText, setEnvText] = useState("");
  const [repoDetails, setRepoDetails] = useState({ url: "", name: "", cmd: "" });

  useEffect(() => {
    if (app) {
      setRepoDetails({ url: app.repo_url || "", name: app.repo_name || "", cmd: app.start_cmd || "" });
      if (app.env_vars) {
        const text = Object.entries(app.env_vars).map(([k, v]) => `${k}=${v}`).join("\n");
        setEnvText(text);
      } else {
        setEnvText("");
      }
      setIsConfirmingDelete(false);
    }
  }, [app]);

  if (!isOpen || !app) return null;
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const handleSaveEnv = async () => {
    setLoading(true);
    try {
      const envObj = {};
      envText.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) envObj[match[1].trim()] = match[2].trim();
      });

      await axios.post(`${API_URL}/api/edit-env`, {
        app_name: app.pm2_name,
        env_vars: envObj
      }, { headers: { "x-api-key": apiKey } });

      alert("✅ Environment Variables Saved! Restart the app to apply changes.");
      refreshDashboard();
    } catch (err) {
      alert("❌ Failed to save Env: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  const handleSaveRepo = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/edit-repo`, {
        app_name: app.pm2_name,
        new_repo_url: repoDetails.url,
        new_repo_name: repoDetails.name,
        new_start_cmd: repoDetails.cmd
      }, { headers: { "x-api-key": apiKey } });

      alert("✅ Repository settings updated! Reset the app to clone new repo.");
      refreshDashboard();
    } catch (err) {
      alert("❌ Failed to update Repo: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/delete-bot`, {
        app_name: app.pm2_name
      }, { headers: { "x-api-key": apiKey } });

      alert("🗑️ App successfully deleted.");
      onClose();
      refreshDashboard();
    } catch (err) {
      alert("❌ Failed to delete app: " + (err.response?.data?.detail || err.message));
      setIsConfirmingDelete(false);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-black/50">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} className="text-purple-400"/> Manage {app.pm2_name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 rounded-lg">
            <X size={20}/>
          </button>
        </div>

        <div className="flex border-b border-white/10 bg-black/20 overflow-x-auto">
          <button onClick={() => setActiveTab('env')} className={`flex-1 p-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'env' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5' : 'text-gray-400 hover:text-white'}`}>
            <FileCode2 size={16}/> Variables
          </button>
          <button onClick={() => setActiveTab('repo')} className={`flex-1 p-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'repo' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-gray-400 hover:text-white'}`}>
            <FolderGit2 size={16}/> Source
          </button>
          <button onClick={() => setActiveTab('danger')} className={`flex-1 p-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'danger' ? 'text-red-400 border-b-2 border-red-400 bg-red-500/5' : 'text-gray-400 hover:text-white'}`}>
            <AlertTriangle size={16}/> Danger
          </button>
        </div>

        <div className="p-6 bg-[#050505] min-h-[300px]">
          {activeTab === 'env' && (
            <div className="animate-in fade-in duration-200">
              <p className="text-sm text-gray-400 mb-4">Add your environment variables here. Use <code className="bg-white/10 px-1 rounded text-gray-200">KEY=VALUE</code> format (one per line).</p>
              <textarea 
                value={envText}
                onChange={(e) => setEnvText(e.target.value)}
                placeholder="BOT_TOKEN=123456789:ABCdefGHI&#10;MONGO_URL=mongodb+srv://..."
                className="w-full h-48 bg-black border border-white/10 rounded-xl p-4 text-sm font-mono text-green-400 focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-600 mb-4"
              />
              <button onClick={handleSaveEnv} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50">
                {loading ? <RotateCw className="animate-spin" size={18}/> : <Save size={18}/>} {loading ? "Saving..." : "Save .env file"}
              </button>
            </div>
          )}

          {activeTab === 'repo' && (
            <div className="animate-in fade-in duration-200 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">GitHub Repository URL</label>
                <input type="text" value={repoDetails.url} onChange={(e) => setRepoDetails({...repoDetails, url: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Repo Name</label>
                  <input type="text" value={repoDetails.name} onChange={(e) => setRepoDetails({...repoDetails, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Command</label>
                  <input type="text" value={repoDetails.cmd} onChange={(e) => setRepoDetails({...repoDetails, cmd: e.target.value})} placeholder="e.g. python3 main.py" className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={handleSaveRepo} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-2 flex justify-center items-center gap-2 transition-all disabled:opacity-50">
                 {loading ? <RotateCw className="animate-spin" size={18}/> : <Save size={18}/>} {loading ? "Updating..." : "Update Config"}
              </button>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="animate-in fade-in duration-200 text-center py-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 className={`text-red-500 w-8 h-8 ${loading ? 'animate-bounce' : ''}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Application</h3>
              <p className="text-red-400/80 text-sm max-w-sm mx-auto mb-6">
                This action will permanently delete this application, its environment variables, and all code from the server. This cannot be undone.
              </p>
              
              {!isConfirmingDelete ? (
                <button onClick={() => setIsConfirmingDelete(true)} disabled={loading} className="w-full bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)] disabled:opacity-50">
                  <AlertTriangle size={18}/> Yes, I want to delete this App
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl text-left">
                  <p className="text-white font-bold mb-1 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500"/> Are you absolutely sure?</p>
                  <p className="text-sm text-red-300/70 mb-4">Please confirm to trigger the deletion protocol.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setIsConfirmingDelete(false)} disabled={loading} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-lg transition-all border border-white/10">
                      Cancel
                    </button>
                    <button onClick={handleDelete} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] disabled:opacity-50">
                      {loading ? <RotateCw size={16} className="animate-spin" /> : <Trash2 size={16} />} 
                      {loading ? "Deleting..." : "Confirm Delete"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

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
  const location = useLocation(); 
  
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("Commander");
  const [apiKey, setApiKey] = useState("");
  
  const [isPremium, setIsPremium] = useState(localStorage.getItem("cloud_is_premium") === "true");

  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false); 
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const key = localStorage.getItem("cloud_api_key");
    const storedUser = localStorage.getItem("cloud_username");
    
    if (!key) {
      navigate('/login'); 
      return;
    }

    if (location.state?.showPaywall) {
      setIsPaywallOpen(true);
      window.history.replaceState({}, document.title); 
    }

    setApiKey(key);
    if (storedUser) setUsername(storedUser);
    fetchDashboardData(key);
  }, [navigate, location]);

  const fetchDashboardData = async (key) => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await axios.get(`${API_URL}/api/services`, {
        headers: { "x-api-key": key } 
      });

      if (response.data.status === "success") {
        setServices(response.data.data || []);
        
        const premiumStatus = response.data.is_premium || false;
        setIsPremium(premiumStatus);
        localStorage.setItem("cloud_is_premium", premiumStatus);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setServices([]); 
      setIsPremium(false);
      localStorage.setItem("cloud_is_premium", "false");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 MAGIC 1: Heartbeat System for Real-time Suspended Check
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const key = localStorage.getItem("cloud_api_key");
        if(!key) return;
        
        const response = await axios.get(`${API_URL}/api/profile`, {
          headers: { "x-api-key": key }
        });

        // Agar user piche se suspend hua, toh turant dhakka maaro!
        if (response.data.data.is_suspended) {
          localStorage.setItem("cloud_is_suspended", "true");
          navigate('/suspended');
        }
      } catch (err) {
        // Backend agar 403 bhej de
        if (err.response?.status === 403) {
           localStorage.setItem("cloud_is_suspended", "true");
           navigate('/suspended');
        }
      }
    };

    // Har 20 second me check karega 
    const interval = setInterval(checkStatus, 20000); 
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // Clear all
    navigate('/login');
  };

  const openTerminal = (appName) => { 
    navigate(`/app/${appName}`);
  };
  
  const openManage = (app) => { setSelectedApp(app); setIsManageOpen(true); };
  
  const handleDeployClick = (e) => {
    if (!isPremium) {
      e.preventDefault(); 
      setIsPaywallOpen(true); 
    }
  };

  const triggerAction = async (appName, actionType) => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      await axios.post(`${API_URL}/api/action`, { app_name: appName, action: actionType }, { headers: { "x-api-key": apiKey } });
      alert(`✅ Action '${actionType}' triggered successfully for ${appName}!`);
      fetchDashboardData(apiKey);
    } catch (err) {
      alert(`❌ Failed to ${actionType}: ` + (err.response?.data?.detail || err.message));
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
          
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/profile" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors bg-white/5 sm:bg-transparent px-2 sm:px-0 py-1.5 sm:py-0 rounded-full sm:rounded-none hover:bg-white/10 sm:hover:bg-transparent">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black shrink-0 relative shadow-lg border border-[#050505]">
                {username.charAt(0).toUpperCase()}
                {isPremium && (
                  <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                    <Crown size={12} className="text-yellow-400" />
                  </div>
                )}
              </div>
              <span className="hidden sm:inline text-white mr-1">{username}</span>
            </Link>

            <Link to="/support" className="text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-xl hover:bg-white/10" title="Billing & Support">
              <MoreVertical size={18} />
            </Link>

            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors p-2 bg-white/5 rounded-xl hover:bg-red-500/10" title="Logout">
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
          
          <Link to="/deploy" onClick={handleDeployClick} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] w-full sm:w-auto justify-center">
            {isPremium ? <Plus size={18} /> : <Crown size={18} className="text-yellow-300" />} 
            Deploy New App
          </Link>
        </div>

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
            
            <Link to="/deploy" onClick={handleDeployClick} className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-xl transition-all border border-white/10 inline-flex items-center gap-2">
               {isPremium ? "Create First Deployment" : <><Crown size={18} className="text-yellow-400"/> Upgrade to Deploy</>}
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((app) => (
              <motion.div key={app.id || app.pm2_name} variants={fadeUp} className="bg-white/[0.03] border border-white/10 hover:border-purple-500/50 rounded-3xl p-6 transition-all group flex flex-col h-full backdrop-blur-sm shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                
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
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-md flex items-center gap-1 w-fit">
                    {app.use_docker ? <Cpu size={12}/> : <Terminal size={12}/>} Engine: {app.use_docker ? 'Docker' : 'PM2'}
                  </span>
                </div>

                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button onClick={() => triggerAction(app.pm2_name, 'restart')} title="Restart Process" className="p-2.5 bg-white/5 hover:bg-purple-600/20 text-gray-400 hover:text-purple-400 rounded-lg transition-colors border border-transparent hover:border-purple-500/30">
                      <RotateCw size={16} />
                    </button>
                    {/* 🔥 FIX: Seedha terminal open karega */}
                    <button onClick={() => openTerminal(app.pm2_name)} title="Open Terminal & Logs" className="p-2.5 bg-white/5 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/30">
                      <Terminal size={16} />
                    </button>
                  </div>
                  
                  <button onClick={() => openManage(app)} className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <Settings size={14} /> Manage
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isPaywallOpen && (
          <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} navigate={navigate} />
        )}

        {isManageOpen && selectedApp && (
          <ManageAppModal 
            isOpen={isManageOpen} 
            onClose={() => setIsManageOpen(false)} 
            app={selectedApp} 
            apiKey={apiKey}
            refreshDashboard={() => fetchDashboardData(apiKey)}
          />
        )}
      </AnimatePresence>
    </div>
  );
                  }
