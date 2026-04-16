import React from 'react';
import { motion } from 'framer-motion';
import { Server, Terminal, GitBranch, Zap, Activity, Lock, Cpu, Rocket } from 'lucide-react';
import Background from '../components/Background';

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, type: "spring", bounce: 0.4 } },
};

// --- COMPONENTS ---
const Navbar = () => (
  <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-6xl z-50">
    <div className="bg-[#050505]/60 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 flex justify-between items-center shadow-[0_0_30px_rgba(168,85,247,0.1)]">
      <div className="text-white font-black text-xl tracking-widest flex items-center gap-2">
        <Server className="text-purple-500 w-6 h-6" /> NEX<span className="text-purple-500">CLOUD</span>
      </div>
      
      <div className="flex items-center gap-4">
        <a href="/login" className="text-gray-300 hover:text-white font-bold text-sm transition-colors">
          Login
        </a>
        <a href="/register" className="bg-white/10 hover:bg-purple-600 border border-white/10 hover:border-purple-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all">
          Sign Up
        </a>
      </div>
    </div>
  </nav>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div variants={fadeInUp} className="bg-white/[0.02] border border-white/5 hover:border-purple-500/30 p-8 rounded-3xl backdrop-blur-sm group transition-all">
    <div className="bg-purple-500/10 w-fit p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
      <Icon className="text-purple-400 w-8 h-8" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default function Home() {
  return (
    <div className="text-gray-200 min-h-screen w-full overflow-x-hidden font-sans relative selection:bg-purple-500/30">
      <Background />
      <Navbar />

      <div className="relative z-10 w-full pt-32 pb-20">
        
        {/* 🚀 HERO SECTION */}
        <section className="flex flex-col justify-center items-center text-center p-6 min-h-[70vh]">
          <motion.div
            className="mb-8 flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-5 py-2 rounded-full text-xs uppercase tracking-widest font-bold backdrop-blur-md"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          >
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
             </span>
             Engine v2.0 Online
          </motion.div>
          
          <motion.h1 
            className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-6 tracking-tight leading-tight max-w-5xl"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            Deploy Your Code <br />
            <span className="text-purple-500">Without the Bullshit.</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 font-medium"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            Push to GitHub and we handle the rest. Smart PM2 management, Docker containers, live logs, and instant .env injection.
          </motion.p>
          
          <motion.div className="flex flex-col sm:flex-row gap-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <a href="/dashboard" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-[0_0_40px_rgba(168,85,247,0.4)]">
              <Rocket size={20}/> Go to Dashboard
            </a>
            <a href="/login" className="bg-[#0a0a0a] border border-white/10 hover:border-white/30 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-3 transition-all">
               <Terminal size={20}/> Terminal Access
            </a>
          </motion.div>
        </section>

        {/* ⚙️ FEATURES SECTION */}
        <motion.section 
          className="max-w-7xl mx-auto px-6 py-20"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">God-Level Infrastructure</h2>
            <p className="text-gray-400">Everything you need to host bots and APIs, zero command line required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={GitBranch} 
              title="GitHub Webhooks" 
              desc="Just push your code to GitHub. Our engine automatically pulls the latest changes, installs dependencies, and restarts your app."
            />
            <FeatureCard 
              icon={Lock} 
              title="Smart .env Manager" 
              desc="No more exposing API keys. Securely inject environment variables directly into your server folders from our dashboard."
            />
            <FeatureCard 
              icon={Activity} 
              title="Live Log Streaming" 
              desc="Connected via WebSockets. Watch your terminal outputs and debug errors in real-time without ever opening SSH."
            />
            <FeatureCard 
              icon={Cpu} 
              title="PM2 & Docker Engine" 
              desc="Choose your weapon. Run simple Python/Node apps via PM2, or deploy complex setups using automated Docker image building."
            />
            <FeatureCard 
              icon={Zap} 
              title="Zero Downtime Restart" 
              desc="Our smart process manager checks if your app is running. It seamlessly restarts active apps or ignites new ones."
            />
            <FeatureCard 
              icon={Server} 
              title="Dedicated API" 
              desc="Control your server programmatically. Restart, check status, and deploy via simple REST API calls using your secure key."
            />
          </div>
        </motion.section>

      </div>
    </div>
  );
}
