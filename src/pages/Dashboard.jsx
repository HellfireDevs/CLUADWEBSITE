import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🔥 FIX: 'MoreVertical' import kiya 3-dot menu ke liye
import { Server, Terminal, RotateCw, Plus, Box, LogOut, Settings, X, Zap, Check, Crown, AlertTriangle, Trash2, Save, FolderGit2, FileCode2, MoreVertical } from 'lucide-react';
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
          <p className="text-gray-400 max-w-lg mx-auto">You need an active subscription to deploy applications.</p>
        </div>
        <div className="p-6 sm:p-8 flex justify-center bg-[#050505]">
            <button onClick={() => navigate('/payment')} className="w-full max-w-md bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              View Premium Plans
            </button>
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
    const confirmDelete = window.confirm(`⚠️ DANGER: Are you sure you want to permanently delete ${app.pm2_name}? This cannot be undone.`);
    if (!confirmDelete) return;

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

        <div className="flex border-b border-white/10 bg-black/20">
          <button onClick={() => setActiveTab('env')} className={`flex-1 p-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'env' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5' : 'text-gray-400 hover:text-white'}`}>
            <FileCode2 size={16}/> Environment Variables
          </button>
          <button onClick={() => setActiveTab('repo')} className={`flex-1 p-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'repo' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-gray-400 hover:text-white'}`}>
            <FolderGit2 size={16}/> Source Config
          </button>
          <button onClick={() => setActiveTab('danger')} className={`flex-1 p-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'danger' ? 'text-red-400 border-b-2 border-red-400 bg-red-500/5' : 'text-gray-400 hover:text-white'}`}>
            <AlertTriangle size={16}/> Danger Zone
          </button>
        </div>

        <div className="p-6 bg-[#050505]">
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
                <Save size={18}/> {loading ? "Saving..." : "Save .env file"}
              </button>
            </div>
          )}

          {activeTab === 'repo' && (
            <div className="animate-in fade-in duration-200 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">GitHub Repository URL</label>
                <input type="text" value={repoDetails.url} onChange={(e) => setRepoDetails({...repoDetails, url: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <Save size={18}/> {loading ? "Updating..." : "Update Config"}
              </button>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="animate-in fade-in duration-200 text-center py-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Application</h3>
              <p className="text-red-400/80 text-sm max-w-sm mx-auto mb-6">
                This action will permanently delete this application, its environment variables, and all code from the server. This cannot be undone.
              </p>
              <button onClick={handleDelete} disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50">
                <AlertTriangle size={18}/> {loading ? "Deleting..." : "Yes, Delete this App"}
              </button>
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

  const [isLogsOpen, setIsLogsOpen] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem("cloud_api_key");
    localStorage.removeItem("cloud_username");
    localStorage.removeItem("cloud_is_premium");
    navigate('/login');
  };

  const openLogs = (app) => { setSelectedApp(app); setIsLogsOpen(true); };
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
            {/* 🔥 MOBILE & PC DONO PE SINK HUA PROFILE AVATAR */}
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

            {/* 🔥 NAYA 3-DOT MENU FOR SUPPORT/BILLING */}
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
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-md">
                    Engine: {app.use_docker ? 'Docker' : 'PM2'}
                  </span>
                </div>

                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button onClick={() => triggerAction(app.pm2_name, 'restart')} title="Restart Process" className="p-2.5 bg-white/5 hover:bg-purple-600/20 text-gray-400 hover:text-purple-400 rounded-lg transition-colors border border-transparent hover:border-purple-500/30">
                      <RotateCw size={16} />
                    </button>
                    <button onClick={() => openLogs(app)} title="View Live Logs" className="p-2.5 bg-white/5 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/30">
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
        {isLogsOpen && selectedApp && (
          <LiveLogsModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} appName={selectedApp.pm2_name} useDocker={selectedApp.use_docker || false} />
        )}
        
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
