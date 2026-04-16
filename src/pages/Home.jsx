import React from 'react';
import { motion } from 'framer-motion';
import { Server, Terminal, GitBranch, Zap, Activity, Lock, Cpu, Rocket, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Background from '../components/Background';

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, type: "spring", bounce: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// --- COMPONENTS ---
const Navbar = () => (
  <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-6xl z-50">
    <div className="bg-[#050505]/80 backdrop-blur-2xl border border-white/10 rounded-full px-5 py-3 sm:px-6 sm:py-4 flex justify-between items-center shadow-[0_0_30px_rgba(168,85,247,0.15)]">
      <div className="text-white font-black text-lg sm:text-xl tracking-widest flex items-center gap-2">
        <Server className="text-purple-500 w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /> NEX<span className="text-purple-500">CLOUD</span>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/login" className="text-gray-300 hover:text-white font-bold text-xs sm:text-sm transition-colors">
          Login
        </Link>
        <Link to="/register" className="relative group overflow-hidden bg-white/10 border border-white/10 hover:border-purple-500 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300">
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
    className="relative group bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 p-6 sm:p-8 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="relative z-10">
      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <Icon className="text-purple-400 w-6 h-6 sm:w-8 sm:h-8" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 tracking-wide">{title}</h3>
      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const StatBox = ({ value, label }) => (
  <div className="text-center p-4 sm:p-6 border border-white/5 bg-white/[0.01] rounded-2xl backdrop-blur-sm hover:bg-white/[0.03] transition-colors">
    <h4 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-1 sm:mb-2">{value}</h4>
    <p className="text-gray-500 text-[10px] sm:text-sm uppercase tracking-widest font-bold">{label}</p>
  </div>
);

export default function Home() {
  return (
    // 🔥 FIX 1: max-w-[100vw] aur overflow-x-hidden strictly add kiya hai container pe
    <div className="text-gray-200 min-h-screen w-full max-w-[100vw] overflow-x-hidden font-sans relative selection:bg-purple-500/30 bg-[#020202]">
      <Background />
      <Navbar />

      {/* 🔥 FIX 2: Blobs ko ek hidden container me daal diya taaki screen faad ke side me na nikle */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-20%] md:left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-700/20 rounded-full blur-[100px] md:blur-[150px] animate-blob mix-blend-screen"></div>
        <div className="absolute top-[40%] right-[-20%] md:right-[-10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-700/20 rounded-full blur-[100px] md:blur-[150px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[10%] md:left-[20%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-indigo-700/10 rounded-full blur-[100px] md:blur-[150px] animate-blob animation-delay-4000 mix-blend-screen"></div>
      </div>

      <div className="relative z-10 w-full">
        
        {/* 🚀 HERO SECTION */}
        <section className="relative flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-32 min-h-screen">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>

          <motion.div
            className="mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-4 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs uppercase tracking-widest font-bold backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.2)]"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
          >
             <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-purple-500"></span>
             </span>
             Engine v2.0 is LIVE
          </motion.div>
          
          {/* 🔥 FIX 3: Text size mobile ke liye thoda chhota kiya hai taaki line break theek se ho */}
          <motion.h1 
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 mb-6 sm:mb-8 tracking-tighter leading-[1.1] max-w-6xl px-2"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Deploy Code. <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-x block mt-2 sm:mt-0">
              Zero Bullshit.
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-sm sm:text-lg md:text-2xl text-gray-400 max-w-3xl mb-10 sm:mb-12 font-medium leading-relaxed px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
          >
            Push to GitHub and let the Engine handle the rest. Smart PM2 management, isolated Docker containers, live terminal logs, and God-level API control.
          </motion.p>
          
          <motion.div className="flex flex-col sm:flex-row gap-4 sm:gap-6 z-20 w-full sm:w-auto px-6 sm:px-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
            <Link to="/dashboard" className="group relative bg-purple-600 text-white font-bold w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <Rocket size={20} className="relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"/> 
              <span className="relative z-10 text-base sm:text-lg">Ignite Dashboard</span>
            </Link>
            <Link to="/login" className="bg-[#111] border border-white/10 hover:border-purple-500/50 hover:bg-white/5 text-white font-bold w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 group">
               <Terminal size={20} className="text-gray-400 group-hover:text-purple-400 transition-colors"/> 
               <span className="text-base sm:text-lg">Terminal Access</span>
            </Link>
          </motion.div>

          <motion.div 
            className="absolute bottom-6 sm:bottom-10 animate-bounce text-gray-600 hidden sm:block"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          >
            <ChevronDown size={32} />
          </motion.div>
        </section>

        {/* 🚀 TECH MARQUEE */}
        {/* 🔥 FIX 4: overflow-hidden is strictly required here to prevent horizontal scroll */}
        <div className="w-full max-w-[100vw] py-4 sm:py-6 border-y border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md overflow-hidden flex whitespace-nowrap mb-20 sm:mb-32">
          <div className="flex gap-10 sm:gap-16 items-center animate-marquee opacity-50">
             {[...Array(3)].map((_, i) => (
                <React.Fragment key={i}>
                  <span className="text-sm sm:text-xl font-black tracking-widest text-gray-500 uppercase flex items-center gap-2 sm:gap-3"><Terminal size={18}/> PYTHON 3.10</span>
                  <span className="text-sm sm:text-xl font-black tracking-widest text-gray-500 uppercase flex items-center gap-2 sm:gap-3"><Server size={18}/> NODE.JS</span>
                  <span className="text-sm sm:text-xl font-black tracking-widest text-gray-500 uppercase flex items-center gap-2 sm:gap-3"><Cpu size={18}/> PM2 ENGINE</span>
                  <span className="text-sm sm:text-xl font-black tracking-widest text-gray-500 uppercase flex items-center gap-2 sm:gap-3"><Lock size={18}/> DOCKER</span>
                  <span className="text-sm sm:text-xl font-black tracking-widest text-gray-500 uppercase flex items-center gap-2 sm:gap-3"><Zap size={18}/> FASTAPI</span>
                </React.Fragment>
             ))}
          </div>
        </div>

        {/* ⚙️ FEATURES SECTION */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 mb-10 sm:mb-20">
          <motion.div 
            className="text-center mb-12 sm:mb-20"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-4 sm:mb-6">God-Level Infrastructure</h2>
            <p className="text-sm sm:text-xl text-gray-400 max-w-2xl mx-auto px-2">Everything you need to host complex bots and scalable APIs, with zero command-line headaches.</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
          >
            <FeatureCard icon={GitBranch} title="GitHub Webhooks" desc="Just push your code to GitHub. Our engine automatically pulls the latest changes, resolves dependencies, and performs a hot-restart." />
            <FeatureCard icon={Lock} title="Smart .env Manager" desc="Never expose API keys again. Securely inject environment variables directly into your secure server vault from the visual dashboard." />
            <FeatureCard icon={Activity} title="Live Log Streaming" desc="Connected via high-speed WebSockets. Watch your terminal outputs, builds, and debug errors in absolute real-time." />
            <FeatureCard icon={Cpu} title="Dual Deployment" desc="Choose your weapon. Run lightweight Python/Node apps via PM2, or deploy complex setups using automated Docker engines." />
            <FeatureCard icon={Zap} title="Zero Downtime" desc="Our smart process manager constantly monitors your app. It seamlessly restarts active apps or resurrects them if they crash." />
            <FeatureCard icon={Server} title="Dedicated API" desc="Control your server programmatically. Restart, check status, flush logs, and trigger deploys via simple REST API calls." />
          </motion.div>
        </section>

        {/* 📊 STATS SECTION */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-20 mb-16 sm:mb-32 border-t border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <StatBox value="99.9%" label="Server Uptime" />
            <StatBox value="<2s" label="Deploy Time" />
            <StatBox value="AES" label="Encryption" />
            <StatBox value="24/7" label="Process Monitor" />
          </div>
        </section>

        {/* CTA FOOTER */}
        <section className="w-full max-w-[100vw] bg-gradient-to-b from-transparent to-purple-900/10 py-20 sm:py-32 text-center border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 sm:mb-8">Ready to exit the Matrix?</h2>
            <Link to="/register" className="inline-flex items-center justify-center w-full sm:w-auto gap-2 sm:gap-3 bg-white text-black font-black px-6 sm:px-10 py-4 sm:py-5 rounded-2xl hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-base sm:text-lg">
              Initialize Your First Bot <ArrowRight size={20}/>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
