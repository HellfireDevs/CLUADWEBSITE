import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Folder, Terminal, Lock, Play, Cpu, ArrowRight, ArrowLeft,
  CheckCircle, Loader2, AlertCircle, Box, Search, Rocket, Trash2,
  Plus, ShieldAlert, Clipboard, Eye, EyeOff, X, AlertTriangle, Zap
} from 'lucide-react';
import { FaGithub, FaDocker } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

// ─────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────
const slide = {
  hidden:  { opacity: 0, x: 40, scale: 0.98 },
  visible: { opacity: 1, x: 0,  scale: 1, transition: { duration: 0.35, type: 'spring', bounce: 0.15 } },
  exit:    { opacity: 0, x: -40, scale: 0.98, transition: { duration: 0.2 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.3 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

/** App name sanitizer: spaces/hyphens → underscore, lowercase, strip special chars */
const sanitizeAppName = (raw) =>
  raw.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');

/** Extract repo name from GitHub URL */
const extractRepoName = (url) => {
  if (!url.includes('github.com')) return '';
  const parts = url.replace(/\/$/, '').split('/');
  return parts[parts.length - 1].replace(/\.git$/, '');
};

/** Validate step 1 fields */
const validateStep1 = (formData) => {
  if (!formData.app_name.trim()) return 'App Name is required.';
  if (formData.app_name.trim().length < 3) return 'App Name must be at least 3 characters.';
  if (!formData.repo_url.trim()) return 'Repository URL is required.';
  if (!formData.repo_url.includes('github.com')) return 'Please enter a valid GitHub repository URL.';
  return null;
};

/** Validate step 3 fields */
const validateStep3 = (formData) => {
  if (['ppam2', 'vip_pm2'].includes(formData.engine) && !formData.start_cmd.trim())
    return 'Start Command is required for this engine.';
  return null;
};

// ─────────────────────────────────────────
// CONFIRM DEPLOY MODAL
// ─────────────────────────────────────────
const ConfirmModal = ({ formData, onConfirm, onCancel, isLoading }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      transition={{ type: 'spring', bounce: 0.25 }}
      className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      style={{ boxShadow: '0 0 60px rgba(168,85,247,0.15)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Rocket size={18} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Confirm Deployment</h3>
            <p className="text-gray-500 text-xs">Review before igniting 🚀</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-gray-600 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Summary */}
      <div className="bg-black/50 border border-white/5 rounded-xl p-4 space-y-3 mb-5 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">App Name</span>
          <span className="text-purple-400 font-bold">{formData.app_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Engine</span>
          <span className={`font-bold ${
            formData.engine === 'ppam2'   ? 'text-purple-400' :
            formData.engine === 'vip_pm2' ? 'text-red-400'    : 'text-blue-400'
          }`}>
            {{ ppam2: 'Public PM2 (PPAM2)', vip_pm2: 'VIP PM2', docker: 'Pure Docker' }[formData.engine]}
          </span>
        </div>
        {formData.start_cmd && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-500 shrink-0">Start CMD</span>
            <span className="text-green-400 text-right truncate">{formData.start_cmd}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">ENV Vars</span>
          <span className="text-yellow-400">
            {formData.envPairs.filter(p => p.key.trim()).length} variable(s)
          </span>
        </div>
        <div className="pt-2 border-t border-white/5">
          <span className="text-gray-500 block mb-1">Repo</span>
          <span className="text-gray-300 text-xs break-all">{formData.repo_url}</span>
        </div>
      </div>

      {/* Warning for VIP */}
      {formData.engine === 'vip_pm2' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2 mb-4 text-xs text-red-400">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          VIP PM2 runs directly on the host server. Admin approval may be required.
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-bold text-sm transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-green-600/40 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
          style={{ boxShadow: isLoading ? 'none' : '0 0 24px rgba(34,197,94,0.35)' }}
        >
          {isLoading
            ? <><Loader2 size={15} className="animate-spin" /> Igniting...</>
            : <><Zap size={15} /> Confirm & Deploy</>}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─────────────────────────────────────────
// ENV ROW COMPONENT
// ─────────────────────────────────────────
const EnvRow = ({ pair, index, onChange, onRemove }) => {
  const [hidden, setHidden] = useState(true);

  const handlePaste = async (field) => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(index, field, text.trim());
    } catch {
      // clipboard permission denied — silent
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className="flex flex-col sm:flex-row gap-2 sm:items-center bg-white/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-white/5 sm:border-none"
    >
      {/* KEY */}
      <div className="relative w-full sm:w-[38%]">
        <input
          type="text"
          placeholder="KEY (e.g. BOT_TOKEN)"
          value={pair.key}
          onChange={(e) => onChange(index, 'key', e.target.value.toUpperCase().replace(/\s/g, '_'))}
          className="w-full bg-black border border-white/10 focus:border-purple-500/70 text-purple-400 placeholder-gray-700 rounded-lg px-3 py-2.5 outline-none font-mono text-sm transition-all"
        />
      </div>

      {/* VALUE */}
      <div className="relative flex-1">
        <input
          type={hidden ? 'password' : 'text'}
          placeholder="VALUE"
          value={pair.value}
          onChange={(e) => onChange(index, 'value', e.target.value)}
          className="w-full bg-black border border-white/10 focus:border-purple-500/70 text-green-400 placeholder-gray-700 rounded-lg px-3 py-2.5 pr-20 outline-none font-mono text-sm transition-all"
        />
        {/* Eye + Paste buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          <button
            type="button"
            onClick={() => handlePaste('value')}
            title="Paste from clipboard"
            className="p-1.5 text-gray-600 hover:text-purple-400 transition-colors"
          >
            <Clipboard size={13} />
          </button>
          <button
            type="button"
            onClick={() => setHidden(!hidden)}
            title={hidden ? 'Show value' : 'Hide value'}
            className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors"
          >
            {hidden ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(index)}
        className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        title="Remove"
      >
        <Trash2 size={15} />
      </button>
    </motion.div>
  );
};

// ─────────────────────────────────────────
// MAIN DEPLOY PAGE
// ─────────────────────────────────────────
export default function Deploy() {
  const navigate = useNavigate();
  const isDeploying = useRef(false); // BUG FIX: double-click guard

  const [step, setStep]           = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // GitHub states
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [repos, setRepos]                         = useState([]);
  const [searchQuery, setSearchQuery]             = useState('');
  const [isLoadingRepos, setIsLoadingRepos]       = useState(false);

  const [formData, setFormData] = useState({
    app_name:  '',
    repo_url:  '',
    repo_name: '',
    envPairs:  [{ key: '', value: '' }],
    engine:    'ppam2',
    start_cmd: '',
  });

  // ── Auth guard + fetch repos
  useEffect(() => {
    const apiKey = localStorage.getItem('cloud_api_key');
    if (!apiKey) { navigate('/login'); return; }
    fetchGitHubRepos(apiKey);
  }, [navigate]);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // ── Fetch GitHub repos
  const fetchGitHubRepos = async (apiKey) => {
    setIsLoadingRepos(true);
    try {
      const res = await axios.get(`${API_URL}/api/github/repos`, {
        headers: { 'x-api-key': apiKey },
      });
      if (res.data.status === 'connected') {
        setIsGithubConnected(true);
        setRepos(res.data.repos || []);
      } else {
        setIsGithubConnected(false);
      }
    } catch {
      setIsGithubConnected(false);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  // ── GitHub OAuth redirect
  const handleGithubConnect = async () => {
    // BUG FIX: fallback to stored username, never hardcode "user"
    const username = localStorage.getItem('cloud_username') || localStorage.getItem('cloud_email') || '';
    try {
      const res = await axios.get(`${API_URL}/api/github/login`, {
        params: username ? { username } : {},
      });
      if (res.data.url) window.location.href = res.data.url;
    } catch {
      setError('Failed to connect to GitHub. Try again.');
    }
  };

  // ── Form field handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = value;

    // BUG FIX: auto-sanitize app_name as user types
    if (name === 'app_name') updated = sanitizeAppName(value);

    setFormData((prev) => ({ ...prev, [name]: updated }));
    if (error) setError('');
  };

  // BUG FIX: trailing slash + .git strip + whitespace trim
  const handleUrlChange = (e) => {
    const url = e.target.value.trim();
    const repoName = extractRepoName(url);
    setFormData((prev) => ({ ...prev, repo_url: url, repo_name: repoName }));
    if (error) setError('');
  };

  const selectRepo = (repo) => {
    setFormData((prev) => ({ ...prev, repo_url: repo.url, repo_name: repo.name }));
    if (error) setError('');
  };

  // ── ENV handlers
  const handleEnvChange = (index, field, value) => {
    const pairs = [...formData.envPairs];
    pairs[index] = { ...pairs[index], [field]: value };
    setFormData((prev) => ({ ...prev, envPairs: pairs }));
  };

  const addEnvPair   = () => setFormData((prev) => ({ ...prev, envPairs: [...prev.envPairs, { key: '', value: '' }] }));
  const removeEnvPair = (i) => {
    if (formData.envPairs.length === 1) {
      // Keep at least one row, just clear it
      setFormData((prev) => ({ ...prev, envPairs: [{ key: '', value: '' }] }));
      return;
    }
    setFormData((prev) => ({ ...prev, envPairs: prev.envPairs.filter((_, idx) => idx !== i) }));
  };

  // ── Step navigation
  const handleNext = () => {
    if (step === 1) {
      const err = validateStep1(formData);
      if (err) { setError(err); return; }
    }
    setError('');
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  // ── Open confirm modal (with step 3 validation)
  const handleDeployClick = () => {
    const err = validateStep3(formData);
    if (err) { setError(err); return; }
    setError('');
    setShowConfirm(true);
  };

  // ── Actual deploy (called from modal confirm)
  // BUG FIX: isDeploying ref prevents double submission
  const handleDeploy = useCallback(async () => {
    if (isDeploying.current) return;
    isDeploying.current = true;
    setIsLoading(true);
    setError('');

    const API_KEY = localStorage.getItem('cloud_api_key');
    const headers = { 'x-api-key': API_KEY };

    try {
      // 1. Inject ENV vars (non-empty pairs only)
      const envContent = formData.envPairs
        .filter((p) => p.key.trim() !== '')
        .map((p) => `${p.key.trim()}=${p.value}`)  // BUG FIX: don't trim values (passwords may have spaces)
        .join('\n');

      if (envContent) {
        try {
          await axios.post(
            `${API_URL}/api/inject-env`,
            { app_name: formData.app_name, env_content: envContent },
            { headers },
          );
        } catch (envErr) {
          // BUG FIX: surface env injection failure to user instead of silently swallowing
          const msg = envErr.response?.data?.detail || 'ENV injection failed';
          throw new Error(`ENV Setup Failed: ${msg}`);
        }
      }

      // 2. Route to correct endpoint
      const endpointMap = {
        ppam2:   '/api/deploy-ppam2',
        vip_pm2: '/api/deploy-vip-pm2',
        docker:  '/api/deploy-docker',
      };

      const payload = {
        repo_url:  formData.repo_url,
        repo_name: formData.repo_name,
        app_name:  formData.app_name,
        ...(formData.start_cmd.trim() && { start_cmd: formData.start_cmd.trim() }),
      };

      const res = await axios.post(`${API_URL}${endpointMap[formData.engine]}`, payload, { headers });

      if (res.data.status === 'success') {
        setSuccess('Deployment Initiated! Taking you to the terminal...');
        setShowConfirm(false);
        setTimeout(() => navigate(`/app/${formData.app_name}`, { state: { isNewDeploy: true } }), 2000);
      } else {
        throw new Error(res.data.detail || 'Unknown server response.');
      }
    } catch (err) {
      setShowConfirm(false);
      setError(err.response?.data?.detail || err.message || 'Deployment failed. Check your config and try again.');
    } finally {
      setIsLoading(false);
      isDeploying.current = false;
    }
  }, [formData, navigate, API_URL]);

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative selection:bg-purple-500/30 pb-24">
      <Background />

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmModal
            formData={formData}
            onConfirm={handleDeploy}
            onCancel={() => !isLoading && setShowConfirm(false)}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>

      {/* ── NAVBAR */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-lg tracking-widest hover:scale-105 transition-transform">
            <Server className="text-purple-500 w-5 h-5" /> NEX<span className="text-purple-500">CLOUD</span>
          </Link>
          <Link to="/dashboard" className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-2 font-medium">
            <ArrowLeft size={15} /> Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 mt-8 relative z-10">

        {/* ── Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Deploy New Application</h1>
          <p className="text-gray-500 text-sm">Configure source, environment, and execution engine.</p>
        </div>

        {/* ── Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-5 w-full h-px bg-white/5 -z-10" />
          <div
            className="absolute left-0 top-5 h-px bg-gradient-to-r from-purple-600 to-purple-400 -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {[
            { num: 1, title: 'Source',      Icon: FaGithub },
            { num: 2, title: 'Environment', Icon: Lock },
            { num: 3, title: 'Execute',     Icon: Cpu },
          ].map(({ num, title, Icon }) => (
            <div key={num} className="flex flex-col items-center gap-2 bg-[#050505] px-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${step > num  ? 'bg-purple-600 border-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]' :
                  step === num ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]' :
                                 'bg-[#0a0a0a] border-white/10 text-gray-600'}`}>
                {step > num ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= num ? 'text-purple-400' : 'text-gray-600'}`}>
                {title}
              </span>
            </div>
          ))}
        </div>

    {/* ── Global Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div key="err" variants={fadeUp} initial="hidden" animate="visible" exit="exit"
              className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-start gap-3 text-sm font-semibold">
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <p>{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-500/60 hover:text-red-400 transition-colors"><X size={15} /></button>
            </motion.div>
          )}
          {success && (
            <motion.div key="ok" variants={fadeUp} initial="hidden" animate="visible" exit="exit"
              className="mb-5 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold">
              <CheckCircle size={17} className="shrink-0" />
              <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Card */}
        <div className="bg-white/[0.025] border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl relative overflow-hidden min-h-[440px]"
          style={{ boxShadow: '0 0 80px rgba(168,85,247,0.05)' }}>

          {/* top glow line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">

              {/* ══════ STEP 1: SOURCE ══════ */}
              {step === 1 && (
                <motion.div key="s1" variants={slide} initial="hidden" animate="visible" exit="exit" className="space-y-5">

                  {/* App Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Application Name <span className="text-purple-500">*</span>
                    </label>
                    <div className="relative">
                      <Box size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      <input
                        type="text" name="app_name" value={formData.app_name}
                        onChange={handleChange}
                        placeholder="e.g., nex_core_bot"
                        maxLength={40}
                        className="w-full bg-black/60 border border-white/8 focus:border-purple-500/60 text-white placeholder-gray-700 rounded-xl px-4 py-3 pl-10 outline-none transition-all text-sm font-mono"
                        style={{ focusShadow: '0 0 15px rgba(168,85,247,0.2)' }}
                      />
                      {/* live preview of sanitized name */}
                      {formData.app_name && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-purple-500/60 font-mono">
                          /{formData.app_name}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 ml-1">Spaces & hyphens auto-converted to underscore.</p>
                  </div>

                  {/* Repo URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Repository URL <span className="text-purple-500">*</span>
                    </label>
                    <div className="relative">
                      <FaGithub size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      <input
                        type="text" name="repo_url" value={formData.repo_url}
                        onChange={handleUrlChange}
                        placeholder="https://github.com/user/repo"
                        className="w-full bg-black/60 border border-white/8 focus:border-purple-500/60 text-white placeholder-gray-700 rounded-xl px-4 py-3 pl-10 outline-none transition-all text-sm"
                      />
                    </div>
                    {formData.repo_name && (
                      <p className="text-[11px] text-green-500/70 ml-1 flex items-center gap-1">
                        <CheckCircle size={10} /> Detected: <span className="font-mono">{formData.repo_name}</span>
                      </p>
                    )}
                  </div>

                  {/* ── GitHub Import Section */}
                  <div className="mt-6 pt-5 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FaGithub size={16} className="text-gray-400" /> Import from GitHub
                      </h3>
                      {!isGithubConnected && (
                        <button
                          onClick={handleGithubConnect}
                          className="bg-white/8 hover:bg-white/15 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 border border-white/10"
                        >
                          Connect <ArrowRight size={11} />
                        </button>
                      )}
                      {isGithubConnected && (
                        <span className="text-[11px] text-green-500 flex items-center gap-1 font-bold">
                          <CheckCircle size={11} /> Connected
                        </span>
                      )}
                    </div>

                    {isLoadingRepos ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-purple-500 w-6 h-6" />
                      </div>
                    ) : !isGithubConnected ? (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-6 text-center">
                        <FaGithub size={36} className="mx-auto text-gray-700 mb-3" />
                        <p className="text-sm text-gray-500 mb-4">Connect GitHub to browse your private &amp; public repos.</p>
                        <button
                          onClick={handleGithubConnect}
                          className="bg-[#1a1a1a] hover:bg-[#242424] border border-white/10 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all inline-flex items-center gap-2"
                        >
                          <FaGithub size={15} /> Connect with GitHub
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                          <input
                            type="text" placeholder="Search repos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/60 border border-white/8 text-sm text-white rounded-lg px-4 py-2 pl-9 outline-none focus:border-purple-500/50 transition-all placeholder-gray-700"
                          />
                          {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                              <X size={13} />
                            </button>
                          )}
                        </div>

                        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1
                          scrollbar-thin scrollbar-thumb-white/8 scrollbar-track-transparent">
                          {filteredRepos.length > 0 ? filteredRepos.map((repo) => (
                            <div
                              key={repo.id}
                              className={`flex justify-between items-center p-3 rounded-xl transition-all border cursor-pointer
                                ${formData.repo_url === repo.url
                                  ? 'bg-purple-500/10 border-purple-500/40'
                                  : 'bg-black/30 border-white/5 hover:bg-white/[0.04] hover:border-white/10'}`}
                              onClick={() => selectRepo(repo)}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                  {repo.private
                                    ? <Lock size={13} className="text-yellow-500" />
                                    : <Folder size={13} className="text-gray-400" />}
                                </div>
                                <div className="truncate">
                                  <p className="text-sm font-semibold text-white truncate">{repo.name}</p>
                                  <p className="text-[11px] text-gray-600 truncate">{repo.full_name}</p>
                                </div>
                              </div>
                              <div className={`shrink-0 ml-3 w-7 h-7 rounded-full flex items-center justify-center transition-all
                                ${formData.repo_url === repo.url ? 'bg-purple-600' : 'bg-white/5'}`}>
                                {formData.repo_url === repo.url
                                  ? <CheckCircle size={14} className="text-white" />
                                  : <Plus size={14} className="text-gray-500" />}
                              </div>
                            </div>
                          )) : (
                            <p className="text-center text-sm text-gray-600 py-6">
                              {searchQuery ? `No repos matching "${searchQuery}"` : 'No repositories found.'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ══════ STEP 2: ENVIRONMENT ══════ */}
              {step === 2 && (
                <motion.div key="s2" variants={slide} initial="hidden" animate="visible" exit="exit" className="space-y-5">

                  <div className="bg-purple-500/8 border border-purple-500/20 rounded-xl p-4 flex gap-3">
                    <Lock className="text-purple-400 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-white font-bold text-sm">Environment Variables</h4>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Secrets injected securely before deploy. Values are masked by default — click 👁 to reveal.
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/8 rounded-xl p-4 sm:p-5">
                    {/* Column headers */}
                    <div className="hidden sm:flex gap-2 mb-3 px-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                      <div className="w-[38%]">Key</div>
                      <div className="flex-1">Value</div>
                      <div className="w-8" />
                    </div>

                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1
                      scrollbar-thin scrollbar-thumb-white/8 scrollbar-track-transparent">
                      <AnimatePresence>
                        {formData.envPairs.map((pair, i) => (
                          <EnvRow
                            key={i}
                            pair={pair}
                            index={i}
                            onChange={handleEnvChange}
                            onRemove={removeEnvPair}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={addEnvPair}
                      className="mt-3 w-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/8 hover:border-white/20 text-gray-400 hover:text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus size={14} /> Add Variable
                    </button>
                  </div>

                  {/* Hint */}
                  <p className="text-[11px] text-gray-600 ml-1 flex items-center gap-1.5">
                    <Clipboard size={11} /> Use the clipboard icon to paste values quickly.
                  </p>
                </motion.div>
              )}

              {/* ══════ STEP 3: EXECUTION ENGINE ══════ */}
              {step === 3 && (
                <motion.div key="s3" variants={slide} initial="hidden" animate="visible" exit="exit" className="space-y-5">

                  {/* Engine Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    {/* PPAM2 */}
                    <div
                      onClick={() => { setFormData((p) => ({ ...p, engine: 'ppam2' })); setError(''); }}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col gap-3
                        ${formData.engine === 'ppam2'
                          ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                          : 'bg-black/30 border-white/8 hover:border-white/20'}`}
                    >
                      {formData.engine === 'ppam2' && (
                        <div className="absolute top-0 right-0 bg-purple-600 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg tracking-wide">
                          RECOMMENDED
                        </div>
                      )}
                      <Terminal size={24} className={formData.engine === 'ppam2' ? 'text-purple-400' : 'text-gray-600'} />
                      <div>
                        <h4 className={`font-bold text-sm ${formData.engine === 'ppam2' ? 'text-white' : 'text-gray-400'}`}>
                          Public PM2
                        </h4>
                        <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                          Runs in an isolated Docker container with PM2 inside. Safe, fast, and resource-limited.
                        </p>
                      </div>
                    </div>

                    {/* VIP PM2 */}
                    <div
                      onClick={() => { setFormData((p) => ({ ...p, engine: 'vip_pm2' })); setError(''); }}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative flex flex-col gap-3
                        ${formData.engine === 'vip_pm2'
                          ? 'bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.12)]'
                          : 'bg-black/30 border-white/8 hover:border-white/20'}`}
                    >
                      <div className="flex justify-between items-start">
                        <Server size={24} className={formData.engine === 'vip_pm2' ? 'text-red-400' : 'text-gray-600'} />
                        <Lock size={12} className={formData.engine === 'vip_pm2' ? 'text-red-500' : 'text-gray-700'} />
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${formData.engine === 'vip_pm2' ? 'text-white' : 'text-gray-400'}`}>
                          VIP PM2
                        </h4>
                        <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                          Direct host server PM2 without container isolation. Requires admin approval.
                        </p>
                      </div>
                    </div>

                    {/* Pure Docker */}
                    <div
                      onClick={() => { setFormData((p) => ({ ...p, engine: 'docker' })); setError(''); }}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col gap-3
                        ${formData.engine === 'docker'
                          ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.12)]'
                          : 'bg-black/30 border-white/8 hover:border-white/20'}`}
                    >
                      <FaDocker size={24} className={formData.engine === 'docker' ? 'text-blue-400' : 'text-gray-600'} />
                      <div>
                        <h4 className={`font-bold text-sm ${formData.engine === 'docker' ? 'text-white' : 'text-gray-400'}`}>
                          Pure Docker
                        </h4>
                        <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                          Uses your repo's custom Dockerfile. Full control over the build and runtime.
                        </p>
                      </div>
                    </div>
                  </div>

                 {/* Dynamic inputs */}
                  <AnimatePresence mode="wait">
                    {(formData.engine === 'ppam2' || formData.engine === 'vip_pm2') && (
                      <motion.div
                        key="cmd"
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-2"
                      >
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                          Start Command <span className="text-purple-500">*</span>
                        </label>
                        <div className="relative">
                          <Play size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                          <input
                            type="text" name="start_cmd" value={formData.start_cmd}
                            onChange={handleChange}
                            placeholder="python3 main.py  or  node index.js"
                            className="w-full bg-black/60 border border-white/8 focus:border-purple-500/60 text-white placeholder-gray-700 rounded-xl px-4 py-3 pl-10 outline-none transition-all font-mono text-sm"
                          />
                        </div>
                        {formData.engine === 'vip_pm2' && (
                          <p className="text-xs text-red-400 flex items-center gap-1.5">
                            <ShieldAlert size={12} />
                            VIP runs directly on the host server. Admin approval required.
                          </p>
                        )}
                      </motion.div>
                    )}

                    {formData.engine === 'docker' && (
                      <motion.div
                        key="docker-info"
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                          <FaDocker size={16} className="text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-white font-bold text-sm">Dockerfile Required</h4>
                            <p className="text-gray-500 text-xs mt-1">
                              Your repo root must contain a valid <code className="text-blue-400 bg-blue-500/10 px-1 rounded">Dockerfile</code>.
                              If missing, NexCloud auto-generates one based on your stack.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Deploy summary preview */}
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 font-mono text-xs space-y-1.5">
                    <p className="text-gray-600 mb-2 uppercase tracking-widest text-[10px]">Deployment Summary</p>
                    <div className="flex gap-2"><span className="text-gray-600 w-20 shrink-0">App</span><span className="text-purple-400">{formData.app_name || '—'}</span></div>
                    <div className="flex gap-2"><span className="text-gray-600 w-20 shrink-0">Repo</span><span className="text-gray-300 truncate">{formData.repo_name || '—'}</span></div>
                    <div className="flex gap-2"><span className="text-gray-600 w-20 shrink-0">Engine</span>
                      <span className={formData.engine === 'ppam2' ? 'text-purple-400' : formData.engine === 'vip_pm2' ? 'text-red-400' : 'text-blue-400'}>
                        {{ ppam2: 'Public PM2', vip_pm2: 'VIP PM2', docker: 'Pure Docker' }[formData.engine]}
                      </span>
                    </div>
                    <div className="flex gap-2"><span className="text-gray-600 w-20 shrink-0">ENV Vars</span>
                      <span className="text-yellow-400">{formData.envPairs.filter(p => p.key.trim()).length}</span>
                    </div>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ── Nav Buttons */}
          <div className="px-6 sm:px-10 pb-8 pt-4 border-t border-white/5 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={step === 1 || isLoading}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-0 flex items-center gap-2 text-sm"
            >
              <ArrowLeft size={15} /> Back
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-7 py-2.5 rounded-xl flex items-center gap-2 transition-all text-sm"
                style={{ boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}
              >
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleDeployClick}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-7 py-2.5 rounded-xl flex items-center gap-2 transition-all text-sm"
                style={{ boxShadow: '0 0 22px rgba(34,197,94,0.3)' }}
              >
                <Rocket size={16} /> Deploy Application
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
