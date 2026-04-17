import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderGit2, Copy, CheckCircle, Loader2, AlertTriangle, Github, Star, GitFork, BookOpen } from 'lucide-react';
import axios from 'axios';

export default function RepoVisualizer() {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [repoDetails, setRepoDetails] = useState(null);
  const [treeString, setTreeString] = useState('');
  const [copied, setCopied] = useState(false);

  // ==========================================
  // 🌳 ASCII TREE GENERATOR ALGORITHM
  // ==========================================
  const generateAsciiTree = (paths, repoName) => {
    const tree = {};
    
    // File paths ko JSON Object (Tree) mein convert karo
    paths.forEach(path => {
      const parts = path.split('/');
      let current = tree;
      parts.forEach(part => {
        if (!current[part]) current[part] = {};
        current = current[part];
      });
    });

    // Object ko ├── aur └── wale string mein convert karo
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

  // ==========================================
  // 🚀 FETCH REPO DATA FROM GITHUB API
  // ==========================================
  const handleFetch = async (e) => {
    e.preventDefault();
    if (!inputUrl) return;

    setLoading(true);
    setError('');
    setTreeString('');
    setRepoDetails(null);

    try {
      // URL se Owner aur Repo Name nikalo (e.g. https://github.com/facebook/react)
      let owner = "", repo = "";
      
      // Clean the input
      const cleanInput = inputUrl.replace(/\/$/, '').trim();
      
      if (cleanInput.includes('github.com')) {
        const parts = cleanInput.split('github.com/')[1].split('/');
        owner = parts[0];
        repo = parts[1];
      } else if (cleanInput.includes('/')) {
        const parts = cleanInput.split('/');
        owner = parts[0];
        repo = parts[1];
      } else {
        throw new Error("Invalid format! Use 'owner/repo' or GitHub URL.");
      }

      // 1. Fetch Repo Info (Stars, Default Branch, etc.)
      const infoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
      setRepoDetails(infoRes.data);
      const defaultBranch = infoRes.data.default_branch;

      // 2. Fetch the File Tree
      const treeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
      
      // Filter out huge directories to keep it clean (like node_modules, .git)
      const paths = treeRes.data.tree
        .map(item => item.path)
        .filter(p => !p.includes('node_modules') && !p.includes('.git/') && !p.includes('.github/'));

      // Generate the visual tree
      const finalTree = generateAsciiTree(paths, repo);
      setTreeString(finalTree);

    } catch (err) {
      if (err.response?.status === 403) {
        setError("GitHub API Rate Limit Exceeded! Thodi der baad try kar bhai.");
      } else if (err.response?.status === 404) {
        setError("Repository nahi mili! Private toh nahi hai?");
      } else {
        setError(err.message || "Bhai kuch gadbad ho gayi fetch karne mein.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(treeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans p-4 relative overflow-hidden flex flex-col items-center">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-4xl z-10 mt-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-2xl mb-4 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <FolderGit2 className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-wide">Repo Structurizer</h1>
          <p className="text-gray-400">Instantly generate a clean folder structure from any public GitHub repository.</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFetch} className="relative mb-8 max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Github className="text-gray-500" size={20} />
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste GitHub URL (e.g. https://github.com/facebook/react)"
            className="w-full bg-white/[0.02] border border-white/10 hover:border-purple-500/30 focus:border-purple-500 text-white placeholder-gray-600 rounded-2xl px-4 py-4 pl-12 pr-32 outline-none transition-all focus:shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-md"
          />
          <button
            type="submit"
            disabled={loading || !inputUrl}
            className="absolute inset-y-2 right-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            <span className="hidden sm:inline">{loading ? 'Fetching...' : 'Analyze'}</span>
          </button>
        </form>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-8 max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold backdrop-blur-md"
            >
              <AlertTriangle size={18} className="shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Area */}
        <AnimatePresence>
          {treeString && repoDetails && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Repo Details Card */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
                  <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                    <BookOpen size={18} className="text-purple-400"/> Info
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">{repoDetails.description || "No description available."}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-gray-400 text-xs font-bold uppercase">Stars</span>
                      <span className="text-yellow-400 font-bold flex items-center gap-1"><Star size={14}/> {repoDetails.stargazers_count}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-gray-400 text-xs font-bold uppercase">Forks</span>
                      <span className="text-blue-400 font-bold flex items-center gap-1"><GitFork size={14}/> {repoDetails.forks_count}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-gray-400 text-xs font-bold uppercase">Default Branch</span>
                      <span className="text-green-400 font-bold text-xs bg-green-500/10 px-2 py-1 rounded-md">{repoDetails.default_branch}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Structure Card */}
              <div className="lg:col-span-2">
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col h-full">
                  {/* Window Header */}
                  <div className="bg-black/50 border-b border-white/5 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="ml-3 text-xs text-gray-500 font-mono">{repoDetails.name} - Structure</span>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors border border-white/10"
                    >
                      {copied ? <CheckCircle size={14} className="text-green-400"/> : <Copy size={14}/>}
                      {copied ? 'Copied!' : 'Copy Tree'}
                    </button>
                  </div>

                  {/* ASCII Code Block */}
                  <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                    <pre className="text-gray-300 font-mono text-sm leading-relaxed">
                      <code>{treeString}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
  
