import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Server, Terminal, GitBranch, Zap, Activity, Lock,
  Cpu, Rocket, ChevronRight, Globe, Shield,
  Check, ArrowRight, Star,
} from 'lucide-react';

/* ══════════════════════════════════════════════
   GLOBAL STYLES — Force dark + fix overflow
══════════════════════════════════════════════ */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { background: #06040f !important; color-scheme: dark !important; }
    body {
      background: #06040f !important;
      color: rgba(255,255,255,0.8) !important;
      font-family: 'DM Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden !important;
      width: 100% !important;
      max-width: 100vw !important;
    }
    /* Force dark even on light-mode OS */
    @media (prefers-color-scheme: light) {
      html, body { background: #06040f !important; color: rgba(255,255,255,0.8) !important; }
    }

    #root, [data-reactroot] {
      background: #06040f !important;
      overflow-x: hidden !important;
      width: 100% !important;
      max-width: 100vw !important;
    }

    .fd { font-family: 'Syne', sans-serif; }
    .fm { font-family: 'JetBrains Mono', monospace; }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: #06040f; }
    ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 4px; }

    /* ── Keyframes ── */
    @keyframes pulse-ring {
      0%   { transform: scale(1); opacity: 0.9; }
      100% { transform: scale(2.8); opacity: 0; }
    }
    @keyframes spin3d {
      from { transform: rotateY(0deg) rotateX(20deg); }
      to   { transform: rotateY(360deg) rotateX(20deg); }
    }
    @keyframes drift {
      0%,100% { transform: translate(0,0) rotate(0deg); }
      33%      { transform: translate(12px,-18px) rotate(4deg); }
      66%      { transform: translate(-8px,-30px) rotate(-3deg); }
    }
    @keyframes marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes scanline {
      0%   { top: -10%; }
      100% { top: 110%; }
    }
    @keyframes float3d {
      0%,100% { transform: perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0); }
      25%      { transform: perspective(700px) rotateX(4deg) rotateY(7deg) translateZ(14px); }
      50%      { transform: perspective(700px) rotateX(-3deg) rotateY(-5deg) translateZ(22px); }
      75%      { transform: perspective(700px) rotateX(3deg) rotateY(-7deg) translateZ(10px); }
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

    /* card 3d hover */
    .c3d { transition: transform .35s cubic-bezier(.175,.885,.32,1.275), box-shadow .35s ease; }
    .c3d:hover {
      transform: perspective(800px) rotateX(-4deg) rotateY(6deg) translateY(-8px) scale(1.02);
      box-shadow: 0 30px 70px rgba(124,58,237,.25), 0 0 0 1px rgba(168,85,247,.3) !important;
    }

    /* glow button */
    .gbtn { transition: all .25s cubic-bezier(.4,0,.2,1); }
    .gbtn:hover { transform: translateY(-3px) scale(1.04); }
    .gbtn:active { transform: translateY(0) scale(.98); }

    /* marquee */
    .mwrap { overflow: hidden; }
    .mtrack { display:flex; width:max-content; animation: marquee 38s linear infinite; }
    .mtrack:hover { animation-play-state: paused; }

    .shimmer {
      background: linear-gradient(90deg,#c084fc 0%,#fff 40%,#22d3ee 60%,#c084fc 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 4s linear infinite;
    }
  `}</style>
);

/* ══════════════════════════════════════════════
   CANVAS BACKGROUND — 3D particle depth field
══════════════════════════════════════════════ */
const Scene3D = () => {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    let W, H, raf;
    const resize = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: 90 }, () => ({
      x: Math.random(), y: Math.random(),
      z: Math.random() * 500 + 80,
      vx: (Math.random() - .5) * .25,
      vy: (Math.random() - .5) * .25,
      r: Math.random() * 1.8 + .4,
      purple: Math.random() > .45,
      op: Math.random() * .55 + .2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#06040f';
      ctx.fillRect(0, 0, W, H);

      // blobs
      [[.15,.2,.42,'rgba(80,20,210,.13)'],[.88,.5,.35,'rgba(168,85,247,.09)'],[.5,.92,.38,'rgba(34,211,238,.06)']].forEach(([bx,by,br,bc]) => {
        const g = ctx.createRadialGradient(bx*W,by*H,0,bx*W,by*H,br*W);
        g.addColorStop(0,bc); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      });

      // grid
      ctx.strokeStyle='rgba(255,255,255,.022)'; ctx.lineWidth=1;
      for(let x=0;x<W;x+=62){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=62){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

      // particles
      const sc0 = 400;
      pts.forEach(p => {
        p.x += p.vx/W; p.y += p.vy/H;
        if(p.x<0)p.x=1; if(p.x>1)p.x=0;
        if(p.y<0)p.y=1; if(p.y>1)p.y=0;
        p.z -= .15; if(p.z<0){ p.z=520; p.x=Math.random(); p.y=Math.random(); }

        const sc = sc0/(sc0+p.z);
        const px = (p.x*W-W/2)*sc+W/2;
        const py = (p.y*H-H/2)*sc+H/2;
        const rv = p.r*sc;
        const al = p.op*sc*1.2;

        ctx.shadowColor = p.purple ? '#a855f7' : '#22d3ee';
        ctx.shadowBlur  = 8*sc;
        ctx.fillStyle   = p.purple ? `rgba(168,85,247,${al})` : `rgba(34,211,238,${al})`;
        ctx.beginPath(); ctx.arc(px,py,Math.max(.3,rv),0,Math.PI*2); ctx.fill();
        ctx.shadowBlur  = 0;
      });

      // connect
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const dx=(a.x-b.x)*W, dy=(a.y-b.y)*H, d=Math.sqrt(dx*dx+dy*dy);
        if(d<115){ ctx.beginPath(); ctx.moveTo(a.x*W,a.y*H); ctx.lineTo(b.x*W,b.y*H);
          ctx.strokeStyle=`rgba(168,85,247,${.055*(1-d/115)})`; ctx.lineWidth=.4; ctx.stroke(); }
      }));

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  }, []);

  return <canvas ref={ref} style={{position:'fixed',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none',display:'block'}} />;
};

/* ══════════════════════════════════════════════
   ROTATING 3D CUBE
══════════════════════════════════════════════ */
const Cube = ({ sz=55, col='#7c3aed', dur='10s', rev=false }) => {
  const h = sz/2;
  const face = (tr) => ({
    position:'absolute', width:sz, height:sz,
    border:`1px solid ${col}45`,
    background:`${col}09`,
    transform: tr,
  });
  return (
    <div style={{width:sz,height:sz,position:'relative',transformStyle:'preserve-3d',
      animation:`spin3d ${dur} linear infinite`,
      animationDirection: rev?'reverse':'normal'}}>
      <div style={face(`translateZ(${h}px)`)}/>
      <div style={face(`translateZ(-${h}px) rotateY(180deg)`)}/>
      <div style={face(`translateX(-${h}px) rotateY(-90deg)`)}/>
      <div style={face(`translateX(${h}px) rotateY(90deg)`)}/>
      <div style={face(`translateY(-${h}px) rotateX(90deg)`)}/>
      <div style={face(`translateY(${h}px) rotateX(-90deg)`)}/>
    </div>
  );
};

/* ══════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════ */
const Navbar = () => {
  const [sc, setSc] = useState(false);
  useEffect(()=>{
    const fn=()=>setSc(window.scrollY>30);
    window.addEventListener('scroll',fn); return ()=>window.removeEventListener('scroll',fn);
  },[]);

  return (
    <nav style={{position:'fixed',top:sc?8:14,left:'50%',transform:'translateX(-50%)',
      width:'min(92%,1080px)',zIndex:999,transition:'top .3s ease'}}>
      <div style={{
        background: sc?'rgba(6,4,15,.94)':'rgba(6,4,15,.6)',
        backdropFilter:'blur(28px)',
        border:'1px solid rgba(168,85,247,.14)',
        borderRadius:100,
        padding:'11px 22px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        boxShadow: sc?'0 8px 40px rgba(0,0,0,.7),0 0 0 1px rgba(168,85,247,.07)':'none',
        transition:'all .3s ease',
        gap:12,
      }}>
        <div className="fd" style={{color:'white',fontWeight:900,fontSize:17,letterSpacing:3,
          display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:9,
            background:'linear-gradient(135deg,#5b21b6,#a855f7)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 0 18px rgba(168,85,247,.5)'}}>
            <Server size={15} color="white"/>
          </div>
          NEX<span style={{color:'#a855f7'}}>CLOUD</span>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:24}}>
          {['Features','Pricing','Docs'].map(l=>(
            <a key={l} href="#" style={{color:'rgba(255,255,255,.42)',fontSize:13,fontWeight:500,
              textDecoration:'none',transition:'color .2s'}}
              onMouseEnter={e=>e.target.style.color='white'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.42)'}>{l}</a>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:9,flexShrink:0}}>
          <a href="/login" style={{color:'rgba(255,255,255,.45)',fontSize:13,fontWeight:500,
            textDecoration:'none',padding:'7px 12px',transition:'color .2s'}}
            onMouseEnter={e=>e.target.style.color='white'}
            onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.45)'}>Login</a>
          <a href="/register" className="gbtn" style={{
            background:'linear-gradient(135deg,#6d28d9,#a855f7)',
            color:'white',fontSize:13,fontWeight:700,
            padding:'9px 18px',borderRadius:100,
            textDecoration:'none',display:'flex',alignItems:'center',gap:5,
            boxShadow:'0 0 22px rgba(168,85,247,.38)',
            whiteSpace:'nowrap',
          }}>Get Started <ArrowRight size={12}/></a>
        </div>
      </div>
    </nav>
  );
};

/* ══════════════════════════════════════════════
   COUNTER
══════════════════════════════════════════════ */
const useCounter=(end,dur=1800)=>{
  const [v,setV]=useState(0);
  const ref=useRef(null), started=useRef(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!started.current){
        started.current=true;
        const step=Math.ceil(end/(dur/16)); let c=0;
        const t=setInterval(()=>{c=Math.min(c+step,end);setV(c);if(c>=end)clearInterval(t);},16);
      }
    },{threshold:.5});
    if(ref.current)obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[end,dur]);
  return [v,ref];
};

const StatCard=({value,suffix,label,icon:Icon})=>{
  const [ct,ref]=useCounter(value);
  return (
    <div ref={ref} className="c3d" style={{
      textAlign:'center',padding:'28px 18px',
      background:'rgba(255,255,255,.02)',
      border:'1px solid rgba(255,255,255,.06)',
      borderRadius:20,position:'relative',overflow:'hidden',
    }}>
      <div style={{position:'absolute',top:0,left:'20%',right:'20%',height:1,
        background:'linear-gradient(90deg,transparent,rgba(168,85,247,.6),transparent)'}}/>
      <div style={{width:42,height:42,borderRadius:13,background:'rgba(168,85,247,.1)',
        border:'1px solid rgba(168,85,247,.2)',display:'flex',alignItems:'center',
        justifyContent:'center',margin:'0 auto 12px'}}>
        <Icon size={18} color="#a855f7"/>
      </div>
      <div className="fd" style={{fontSize:36,fontWeight:900,color:'white',lineHeight:1}}>
        {ct.toLocaleString()}<span style={{color:'#a855f7'}}>{suffix}</span>
      </div>
      <div style={{color:'rgba(255,255,255,.3)',fontSize:11,marginTop:7,fontWeight:500,
        letterSpacing:1,textTransform:'uppercase'}}>{label}</div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   FEATURE CARD
══════════════════════════════════════════════ */
const FCard=({icon:Icon,title,desc,accent,delay=0})=>(
  <motion.div
    initial={{opacity:0,y:40,rotateX:15}}
    whileInView={{opacity:1,y:0,rotateX:0}}
    viewport={{once:true}}
    transition={{duration:.55,delay,type:'spring',bounce:.25}}
    className="c3d"
    style={{
      background:accent?'linear-gradient(145deg,rgba(109,40,217,.18),rgba(168,85,247,.06))':'rgba(255,255,255,.02)',
      border:`1px solid ${accent?'rgba(168,85,247,.3)':'rgba(255,255,255,.06)'}`,
      borderRadius:22,padding:'26px 22px',position:'relative',overflow:'hidden',
    }}
  >
    {accent&&<div style={{position:'absolute',top:-30,right:-30,width:100,height:100,
      background:'radial-gradient(circle,rgba(168,85,247,.25),transparent)',
      borderRadius:'50%',pointerEvents:'none'}}/>}
    <div style={{position:'absolute',top:0,left:'15%',right:'15%',height:1,
      background:`linear-gradient(90deg,transparent,${accent?'rgba(168,85,247,.7)':'rgba(255,255,255,.07)'},transparent)`}}/>
    <div style={{width:46,height:46,borderRadius:13,
      background:accent?'rgba(168,85,247,.18)':'rgba(168,85,247,.08)',
      border:`1px solid ${accent?'rgba(168,85,247,.4)':'rgba(168,85,247,.15)'}`,
      display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,
      boxShadow:accent?'0 0 18px rgba(168,85,247,.2)':'none'}}>
      <Icon size={21} color="#a855f7"/>
    </div>
    <h3 className="fd" style={{fontSize:17,fontWeight:800,color:'white',marginBottom:9}}>{title}</h3>
    <p style={{color:'rgba(255,255,255,.38)',fontSize:13,lineHeight:1.75}}>{desc}</p>
    <div style={{marginTop:16,display:'flex',alignItems:'center',gap:5,
      color:'#a855f7',fontSize:12,fontWeight:700,cursor:'pointer'}}>
      Learn more <ChevronRight size={12}/>
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════
   PRICING CARD
══════════════════════════════════════════════ */
const PCard=({plan,price,features,highlight,delay})=>(
  <motion.div
    initial={{opacity:0,y:50,scale:.95}}
    whileInView={{opacity:1,y:0,scale:1}}
    viewport={{once:true}}
    transition={{duration:.5,delay,type:'spring',bounce:.2}}
    className="c3d"
    style={{
      background:highlight?'linear-gradient(160deg,rgba(109,40,217,.22),rgba(168,85,247,.08))':'rgba(255,255,255,.02)',
      border:`1px solid ${highlight?'rgba(168,85,247,.45)':'rgba(255,255,255,.06)'}`,
      borderRadius:26,padding:'32px 26px',
      position:'relative',overflow:'hidden',
      boxShadow:highlight?'0 0 80px rgba(168,85,247,.15)':'none',
    }}
  >
    {highlight&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,
      background:'linear-gradient(90deg,transparent,#a855f7,#22d3ee,transparent)'}}/>}
    {highlight&&<div style={{position:'absolute',top:16,right:16,
      background:'linear-gradient(135deg,#6d28d9,#a855f7)',
      color:'white',fontSize:10,fontWeight:700,
      padding:'4px 11px',borderRadius:100,letterSpacing:1.5}} className="fm">POPULAR</div>}
    <div style={{color:'rgba(255,255,255,.38)',fontSize:10,fontWeight:700,letterSpacing:2,
      textTransform:'uppercase',marginBottom:9}} className="fm">{plan}</div>
    <div style={{marginBottom:24}}>
      <span className="fd" style={{fontSize:46,fontWeight:900,color:'white',lineHeight:1}}>${price}</span>
      <span style={{color:'rgba(255,255,255,.28)',fontSize:12}}>/mo</span>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:26}}>
      {features.map((f,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:19,height:19,borderRadius:6,flexShrink:0,
            background:highlight?'rgba(168,85,247,.2)':'rgba(255,255,255,.05)',
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Check size={11} color={highlight?'#a855f7':'rgba(255,255,255,.35)'}/>
          </div>
          <span style={{color:'rgba(255,255,255,.52)',fontSize:13}}>{f}</span>
        </div>
      ))}
    </div>
    <a href="/register" className="gbtn" style={{
      display:'block',textAlign:'center',
      background:highlight?'linear-gradient(135deg,#6d28d9,#a855f7)':'rgba(255,255,255,.05)',
      border:highlight?'none':'1px solid rgba(255,255,255,.09)',
      color:'white',fontWeight:700,fontSize:14,padding:'13px 0',borderRadius:14,
      textDecoration:'none',
      boxShadow:highlight?'0 0 28px rgba(168,85,247,.35)':'none',
    }}>{plan==='Enterprise'?'Contact Sales':'Get Started'}</a>
  </motion.div>
);

/* ══════════════════════════════════════════════
   TERMINAL
══════════════════════════════════════════════ */
const Terminal3D=()=>{
  const lines=[
    {t:'$ git push origin main',c:'#22d3ee',d:0},
    {t:'↳ Webhook received...',c:'rgba(255,255,255,.38)',d:.5},
    {t:'↳ Pulling latest changes...',c:'rgba(255,255,255,.38)',d:.95},
    {t:'↳ npm install (12 packages)',c:'rgba(255,255,255,.38)',d:1.4},
    {t:'↳ Building Docker image...',c:'rgba(255,255,255,.38)',d:1.85},
    {t:'✓ PM2 restarted: bot [PID 4821]',c:'#4ade80',d:2.3},
    {t:'✓ Live in 1.3s 🚀',c:'#a855f7',d:2.75},
  ];
  return (
    <motion.div
      initial={{opacity:0,x:40,rotateY:-12}}
      whileInView={{opacity:1,x:0,rotateY:0}}
      viewport={{once:true}}
      transition={{duration:.65,type:'spring',bounce:.2}}
      style={{animation:'float3d 9s ease-in-out infinite'}}
    >
      <div style={{
        background:'rgba(2,1,10,.85)',
        border:'1px solid rgba(168,85,247,.22)',
        borderRadius:18,padding:'22px 20px',
        backdropFilter:'blur(24px)',
        boxShadow:'0 40px 80px rgba(0,0,0,.65),0 0 0 1px rgba(168,85,247,.1),inset 0 1px 0 rgba(255,255,255,.04)',
        position:'relative',overflow:'hidden',
      }}>
        {/* scanline */}
        <div style={{position:'absolute',left:0,right:0,height:36,
          background:'linear-gradient(transparent,rgba(168,85,247,.04),transparent)',
          animation:'scanline 4s linear infinite',pointerEvents:'none',zIndex:1}}/>
        {/* dots */}
        <div style={{display:'flex',gap:6,marginBottom:16,alignItems:'center'}}>
          {['#ff5f57','#febc2e','#28c840'].map((c,i)=>(
            <div key={i} style={{width:11,height:11,borderRadius:'50%',background:c}}/>
          ))}
          <div style={{marginLeft:'auto',color:'rgba(255,255,255,.18)',fontSize:10}} className="fm">deploy.sh</div>
        </div>
        {lines.map((l,i)=>(
          <motion.div key={i}
            initial={{opacity:0,x:-6}}
            whileInView={{opacity:1,x:0}}
            viewport={{once:true}}
            transition={{delay:l.d+.2,duration:.22}}
            className="fm"
            style={{color:l.c,fontSize:12,lineHeight:1.9,position:'relative',zIndex:2}}
          >{l.t}</motion.div>
        ))}
        <div className="fm" style={{color:'#a855f7',fontSize:12,marginTop:3,zIndex:2,
          position:'relative',animation:'blink 1s step-end infinite'}}>█</div>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════
   MARQUEE
══════════════════════════════════════════════ */
const Marquee=()=>{
  const items=['Node.js','Python','Docker','PM2','GitHub','WebSockets','Redis','Nginx','PostgreSQL','MongoDB','FastAPI','Express','Bun','Deno','Next.js','Django'];
  return (
    <div style={{borderTop:'1px solid rgba(255,255,255,.04)',borderBottom:'1px solid rgba(255,255,255,.04)',padding:'13px 0'}}
      className="mwrap">
      <div className="mtrack">
        {[...items,...items].map((t,i)=>(
          <div key={i} className="fm" style={{
            padding:'6px 18px',margin:'0 6px',
            background:'rgba(255,255,255,.025)',
            border:'1px solid rgba(255,255,255,.055)',
            borderRadius:100,color:'rgba(255,255,255,.28)',
            fontSize:11,fontWeight:600,whiteSpace:'nowrap',
            display:'flex',alignItems:'center',gap:7,
          }}>
            <span style={{width:5,height:5,borderRadius:'50%',background:'rgba(168,85,247,.65)',
              display:'inline-block',boxShadow:'0 0 6px rgba(168,85,247,.9)'}}/>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   HOME
══════════════════════════════════════════════ */
export default function Home() {
  return (
    <div style={{
      background:'#06040f',
      color:'rgba(255,255,255,.8)',
      minHeight:'100vh',
      width:'100%',
      maxWidth:'100vw',
      overflowX:'hidden',
      position:'relative',
    }}>
      <G/>
      <Scene3D/>
      <Navbar/>

      <div style={{position:'relative',zIndex:10,width:'100%'}}>

        {/* ─── HERO ─── */}
        <section style={{
          minHeight:'100svh',
          display:'flex',flexDirection:'column',
          alignItems:'center',justifyContent:'center',
          textAlign:'center',
          padding:'120px 20px 60px',
          position:'relative',
        }}>
          {/* 3D cubes */}
          <div style={{position:'absolute',top:'18%',left:'4%',perspective:600,pointerEvents:'none'}}>
            <Cube sz={52} col="#7c3aed" dur="11s"/>
          </div>
          <div style={{position:'absolute',top:'28%',right:'5%',perspective:600,pointerEvents:'none'}}>
            <Cube sz={36} col="#22d3ee" dur="8s" rev/>
          </div>
          <div style={{position:'absolute',bottom:'22%',left:'7%',perspective:600,pointerEvents:'none'}}>
            <Cube sz={28} col="#a855f7" dur="14s"/>
          </div>
          <div style={{position:'absolute',bottom:'30%',right:'8%',perspective:600,pointerEvents:'none'}}>
            <Cube sz={22} col="#22d3ee" dur="9s" rev/>
          </div>

          {/* Badge */}
          <motion.div
            initial={{opacity:0,y:-18}} animate={{opacity:1,y:0}}
            style={{
              display:'inline-flex',alignItems:'center',gap:10,
              background:'rgba(168,85,247,.08)',
              border:'1px solid rgba(168,85,247,.2)',
              padding:'7px 17px',borderRadius:100,marginBottom:30,
              color:'#c084fc',fontSize:11,fontWeight:700,letterSpacing:2,
              textTransform:'uppercase',
            }} className="fm"
          >
            <span style={{position:'relative',display:'flex',width:8,height:8}}>
              <span style={{position:'absolute',inset:0,borderRadius:'50%',background:'#a855f7',
                animation:'pulse-ring 1.6s ease-out infinite'}}/>
              <span style={{width:8,height:8,borderRadius:'50%',background:'#a855f7',position:'relative'}}/>
            </span>
            Engine v2.0 — Docker Auto-Build
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{opacity:0,y:50}} animate={{opacity:1,y:0}}
            transition={{duration:.65,type:'spring',bounce:.28}}
            className="fd"
            style={{
              fontSize:'clamp(48px,11vw,106px)',
              fontWeight:900,lineHeight:.95,letterSpacing:'-3px',
              color:'white',maxWidth:880,marginBottom:26,
            }}
          >
            Deploy Code.
            <br/>
            <span className="shimmer">Skip the BS.</span>
          </motion.h1>

          <motion.p
            initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.38}}
            style={{fontSize:16,color:'rgba(255,255,255,.36)',maxWidth:510,lineHeight:1.78,marginBottom:38}}
          >
            Push to GitHub and we handle everything — PM2 restarts, Docker builds,
            live log streaming, and instant{' '}
            <code className="fm" style={{color:'#a855f7',fontSize:13,background:'rgba(168,85,247,.1)',
              padding:'2px 6px',borderRadius:5}}>.env</code>{' '}
            injection.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.52}}
            style={{display:'flex',gap:13,flexWrap:'wrap',justifyContent:'center'}}
          >
            <a href="/dashboard" className="gbtn" style={{
              background:'linear-gradient(135deg,#6d28d9,#a855f7)',
              color:'white',fontWeight:700,fontSize:15,
              padding:'14px 28px',borderRadius:14,
              textDecoration:'none',display:'flex',alignItems:'center',gap:8,
              boxShadow:'0 0 48px rgba(168,85,247,.42)',
            }}><Rocket size={17}/> Launch Dashboard</a>
            <a href="/docs" className="gbtn" style={{
              background:'rgba(255,255,255,.04)',
              border:'1px solid rgba(255,255,255,.1)',
              color:'rgba(255,255,255,.68)',fontWeight:600,fontSize:15,
              padding:'14px 28px',borderRadius:14,
              textDecoration:'none',display:'flex',alignItems:'center',gap:8,
              boxShadow:'none',
            }}><Terminal size={17}/> View Docs</a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.75}}
            style={{marginTop:40,display:'flex',alignItems:'center',gap:13,flexWrap:'wrap',justifyContent:'center'}}
          >
            <div style={{display:'flex'}}>
              {['#5b21b6','#7c3aed','#6d28d9','#8b5cf6','#9333ea'].map((c,i)=>(
                <div key={i} style={{width:28,height:28,borderRadius:'50%',
                  background:`linear-gradient(135deg,${c},rgba(168,85,247,.5))`,
                  border:'2px solid #06040f',marginLeft:i>0?-9:0}}/>
              ))}
            </div>
            <div style={{display:'flex',gap:3}}>
              {[...Array(5)].map((_,i)=><Star key={i} size={12} fill="#f59e0b" color="#f59e0b"/>)}
            </div>
            <span style={{color:'rgba(255,255,255,.32)',fontSize:13}}>
              Trusted by <strong style={{color:'white'}}>2,400+</strong> developers
            </span>
          </motion.div>
        </section>

        {/* ─── MARQUEE ─── */}
        <Marquee/>

        {/* ─── STATS ─── */}
        <section style={{maxWidth:1080,margin:'65px auto',padding:'0 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14}}>
            <StatCard value={2400} suffix="+" label="Active Deployments" icon={Rocket}/>
            <StatCard value={99}   suffix=".9%" label="Uptime SLA"        icon={Activity}/>
            <StatCard value={1200} suffix="ms"  label="Avg Deploy Time"   icon={Zap}/>
            <StatCard value={50}   suffix="+"   label="Frameworks"        icon={Globe}/>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section style={{maxWidth:1080,margin:'65px auto',padding:'0 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:48,alignItems:'center'}}>
            <div>
              <div className="fm" style={{color:'#a855f7',fontSize:10,letterSpacing:3,textTransform:'uppercase',marginBottom:13}}>// how it works</div>
              <h2 className="fd" style={{fontSize:'clamp(26px,5vw,48px)',fontWeight:900,color:'white',lineHeight:1.08,marginBottom:16}}>
                Push. Deploy.<br/><span style={{color:'#a855f7'}}>Done.</span>
              </h2>
              <p style={{color:'rgba(255,255,255,.36)',fontSize:14,lineHeight:1.82,marginBottom:26}}>
                Connect your repo once. Every push triggers our engine — from deps install to live process in under 2 seconds.
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {['Connect GitHub in 30 seconds','Auto .env injection from dashboard','PM2 or Docker — auto-detected','Live WebSocket log streaming'].map((t,i)=>(
                  <motion.div key={i}
                    initial={{opacity:0,x:-18}}
                    whileInView={{opacity:1,x:0}}
                    viewport={{once:true}}
                    transition={{delay:i*.1}}
                    style={{display:'flex',alignItems:'center',gap:10}}
                  >
                    <div style={{width:21,height:21,borderRadius:7,flexShrink:0,
                      background:'rgba(168,85,247,.14)',border:'1px solid rgba(168,85,247,.28)',
                      display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <Check size={11} color="#a855f7"/>
                    </div>
                    <span style={{color:'rgba(255,255,255,.52)',fontSize:13}}>{t}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <Terminal3D/>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section style={{maxWidth:1080,margin:'65px auto',padding:'0 20px'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div className="fm" style={{color:'#a855f7',fontSize:10,letterSpacing:3,textTransform:'uppercase',marginBottom:13}}>// features</div>
            <h2 className="fd" style={{fontSize:'clamp(26px,5vw,48px)',fontWeight:900,color:'white',marginBottom:13}}>Everything you need.</h2>
            <p style={{color:'rgba(255,255,255,.32)',fontSize:14,maxWidth:400,margin:'0 auto'}}>Built for devs who ship fast and hate wasting time on DevOps.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:16}}>
            <FCard icon={GitBranch} title="GitHub Webhooks"   desc="Push once, deploy forever. Engine pulls, installs deps, and restarts — zero touch required."   accent delay={0}/>
            <FCard icon={Lock}      title="Smart .env Manager"desc="Inject secrets from dashboard. No plaintext files. No exposed keys. Ever."                      delay={.1}/>
            <FCard icon={Activity}  title="Live Log Streaming" desc="Real-time terminal via WebSockets. Debug without SSH from anywhere in the world."               delay={.2}/>
            <FCard icon={Cpu}       title="PM2 & Docker Engine"desc="Auto-detect your stack. Simple apps run PM2, complex setups get full Docker builds."            delay={.3}/>
            <FCard icon={Zap}       title="Zero Downtime"      desc="Health-check before traffic switch. Users never see a cold restart or error page."               delay={.4}/>
            <FCard icon={Shield}    title="REST API Control"   desc="Restart, deploy, and check status programmatically with your authenticated API key."             delay={.5}/>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section style={{maxWidth:1080,margin:'65px auto',padding:'0 20px'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div className="fm" style={{color:'#a855f7',fontSize:10,letterSpacing:3,textTransform:'uppercase',marginBottom:13}}>// pricing</div>
            <h2 className="fd" style={{fontSize:'clamp(26px,5vw,48px)',fontWeight:900,color:'white',marginBottom:13}}>Simple pricing.</h2>
            <p style={{color:'rgba(255,255,255,.32)',fontSize:14}}>No hidden fees. Cancel anytime.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:18}}>
            <PCard plan="Starter"    price={0}  delay={0}   features={['3 deployments','GitHub webhooks','PM2 only','1GB RAM/app','Community support']}/>
            <PCard plan="Pro"        price={12} delay={.1}  highlight features={['Unlimited deployments','Docker support','Smart .env Manager','Live log streaming','Priority support','Custom domains']}/>
            <PCard plan="Enterprise" price={49} delay={.2}  features={['Everything in Pro','Dedicated node','SLA guarantee','Team access','SSO & audit logs','24/7 support']}/>
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <motion.section
          initial={{opacity:0,y:36}}
          whileInView={{opacity:1,y:0}}
          viewport={{once:true}}
          style={{maxWidth:860,margin:'65px auto 75px',padding:'0 20px'}}
        >
          <div style={{
            background:'linear-gradient(135deg,rgba(109,40,217,.28),rgba(168,85,247,.09))',
            border:'1px solid rgba(168,85,247,.3)',
            borderRadius:26,padding:'48px 32px',
            textAlign:'center',position:'relative',overflow:'hidden',
          }}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:1,
              background:'linear-gradient(90deg,transparent,#a855f7,#22d3ee,transparent)'}}/>
            <div style={{position:'absolute',top:-70,left:'50%',transform:'translateX(-50%)',
              width:260,height:180,
              background:'radial-gradient(circle,rgba(168,85,247,.18),transparent)',
              pointerEvents:'none'}}/>
            <h2 className="fd" style={{fontSize:'clamp(24px,5vw,42px)',fontWeight:900,color:'white',marginBottom:14,position:'relative'}}>
              Ready to ship faster?
            </h2>
            <p style={{color:'rgba(255,255,255,.38)',fontSize:15,marginBottom:30,position:'relative'}}>
              Join 2,400+ developers who stopped wrestling with servers.
            </p>
            <a href="/register" className="gbtn" style={{
              display:'inline-flex',alignItems:'center',gap:8,
              background:'linear-gradient(135deg,#6d28d9,#a855f7)',
              color:'white',fontWeight:700,fontSize:15,
              padding:'14px 32px',borderRadius:14,textDecoration:'none',
              boxShadow:'0 0 48px rgba(168,85,247,.42)',
            }}><Rocket size={17}/> Start for Free</a>
          </div>
        </motion.section>

        {/* ─── FOOTER ─── */}
        <footer style={{borderTop:'1px solid rgba(255,255,255,.05)',padding:'34px 20px',textAlign:'center'}}>
          <div className="fd" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            color:'white',fontWeight:900,fontSize:16,letterSpacing:3,marginBottom:10}}>
            <Server size={15} color="#a855f7"/>
            NEX<span style={{color:'#a855f7'}}>CLOUD</span>
          </div>
          <p style={{color:'rgba(255,255,255,.18)',fontSize:12}}>© 2025 NexCloud. Built for developers, by developers.</p>
        </footer>

      </div>
    </div>
  );
      }
