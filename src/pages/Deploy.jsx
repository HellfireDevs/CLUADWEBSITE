import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Github, Folder, Terminal, Lock, Play, Cpu, ArrowRight, ArrowLeft, CheckCircle, Loader2, AlertCircle, Box } from 'lucide-react';
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

  // 🛡️ AUTH GUARD
  useEffect(() => {
    const apiKey = localStorage.getItem("cloud_api_key");
    if (!apiKey) navigate('/login');
  }, [navigate]);

  // Form State
  const [formData, setFormData] = useState({
    app_name: '',       // PM2/Docker Name
    repo_url: '',       // GitHub Link
    repo_name: '',      // Auto-extracted
    folder_path: '',    // e.g. /root/bots/mybot
    env_content: '',    // Raw .env data
    use_docker: false,  // Toggle
    start_cmd: ''       // e.g. python3 main.py
  });

  // Smart GitHub URL Extractor
  const handleUrlChange = (e) => {
    const url = e.target.value;
    let extractedName = formData.repo_name;
    
    if (url.includes('github.com')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      extractedName = lastPart.replace('.git', '');
    }

    setFormData({ 
      ...formData, 
      repo_url: url, 
      repo_name: extractedName 
    });
    setError("");
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (error) setError("");
  };

  const handleNext = () => {
    if (step === 1 && (!formData.app_name || !formData.repo_url || !formData.folder_path)) {
      setError("Please fill all the source details!");
      return;
    }
    if (step === 3 && !formData.use_docker && !formData.start_cmd) {
      setError("PM2 requires a start command (e.g., 'python3 main.py')!");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  // 🚀 THE ULTIMATE DEPLOYMENT FUNCTION
  const handleDeploy = async () => {
    if (!formData.use_docker && !formData.start_cmd) {
      setError("PM2 ke liye Start Command zaroori hai bhai!");
      return;
    }

    setIsLoading(true);
    setError("");
    const API_KEY = localStorage.getItem("cloud_api_key");
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    try {
      const headers = { "x-api-key": API_KEY };

      // Step 1: Agar .env content hai, toh pehle usko inject karo (Optional feature jo humne banaya tha)
      if (formData.env_content.trim() !== '') {
        await axios.post(`${API_URL}/api/inject-env`, {
          folder_path: formData.folder_path,
          env_content: formData.env_content
        }, { headers });
      }

      // Step 2: Main Deployment API call karo
      const payload = {
        repo_url: formData.repo_url,
        repo_name: formData.repo_name,
        app_name: formData.app_name,
        folder_path: formData.folder_path,
        use_docker: formData.use_docker,
        start_cmd: formData.start_cmd
      };

      const response = await axios.post(`${API_URL}/api/deploy-new`, payload, { headers });

      if (response.data.status === "success") {
        setSuccess("Deployment Configuration Saved & Initiated! Redirecting to Dashboard...");
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Deployment failed! Backend error.");
    } finally {
      setIsLoading(false);
    }
  };

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
            { num: 1, title: "Source", icon: Github },
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
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">GitHub Repository URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500"><Github size={18} /></div>
                    <input type="text" name="repo_url" value={formData.repo_url} onChange={handleUrlChange} placeholder="https://github.com/username/repo.git"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-purple-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                  </div>
                  {formData.repo_name && <p className="text-xs text-purple-400 font-mono ml-2">Extracted Repo: {formData.repo_name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">VPS Folder Path</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500"><Folder size={18} /></div>
                    <input type="text" name="folder_path" value={formData.folder_path} onChange={handleChange} placeholder="/root/bots/my_bot"
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-purple-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2: ENVIRONMENT VARIABLES ================= */}
            {step === 2 && (
              <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex gap-3">
                  <Lock className="text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Secure Environment Injector</h4>
                    <p className="text-gray-400 text-xs mt-1">Paste your raw .env content here. It will be securely injected into the deployment folder before startup.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-1 focus-within:border-purple-500 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all">
                    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 border-b border-white/5 rounded-t-lg">
                      <Terminal size={14} className="text-gray-500" />
                      <span className="text-xs font-mono text-gray-400">.env</span>
                    </div>
                    <textarea 
                      name="env_content" 
                      value={formData.env_content} 
                      onChange={handleChange} 
                      placeholder="API_ID=1234567&#10;API_HASH=your_hash_here&#10;BOT_TOKEN=your_token_here"
                      className="w-full h-48 bg-transparent text-green-400 font-mono text-sm p-4 outline-none resize-none placeholder-gray-700"
                    ></textarea>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 3: EXECUTION ENGINE ================= */}
            {step === 3 && (
              <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                
                {/* Engine Selector */}
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

                {/* Start Command (Only if PM2 is selected) */}
                <AnimatePresence>
                  {!formData.use_docker && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">PM2 Start Command</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-gray-500"><Play size={18} /></div>
                        <input type="text" name="start_cmd" value={formData.start_cmd} onChange={handleChange} placeholder="python3 -m Yukimusi"
                          className="w-full bg-[#0a0a0a] border border-white/10 focus:border-purple-500 text-white placeholder-gray-600 rounded-xl px-4 py-3.5 pl-11 outline-none transition-all font-mono text-sm focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                      </div>
                      <p className="text-xs text-gray-500 ml-1 mt-1">Make sure the entry file exists in the repo!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons (Bottom) */}
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

