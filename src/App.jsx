import React from 'react';
import { motion } from 'framer-motion';
import { BotMessageSquare, MessageCircle, ShieldCheck, Zap, Headset } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import Background from './components/Background';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const fadeIn = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const BotCard = ({ name, description, icon: Icon, popular }) => (
  <motion.div 
    variants={fadeIn}
    className="bg-gray-900/60 p-8 rounded-3xl shadow-xl border border-gray-800 backdrop-blur-md hover:border-purple-600 transition-all duration-300 relative group"
    whileHover={{ y: -5, scale: 1.02 }}
  >
    {popular && (
        <span className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Popular</span>
    )}
    <div className="flex items-center gap-4 mb-6">
      <div className="bg-purple-950/50 p-4 rounded-full border border-purple-700">
        <Icon className="w-10 h-10 text-purple-400" />
      </div>
      <h3 className="text-3xl font-bold text-white tracking-tight">{name}</h3>
    </div>
    <p className="text-gray-400 text-lg leading-relaxed mb-8">{description}</p>
    <div className="flex gap-4">
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all">Launch Bot</button>
        <button className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition-all">View Updates</button>
    </div>
  </motion.div>
);

const TeamMember = ({ name, role, description, letter }) => (
  <motion.div variants={fadeIn} className="bg-gray-900/60 p-8 rounded-[3rem] border border-gray-800 flex items-center gap-8 shadow-xl w-full backdrop-blur-md hover:border-purple-600 transition-all">
      <div className="w-24 h-24 rounded-full bg-purple-900 flex items-center justify-center text-5xl font-bold text-white border-4 border-purple-600 shadow-lg">{letter}</div>
      <div>
          <span className="text-purple-400 font-medium text-lg">{role}</span>
          <h3 className="text-4xl font-bold text-white mb-2">{name}</h3>
          <p className="text-gray-400 text-lg">{description}</p>
      </div>
  </motion.div>
);

export default function App() {
  return (
    <div className="text-gray-200 min-h-screen font-sans relative">
      <Background />

      <div className="relative z-10">
        {/* 🚀 Hero Section */}
        <section className="h-screen flex flex-col justify-center items-center text-center p-6 bg-black/20">
          <motion.div
            className="mb-6 bg-gray-900/80 border border-purple-500/50 text-purple-300 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          >
             ● Live on Layer 223+
          </motion.div>
          <motion.h1 
            className="text-8xl md:text-9xl font-extrabold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
            initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          >
            Welcome to nex
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
          >
            An advanced Telegram bot ecosystem, precisely engineered by HellfireDevs.
          </motion.p>
          <motion.div className="flex gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 transition-all">
              <Zap size={20}/> Explore Ecosystem
            </button>
            <button className="bg-gray-100 hover:bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl flex items-center gap-2 transition-all">
              <ShieldCheck size={20}/> Security
            </button>
          </motion.div>
        </section>

        {/* 🤖 Bots Section */}
        <motion.section className="min-h-screen p-12 lg:p-24" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <motion.div variants={fadeIn} className="text-center mb-20">
              <span className="text-purple-400 font-semibold text-xl uppercase tracking-wider">Our Ecosystem</span>
              <h2 className="text-6xl md:text-7xl font-extrabold text-white mt-4 mb-6">Powerful <span className="text-purple-500">Telegram Bots</span></h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <BotCard name="Alisa Music Bot" description="Zero-lag, extreme high-quality music streaming within supergroups." icon={BotMessageSquare} popular />
            <BotCard name="NEX Management" description="Next-generation group automation ecosystem. Advanced antiflood protocols." icon={BotMessageSquare} />
          </div>
        </motion.section>

        {/* 💻 Team Section */}
        <motion.section className="p-12 lg:p-24 bg-black/40 backdrop-blur-md" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <motion.div variants={fadeIn} className="text-center mb-20">
                <span className="text-purple-400 font-semibold text-xl uppercase tracking-wider">The Architects</span>
                <h2 className="text-6xl md:text-7xl font-extrabold text-white mt-4 mb-6">HellfireDevs <span className="text-purple-500">Core Team</span></h2>
          </motion.div>
          
          <div className="flex flex-col gap-10 max-w-4xl mx-auto">
            <TeamMember name="Shivansh" role="Lead Developer & AWS Architect" description="Specialist in Layer 223+ migration, raw MTProto decoding, and secure infrastructure." letter="S" />
          </div>
        </motion.section>

        {/* 📞 Footer */}
        <footer className="p-12 border-t border-gray-900 bg-black text-center relative z-20">
          <motion.div variants={fadeIn} initial="hidden" whileInView="visible" className="flex justify-center gap-10 text-purple-400 mb-8">
            <a href="#" className="hover:text-white flex items-center gap-2"><Headset size={24} /> Support Group</a>
            <a href="#" className="hover:text-white flex items-center gap-2"><FaGithub size={24} /> Github</a>
          </motion.div>
          <p className="text-gray-600 text-sm">© 2026 Nex Networks. Engineered by HellfireDevs.</p>
        </footer>
      </div>
    </div>
  );
}
