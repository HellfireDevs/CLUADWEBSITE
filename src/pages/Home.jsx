import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Server, Terminal, GitBranch, Zap, Activity, Lock,
  Cpu, Rocket, ChevronRight, Globe, Shield, BarChart2,
  Check, ArrowRight, Star, Menu, X
} from 'lucide-react';

/* ─── Google Fonts ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #030305; }
    :root {
      --purple: #a855f7;
      --purple-dim: rgba(168,85,247,0.15);
      --purple-glow: rgba(168,85,247,0.35);
      --cyan: #22d3ee;
      --surface: rgba(255,255,255,0.03);
      --border: rgba(255,255,255,0.07);
    }
    .font-display { font-family: 'Syne', sans-serif; }
    .font-body { font-family: 'DM Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #030305; }
    ::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 4px; }

    /* Grain overlay */
    .grain::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 100;
      opacity: 0.35;
    }

    .glow-text {
      text-shadow: 0 0 60px rgba(168,85,247,0.5), 0 0 120px rgba(168,85,247,0.2);
    }
    .card-hover {
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .card-hover:hover {
      transform: translateY(-4px);
      border-color: rgba(168,85,247,0.4) !important;
      box-shadow: 0 20px 60px rgba(168,85,247,0.12), 0 0 0 1px rgba(168,85,247,0.1);
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(3deg); }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .marquee-track {
      animation: marquee 30s linear infinite;
      display: flex;
      width: max-content;
    }
    .marquee-track:hover { animation-play-state: paused; }
  `}</style>
);

/* ─── Background ─── */
const Background = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
    {/* deep base */}
    <div style={{ position:'absolute', inset:0, background:'#030305' }} />
    {/* mesh blobs */}
    <div style={{
      position:'absolute', top:'-20%', left:'-10%', width:'70vw', height:'70vw',
      background:'radial-gradient(ellipse, rgba(88,28,220,0.18) 0%, transparent 65%)',
      borderRadius:'50%', filter:'blur(40px)'
    }} />
    <div style={{
      position:'absolute', top:'30%', right:'-15%', width:'60vw', height:'60vw',
      background:'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 65%)',
      borderRadius:'50%', filter:'blur(60px)'
    }} />
    <div style={{
      position:'absolute', bottom:'-10%', left:'20%', width:'50vw', height:'50vw',
      background:'radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 65%)',
      borderRadius:'50%', filter:'blur(50px)'
    }} />
    {/* grid */}
    <div style={{
      position:'absolute', inset:0,
      backgroundImage:`linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
      backgroundSize:'60px 60px',
      maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)'
    }} />
    {/* floating orbs */}
    {[...Array(6)].map((_, i) => (
      <div key={i} style={{
        position:'absolute',
        width: `${8 + i * 4}px`, height: `${8 + i * 4}px`,
        borderRadius:'50%',
        background: i % 2 === 0 ? 'rgba(168,85,247,0.6)' : 'rgba(34,211,238,0.4)',
        top: `${10 + i * 15}%`, left: `${5 + i * 16}%`,
        animation: `float ${4 + i}s ease-in-out infinite`,
        animationDelay: `${i * 0.7}s`,
        boxShadow: `0 0 20px ${i % 2 === 0 ? 'rgba(168,85,247,0.8)' : 'rgba(34,211,238,0.6)'}`
      }} />
    ))}
  </div>
);

/* ─── Navbar ─── */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position:'fixed', top: scrolled ? 8 : 16, left:'50%', transform:'translateX(-50%)',
      width:'92%', maxWidth:1100, zIndex:200,
      transition:'top 0.3s ease'
    }}>
      <div style={{
        background: scrolled ? 'rgba(3,3,5,0.85)' : 'rgba(3,3,5,0.5)',
        backdropFilter:'blur(24px)',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:100,
        padding:'14px 28px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.1)' : 'none',
        transition:'all 0.3s ease'
      }}>
        {/* Logo */}
        <div className="font-display" style={{
          color:'white', fontWeight:900, fontSize:20, letterSpacing:3,
          display:'flex', alignItems:'center', gap:8
        }}>
          <div style={{
            width:32, height:32, borderRadius:10,
            background:'linear-gradient(135deg, #7c3aed, #a855f7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 20px rgba(168,85,247,0.5)'
          }}>
            <Server size={16} color="white" />
          </div>
          NEX<span style={{color:'#a855f7'}}>CLOUD</span>
        </div>

        {/* Desktop Links */}
        <div style={{ display:'flex', alignItems:'center', gap:32 }} className="font-body">
          {['Features','Pricing','Docs','Status'].map(l => (
            <a key={l} href="#" style={{
              color:'rgba(255,255,255,0.5)', fontSize:14, fontWeight:500,
              textDecoration:'none', transition:'color 0.2s'
            }}
            onMouseEnter={e => e.target.style.color='white'}
            onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.5)'}
            >{l}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <a href="/login" className="font-body" style={{
            color:'rgba(255,255,255,0.6)', fontSize:14, fontWeight:500,
            textDecoration:'none', padding:'8px 16px',
            transition:'color 0.2s'
          }}
          onMouseEnter={e => e.target.style.color='white'}
          onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.6)'}
          >Login</a>
          <a href="/register" className="font-body" style={{
            background:'linear-gradient(135deg, #7c3aed, #a855f7)',
            color:'white', fontSize:14, fontWeight:700,
            textDecoration:'none', padding:'10px 22px', borderRadius:100,
            boxShadow:'0 0 24px rgba(168,85,247,0.4)',
            transition:'all 0.2s', display:'flex', alignItems:'center', gap:6
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 40px rgba(168,85,247,0.7)'; e.currentTarget.style.transform='scale(1.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='0 0 24px rgba(168,85,247,0.4)'; e.currentTarget.style.transform='scale(1)'; }}
          >Get Started <ArrowRight size={14}/></a>
        </div>
      </div>
    </nav>
  );
};

/* ─── Stat Counter ─── */
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return [count, ref];
};

const StatCard = ({ value, suffix, label, icon: Icon }) => {
  const [count, ref] = useCounter(value);
  return (
    <div ref={ref} style={{
      textAlign:'center', padding:'32px 24px',
      background:'rgba(255,255,255,0.02)',
      border:'1px solid rgba(255,255,255,0.06)',
      borderRadius:24,
      position:'relative', overflow:'hidden'
    }}>
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:1,
        background:'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)'
      }} />
      <div style={{
        width:48, height:48, borderRadius:16,
        background:'rgba(168,85,247,0.1)',
        border:'1px solid rgba(168,85,247,0.2)',
        display:'flex', alignItems:'center', justifyContent:'center',
        margin:'0 auto 16px'
      }}>
        <Icon size={22} color="#a855f7" />
      </div>
      <div className="font-display" style={{
        fontSize:42, fontWeight:900, color:'white',
        lineHeight:1
      }}>
        {count.toLocaleString()}<span style={{color:'#a855f7'}}>{suffix}</span>
      </div>
      <div className="font-body" style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:8, fontWeight:500 }}>{label}</div>
    </div>
  );
};

/* ─── Feature Card ─── */
const FeatureCard = ({ icon: Icon, title, desc, accent = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="card-hover"
    style={{
      background: accent ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.05))' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${accent ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius:24,
      padding:32,
      position:'relative', overflow:'hidden'
    }}
  >
    {accent && (
      <div style={{
        position:'absolute', top:-40, right:-40, width:120, height:120,
        background:'radial-gradient(circle, rgba(168,85,247,0.2), transparent)',
        borderRadius:'50%'
      }} />
    )}
    <div style={{
      width:52, height:52, borderRadius:16,
      background: accent ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.08)',
      border:`1px solid ${accent ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.15)'}`,
      display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20
    }}>
      <Icon size={24} color="#a855f7" />
    </div>
    <h3 className="font-display" style={{ fontSize:20, fontWeight:800, color:'white', marginBottom:10 }}>{title}</h3>
    <p className="font-body" style={{ color:'rgba(255,255,255,0.45)', fontSize:14, lineHeight:1.7 }}>{desc}</p>
    <div style={{
      marginTop:20, display:'flex', alignItems:'center', gap:6,
      color:'#a855f7', fontSize:13, fontWeight:600, cursor:'pointer'
    }}>
      <span className="font-body">Learn more</span> <ChevronRight size={14}/>
    </div>
  </motion.div>
);

/* ─── Pricing Card ─── */
const PricingCard = ({ plan, price, features, highlight, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="card-hover"
    style={{
      background: highlight
        ? 'linear-gradient(160deg, rgba(124,58,237,0.2), rgba(168,85,247,0.08))'
        : 'rgba(255,255,255,0.02)',
      border: `1px solid ${highlight ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius:28,
      padding:36,
      position:'relative', overflow:'hidden',
      ...(highlight ? { boxShadow:'0 0 60px rgba(168,85,247,0.15)' } : {})
    }}
  >
    {highlight && (
      <>
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:2,
          background:'linear-gradient(90deg, transparent, #a855f7, #22d3ee, transparent)'
        }} />
        <div style={{
          position:'absolute', top:20, right:20,
          background:'linear-gradient(135deg, #7c3aed, #a855f7)',
          color:'white', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:100,
          letterSpacing:1, fontFamily:'JetBrains Mono, monospace'
        }}>POPULAR</div>
      </>
    )}
    <div className="font-body" style={{ color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>{plan}</div>
    <div style={{ marginBottom:28 }}>
      <span className="font-display" style={{ fontSize:52, fontWeight:900, color:'white', lineHeight:1 }}>${price}</span>
      <span className="font-body" style={{ color:'rgba(255,255,255,0.35)', fontSize:14 }}>/mo</span>
    </div>
    <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
      {features.map((f, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:20, height:20, borderRadius:6,
            background: highlight ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
          }}>
            <Check size={12} color={highlight ? '#a855f7' : 'rgba(255,255,255,0.4)'} />
          </div>
          <span className="font-body" style={{ color:'rgba(255,255,255,0.6)', fontSize:14 }}>{f}</span>
        </div>
      ))}
    </div>
    <a href="/register" style={{
      display:'block', textAlign:'center',
      background: highlight ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.05)',
      border: highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
      color:'white', fontWeight:700, fontSize:14, padding:'14px 0', borderRadius:14,
      textDecoration:'none',
      boxShadow: highlight ? '0 0 30px rgba(168,85,247,0.3)' : 'none',
      transition:'all 0.2s',
      fontFamily:'DM Sans, sans-serif'
    }}>
      {plan === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
    </a>
  </motion.div>
);

/* ─── Terminal Animation ─── */
const TerminalBlock = () => {
  const lines = [
    { text: '$ git push origin main', color: '#22d3ee', delay: 0 },
    { text: '→ Webhook received by NexCloud...', color: 'rgba(255,255,255,0.5)', delay: 0.6 },
    { text: '→ Pulling latest changes...', color: 'rgba(255,255,255,0.5)', delay: 1.1 },
    { text: '→ Installing dependencies...', color: 'rgba(255,255,255,0.5)', delay: 1.6 },
    { text: '✓ PM2 restarted: my-bot (PID 4821)', color: '#4ade80', delay: 2.1 },
    { text: '✓ Live in 1.2s', color: '#a855f7', delay: 2.6 },
  ];
  return (
    <div style={{
      background:'rgba(0,0,0,0.6)',
      border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:20,
      padding:28,
      backdropFilter:'blur(20px)',
      boxShadow:'0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.1)'
    }}>
      {/* Window dots */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
          <div key={i} style={{ width:12, height:12, borderRadius:'50%', background:c }} />
        ))}
        <div style={{ marginLeft:'auto', color:'rgba(255,255,255,0.2)', fontSize:11 }} className="font-mono">nexcloud ~ deploy</div>
      </div>
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity:0, x:-10 }}
          whileInView={{ opacity:1, x:0 }}
          viewport={{ once: true }}
          transition={{ delay: l.delay, duration: 0.3 }}
          className="font-mono"
          style={{ color: l.color, fontSize:13, lineHeight:1.8 }}
        >
          {l.text}
        </motion.div>
      ))}
      {/* Blinking cursor */}
      <div className="font-mono" style={{ color:'#a855f7', fontSize:13, marginTop:4 }}>
        <motion.span animate={{ opacity:[1,0,1] }} transition={{ repeat:Infinity, duration:1 }}>█</motion.span>
      </div>
    </div>
  );
};

/* ─── Marquee ─── */
const MarqueeTech = () => {
  const items = ['Node.js','Python','Docker','PM2','GitHub','WebSockets','Redis','Nginx','PostgreSQL','MongoDB','FastAPI','Express','Bun','Deno','Next.js','Django'];
  return (
    <div style={{ overflow:'hidden', padding:'16px 0', borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div className="marquee-track">
        {[...items,...items].map((t, i) => (
          <div key={i} className="font-mono" style={{
            padding:'8px 24px', margin:'0 8px',
            background:'rgba(255,255,255,0.03)',
            border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:100,
            color:'rgba(255,255,255,0.3)', fontSize:12, fontWeight:600,
            whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'rgba(168,85,247,0.5)', display:'inline-block' }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Main ─── */
export default function Home() {
  return (
    <div className="font-body grain" style={{ background:'#030305', color:'rgba(255,255,255,0.8)', minHeight:'100vh', overflowX:'hidden' }}>
      <FontLoader />
      <Background />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        minHeight:'100vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', textAlign:'center',
        padding:'120px 24px 60px', position:'relative', zIndex:10
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
          style={{
            display:'inline-flex', alignItems:'center', gap:10,
            background:'rgba(168,85,247,0.08)',
            border:'1px solid rgba(168,85,247,0.25)',
            padding:'8px 20px', borderRadius:100, marginBottom:36,
            color:'#c084fc', fontSize:12, fontWeight:700, letterSpacing:2,
            textTransform:'uppercase'
          }}
        >
          <span style={{ position:'relative', display:'flex', width:8, height:8 }}>
            <span style={{
              position:'absolute', inset:0, borderRadius:'50%', background:'#a855f7',
              animation:'pulse-ring 1.5s ease-out infinite'
            }} />
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#a855f7', position:'relative' }} />
          </span>
          Engine v2.0 — Now with Docker Auto-Build
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-display"
          initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}
          style={{
            fontSize:'clamp(48px, 9vw, 100px)',
            fontWeight:900, lineHeight:1.0, letterSpacing:'-2px',
            color:'white', maxWidth:900, marginBottom:28
          }}
        >
          Deploy Code.
          <br />
          <span className="glow-text" style={{
            background:'linear-gradient(135deg, #a855f7 0%, #c084fc 40%, #22d3ee 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text'
          }}>
            Skip the BS.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          style={{ fontSize:18, color:'rgba(255,255,255,0.4)', maxWidth:560, lineHeight:1.7, marginBottom:44, fontWeight:400 }}
        >
          Push to GitHub and we handle everything — PM2 restarts, Docker builds, live log streaming, and instant <span className="font-mono" style={{ color:'#a855f7', fontSize:15 }}>.env</span> injection.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}
        >
          <a href="/dashboard" style={{
            background:'linear-gradient(135deg, #7c3aed, #a855f7)',
            color:'white', fontWeight:700, fontSize:15,
            padding:'16px 32px', borderRadius:16,
            textDecoration:'none', display:'flex', alignItems:'center', gap:10,
            boxShadow:'0 0 50px rgba(168,85,247,0.45)',
            transition:'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 70px rgba(168,85,247,0.65)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 0 50px rgba(168,85,247,0.45)'; }}
          >
            <Rocket size={18}/> Launch Dashboard
          </a>
          <a href="/docs" style={{
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.1)',
            color:'rgba(255,255,255,0.7)', fontWeight:600, fontSize:15,
            padding:'16px 32px', borderRadius:16,
            textDecoration:'none', display:'flex', alignItems:'center', gap:10,
            transition:'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; e.currentTarget.style.color='white'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(255,255,255,0.7)'; }}
          >
            <Terminal size={18}/> View Docs
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}
          style={{ marginTop:48, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', justifyContent:'center' }}
        >
          <div style={{ display:'flex' }}>
            {['#7c3aed','#a855f7','#6d28d9','#8b5cf6','#9333ea'].map((c,i) => (
              <div key={i} style={{
                width:32, height:32, borderRadius:'50%',
                background:`linear-gradient(135deg, ${c}, rgba(255,255,255,0.2))`,
                border:'2px solid #030305',
                marginLeft: i > 0 ? -10 : 0
              }} />
            ))}
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {[...Array(5)].map((_,i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
          </div>
          <span style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Trusted by <strong style={{color:'white'}}>2,400+</strong> developers</span>
        </motion.div>
      </section>

      {/* ── TECH MARQUEE ── */}
      <div style={{ position:'relative', zIndex:10 }}><MarqueeTech /></div>

      {/* ── STATS ── */}
      <section style={{ maxWidth:1100, margin:'80px auto', padding:'0 24px', position:'relative', zIndex:10 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:20 }}>
          <StatCard value={2400} suffix="+" label="Active Deployments" icon={Rocket} />
          <StatCard value={99} suffix=".9%" label="Uptime SLA" icon={Activity} />
          <StatCard value={1200} suffix="ms" label="Avg Deploy Time" icon={Zap} />
          <StatCard value={50} suffix="+" label="Supported Frameworks" icon={Globe} />
        </div>
      </section>

      {/* ── TERMINAL + TEXT ── */}
      <section style={{ maxWidth:1100, margin:'80px auto', padding:'0 24px', position:'relative', zIndex:10 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <div className="font-mono" style={{ color:'#a855f7', fontSize:12, letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>// how it works</div>
            <h2 className="font-display" style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:900, color:'white', lineHeight:1.1, marginBottom:20 }}>
              From push<br />to <span style={{ color:'#a855f7' }}>production</span><br />in seconds.
            </h2>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15, lineHeight:1.8, marginBottom:32 }}>
              Connect your GitHub repo once. Every push triggers our engine — dependency install, process restart, and zero-downtime deployment. Watch it happen live.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {['Connect GitHub repo in 30 seconds','Automatic .env injection from dashboard','PM2 or Docker — your choice','Live WebSocket log streaming'].map((t,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{
                    width:24, height:24, borderRadius:8,
                    background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.3)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                  }}>
                    <Check size={13} color="#a855f7" />
                  </div>
                  <span style={{ color:'rgba(255,255,255,0.6)', fontSize:14 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity:0, x:40 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
          >
            <TerminalBlock />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth:1100, margin:'80px auto', padding:'0 24px', position:'relative', zIndex:10 }}>
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <div className="font-mono" style={{ color:'#a855f7', fontSize:12, letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>// features</div>
          <h2 className="font-display" style={{ fontSize:'clamp(30px,5vw,52px)', fontWeight:900, color:'white', marginBottom:16 }}>
            Everything you need.<br />Nothing you don't.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15, maxWidth:500, margin:'0 auto' }}>Built for developers who hate wasting time on DevOps.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20 }}>
          <FeatureCard icon={GitBranch} title="GitHub Webhooks" desc="Push your code and walk away. Our engine pulls changes, installs deps, and restarts your app automatically — every single time." accent delay={0} />
          <FeatureCard icon={Lock} title="Smart .env Manager" desc="Securely inject secrets and API keys directly into your deployments from our dashboard. No plaintext. No leaks." delay={0.1} />
          <FeatureCard icon={Activity} title="Live Log Streaming" desc="Real-time terminal output streamed via WebSockets. Debug without SSH. See what's happening the moment it happens." delay={0.2} />
          <FeatureCard icon={Cpu} title="PM2 & Docker Engine" desc="Simple apps via PM2, complex setups via Docker — we auto-detect your Dockerfile or generate one from your repo type." delay={0.3} />
          <FeatureCard icon={Zap} title="Zero Downtime Deploys" desc="Smart process manager that checks health before switching traffic. Your users never see a single error during updates." delay={0.4} />
          <FeatureCard icon={Shield} title="Dedicated REST API" desc="Control everything programmatically. Restart, deploy, and check status via authenticated API calls from anywhere." delay={0.5} />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ maxWidth:1100, margin:'80px auto', padding:'0 24px', position:'relative', zIndex:10 }}>
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <div className="font-mono" style={{ color:'#a855f7', fontSize:12, letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>// pricing</div>
          <h2 className="font-display" style={{ fontSize:'clamp(30px,5vw,52px)', fontWeight:900, color:'white', marginBottom:16 }}>
            Simple, honest pricing.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15 }}>No hidden fees. Cancel anytime.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24 }}>
          <PricingCard plan="Starter" price={0} delay={0} features={['3 deployments','GitHub webhooks','PM2 only','1GB RAM per app','Community support']} />
          <PricingCard plan="Pro" price={12} delay={0.1} highlight features={['Unlimited deployments','Docker support','Smart .env Manager','Live log streaming','Priority support','Custom domains']} />
          <PricingCard plan="Enterprise" price={49} delay={0.2} features={['Everything in Pro','Dedicated node','SLA guarantee','Team access control','SSO & audit logs','24/7 SLA support']} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop:'1px solid rgba(255,255,255,0.05)',
        padding:'48px 24px', marginTop:80,
        position:'relative', zIndex:10, textAlign:'center'
      }}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          marginBottom:16, color:'white', fontWeight:900, fontSize:18, letterSpacing:3
        }} className="font-display">
          <Server size={18} color="#a855f7" />
          NEX<span style={{color:'#a855f7'}}>CLOUD</span>
        </div>
        <p style={{ color:'rgba(255,255,255,0.25)', fontSize:13 }}>© 2025 NexCloud. Built for developers, by developers.</p>
      </footer>
    </div>
  );
}
