import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, FolderGit2, Copy, CheckCircle, Loader2, AlertTriangle, 
  Star, GitFork, BookOpen, Lock, Folder, ArrowLeft 
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa'; 
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background'; 

export default function RepoVisualizer() {
  const navigate = useNavigate();
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [repoDetails, setRepoDetails] = useState(null);
  const [treeString, setTreeString] = useState('');
  const [copied, setCopied] = useState(false);

  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const apiKey = localStorage.getItem("cloud_api_key");
    if (!apiKey) {
      navigate('/login');
      return;
    }
    fetchGitHubRepos(apiKey);
  }, [navigate]);

  const fetchGitHubRepos = async (apiKey) => {
    setIsLoadingRepos(true);
    try {
      const response = await axios.get(`${API_URL}/api/github/repos`, {
        headers: { "x-api-key": apiKey }
      });
      if (response.data.status === "connected") {
        setIsGithubConnected(true);
        setRepos(response.data.repos || []);
      }
    } catch (err) {
      setIsGithubConnected(false);
      setRepos([]); 
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleGithubConnect = () => {
    const username = localStorage.getItem("cloud_username") || "user"; 
    window.location.href = `${API_URL}/api/github/login?username=${username}`;
  };

  const generateAsciiTree = (paths, repoName) => {
    const tree = {};
    paths.forEach(path => {
      const parts = path.split('/');
      let current = tree;
      parts.forEach(part => {
        if (!current[part]) current[part] = {};
        current = current[part];
      });
    });

    const drawTree = (node, prefix = '') => {
      let result = '';
      const keys = Object.keys(node);
      keys.forEach((key, index) => {
        const isLast = index === keys.length - 1;
        result += `${prefix}${isLast ? '└── ' : '├── '}${key}\n`;
        if (Object.keys(node[key]).length > 0) {
          result += drawTree(node[key], prefix + (isLast ? '    ' : '│   '));
        }
      });
      return result;
    };
    return `${repoName}/\n${drawTree(tree)}`;
  };

  // 🔥 URL PARSING FIX KIYA
  const analyzeRepo = async (input) => {
    if (!input) return;
    setLoading(true);
    setError('');
    setTreeString('');
    setRepoDetails(null);

    try {
      let owner = "", repo = "";
      const cleanInput = input.replace(/\/$/, '').trim();
      
      // Agar direct "facebook/react" jaisa naam pass ho
      if (cleanInput.split('/').length === 2 && !cleanInput.includes('github.com')) {
         const parts = cleanInput.split('/');
         owner = parts[0];
         repo = parts[1];
      } 
      // Agar pura github url ho
      else if (cleanInput.includes('github.com')) {
        const parts = cleanInput.split('github.com/')[1].split('/');
        owner = parts[0];
        repo = parts[1];
      } 
      // Agar backend se api.github.com wala url aaye
      else if (cleanInput.includes('api.github.com/repos/')) {
        const parts = cleanInput.split('api.github.com/repos/')[1].split('/');
        owner = parts[0];
        repo = parts[1];
      } else {
        throw new Error("Invalid GitHub URL or Format!");
      }

      const infoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
      setRepoDetails(infoRes.data);
      
      const treeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${infoRes.data.default_branch}?recursive=1`);
      
      const treeData = treeRes.data.tree || [];
      const paths = treeData
        .map(item => item.path)
        .filter(p => !p.includes('node_modules') && !p.includes('.git/') && !p.includes('.github/'));

      setTreeString(generateAsciiTree(paths, repo));
      
    } catch (err) {
      if (err.response?.status === 404) {
         setError("❌ Repository not found. (If it's private, React cannot fetch it directly without backend auth!)");
      } else if (err.response?.status === 403) {
         setError("⚠️ GitHub API limit reached! Please wait a while.");
      } else {
         setError(err.message || "Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  const safeRepos = Array.isArray(repos) ? repos : [];
  const filteredRepos = safeRepos.filter(repo => 
    repo.name && repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans p-4 relative overflow-hidden flex flex-col items-center">
      <Background />
      
      <nav className="w-full max-w-5xl z-50 mb-4 mt-2 flex justify-start">
        <Link to="/dashboard" className="text-gray-400 hover:text-white font-bold text-sm transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-white/10">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </nav>

      <div className="w-full max-w-5xl z-10">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl mb-4 border border-purple-500/30 flex items-center justify-center shadow-lg">
            <FolderGit2 className="text-purple-400" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Structure Visualizer</h1>
          <p className="text-gray-400 text-sm mt-1">Generate professional ASCII trees from GitHub Repositories</p>
        </div>

        {/* 🔥 YAHAN WAPAS ERROR ALERT LAGA DIYA */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-8 max-w-5xl mx-auto bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold backdrop-blur-md"
            >
              <AlertTriangle size={18} className="shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <FaGithub size={18}/> {isGithubConnected ? 'Your Repositories' : 'GitHub Access'}
              </h3>

              {!isGithubConnected ? (
                <div className="text-center py-6 bg-black/40 rounded-2xl border border-white/5">
                  <Lock className="mx-auto text-gray-600 mb-3" size={32} />
                  <p className="text-xs text-gray-400 mb-4 px-4">Connect GitHub to visualize your private and public repositories easily.</p>
                  <button onClick={handleGithubConnect} className="bg-white text-black font-bold px-6 py-2 rounded-xl text-xs hover:bg-gray-200 transition-all">
                    Connect GitHub
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search repos..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 text-xs text-white rounded-xl px-4 py-2.5 pl-9 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {isLoadingRepos ? (
                      <div className="text-center py-10"><Loader2 className="animate-spin text-purple-500 mx-auto" /></div>
                    ) : filteredRepos.length > 0 ? (
                      filteredRepos.map(repo => (
                        <div 
                          key={repo.id} 
                          // 🔥 FIX: Ab direct repo.full_name pass ho raha hai ("owner/repo")
                          onClick={() => { setInputUrl(repo.html_url); analyzeRepo(repo.full_name); }}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all group ${inputUrl === repo.html_url ? 'bg-purple-500/10 border-purple-500/50' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {repo.private ? <Lock size={14} className="text-yellow-500 shrink-0"/> : <Folder size={14} className="text-gray-400 shrink-0"/>}
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">{repo.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{repo.private ? 'Private' : 'Public'}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-gray-500 py-4">No repositories found.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-white/5">
                 <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Manual Input</p>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={inputUrl} 
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://github.com/owner/repo"
                      className="flex-1 bg-black/50 border border-white/10 text-xs text-white rounded-xl px-4 py-2 outline-none focus:border-purple-500"
                    />
                    <button onClick={() => analyzeRepo(inputUrl)} disabled={loading || !inputUrl} className="bg-purple-600 disabled:opacity-50 p-2 rounded-xl text-white transition-all"><Search size={16}/></button>
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!treeString ? (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="h-full flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 border-dashed rounded-3xl p-10 text-center min-h-[400px]">
                  <FaGithub size={48} className="text-gray-800 mb-4" />
                  <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm">Select a Repository</h3>
                  <p className="text-gray-600 text-xs mt-2">Pick a repo from the list to visualize its code structure</p>
                  {loading && <Loader2 className="animate-spin text-purple-500 mt-4" size={24} />}
                </motion.div>
              ) : (
                <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} className="space-y-4 h-full flex flex-col">
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                      <Star size={14} className="text-yellow-400" />
                      <span className="text-xs font-bold">{repoDetails?.stargazers_count || 0}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                      <GitFork size={14} className="text-blue-400" />
                      <span className="text-xs font-bold">{repoDetails?.forks_count || 0}</span>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                      <BookOpen size={14} className="text-purple-400" />
                      <span className="text-xs font-bold uppercase tracking-tighter">{repoDetails?.default_branch || 'main'}</span>
                    </div>
                  </div>

                  <div className="bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                    <div className="bg-white/[0.03] border-b border-white/10 p-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                        <span className="text-[10px] font-mono text-gray-500 ml-2 uppercase tracking-widest">{repoDetails?.name} Structure</span>
                      </div>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(treeString); setCopied(true); setTimeout(()=>setCopied(false), 2000); }}
                        className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                      >
                        {copied ? <CheckCircle size={12} className="text-green-400"/> : <Copy size={12}/>}
                        {copied ? 'Copied' : 'Copy Tree'}
                      </button>
                    </div>
                    <div className="p-6 overflow-auto font-mono text-xs leading-relaxed text-purple-300/90 max-h-[500px] scrollbar-thin scrollbar-thumb-purple-500/20">
                      <pre><code>{treeString}</code></pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
