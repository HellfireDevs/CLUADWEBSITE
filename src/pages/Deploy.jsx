import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🛠️ FIX: Trash2 import kiya Delete button ke liye
import { Server, Folder, Terminal, Lock, Play, Cpu, ArrowRight, ArrowLeft, CheckCircle, Loader2, AlertCircle, Box, Search, Rocket, Trash2, Plus } from 'lucide-react';
import { FaGithub } from 'react-icons/fa'; 
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

// --- ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, type: "spring", bounce: 0.2 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
};

export default function Deploy() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🐙 GitHub States
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    app_name: '',       
    repo_url: '',       
    repo_name: '',      
    envPairs: [{ key: '', value: '' }], // 🔥 NEW: Dynamic Array for ENV Variables
    use_docker: false,  
    start_cmd: ''       
  });

  // 🛡️ AUTH GUARD & FETCH REPOS
  useEffect(() => {
    const apiKey = localStorage.getItem("cloud_api_key");
    if (!apiKey) navigate('/login');
    else fetchGitHubRepos(apiKey);
  }, [navigate]);

  // 🐙 Fetch Repos from Backend
  const fetchGitHubRepos = async (apiKey) => {
    setIsLoadingRepos(true);
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    try {
      const response = await axios.get(`${API_URL}/api/github/repos`, {
        headers: { "x-api-key": apiKey }
      });
      if (response.data.status === "connected") {
        setIsGithubConnected(true);
        setRepos(response.data.repos);
      } else {
        setIsGithubConnected(false);
      }
    } catch (err) {
      console.log("GitHub not connected or token expired.");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  // 🐙 Handle GitHub Connect
  const handleGithubConnect = async () => {
    const username = localStorage.getItem("cloud_username") || "user"; 
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    try {
      const response = await axios.get(`${API_URL}/api/github/login?username=${username}`);
      if (response.data.url) {
        window.location.href = response.data.url; 
      }
    } catch (err) {
      setError("Failed to generate GitHub login URL");
    }
  };

  // Smart GitHub URL Extractor
  const handleUrlChange = (e) => {
    const url = e.target.value;
    let extractedName = formData.repo_name;
    if (url.includes('github.com')) {
      const parts = url.split('/');
      extractedName = parts[parts.length - 1].replace('.git', '');
    }
    setFormData({ ...formData, repo_url: url, repo_name: extractedName });
    setError("");
  };

  // Select Repo from List
  const selectRepo = (repo) => {
    setFormData({
      ...formData,
      repo_url: repo.url,
      repo_name: repo.name
    });
    setError("");
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (error) setError("");
  };

  // 🔥 ENV VARIABLE HANDLERS (Add, Remove, Edit)
  const handleEnvChange = (index, field, value) => {
    const newPairs = [...formData.envPairs];
    newPairs[index][field] = value;
    setFormData({ ...formData, envPairs: newPairs });
  };

  const addEnvPair = () => {
    setFormData({ ...formData, envPairs: [...formData.envPairs, { key: '', value: '' }] });
  };

  const removeEnvPair = (index) => {
    const newPairs = formData.envPairs.filter((_, i) => i !== index);
    setFormData({ ...formData, envPairs: newPairs });
  };

  // Nav Handlers
  const handleNext = () => {
    if (step === 1 && (!formData.app_name || !formData.repo_url)) {
      setError("Please provide an App Name and a Repository URL!");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  // Deploy Handler
  const handleDeploy = async () => {
    if (!formData.use_docker && !formData.start_cmd) {
      setError("PM2 requires a Start Command (e.g., 'python3 main.py')!");
      return;
    }

    setIsLoading(true);
    setError("");
    const API_KEY = localStorage.getItem("cloud_api_key");
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    try {
      const headers = { "x-api-key": API_KEY };

      // 🔥 PREPARE ENV STRING FROM ARRAY (Backend ko pehle jaisa data hi milega)
      const generatedEnvContent = formData.envPairs
        .filter(pair => pair.key.trim() !== '')
        .map(pair => `${pair.key.trim()}=${pair.value.trim()}`)
        .join('\n');

      if (generatedEnvContent.trim() !== '') {
        await axios.post(`${API_URL}/api/inject-env`, {
          app_name: formData.app_name, 
          env_content: generatedEnvContent
        }, { headers }).catch(err => console.log("Env injection skip/fail", err));
      }

      const payload = {
        repo_url: formData.repo_url,
        repo_name: formData.repo_name,
        app_name: formData.app_name,
        use_docker: formData.use_docker,
        start_cmd: formData.start_cmd
      };

      const response = await axios.post(`${API_URL}/api/deploy-new`, payload, { headers });

      if (response.data.status === "success") {
        setSuccess("Deployment Initiated! Redirecting to Dashboard...");
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Deployment failed! Backend error.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRepos = repos.filter(repo => repo.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative selection:bg-purple-500/30 pb-20">
      <Background />
      
      {/* 🚀 TOP NAVBAR */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-xl tracking-widest hover:scale-105 transition-transform">
            <Server className="text-purple-500 w-6 h-6" /> NEX<span className="text-purple-500">CLOUD</span>
          </Link>
          <Link to="/dashboard" className="text-gray-400 hover:text-white font-bold text-sm transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 mt-10 relative z-10">
        
        {/* Header & Stepper */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Deploy New Application</h1>
          <p className="text-gray-400">Configure your repository, environment, and execution engine.</p>
        </div>

        {/* Stepper UI */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 -z-10 rounded-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-purple-600 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[
            { num: 1, title: "Source", icon: FaGithub },
            { num: 2, title: "Environment", icon: Lock },
            { num: 3, title: "Execution", icon: Cpu }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-[#050505] px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= s.num ? 'bg-purple-600 border-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-[#0a0a0a] border-white/10 text-gray-500'}`}>
                {step > s.num ? <CheckCircle size={20} /> : <s.icon size={20} />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest hidden sm:block ${step >= s.num ? 'text-purple-400' : 'text-gray-500'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Global Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg">
              <AlertCircle size={18} className="shrink-0" /> <p>{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg">
              <CheckCircle size={18} className="shrink-0" /> <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* ================= STEP 1: SOURCE DETAILS ================= */}
            {step === 1 && (
              <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Application Name (Unique ID)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500"><Box size={18} /></div>
                    <input type="text" name="app_name" value={formData.app_name} onChange={handleChange} placeholder="e.g., nex_core_bot"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-purple-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Selected Repository URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500"><FaGithub size={18} /></div>
                    <input type="text" name="repo_url" value={formData.repo_url} onChange={handleUrlChange} placeholder="Enter manually or select from GitHub below"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-purple-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                  </div>
                </div>

                {/* 🐙 GITHUB INTEGRATION UI */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><FaGithub size={18}/> Import from GitHub</h3>
                    {!isGithubConnected && (
                      <button onClick={handleGithubConnect} className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2">
                        Connect Account
                      </button>
                    )}
                  </div>

                  {isLoadingRepos ? (
                    <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>
                  ) : !isGithubConnected ? (
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 text-center">
                      <FaGithub size={40} className="mx-auto text-gray-600 mb-3" />
                      <p className="text-sm text-gray-400 mb-4">Connect your GitHub to easily import public and private repositories.</p>
                      <button onClick={handleGithubConnect} className="bg-[#24292e] hover:bg-[#2f363d] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg">
                        Connect with GitHub
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search repositories..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-white/10 text-sm text-white rounded-lg px-4 py-2.5 pl-10 outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Repo List */}
                      <div className="max-h-60 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {filteredRepos.length > 0 ? (
                          filteredRepos.map(repo => (
                            <div key={repo.id} className="flex justify-between items-center bg-[#0a0a0a] hover:bg-white/5 border border-white/5 p-3 rounded-xl transition-all group">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                  {repo.private ? <Lock size={16} className="text-yellow-500" /> : <Folder size={16} className="text-gray-400" />}
                                </div>
                                <div className="truncate">
                                  <p className="text-sm font-bold text-white truncate">{repo.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{repo.full_name}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => selectRepo(repo)}
                                className={`shrink-0 ml-4 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.repo_url === repo.url ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20 group-hover:border-white/30'}`}
                              >
                                {formData.repo_url === repo.url ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm text-gray-500 py-4">No repositories found.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* ================= STEP 2: ENVIRONMENT VARIABLES (DYNAMIC BOXES) ================= */}
            {step === 2 && (
              <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex gap-3">
                  <Lock className="text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Environment Variables</h4>
                    <p className="text-gray-400 text-xs mt-1">Add your secret keys and configurations here. These will be securely injected during deployment.</p>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                  
                  {/* Table Header */}
                  <div className="flex gap-2 mb-2 px-1 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <div className="w-1/3">Key</div>
                    <div className="flex-1">Value</div>
                    <div className="w-10"></div>
                  </div>

                  {/* Dynamic Rows */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {formData.envPairs.map((pair, index) => (
                      <div key={index} className="flex gap-2 items-center group">
                        <input 
                          type="text" 
                          placeholder="BOT_TOKEN"
                          value={pair.key}
                          onChange={(e) => handleEnvChange(index, 'key', e.target.value.toUpperCase())}
                          className="w-1/3 bg-black border border-white/10 focus:border-purple-500 text-purple-400 placeholder-gray-700 rounded-lg px-3 py-2 outline-none font-mono text-sm transition-all"
                        />
                        <input 
                          type="text" 
                          placeholder="123456:ABC-DEF..."
                          value={pair.value}
                          onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                          className="flex-1 bg-black border border-white/10 focus:border-purple-500 text-green-400 placeholder-gray-700 rounded-lg px-3 py-2 outline-none font-mono text-sm transition-all"
                        />
                        <button 
                          onClick={() => removeEnvPair(index)}
                          className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Variable"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Button */}
                  <button 
                    onClick={addEnvPair}
                    className="mt-4 w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-gray-300 font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus size={16} /> Add Another Variable
                  </button>

                </div>
              </motion.div>
            )}

            {/* ================= STEP 3: EXECUTION ENGINE ================= */}
            {step === 3 && (
              <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData({...formData, use_docker: false})}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center ${!formData.use_docker ? 'bg-purple-500/10 border-purple-500' : 'bg-[#0a0a0a] border-white/10 hover:border-white/30'}`}
                  >
                    <Terminal className={!formData.use_docker ? 'text-purple-400' : 'text-gray-500'} size={32} />
                    <div>
                      <h4 className={`font-bold ${!formData.use_docker ? 'text-white' : 'text-gray-400'}`}>PM2 Engine</h4>
                      <p className="text-xs text-gray-500 mt-1">Standard Node/Python</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setFormData({...formData, use_docker: true})}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center ${formData.use_docker ? 'bg-blue-500/10 border-blue-500' : 'bg-[#0a0a0a] border-white/10 hover:border-white/30'}`}
                  >
                    <Cpu className={formData.use_docker ? 'text-blue-400' : 'text-gray-500'} size={32} />
                    <div>
                      <h4 className={`font-bold ${formData.use_docker ? 'text-white' : 'text-gray-400'}`}>Docker Engine</h4>
                      <p className="text-xs text-gray-500 mt-1">Containerized Setup</p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {!formData.use_docker && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">PM2 Start Command</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500"><Play size={18} /></div>
                        <input type="text" name="start_cmd" value={formData.start_cmd} onChange={handleChange} placeholder="python3 main.py"
                          className="w-full bg-[#0a0a0a] border border-white/10 focus:border-purple-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all font-mono text-sm focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                      </div>
                      <p className="text-xs text-gray-500 ml-1 mt-1">Make sure the entry file exists in the repo!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-white/5 flex justify-between">
            <button 
              onClick={handleBack} 
              disabled={step === 1 || isLoading}
              className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-0 flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {step < 3 ? (
              <button 
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleDeploy}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Igniting System...</> : <><Rocket size={18} /> Deploy Application</>}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
