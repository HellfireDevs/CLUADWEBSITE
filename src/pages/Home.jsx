import React from 'react';
import { motion } from 'framer-motion';
import { Server, Terminal, GitBranch, Zap, Activity, Lock, Cpu, Rocket } from 'lucide-react';

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};

// --- BACKGROUND ---
const Background = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    <div className="absolute w-[500px] h-[500px] bg-purple-600/30 blur-[140px] rounded-full top-[-100px] left-[-100px]" />
    <div className="absolute w-[400px] h-[400px] bg-pink-500/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
  </div>
);

// --- NAVBAR ---
const Navbar = () => (
  <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50">
    <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex justify-between items-center">
      <div className="text-white font-black text-xl flex items-center gap-2">
        <Server className="text-purple-500" /> NEXCLOUD
      </div>
      <div className="flex gap-4">
        <a href="/login" className="text-gray-300 hover:text-white">Login</a>
        <a href="/register" className="bg-purple-600 px-5 py-2 rounded-full">Sign Up</a>
      </div>
    </div>
  </nav>
);

// --- FEATURE CARD ---
const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ scale: 1.05 }}
    className="bg-white/[0.05] border border-white/10 p-8 rounded-3xl backdrop-blur-xl"
  >
    <Icon className="text-purple-400 mb-4" size={32} />
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{desc}</p>
  </motion.div>
);

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen font-sans relative overflow-x-hidden">
      <Background />
      <Navbar />

      {/* HERO */}
      <section className="flex flex-col justify-center items-center text-center min-h-screen px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-9xl font-black mb-6"
        >
          Deploy Faster
          <br />
          <span className="text-purple-500">Than Ever.</span>
        </motion.h1>

        <p className="text-gray-400 text-lg max-w-xl mb-8">
          Push your code and we handle everything. Hosting, scaling, logs — all automated.
        </p>

        <div className="flex gap-4">
          <a className="bg-purple-600 px-8 py-4 rounded-xl flex gap-2 items-center">
            <Rocket size={18}/> Get Started
          </a>
          <a className="border border-white/20 px-8 py-4 rounded-xl flex gap-2 items-center">
            <Terminal size={18}/> Live Demo
          </a>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto py-20 px-6 text-center">
        {[
          { num: "99.9%", label: "Uptime" },
          { num: "1K+", label: "Deploys" },
          { num: "24/7", label: "Monitoring" },
          { num: "<1s", label: "Deploy" },
        ].map((item, i) => (
          <div key={i} className="bg-white/[0.05] p-6 rounded-xl">
            <h3 className="text-2xl text-purple-400 font-bold">{item.num}</h3>
            <p className="text-gray-400">{item.label}</p>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        className="max-w-7xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6"
      >
        <FeatureCard icon={GitBranch} title="GitHub Deploy" desc="Auto deploy from GitHub" />
        <FeatureCard icon={Lock} title="Secure ENV" desc="Safe environment variables" />
        <FeatureCard icon={Activity} title="Live Logs" desc="Real-time debugging" />
        <FeatureCard icon={Cpu} title="Docker + PM2" desc="Flexible runtime" />
        <FeatureCard icon={Zap} title="Fast Restart" desc="Zero downtime" />
        <FeatureCard icon={Server} title="API Control" desc="Full server control" />
      </motion.section>

      {/* CTA */}
      <section className="text-center py-24">
        <h2 className="text-4xl font-black mb-4">Start Building Today</h2>
        <p className="text-gray-400 mb-8">Deploy your first app in seconds.</p>
        <a className="bg-purple-600 px-10 py-4 rounded-xl font-bold">Launch Now 🚀</a>
      </section>

    </div>
  );
}
