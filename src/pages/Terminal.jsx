import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Server, ArrowLeft, Terminal as TerminalIcon, Play, Square, RotateCw, RefreshCcw, Box, Cpu, CircleDot } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

export default function Terminal() {
  const { appName } = useParams(); // URL se app ka naam nikalenge
  const navigate = useNavigate();
  const [appDetails, setAppDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  
  // Terminal States
  const [logs, setLogs] = useState([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const logsEndRef = useRef(null);
  const wsRef = useRef(null);

  // 1. Fetch App Details (Status, Docker/PM2 info)
  useEffect(() => {
    const key = localStorage.getItem("cloud_api_key");
    if (!key) return navigate('/login');
    setApiKey(key);
    fetchAppDetails(key);
    
    // Cleanup WebSocket on unmount
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
          connectWebSocket(currentApp); // Connect logs after getting details
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

  // 2. Connect Live Logs (WebSocket)
  const connectWebSocket = (app) => {
    if (wsRef.current) wsRef.current.close(); // Close old connection
    
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws');
    const wsUrl = `${wsBaseUrl}/ws/stream/${appName}?use_docker=${app.use_docker ? 'true' : 'false'}`;
    
    setLogs([`> Starting connection to ${appName} logs pipe...`, `> Engine: ${app.use_docker ? 'Docker' : 'PM2'}`]);
    
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => setLogs((prev) => [...prev, event.data]);
    ws.onerror = () => setLogs((prev) => [...prev, "❌ WebSocket Connection Error. Engine unavailable."]);
    ws.onclose = () => setLogs((prev) => [...prev, "🔴 Connection closed."]);
    
    wsRef.current = ws;
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 3. Handle Buttons (Start, Stop, Restart)
  const handleAction = async (actionType) => {
    setIsActionLoading(true);
    setLogs(prev => [...prev, `> Executing command: [${actionType.toUpperCase()}] ...`]);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      await axios.post(`${API_URL}/api/action`, { 
        app_name: appName, 
        action: actionType 
      }, { headers: { "x-api-key": apiKey } });
      
      setLogs(prev => [...prev, `✅ Action '${actionType}' triggered successfully.`]);
      // Refresh status after 2 seconds
      setTimeout(() => fetchAppDetails(apiKey), 2000);
    } catch (err) {
      setLogs(prev => [...prev, `❌ Action failed: ${err.response?.data?.detail || err.message}`]);
    }
    setIsActionLoading(false);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-purple-500 animate-pulse">Initializing Terminal Interface...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans flex flex-col">
      <Background />
      
      {/* 🚀 TOP NAVBAR */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-white flex items-center gap-2 tracking-widest">
                <TerminalIcon size={18} className="text-purple-400"/> {appName.toUpperCase()}
              </h1>
              {appDetails && (
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest mt-0.5">
                  <span className="flex items-center gap-1 text-gray-500">
                    {appDetails.use_docker ? <Cpu size={12}/> : <Box size={12}/>} 
                    {appDetails.use_docker ? 'Docker' : 'PM2'}
                  </span>
                  <span className={`flex items-center gap-1 ${appDetails.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                    <CircleDot size={10} className={appDetails.status === 'online' ? 'animate-pulse' : ''} />
                    {appDetails.status || 'Unknown'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls Menu */}
          <div className="flex items-center gap-2 bg-[#0a0a0a] p-1 rounded-xl border border-white/5">
            <button onClick={() => handleAction('start')} disabled={isActionLoading} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors text-sm font-bold disabled:opacity-50">
              <Play size={16} className="fill-green-400/20"/> <span className="hidden sm:inline">Start</span>
            </button>
            <button onClick={() => handleAction('restart')} disabled={isActionLoading} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors text-sm font-bold disabled:opacity-50">
              <RotateCw size={16} /> <span className="hidden sm:inline">Restart</span>
            </button>
            <button onClick={() => handleAction('stop')} disabled={isActionLoading} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-bold disabled:opacity-50">
              <Square size={16} className="fill-red-400/20"/> <span className="hidden sm:inline">Stop</span>
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>
            <button onClick={() => handleAction('restart')} disabled={isActionLoading} className="p-2 sm:px-4 sm:py-2 hidden sm:flex items-center gap-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-sm font-bold disabled:opacity-50" title="Pulls latest code and restarts">
              <RefreshCcw size={16}/> Redeploy
            </button>
          </div>
        </div>
      </nav>

      {/* 🖥️ TERMINAL WINDOW */}
      <div className="flex-1 p-2 sm:p-4 flex flex-col min-h-0 z-10">
        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
          
          {/* Mac-style Window Header */}
          <div className="h-8 bg-black/50 border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="text-[10px] text-gray-500 font-mono ml-4 tracking-widest">root@nex-cloud:~/{appName}</span>
          </div>

          {/* Logs Area */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[13px] sm:text-sm text-green-400/90 leading-relaxed tracking-wide scrollbar-thin scrollbar-thumb-white/10">
            {logs.map((log, i) => (
              <div key={i} className={`${log.includes('❌') || log.includes('🔴') ? 'text-red-400' : log.includes('✅') ? 'text-blue-400' : ''}`}>
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* Blur Overlay at top of terminal for cool effect */}
          <div className="absolute top-8 left-0 right-0 h-4 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
                    }

