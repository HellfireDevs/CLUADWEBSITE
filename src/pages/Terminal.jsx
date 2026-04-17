import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Terminal as TerminalIcon, Play, Square, RotateCw,
  RefreshCcw, Cpu, CircleDot, GitBranch, Trash2, DownloadCloud,
  AlertTriangle, Wifi, WifiOff, Box, Zap
} from 'lucide-react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_LOG_LINES = 500; // Memory guard — purane logs drop ho jaate hain
const RECONNECT_DELAY_MS = 3000;
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_URL  = API_URL.replace(/^http/, 'ws');

// ─── Log color classifier ─────────────────────────────────────────────────────
const getLogColor = (line, mode) => {
  if (!line) return 'text-gray-600';
  const l = line;
  if (l.includes('❌') || l.includes('🚨') || l.includes('ERROR') || l.includes('🔴'))
    return 'text-red-400';
  if (l.includes('✅') || l.includes('NEX_CLOUD_BUILD_COMPLETE'))
    return 'text-emerald-400 font-semibold';
  if (l.includes('NEX_CLOUD_BUILD_FAILED'))
    return 'text-red-500 font-bold';
  if (l.includes('⚠️') || l.includes('WARNING'))
    return 'text-amber-400';
  if (mode === 'build') {
    if (l.includes('🚀') || l.includes('🔥')) return 'text-violet-400 font-semibold';
    if (l.includes('🐳') || l.includes('📦') || l.includes('🏗️')) return 'text-sky-400';
    if (l.includes('🧹') || l.includes('⬇️') || l.includes('🔫')) return 'text-cyan-400';
    if (l.startsWith('>')) return 'text-gray-500 italic';
    return 'text-gray-300';
  }
  if (l.startsWith('>')) return 'text-gray-500 italic';
  return 'text-emerald-300/90';
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    online:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', pulse: true },
    offline: { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         pulse: false },
    stopped: { color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20',   pulse: false },
    errored: { color: 'text-red-500',     bg: 'bg-red-500/10 border-red-500/20',         pulse: false },
  };
  const s = map[status] || { color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', pulse: false };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${s.bg} ${s.color}`}>
      <CircleDot size={8} className={s.pulse ? 'animate-pulse' : ''} />
      {status || 'unknown'}
    </span>
  );
};

// ─── Action button ────────────────────────────────────────────────────────────
const ActionBtn = ({ onClick, disabled, icon: Icon, label, colorClass }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all
      disabled:opacity-30 disabled:cursor-not-allowed border border-transparent
      hover:border-white/10 active:scale-95 whitespace-nowrap ${colorClass}`}
  >
    <Icon size={14} />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// ─── WS connection dot ────────────────────────────────────────────────────────
const WsDot = ({ state }) => {
  // 0=CONNECTING 1=OPEN 2=CLOSING 3=CLOSED
  const colors = ['text-amber-400 animate-pulse', 'text-emerald-400', 'text-amber-400', 'text-red-400'];
  const labels = ['Connecting', 'Live', 'Closing', 'Disconnected'];
  const c = colors[state ?? 3];
  return (
    <span className={`flex items-center gap-1 text-[10px] font-mono font-bold ${c}`}>
      {state === 1 ? <Wifi size={11} /> : <WifiOff size={11} />}
      {labels[state ?? 3]}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Terminal() {
  const { appName }  = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();

  // ── State ──────────────────────────────────────────────────────────────────
  const [apiKey,          setApiKey]          = useState('');
  const [appDetails,      setAppDetails]      = useState(null);
  const [isLoading,       setIsLoading]       = useState(true);
  const [logs,            setLogs]            = useState([]);
  const [logMode,         setLogMode]         = useState(
    location.state?.isNewDeploy ? 'build' : 'runtime'
  );
  const [wsState,         setWsState]         = useState(WebSocket.CLOSED);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionType,      setActionType]      = useState('');
  const [autoDeploy,      setAutoDeploy]      = useState(true);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [autoReconnect,   setAutoReconnect]   = useState(
    () => localStorage.getItem('nex_auto_reconnect') === 'true'
  );

  // ── Refs (stable across renders, safe in callbacks) ────────────────────────
  const wsRef              = useRef(null);
  const reconnectTimer     = useRef(null);
  const intentionalClose   = useRef(false);
  const userStopped        = useRef(false);
  const autoReconnectRef   = useRef(autoReconnect);
  const logModeRef         = useRef(logMode);       // BUG FIX: stale closure in ws.onmessage
  const appDetailsRef      = useRef(null);          // BUG FIX: stale closure in setTimeout
  const logsEndRef         = useRef(null);

  // keep refs in sync
  useEffect(() => { autoReconnectRef.current = autoReconnect; }, [autoReconnect]);
  useEffect(() => { logModeRef.current = logMode; }, [logMode]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // ── addLog helper with MAX_LOG_LINES guard ─────────────────────────────────
  const addLog = useCallback((line) => {
    setLogs(prev => {
      const next = [...prev, line];
      return next.length > MAX_LOG_LINES ? next.slice(next.length - MAX_LOG_LINES) : next;
    });
  }, []);

  const addLogs = useCallback((lines) => {
    setLogs(prev => {
      const next = [...prev, ...lines];
      return next.length > MAX_LOG_LINES ? next.slice(next.length - MAX_LOG_LINES) : next;
    });
  }, []);

  // ── WebSocket ──────────────────────────────────────────────────────────────
  const connectWebSocket = useCallback((app, mode, isReconnect = false) => {
    // Tear down existing connection first
    intentionalClose.current = true;
    wsRef.current?.close();
    wsRef.current = null;
    clearTimeout(reconnectTimer.current);
    intentionalClose.current = false;

    const username = localStorage.getItem('cloud_username') || 'user';
    const wsUrl = mode === 'build'
      ? `${WS_URL}/ws/build-stream/${username}/${appName}`
      : `${WS_URL}/ws/stream/${appName}?use_docker=${app?.use_docker ? 'true' : 'false'}`;

    if (!isReconnect) {
      setLogs(
        mode === 'build'
          ? [`> 🏗️ BUILD STREAM — [${appName}]`, `> Connecting to pipeline...`]
          : [`> 📡 RUNTIME LOGS — [${appName}]`, `> Engine: ${app?.use_docker ? 'Docker' : 'PM2'}`]
      );
    } else {
      addLog(`> 🔄 Reconnecting...`);
    }

    const ws = new WebSocket(wsUrl);
    setWsState(WebSocket.CONNECTING);

    ws.onopen  = () => setWsState(WebSocket.OPEN);

    ws.onmessage = ({ data }) => {
      addLog(data);
      // Build stream: auto-notify on finish
      if (
        logModeRef.current === 'build' &&
        (data.includes('NEX_CLOUD_BUILD_COMPLETE') || data.includes('NEX_CLOUD_BUILD_FAILED'))
      ) {
        addLog('');
        addLog('> 🏁 Build finished. Switch to RUNTIME tab to see live logs.');
      }
    };

    ws.onerror = () => { /* onclose fires right after, handle there */ };

    ws.onclose = () => {
      setWsState(WebSocket.CLOSED);
      if (intentionalClose.current) return;

      if (userStopped.current) {
        addLog('🔴 App is stopped. Stream paused.');
        return;
      }
      if (!autoReconnectRef.current) {
        addLog('🔴 Disconnected. Auto-Reconnect is OFF.');
        return;
      }
      addLog(`🔴 Disconnected. Reconnecting in ${RECONNECT_DELAY_MS / 1000}s...`);
      reconnectTimer.current = setTimeout(() => {
        // BUG FIX: use ref so we always get the latest appDetails
        connectWebSocket(appDetailsRef.current, logModeRef.current, true);
      }, RECONNECT_DELAY_MS);
    };

    wsRef.current = ws;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appName, addLog]);

  // ── Fetch app details ──────────────────────────────────────────────────────
  const fetchAppDetails = useCallback(async (key) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/services`, {
        headers: { 'x-api-key': key }
      });
      if (data.status === 'success') {
        const app = (data.data || []).find(s => s.pm2_name === appName);
        if (app) {
          setAppDetails(app);
          appDetailsRef.current = app; // BUG FIX: keep ref updated
          setAutoDeploy(app.auto_deploy !== false);
          if (app.update_pending) setShowUpdatePopup(true);

          // BUG FIX: set userStopped based on real status, not assumption
          userStopped.current = ['offline', 'stopped', 'errored'].includes(app.status);
          return app;
        } else {
          setLogs(['❌ App not found in your account!']);
        }
      }
    } catch {
      setLogs(['❌ Failed to fetch app details. Is backend running?']);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [appName]);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const key = localStorage.getItem('cloud_api_key');
    if (!key) { navigate('/login'); return; }
    setApiKey(key);

    fetchAppDetails(key).then(app => {
      if (app) connectWebSocket(app, logMode, false);
    });

    return () => {
      intentionalClose.current = true;
      wsRef.current?.close();
      clearTimeout(reconnectTimer.current);
    };
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Switch log mode (tab click) ────────────────────────────────────────────
  const switchLogMode = useCallback((newMode) => {
    if (!appDetailsRef.current) return;
    setLogMode(newMode);
    logModeRef.current = newMode;
    connectWebSocket(appDetailsRef.current, newMode, false);
  }, [connectWebSocket]);

  // ── Toggle auto-reconnect ──────────────────────────────────────────────────
  const handleToggleAutoReconnect = () => {
    const next = !autoReconnect;
    setAutoReconnect(next);
    autoReconnectRef.current = next;
    localStorage.setItem('nex_auto_reconnect', String(next));

    if (next && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
      connectWebSocket(appDetailsRef.current, logModeRef.current, true);
    }
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleAction = async (type) => {
    setActionType(type);
    setIsActionLoading(true);

    if (type === 'stop') {
      userStopped.current = true;
    } else if (['start', 'restart', 'redeploy', 'git_pull'].includes(type)) {
      userStopped.current = false;
    }
    if (type === 'git_pull') setShowUpdatePopup(false);

    const backendAction = type === 'redeploy' ? 'reset' : type;

    // Switch to build tab for deploy actions
    if (['reset', 'git_pull'].includes(backendAction)) {
      switchLogMode('build');
    }

    try {
      await axios.post(
        `${API_URL}/api/action`,
        { app_name: appName, action: backendAction },
        { headers: { 'x-api-key': apiKey } }
      );

      if (backendAction === 'clear_logs') {
        setLogs([`✅ Logs flushed for ${appName}.`]);
      }

      // BUG FIX: use ref inside timeout so appDetails is never stale
      setTimeout(async () => {
        const fresh = await fetchAppDetails(apiKey);
        if (fresh) appDetailsRef.current = fresh;
        setIsActionLoading(false);
        setActionType('');

        // Reconnect WS if it dropped
        if (
          ['start', 'restart', 'reset', 'git_pull'].includes(backendAction) &&
          (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)
        ) {
          connectWebSocket(appDetailsRef.current, logModeRef.current, true);
        }
      }, 1200);
    } catch (err) {
      addLog(`❌ Action failed: ${err.response?.data?.detail || err.message}`);
      setIsActionLoading(false);
      setActionType('');
    }
  };

  // ── Auto-deploy toggle ─────────────────────────────────────────────────────
  const handleToggleAutoDeploy = async () => {
    if (isToggleLoading) return;
    setIsToggleLoading(true);
    const next = !autoDeploy;
    setAutoDeploy(next);
    try {
      await axios.post(
        `${API_URL}/api/toggle-autodeploy`,
        { app_name: appName, status: next },
        { headers: { 'x-api-key': apiKey } }
      );
      addLog(`> ⚙️ Auto-Deploy is now ${next ? 'ON ✅' : 'OFF 🔴'}`);
    } catch {
      setAutoDeploy(!next);
      addLog('❌ Failed to toggle Auto-Deploy.');
    } finally {
      setIsToggleLoading(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const actionLabel = {
    start:      'IGNITING',
    stop:       'HALTING',
    restart:    'REBOOTING',
    redeploy:   'REBUILDING',
    clear_logs: 'FLUSHING',
    git_pull:   'PULLING',
  }[actionType] || 'PROCESSING';

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Zap size={32} className="text-violet-500 animate-pulse" />
        <p className="text-violet-400 font-mono text-sm tracking-[0.3em] uppercase animate-pulse">
          Initializing Terminal...
        </p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#050505] text-gray-200 flex flex-col overflow-hidden relative">
      <Background />

      {/* ── GitHub Update Popup ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showUpdatePopup && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.96 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-sm
              bg-[#0d0d0f] border border-blue-500/25 rounded-2xl p-5
              shadow-[0_0_60px_rgba(59,130,246,0.12)]"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20
                flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm mb-1">New Push Detected</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  GitHub received a push. Auto-Deploy is OFF — approve manually to deploy.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction('git_pull')}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs
                      font-bold py-2 rounded-lg transition-colors"
                  >
                    Pull & Deploy
                  </button>
                  <button
                    onClick={() => setShowUpdatePopup(false)}
                    className="px-4 bg-white/5 hover:bg-white/10 text-gray-400 text-xs
                      font-bold py-2 rounded-lg transition-colors border border-white/5"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Action Overlay ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isActionLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/70 backdrop-blur-sm
              flex flex-col items-center justify-center gap-5"
          >
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20
              flex items-center justify-center">
              <RotateCw size={28} className="text-violet-400 animate-spin" />
            </div>
            <p className="text-violet-300 font-mono text-sm font-bold tracking-[0.4em] uppercase animate-pulse">
              {actionLabel}...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="shrink-0 z-50 bg-[#09090b]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="px-3 sm:px-5 py-3 flex flex-col gap-3">

          {/* Row 1: back + name + status */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/dashboard"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5
                flex items-center justify-center text-gray-400 hover:text-white transition-all shrink-0"
            >
              <ArrowLeft size={15} />
            </Link>

            <div className="flex items-center gap-2 min-w-0 flex-1">
              <TerminalIcon size={16} className="text-violet-400 shrink-0" />
              <span className="text-sm font-black text-white tracking-widest truncate font-mono uppercase">
                {appName}
              </span>
              {appDetails && <StatusBadge status={appDetails.status} />}
            </div>

            {/* Engine badge */}
            {appDetails && (
              <span className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg
                bg-white/5 border border-white/5 text-gray-500 text-[10px] font-bold
                uppercase tracking-widest shrink-0">
                {appDetails.use_docker ? <Cpu size={10} /> : <Box size={10} />}
                {appDetails.use_docker ? 'Docker' : 'PM2'}
              </span>
            )}
          </div>

          {/* Row 2: action controls */}
          <div className="flex items-center justify-between gap-2">

            {/* Left: Auto-Deploy toggle */}
            <button
              onClick={handleToggleAutoDeploy}
              disabled={isToggleLoading}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5
                hover:bg-white/8 border border-white/5 transition-all disabled:opacity-50"
            >
              <GitBranch size={11} className={autoDeploy ? 'text-blue-400' : 'text-gray-500'} />
              <span className={`text-[10px] font-bold uppercase tracking-widest
                ${autoDeploy ? 'text-blue-400' : 'text-gray-500'}`}>
                Auto
              </span>
              {/* Toggle pill */}
              <div className={`relative w-7 h-4 rounded-full transition-colors
                ${autoDeploy ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all
                  ${autoDeploy ? 'left-3.5' : 'left-0.5'}`} />
              </div>
            </button>

            {/* Right: action buttons */}
            <div className="flex items-center gap-1">
              <ActionBtn onClick={() => handleAction('start')}   disabled={isActionLoading} icon={Play}         label="Start"    colorClass="text-emerald-400 hover:bg-emerald-500/10" />
              <ActionBtn onClick={() => handleAction('restart')} disabled={isActionLoading} icon={RotateCw}     label="Restart"  colorClass="text-violet-400 hover:bg-violet-500/10" />
              <ActionBtn onClick={() => handleAction('stop')}    disabled={isActionLoading} icon={Square}       label="Stop"     colorClass="text-red-400 hover:bg-red-500/10" />
              <div className="w-px h-5 bg-white/10 mx-0.5" />
              <ActionBtn onClick={() => handleAction('git_pull')} disabled={isActionLoading} icon={DownloadCloud} label="Pull"   colorClass="text-sky-400 hover:bg-sky-500/10" />
              <ActionBtn onClick={() => handleAction('redeploy')} disabled={isActionLoading} icon={RefreshCcw}   label="Reset"  colorClass="text-amber-400 hover:bg-amber-500/10" />
            </div>
          </div>
        </div>
      </nav>

      {/* ── Terminal Window ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 p-2 sm:p-4 flex flex-col z-10">
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden
          border border-white/[0.07] bg-[#050507]
          shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_32px_64px_rgba(0,0,0,0.6)]">

          {/* Terminal chrome bar */}
          <div className="shrink-0 h-11 bg-[#0c0c0f] border-b border-white/[0.06]
            flex items-center justify-between px-3 gap-2">

            {/* Left: dots + tabs */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Traffic lights – hidden on very small screens */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors cursor-default" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70 hover:bg-yellow-500 transition-colors cursor-default" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70 hover:bg-emerald-500 transition-colors cursor-default" />
              </div>

              {/* Mode tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-white/[0.04] rounded-lg border border-white/[0.04]">
                <button
                  onClick={() => switchLogMode('runtime')}
                  className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold font-mono
                    tracking-wider transition-all whitespace-nowrap
                    ${logMode === 'runtime'
                      ? 'bg-violet-600/90 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                      : 'text-gray-500 hover:text-gray-300'}`}
                >
                  📡 Runtime
                </button>
                <button
                  onClick={() => switchLogMode('build')}
                  className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold font-mono
                    tracking-wider transition-all whitespace-nowrap
                    ${logMode === 'build'
                      ? 'bg-sky-600/90 text-white shadow-[0_0_12px_rgba(14,165,233,0.4)]'
                      : 'text-gray-500 hover:text-gray-300'}`}
                >
                  🏗️ Build
                </button>
              </div>
            </div>

            {/* Right: WS status + toggles */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Live connection indicator */}
              <WsDot state={wsState} />

              {/* Auto-Reconnect toggle */}
              <button
                onClick={handleToggleAutoReconnect}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04]
                  hover:bg-white/[0.08] border border-white/[0.04] transition-all"
                title="Auto-Reconnect WebSocket"
              >
                <span className={`text-[10px] font-bold font-mono tracking-wider
                  ${autoReconnect ? 'text-emerald-400' : 'text-gray-600'}`}>
                  <span className="hidden sm:inline">AUTO </span>⟲
                </span>
                <div className={`relative w-6 h-3.5 rounded-full transition-colors
                  ${autoReconnect ? 'bg-emerald-600' : 'bg-gray-700'}`}>
                  <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white
                    transition-all ${autoReconnect ? 'left-3' : 'left-0.5'}`} />
                </div>
              </button>

              {/* Flush logs */}
              <button
                onClick={() => handleAction('clear_logs')}
                disabled={isActionLoading || logMode === 'build'}
                title={logMode === 'build' ? 'Cannot flush build logs' : 'Flush PM2 logs'}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md font-mono
                  text-[10px] font-bold transition-all border border-transparent
                  disabled:opacity-25 disabled:cursor-not-allowed
                  bg-white/[0.04] hover:bg-red-500/10 hover:border-red-500/20
                  text-gray-500 hover:text-red-400"
              >
                <Trash2 size={12} />
                <span className="hidden sm:inline">Flush</span>
              </button>
            </div>
          </div>

          {/* ── Log area ────────────────────────────────────────────────── */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4
            font-mono text-[11px] sm:text-[12.5px] leading-relaxed
            scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
            bg-[#050507]">

            {logs.length === 0 ? (
              <span className="text-gray-700 italic">Waiting for logs...</span>
            ) : (
              logs.map((line, i) => (
                <div
                  key={i}
                  className={`break-all whitespace-pre-wrap mb-0.5 ${getLogColor(line, logMode)}`}
                >
                  {line || '\u00A0'}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Bottom gradient fade */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8
            bg-gradient-to-t from-[#050507] to-transparent" />
        </div>
      </div>
    </div>
  );
      }
