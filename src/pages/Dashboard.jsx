import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Terminal, RotateCw, Plus, Box, LogOut, Settings, X,
  Zap, Check, Crown, AlertTriangle, Trash2, Save, FolderGit2,
  FileCode2, MoreVertical, Cpu, Shield, ZapOff, CheckCircle,
  AlertCircle, Info, Loader2, StopCircle, Play,
} from 'lucide-react';
import { FaGithub, FaDocker } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const HEARTBEAT_INTERVAL = 30_000; // 30s

// ─────────────────────────────────────────
// ANIMATIONS
// ─────────────────────────────────────────
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.25, duration: 0.5 } },
};
const scaleIn = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.2 } },
  exit:    { opacity: 0, scale: 0.94, transition: { duration: 0.15 } },
};

// ─────────────────────────────────────────
// TOAST SYSTEM  (replaces all alert() calls)
// ─────────────────────────────────────────
let _addToast = null;

export const toast = {
  success: (msg) => _addToast?.({ type: 'success', msg }),
  error:   (msg) => _addToast?.({ type: 'error',   msg }),
  info:    (msg) => _addToast?.({ type: 'info',    msg }),
};

const TOAST_ICONS = {
  success: <CheckCircle  size={16} className="text-green-400 shrink-0" />,
  error:   <AlertCircle  size={16} className="text-red-400   shrink-0" />,
  info:    <Info         size={16} className="text-blue-400  shrink-0" />,
};
const TOAST_STYLES = {
  success: 'bg-green-500/10 border-green-500/30 text-green-300',
  error:   'bg-red-500/10   border-red-500/30   text-red-300',
  info:    'bg-blue-500/10  border-blue-500/30  text-blue-300',
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _addToast = ({ type, msg }) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, type, msg }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    };
    return () => { _addToast = null; };
  }, []);

  return (
    <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0,  scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-semibold shadow-2xl backdrop-blur-md ${TOAST_STYLES[t.type]}`}
          >
            {TOAST_ICONS[t.type]}
            <span className="leading-snug">{t.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────
// PAYWALL MODAL
// ─────────────────────────────────────────
const PaywallModal = ({ onClose, navigate }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      variants={scaleIn} initial="hidden" animate="visible" exit="exit"
      className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.12)] relative max-h-[92vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-black/60 p-1.5 rounded-full z-20 transition-colors">
        <X size={18} />
      </button>

      {/* Header */}
      <div className="p-6 sm:p-8 text-center border-b border-white/5 bg-gradient-to-b from-purple-900/20 to-transparent shrink-0">
        <div className="w-14 h-14 bg-purple-500/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/25">
          <Crown className="text-purple-400 w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Upgrade to Deploy</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Select a high-performance cloud engine to deploy and scale your applications.
        </p>
      </div>

      {/* Plans */}
      <div className="p-4 sm:p-8 bg-[#050505] overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">

          {/* Starter ₹49 */}
          <div className="bg-white/[0.02] border border-white/10 hover:border-purple-500/25 rounded-2xl p-6 flex flex-col transition-all">
            <div className="mb-1">
              <h3 className="text-lg font-bold text-white">NEX Starter</h3>
              <p className="text-gray-500 text-xs mt-0.5">Perfect for small bots & personal projects.</p>
            </div>
            <div className="text-3xl font-black text-white my-5">
              ₹49<span className="text-base text-gray-500 font-normal">/mo</span>
            </div>
            <div className="space-y-3 mb-6 flex-1">
              {['2 Core High-Speed CPU','8 GB Dedicated RAM','Unlimited Bandwidth','Zero Downtime (24/7)','Standard Network Speed'].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <Check size={15} className="text-purple-400 shrink-0" /> {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/payment', { state: { plan: '49' } })}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              Select Starter
            </button>
          </div>

          {/* Overlord ₹89 */}
          <div className="bg-purple-900/10 border border-purple-500/40 rounded-2xl p-6 flex flex-col relative shadow-[0_0_30px_rgba(168,85,247,0.12)] md:-translate-y-2">
            <div className="absolute top-0 inset-x-0 flex justify-center">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-b-lg">
                Most Popular
              </span>
            </div>
            <div className="mt-3 mb-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                NEX Overlord <Zap size={16} className="text-yellow-400" />
              </h3>
              <p className="text-purple-300/60 text-xs mt-0.5">Extreme power for production-grade apps.</p>
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent my-5">
              ₹89<span className="text-base text-gray-500 font-normal not-italic" style={{WebkitTextFillColor:'rgba(156,163,175,1)' }}>/mo</span>
            </div>
            <div className="space-y-3 mb-6 flex-1">
              {['4 Core Ultra-Fast CPU','16 GB DDR4 RAM','Unlimited Deployments','Advanced DDoS Protection','Priority Support Desk','10 Gbps Uplink Speed'].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-white font-medium">
                  <Zap size={15} className="text-yellow-400 shrink-0" /> {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/payment', { state: { plan: '89' } })}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-[0_0_18px_rgba(168,85,247,0.35)]"
            >
              Deploy with Overlord
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ─────────────────────────────────────────
// MANAGE APP MODAL
// ─────────────────────────────────────────
const ManageAppModal = ({ onClose, app, apiKey, onRefresh }) => {
  const [tab, setTab]       = useState('env');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [envText, setEnvText]       = useState('');
  const [repoDetails, setRepoDetails] = useState({ url: '', name: '', cmd: '' });

  // Populate on mount / app change
  useEffect(() => {
    if (!app) return;
    setRepoDetails({ url: app.repo_url || '', name: app.repo_name || '', cmd: app.start_cmd || '' });
    if (app.env_vars && typeof app.env_vars === 'object') {
      setEnvText(Object.entries(app.env_vars).map(([k, v]) => `${k}=${v}`).join('\n'));
    } else {
      setEnvText('');
    }
    setConfirmDelete(false);
    setTab('env');
  }, [app]);

  if (!app) return null;

  const withLoading = async (fn) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };

  const handleSaveEnv = () => withLoading(async () => {
    const env_vars = {};
    envText.split('\n').forEach((line) => {
      const m = line.match(/^([^=]+)=(.*)$/);
      if (m) env_vars[m[1].trim()] = m[2]; // BUG FIX: don't trim value
    });
    try {
      await axios.post(`${API_URL}/api/edit-env`, { app_name: app.pm2_name, env_vars }, { headers: { 'x-api-key': apiKey } });
      toast.success('ENV saved! Restart the app to apply changes.');
      onRefresh();
    } catch (err) {
      toast.error('Failed to save ENV: ' + (err.response?.data?.detail || err.message));
    }
  });

  const handleSaveRepo = () => withLoading(async () => {
    try {
      await axios.post(`${API_URL}/api/edit-repo`, {
        app_name:      app.pm2_name,
        new_repo_url:  repoDetails.url.trim(),
        new_repo_name: repoDetails.name.trim(),
        new_start_cmd: repoDetails.cmd.trim(),
      }, { headers: { 'x-api-key': apiKey } });
      toast.success('Repo config updated! Reset app to pull new code.');
      onRefresh();
    } catch (err) {
      toast.error('Failed to update repo: ' + (err.response?.data?.detail || err.message));
    }
  });

  const handleDelete = () => withLoading(async () => {
    try {
      await axios.post(`${API_URL}/api/delete-bot`, { app_name: app.pm2_name }, { headers: { 'x-api-key': apiKey } });
      toast.success(`${app.pm2_name} deleted successfully.`);
      onClose();
      onRefresh();
    } catch (err) {
      toast.error('Delete failed: ' + (err.response?.data?.detail || err.message));
      setConfirmDelete(false);
    }
  });

  const tabs = [
    { id: 'env',    label: 'Variables', icon: FileCode2, color: 'purple' },
    { id: 'repo',   label: 'Source',    icon: FolderGit2, color: 'blue' },
    { id: 'danger', label: 'Danger',    icon: AlertTriangle, color: 'red' },
  ];

  const tabColor = { purple: 'text-purple-400 border-purple-400 bg-purple-500/5', blue: 'text-blue-400 border-blue-400 bg-blue-500/5', red: 'text-red-400 border-red-400 bg-red-500/5' };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', bounce: 0.2 }}
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/8 bg-black/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Settings size={16} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm leading-tight">{app.pm2_name}</h3>
              <p className="text-gray-600 text-xs">App Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-white/8 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8 bg-black/20 shrink-0 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-3 text-xs font-bold flex justify-center items-center gap-1.5 transition-colors whitespace-nowrap min-w-[80px] border-b-2
                ${tab === id ? `${tabColor[color]} border-current` : 'text-gray-500 hover:text-gray-300 border-transparent'}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 bg-[#050505] overflow-y-auto flex-1 min-h-[280px]">
          <AnimatePresence mode="wait">

            {/* ENV Tab */}
            {tab === 'env' && (
              <motion.div key="env" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <p className="text-xs text-gray-500 mb-3">
                  One variable per line. Format: <code className="text-purple-400 bg-purple-500/10 px-1 rounded">KEY=VALUE</code>
                </p>
                <textarea
                  value={envText}
                  onChange={(e) => setEnvText(e.target.value)}
                  placeholder={"BOT_TOKEN=123456789:ABCdef\nMONGO_URL=mongodb+srv://..."}
                  spellCheck={false}
                  className="w-full h-44 bg-black border border-white/8 rounded-xl p-3.5 text-sm font-mono text-green-400 focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-gray-700 resize-none mb-4"
                />
                <button
                  onClick={handleSaveEnv}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 transition-all text-sm"
                  style={{ boxShadow: '0 0 18px rgba(168,85,247,0.25)' }}
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {loading ? 'Saving...' : 'Save .env File'}
                </button>
              </motion.div>
            )}

            {/* Repo Tab */}
            {tab === 'repo' && (
              <motion.div key="repo" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">GitHub Repository URL</label>
                  <input
                    type="text" value={repoDetails.url}
                    onChange={(e) => setRepoDetails((p) => ({ ...p, url: e.target.value }))}
                    className="w-full bg-black border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                    placeholder="https://github.com/user/repo"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Repo Name</label>
                    <input
                      type="text" value={repoDetails.name}
                      onChange={(e) => setRepoDetails((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-black border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="my-bot"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Command</label>
                    <input
                      type="text" value={repoDetails.cmd}
                      onChange={(e) => setRepoDetails((p) => ({ ...p, cmd: e.target.value }))}
                      className="w-full bg-black border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                      placeholder="python3 main.py"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveRepo}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 transition-all text-sm"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {loading ? 'Updating...' : 'Update Config'}
                </button>
              </motion.div>
            )}

            {/* Danger Tab */}
            {tab === 'danger' && (
              <motion.div key="danger" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="text-center py-4">
                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">Delete Application</h3>
                <p className="text-red-400/70 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                  This permanently deletes the app, its environment variables, and all server files. <strong className="text-red-400">Cannot be undone.</strong>
                </p>

                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all text-sm"
                  >
                    <AlertTriangle size={16} /> Delete this Application
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/8 border border-red-500/25 p-4 rounded-2xl text-left">
                    <p className="text-white font-bold mb-1 text-sm flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-500" /> Are you absolutely sure?
                    </p>
                    <p className="text-red-300/60 text-xs mb-4">This action cannot be reversed.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        disabled={loading}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl border border-white/10 text-sm transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 text-sm transition-all"
                        style={{ boxShadow: '0 0 14px rgba(220,38,38,0.35)' }}
                      >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        {loading ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────
// APP CARD
// ─────────────────────────────────────────
const AppCard = ({ app, apiKey, onManage, onNavigate, onRefresh }) => {
  // Per-card action loading states  — BUG FIX: was global before
  const [actionLoading, setActionLoading] = useState(null); // 'restart' | 'stop' | 'start'

  const triggerAction = async (action) => {
    if (actionLoading) return;
    setActionLoading(action);
    try {
      await axios.post(
        `${API_URL}/api/action`,
        { app_name: app.pm2_name, action },
        { headers: { 'x-api-key': apiKey } },
      );
      toast.success(`${app.pm2_name} → ${action} successful!`);
      // Small delay so PM2 has time to update status
      setTimeout(onRefresh, 1200);
    } catch (err) {
      toast.error(`${action} failed: ` + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const isOnline = app.status === 'online';

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white/[0.025] border border-white/8 hover:border-purple-500/35 rounded-2xl p-5 transition-all group flex flex-col backdrop-blur-sm"
      style={{ boxShadow: isOnline ? '0 0 0 0 transparent' : undefined }}
      whileHover={{ y: -3, boxShadow: '0 0 24px rgba(168,85,247,0.08)' }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
    >
      {/* Top row */}
      <div className="flex justify-between items-start mb-3">
        <div className="overflow-hidden">
          <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate leading-tight">
            {app.pm2_name}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-1 font-medium">
            <FaGithub size={11} />
            <span className="truncate">{app.repo_name || 'unknown'}</span>
          </div>
        </div>

        {/* Status badge */}
        <div className={`shrink-0 ml-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border
          ${isOnline
            ? 'bg-green-500/10 border-green-500/25 text-green-400'
            : 'bg-red-500/10 border-red-500/25 text-red-400'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {app.status || 'stopped'}
        </div>
      </div>

      {/* Engine badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/4 border border-white/8 text-gray-400 px-2.5 py-1 rounded-lg">
          {app.use_docker ? <><FaDocker size={11} className="text-blue-400" /> Docker</> : <><Cpu size={11} className="text-purple-400" /> PM2</>}
        </span>
      </div>

      {/* Memory / CPU stats if available */}
      {(app.memory || app.cpu !== undefined) && (
        <div className="flex gap-3 mb-4 text-[11px] text-gray-600 font-mono">
          {app.cpu  !== undefined && <span>CPU <span className="text-gray-400">{app.cpu}%</span></span>}
          {app.memory               && <span>MEM <span className="text-gray-400">{app.memory}</span></span>}
          {app.uptime               && <span>UP <span className="text-gray-400">{app.uptime}</span></span>}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {/* Restart */}
          <button
            onClick={() => triggerAction('restart')}
            disabled={!!actionLoading}
            title="Restart"
            className="p-2 bg-white/4 hover:bg-purple-600/20 text-gray-500 hover:text-purple-400 rounded-lg transition-all border border-transparent hover:border-purple-500/25 disabled:opacity-40"
          >
            {actionLoading === 'restart'
              ? <Loader2 size={15} className="animate-spin text-purple-400" />
              : <RotateCw size={15} />}
          </button>

          {/* Stop / Start toggle */}
          <button
            onClick={() => triggerAction(isOnline ? 'stop' : 'start')}
            disabled={!!actionLoading}
            title={isOnline ? 'Stop' : 'Start'}
            className={`p-2 rounded-lg transition-all border border-transparent disabled:opacity-40
              ${isOnline
                ? 'bg-white/4 hover:bg-red-600/20 text-gray-500 hover:text-red-400 hover:border-red-500/25'
                : 'bg-white/4 hover:bg-green-600/20 text-gray-500 hover:text-green-400 hover:border-green-500/25'}`}
          >
            {actionLoading === 'stop' || actionLoading === 'start'
              ? <Loader2 size={15} className="animate-spin" />
              : isOnline ? <StopCircle size={15} /> : <Play size={15} />}
          </button>

          {/* Terminal */}
          <button
            onClick={() => onNavigate(app.pm2_name)}
            title="Open Terminal & Logs"
            className="p-2 bg-white/4 hover:bg-blue-600/20 text-gray-500 hover:text-blue-400 rounded-lg transition-all border border-transparent hover:border-blue-500/25"
          >
            <Terminal size={15} />
          </button>
        </div>

        <button
          onClick={() => onManage(app)}
          className="text-[11px] font-bold text-gray-500 hover:text-white flex items-center gap-1.5 px-3 py-2 bg-white/4 rounded-lg hover:bg-white/8 transition-colors border border-white/5 hover:border-white/15"
        >
          <Settings size={13} /> Manage
        </button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="space-y-2">
        <div className="h-4 w-28 bg-white/8 rounded-lg" />
        <div className="h-3 w-20 bg-white/5 rounded-lg" />
      </div>
      <div className="h-6 w-16 bg-white/5 rounded-full" />
    </div>
    <div className="h-6 w-16 bg-white/5 rounded-lg mb-4" />
    <div className="pt-4 border-t border-white/5 flex justify-between">
      <div className="flex gap-1.5">
        {[1,2,3].map(i => <div key={i} className="w-8 h-8 bg-white/5 rounded-lg" />)}
      </div>
      <div className="w-20 h-8 bg-white/5 rounded-lg" />
    </div>
  </div>
);

// ─────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────
export default function Dashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [services, setServices]       = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [username, setUsername]       = useState('Commander');
  const [apiKey, setApiKey]           = useState('');
  const [isPremium, setIsPremium]     = useState(() => localStorage.getItem('cloud_is_premium') === 'true');
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isManageOpen, setIsManageOpen]   = useState(false);
  const [selectedApp, setSelectedApp]     = useState(null);

  // ── Fetch dashboard data
  const fetchDashboardData = useCallback(async (key) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/services`, {
        headers: { 'x-api-key': key },
      });
      if (res.data.status === 'success') {
        setServices(res.data.data || []);
        const premium = Boolean(res.data.is_premium);
        setIsPremium(premium);
        localStorage.setItem('cloud_is_premium', String(premium));
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      // BUG FIX: don't reset premium on network error — keep last known value
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Init
  useEffect(() => {
    const key  = localStorage.getItem('cloud_api_key');
    const user = localStorage.getItem('cloud_username');
    if (!key) { navigate('/login'); return; }

    setApiKey(key);
    if (user) setUsername(user);
    fetchDashboardData(key);

    // BUG FIX: clear location state after reading so paywall doesn't re-open on refresh
    if (location.state?.showPaywall) {
      setIsPaywallOpen(true);
      window.history.replaceState({}, '');
    }
  }, [navigate, fetchDashboardData]);

  // ── Heartbeat — BUG FIX: separate from fetchDashboardData (lightweight profile check)
  useEffect(() => {
    const key = localStorage.getItem('cloud_api_key');
    if (!key) return;

    const check = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/profile`, {
          headers: { 'x-api-key': key },
          timeout: 8000,
        });
        if (res.data?.data?.is_suspended) {
          localStorage.setItem('cloud_is_suspended', 'true');
          navigate('/suspended');
        }
      } catch (err) {
        if (err.response?.status === 403) {
          localStorage.setItem('cloud_is_suspended', 'true');
          navigate('/suspended');
        }
        // network errors — ignore silently
      }
    };

    const interval = setInterval(check, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // BUG FIX: non-premium deploy click — prevent navigation properly
  const handleDeployClick = (e) => {
    if (!isPremium) {
      e.preventDefault();
      e.stopPropagation();
      setIsPaywallOpen(true);
    }
  };

  const openManage = (app) => { setSelectedApp(app); setIsManageOpen(true); };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative selection:bg-purple-500/30 pb-20">
      <Background />
      <ToastContainer />

      {/* ── Modals */}
      <AnimatePresence>
        {isPaywallOpen && (
          <PaywallModal key="paywall" onClose={() => setIsPaywallOpen(false)} navigate={navigate} />
        )}
        {isManageOpen && selectedApp && (
          <ManageAppModal
            key="manage"
            onClose={() => setIsManageOpen(false)}
            app={selectedApp}
            apiKey={apiKey}
            onRefresh={() => fetchDashboardData(apiKey)}
          />
        )}
      </AnimatePresence>

      {/* ── Navbar */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-lg tracking-widest hover:scale-105 transition-transform">
            <Server className="text-purple-500 w-5 h-5" /> NEX<span className="text-purple-500">CLOUD</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0">
                {username.charAt(0).toUpperCase()}
                {isPremium && (
                  <div className="absolute -bottom-1 -right-1 bg-[#050505] rounded-full p-0.5">
                    <Crown size={10} className="text-yellow-400" />
                  </div>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-semibold text-gray-300">{username}</span>
            </Link>

            <Link to="/support" title="Support" className="p-2 text-gray-500 hover:text-white bg-white/4 hover:bg-white/8 rounded-xl transition-colors">
              <MoreVertical size={17} />
            </Link>

            <button onClick={handleLogout} title="Logout" className="p-2 text-gray-500 hover:text-red-400 bg-white/4 hover:bg-red-500/10 rounded-xl transition-colors">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-8 relative z-10">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-0.5">
              Your Applications
            </h1>
            <p className="text-gray-500 text-sm">
              {isLoading ? 'Loading...' : `${services.length} app${services.length !== 1 ? 's' : ''} deployed`}
            </p>
          </div>

          {/* BUG FIX: wrap in div for non-premium — Link won't navigate if premium=false */}
          {isPremium ? (
            <Link
              to="/deploy"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-sm w-full sm:w-auto justify-center"
              style={{ boxShadow: '0 0 20px rgba(168,85,247,0.28)' }}
            >
              <Plus size={16} /> Deploy New App
            </Link>
          ) : (
            <button
              onClick={handleDeployClick}
              className="bg-purple-600/80 hover:bg-purple-600 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-sm w-full sm:w-auto justify-center border border-purple-500/30"
              style={{ boxShadow: '0 0 16px rgba(168,85,247,0.2)' }}
            >
              <Crown size={15} className="text-yellow-300" /> Upgrade to Deploy
            </button>
          )}
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white/[0.02] border border-white/8 border-dashed rounded-2xl py-20 px-6"
          >
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-purple-500/15">
              <Box className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Applications Yet</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-7 leading-relaxed">
              You haven't deployed any code yet. Connect a GitHub repo to get started.
            </p>
            {isPremium ? (
              <Link to="/deploy" className="bg-white/8 hover:bg-white/12 text-white font-bold px-7 py-2.5 rounded-xl transition-all border border-white/10 inline-flex items-center gap-2 text-sm">
                Create First Deployment
              </Link>
            ) : (
              <button onClick={() => setIsPaywallOpen(true)} className="bg-white/8 hover:bg-white/12 text-white font-bold px-7 py-2.5 rounded-xl transition-all border border-white/10 inline-flex items-center gap-2 text-sm">
                <Crown size={15} className="text-yellow-400" /> Upgrade to Deploy
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={stagger} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {services.map((app) => (
              <AppCard
                key={app.id || app.pm2_name}
                app={app}
                apiKey={apiKey}
                onManage={openManage}
                onNavigate={(name) => navigate(`/app/${name}`)}
                onRefresh={() => fetchDashboardData(apiKey)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
