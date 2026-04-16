import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, ArrowLeft, Terminal as TerminalIcon, Play, Square, RotateCw, 
  RefreshCcw, Box, Cpu, CircleDot, GitBranch, Trash2, DownloadCloud, AlertTriangle 
} from 'lucide-react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

export default function Terminal() {
  const { appName } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation(); 
  const [appDetails, setAppDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  
  const [logMode, setLogMode] = useState(location.state?.isNewDeploy ? 'build' : 'runtime'); 

  // Terminal States
  const [logs, setLogs] = useState([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionType, setActionType] = useState(""); 
  const logsEndRef = useRef(null);
  const wsRef = useRef(null);

  // Auto-Deploy & Update States
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false); 

  // 1. Fetch App Details
  useEffect(() => {
    const key = localStorage.getItem("cloud_api_key");
    if (!key) return navigate('/login');
    setApiKey(key);
    fetchAppDetails(key);
    
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [appName, navigate]);

  const fetchAppDetails = async (key) => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await axios.get(`${API_URL}/api/services`, { headers: { "x-api-key": key } });
      
      if (response.data.status === "success") {
        const services = response.data.data || [];
        const currentApp = services.find(s => s.pm2_name === appName);
        
        if (currentApp) {
          setAppDetails(currentApp);
          setAutoDeploy(currentApp.auto_deploy !== false); 
          
          if (currentApp.update_pending) {
            setShowUpdatePopup(true);
          }
          connectWebSocket(currentApp, logMode); 
        } else {
          setLogs(["❌ App not found in your account!"]);
        }
      }
    } catch (err) {
      setLogs(["❌ Failed to fetch app details! Backend down?"]);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 🔥 SMART WEBSOCKET LOGIC
  const connectWebSocket = (app, mode = logMode) => {
    if (wsRef.current) wsRef.current.close(); 
    
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws');
    const username = localStorage.getItem("cloud_username") || "user";
    
    let wsUrl = "";
    
    if (mode === 'build') {
      wsUrl = `${wsBaseUrl}/ws/build-stream/${username}/${appName}`;
      setLogs([`> 🏗️ INITIALIZING LIVE BUILD ENGINE FOR [${appName}]...`, `> Connecting to secure pipeline...`]);
    } else {
      wsUrl = `${wsBaseUrl}/ws/stream/${appName}?use_docker=${app.use_docker ? 'true' : 'false'}`;
      setLogs([`> 📡 CONNECTING TO RUNTIME LOGS [${appName}]...`, `> Engine: ${app.use_docker ? 'Docker' : 'PM2'}`]);
    }
    
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const text = event.data;
      setLogs((prev) => [...prev, text]);

      if (mode === 'build' && (text.includes('NEX_CLOUD_BUILD_COMPLETE') || text.includes('NEX_CLOUD_BUILD_FAILED'))) {
        setTimeout(() => {
          setLogs(prev => [...prev, "", "> 🔄 Build process finished. Auto-switching to runtime logs in 3 seconds..."]);
          setTimeout(() => {
            switchLogMode('runtime', app);
          }, 3000);
        }, 1000);
      }
    };
    
    ws.onerror = () => setLogs((prev) => [...prev, `❌ WebSocket Error in ${mode.toUpperCase()} mode.`]);
    ws.onclose = () => setLogs((prev) => [...prev, `🔴 ${mode.toUpperCase()} Stream Disconnected.`]);
    
    wsRef.current = ws;
  };

  const switchLogMode = (newMode, app = appDetails) => {
    if (!app) return;
    setLogMode(newMode);
    setLogs([]); 
    connectWebSocket(app, newMode);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // 3. Handle Actions
  const handleAction = async (type) => {
    setActionType(type); 
    setIsActionLoading(true);
    
    if (type === 'git_pull') setShowUpdatePopup(false);

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const backendAction = type === 'redeploy' ? 'reset' : type;

      if (backendAction === 'reset' || backendAction === 'git_pull') {
        switchLogMode('build');
      } 

      await axios.post(`${API_URL}/api/action`, { 
        app_name: appName, 
        action: backendAction 
      }, { headers: { "x-api-key": apiKey } });
      
      if (backendAction === 'clear_logs') {
        setLogs([`✅ System logs flushed successfully for ${appName}.`]);
      }

      setTimeout(() => {
        fetchAppDetails(apiKey);
        setIsActionLoading(false);
        setActionType("");
      }, 1000); 
      
    } catch (err) {
      setLogs(prev => [...prev, `❌ Action failed: ${err.response?.data?.detail || err.message}`]);
      setIsActionLoading(false);
      setActionType("");
    }
  };

  // 4. Handle Auto-Deploy Toggle
  const handleToggleAutoDeploy = async () => {
    setIsToggleLoading(true);
    const newStatus = !autoDeploy;
    setAutoDeploy(newStatus); 

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      await axios.post(`${API_URL}/api/toggle-autodeploy`, {
        app_name: appName,
        status: newStatus
      }, { headers: { "x-api-key": apiKey } });
      
      setLogs(prev => [...prev, `> ⚙️ SYSTEM: Auto-Deploy via GitHub is now ${newStatus ? 'ON' : 'OFF'}.`]);
    } catch (err) {
      setAutoDeploy(!newStatus);
      setLogs(prev => [...prev, `❌ SYSTEM: Failed to change Auto-Deploy status.`]);
    } finally {
      setIsToggleLoading(false);
    }
  };

  if (isLoading) {
    return <div className="h-screen bg-[#050505] flex items-center justify-center text-purple-500 animate-pulse font-mono tracking-widest uppercase">Initializing Terminal Interface...</div>;
  }

  const getLoadingText = () => {
    if (actionType === 'start') return 'IGNITING SYSTEM';
    if (actionType === 'stop') return 'SHUTTING DOWN';
    if (actionType === 'restart') return 'RESTARTING ENGINE';
    if (actionType === 'redeploy') return 'INITIALIZING BUILD';
    if (actionType === 'clear_logs') return 'SWEEPING LOGS';
    if (actionType === 'git_pull') return 'FETCHING NEW CODE';
    return 'PROCESSING';
  };

  return (
    // 🔥 FIX: Height ko screen ke barabar restrict kar diya `h-screen overflow-hidden`
    <div className="h-screen bg-[#050505] text-gray-200 font-sans flex flex-col relative overflow-hidden">
      <Background />
      
      {/* 🚨 GITHUB UPDATE POPUP */}
      <AnimatePresence>
        {showUpdatePopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} 
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[90] w-[90%] max-w-md bg-[#0a0a0a]/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(59,130,246,0.15)]"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl shrink-0">
                <AlertTriangle size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Update Available!</h3>
                <p className="text-gray-400 text-sm mb-4">A new push was detected on your GitHub repository. Since Auto-Deploy is OFF, manual approval is required.</p>
                <div className="flex gap-3">
                  <button onClick={() => handleAction('git_pull')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded-lg transition-colors shadow-lg">
                    Pull & Deploy
                  </button>
                  <button onClick={() => setShowUpdatePopup(false)} className="px-4 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-bold py-2 rounded-lg transition-colors border border-white/5">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 ACTION OVERLAY */}
      <AnimatePresence>
        {isActionLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center">
            <div className="flex flex-col items-center">
              <RotateCw size={48} className="text-purple-500 animate-spin mb-4 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
              <div className="text-purple-400 font-mono text-xl font-bold tracking-[0.3em] uppercase animate-pulse text-center px-4">
                {getLoadingText()}...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 TOP NAVBAR - Always fixed at the top */}
      <nav className="border-b border-white/5 bg-[#0a0a0a] z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
          
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white shrink-0">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-black text-white flex items-center gap-2 tracking-widest truncate">
                <TerminalIcon size={18} className="text-purple-400 shrink-0"/> <span className="truncate">{appName.toUpperCase()}</span>
              </h1>
              
              {appDetails && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">
                  <span className="flex items-center gap-1 text-gray-500 shrink-0">
                    {appDetails.use_docker ? <Cpu size={12}/> : <Box size={12}/>} 
                    {appDetails.use_docker ? 'Docker' : 'PM2'}
                  </span>
                  <span className={`flex items-center gap-1 shrink-0 ${appDetails.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                    <CircleDot size={10} className={appDetails.status === 'online' ? 'animate-pulse' : ''} />
                    {appDetails.status || 'Unknown'}
                  </span>
                  <div className="w-px h-3 bg-white/20 hidden sm:block"></div>
                  {/* ⚙️ AUTO-DEPLOY TOGGLE */}
                  <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={handleToggleAutoDeploy}>
                    <span className={`flex items-center gap-1 transition-colors ${autoDeploy ? 'text-blue-400' : 'text-gray-500'}`}>
                      <GitBranch size={12} /> Auto-Deploy
                    </span>
                    <button disabled={isToggleLoading} className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${autoDeploy ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoDeploy ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls Menu - Scrollable on mobile if needed */}
          <div className="flex items-center gap-2 bg-[#050505] p-1 rounded-xl border border-white/5 overflow-x-auto shrink-0 pb-1 sm:pb-0 scrollbar-hide">
            <button onClick={() => handleAction('start')} disabled={isActionLoading} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors text-xs sm:text-sm font-bold disabled:opacity-50 whitespace-nowrap">
              <Play size={16} className="fill-green-400/20 shrink-0"/> <span className="hidden sm:inline">Start</span>
            </button>
            <button onClick={() => handleAction('restart')} disabled={isActionLoading} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors text-xs sm:text-sm font-bold disabled:opacity-50 whitespace-nowrap">
              <RotateCw size={16} className="shrink-0" /> <span className="hidden sm:inline">Restart</span>
            </button>
            <button onClick={() => handleAction('stop')} disabled={isActionLoading} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs sm:text-sm font-bold disabled:opacity-50 whitespace-nowrap">
              <Square size={16} className="fill-red-400/20 shrink-0"/> <span className="hidden sm:inline">Stop</span>
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 shrink-0"></div>
            <button onClick={() => handleAction('git_pull')} disabled={isActionLoading} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-xs sm:text-sm font-bold disabled:opacity-50 whitespace-nowrap" title="Manually pull latest code">
              <DownloadCloud size={16} className="shrink-0"/> <span className="hidden sm:inline">Pull Code</span>
            </button>
            <button onClick={() => handleAction('redeploy')} disabled={isActionLoading} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors text-xs sm:text-sm font-bold disabled:opacity-50 whitespace-nowrap" title="Force reinstall requirements & deploy">
              <RefreshCcw size={16} className="shrink-0"/> <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 🖥️ TERMINAL WINDOW - This area will scroll internally */}
      <div className="flex-1 p-2 sm:p-4 flex flex-col min-h-0 z-10 w-full max-w-7xl mx-auto pb-6 sm:pb-4">
        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
          
          {/* Mac-style Window Header with 📡 TABS */}
          <div className="h-12 bg-black border-b border-white/5 flex items-center justify-between px-2 sm:px-4 shrink-0 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 mr-2 sm:mr-0 pl-1 hidden sm:flex">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              
              {/* 🔥 TABS START */}
              <div className="flex items-center gap-1 sm:gap-2 sm:ml-4 p-1 bg-white/5 rounded-lg shrink-0">
                <button 
                  onClick={() => switchLogMode('runtime')}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold font-mono tracking-widest transition-all whitespace-nowrap ${logMode === 'runtime' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  📡 RUNTIME
                </button>
                <button 
                  onClick={() => switchLogMode('build')}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold font-mono tracking-widest transition-all whitespace-nowrap ${logMode === 'build' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  🏗️ BUILD LOGS
                </button>
              </div>
            </div>

            <button 
              onClick={() => handleAction('clear_logs')} 
              disabled={isActionLoading || logMode === 'build'}
              title={logMode === 'build' ? "Cannot flush build logs" : "Clear PM2 Logs"}
              className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-colors font-mono text-[10px] sm:text-xs font-bold shrink-0 whitespace-nowrap ${logMode === 'build' ? 'opacity-30 cursor-not-allowed text-gray-600' : 'bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400'}`}
            >
              <Trash2 size={14} className="shrink-0"/> <span className="hidden sm:inline">Flush Logs</span>
            </button>
          </div>

          {/* Logs Area - ONLY THIS SCROLLS */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto font-mono text-[11px] sm:text-[13px] leading-relaxed tracking-wide scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-[#050505]">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic">Waiting for incoming logs...</div>
            ) : (
              logs.map((log, i) => {
                let colorClass = "text-gray-300";
                if (logMode === 'build') {
                  if (log.includes('🚀') || log.includes('✅')) colorClass = "text-green-400 font-bold";
                  else if (log.includes('❌') || log.includes('🚨')) colorClass = "text-red-400 font-bold";
                  else if (log.includes('🧹') || log.includes('🐳') || log.includes('📦')) colorClass = "text-blue-400";
                } else {
                  if (log.includes('❌') || log.includes('🔴')) colorClass = "text-red-400";
                  else if (log.includes('✅') || log.includes('⚙️')) colorClass = "text-blue-400";
                  else colorClass = "text-green-400/90";
                }

                return (
                  <div key={i} className={`${colorClass} break-words whitespace-pre-wrap mb-1`}>
                    {log}
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
          
          {/* Top Shadow for Terminal */}
          <div className="absolute top-[48px] left-0 right-0 h-4 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
