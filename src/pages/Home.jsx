import React from 'react';
import { motion } from 'framer-motion';
import { Server, Terminal, GitBranch, Zap, Activity, Lock, Cpu, Rocket, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Background from '../components/Background';

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, type: "spring", bounce: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

// --- COMPONENTS ---
const Navbar = () => (
  <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-6xl z-50">
    <div className="bg-[#050505]/60 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 flex justify-between items-center shadow-[0_0_40px_rgba(168,85,247,0.15)]">
      <div className="text-white font-black text-xl tracking-widest flex items-center gap-2">
        <Server className="text-purple-500 w-6 h-6 animate-pulse" /> NEX<span className="text-purple-500">CLOUD</span>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-gray-300 hover:text-white font-bold text-sm transition-colors">
          Login
        </Link>
        <Link to="/register" className="relative group overflow-hidden bg-white/10 border border-white/10 hover:border-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold transition-all duration-300">
          <span className="relative z-10">Deploy Now</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>
    </div>
  </nav>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div 
    variants={fadeInUp}
    className="relative group bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 p-8 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2"
  >
    {/* Animated Gradient Background on Hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
    
    {/* Top Highlight Line */}
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="relative z-10">
      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <Icon className="text-purple-400 w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const StatBox = ({ value, label }) => (
  <div className="text-center p-6 border border-white/5 bg-white/[0.01] rounded-2xl backdrop-blur-sm hover:bg-white/[0.03] transition-colors">
    <h4 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">{value}</h4>
    <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">{label}</p>
  </div>
);

export default function Home() {
  return (
    <div className="text-gray-200 min-h-screen w-full overflow-x-hidden font-sans relative selection:bg-purple-500/30 bg-[#020202]">
      <Background />
      <Navbar />

      {/* 🌊 Deep Fluid Glows (Water Effect Alternative) */}
      <div className="fixed top-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[150px] pointer-events-none animate-blob mix-blend-screen"></div>
      <div className="fixed top-[40%] right-[-10%] w-[400px] h-[400px] bg-blue-700/20 rounded-full blur-[150px] pointer-events-none animate-blob animation-delay-2000 mix-blend-screen"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[150px] pointer-events-none animate-blob animation-delay-4000 mix-blend-screen"></div>

      <div className="relative z-10 w-full">
        
        {/* 🚀 HERO SECTION */}
        <section className="relative flex flex-col justify-center items-center text-center px-6 pt-40 pb-32 min-h-screen">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            {/* Minimal Grid Background pattern for tech feel */}
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>

          <motion.div
            className="mb-8 flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-5 py-2 rounded-full text-xs uppercase tracking-widest font-bold backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.2)]"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
          >
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
             </span>
             Engine v2.0 is LIVE
          </motion.div>
          
          <motion.h1 
            className="text-6xl sm:text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 mb-8 tracking-tighter leading-[1.1] max-w-6xl"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Deploy Code. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-x">
              Zero Bullshit.
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-2xl text-gray-400 max-w-3xl mb-12 font-medium leading-relaxed"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
          >
            Push to GitHub and let the Engine handle the rest. Smart PM2 management, isolated Docker containers, live terminal logs, and God-level API control.
          </motion.p>
          
          <motion.div className="flex flex-col sm:flex-row gap-6 z-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
            <Link to="/dashboard" className="group relative bg-purple-600 text-white font-bold px-10 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <Rocket size={22} className="relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"/> 
              <span className="relative z-10 text-lg">Ignite Dashboard</span>
            </Link>
            <Link to="/login" className="bg-[#111] border border-white/10 hover:border-purple-500/50 hover:bg-white/5 text-white font-bold px-10 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 group">
               <Terminal size={22} className="text-gray-400 group-hover:text-purple-400 transition-colors"/> 
               <span className="text-lg">Terminal Access</span>
            </Link>
          </motion.div>

          <motion.div 
            className="absolute bottom-10 animate-bounce text-gray-600"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          >
            <ChevronDown size={32} />
          </motion.div>
        </section>

        {/* 🚀 TECH MARQUEE (Moving Banner) */}
        <div className="w-full py-6 border-y border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md overflow-hidden flex whitespace-nowrap mb-32">
          <div className="flex gap-16 items-center animate-marquee opacity-50">
             {/* Simple SAFE Icons use kiye hain yahan */}
             {[...Array(3)].map((_, i) => (
                <React.Fragment key={i}>
                  <span className="text-xl font-black tracking-widest text-gray-500 uppercase flex items-center gap-3"><Terminal/> PYTHON 3.10</span>
                  <span className="text-xl font-black tracking-widest text-gray-500 uppercase flex items-center gap-3"><Server/> NODE.JS</span>
                  <span className="text-xl font-black tracking-widest text-gray-500 uppercase flex items-center gap-3"><Cpu/> PM2 ENGINE</span>
                  <span className="text-xl font-black tracking-widest text-gray-500 uppercase flex items-center gap-3"><Lock/> DOCKER</span>
                  <span className="text-xl font-black tracking-widest text-gray-500 uppercase flex items-center gap-3"><Zap/> FASTAPI</span>
                </React.Fragment>
             ))}
          </div>
        </div>

        {/* ⚙️ FEATURES SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20 mb-20">
          <motion.div 
            className="text-center mb-20"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-6">God-Level Infrastructure</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to host complex bots and scalable APIs, with zero command-line headaches.</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
          >
            <FeatureCard 
              icon={GitBranch} 
              title="GitHub Webhooks" 
              desc="Just push your code to GitHub. Our engine automatically pulls the latest changes, resolves dependencies, and performs a hot-restart."
            />
            <FeatureCard 
              icon={Lock} 
              title="Smart .env Manager" 
              desc="Never expose API keys again. Securely inject environment variables directly into your secure server vault from the visual dashboard."
            />
            <FeatureCard 
              icon={Activity} 
              title="Live Log Streaming" 
              desc="Connected via high-speed WebSockets. Watch your terminal outputs, builds, and debug errors in absolute real-time."
            />
            <FeatureCard 
              icon={Cpu} 
              title="Dual Deployment" 
              desc="Choose your weapon. Run lightweight Python/Node apps via blazing fast PM2, or deploy complex setups using automated Docker engines."
            />
            <FeatureCard 
              icon={Zap} 
              title="Zero Downtime" 
              desc="Our smart process manager constantly monitors your app. It seamlessly restarts active apps or resurrects them if they crash."
            />
            <FeatureCard 
              icon={Server} 
              title="Dedicated API" 
              desc="Control your server programmatically. Restart, check status, flush logs, and trigger deploys via simple REST API calls."
            />
          </motion.div>
        </section>

        {/* 📊 STATS SECTION */}
        <section className="max-w-6xl mx-auto px-6 py-20 mb-32 border-t border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatBox value="99.9%" label="Server Uptime" />
            <StatBox value="<2s" label="Deploy Time" />
            <StatBox value="AES" label="Encryption" />
            <StatBox value="24/7" label="Process Monitor" />
          </div>
        </section>

        {/* CTA FOOTER */}
        <section className="w-full bg-gradient-to-b from-transparent to-purple-900/10 py-32 text-center border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 px-6">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Ready to exit the Matrix?</h2>
            <Link to="/register" className="inline-flex items-center gap-3 bg-white text-black font-black px-10 py-5 rounded-2xl hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-lg">
              Initialize Your First Bot <ArrowRight size={20}/>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

