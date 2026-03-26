import React from 'react';
import { motion } from 'framer-motion';
import { BotMessageSquare, Github, MessageCircle } from 'lucide-react';
import Background from './components/Background';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const fadeIn = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const BotCard = ({ name, description, icon: Icon, popular }) => (
  <motion.div 
    variants={fadeIn}
    className="bg-gray-900/60 p-8 rounded-3xl shadow-xl border border-gray-800 backdrop-blur-sm hover:border-purple-600 transition-all duration-300 relative group"
    whileHover={{ y: -10, scale: 1.02 }}
  >
    {popular && (
        <span className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</span>
    )}
    <div className="flex items-center gap-5 mb-6">
      <div className="bg-purple-950/50 p-4 rounded-full border border-purple-700">
        <Icon className="w-10 h-10 text-purple-400" />
      </div>
      <h3 className="text-3xl font-extrabold text-white">{name}</h3>
    </div>
    <p className="text-gray-400 text-lg leading-relaxed">{description}</p>
    <div className="mt-8 flex gap-4">
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">Launch Bot</button>
        <button className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">View Updates</button>
    </div>
  </motion.div>
);

export default function App() {
  return (
    <div className="text-gray-200 min-h-screen font-sans relative">
      <Background />
      <div className="relative z-10">
        <section className="h-screen flex flex-col justify-center items-center text-center p-6">
          <motion.div
            className="mb-4 bg-gray-800/50 border border-purple-500/50 text-purple-300 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
             ● Now Live
          </motion.div>
          <motion.h1 
            className="text-8xl font-extrabold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            Welcome to nex
          </motion.h1>
          <motion.p 
            className="text-2xl text-gray-400 max-w-3xl mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            High-performance Telegram bot ecosystem, built by HellfireDevs.
          </motion.p>
        </section>

        <motion.section 
          id="bots"
          className="min-h-screen p-16 lg:p-28"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={fadeIn} className="text-center mb-24">
              <span className="text-purple-400 font-semibold text-lg">Our Ecosystem</span>
              <h2 className="text-7xl font-extrabold text-white mt-2 mb-6">Powerful <span className="text-purple-500">Telegram Bots</span></h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
            <BotCard 
              name="Alisa Music Bot" 
              description="Lag-free, high-quality music streaming within Telegram supergroups."
              icon={BotMessageSquare}
              popular
            />
            <BotCard 
              name="NEX Management" 
              description="Advanced group automation, powerful antiflood controls, and security protocols."
              icon={BotMessageSquare}
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
