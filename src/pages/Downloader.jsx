import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🔥 FIX: CheckCircle ko import mein add kar diya hai, warna processing ke baad app crash ho jata!
import { Youtube, Search, Loader2, Play, Download, AlertTriangle, ArrowLeft, Headphones, Monitor, Music, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background'; 

export default function Downloader() {
  const [url, setUrl] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);

  const [selectedFormat, setSelectedFormat] = useState('video'); // 'video' or 'audio'
  const [selectedQuality, setSelectedQuality] = useState('720p');
  
  const [generatingLink, setGeneratingLink] = useState(false);
  const [streamLink, setStreamLink] = useState('');

  // 🚀 UPDATE: Tera naya Cloudflare Tunnel ka link yahan set kar diya hai!
  const YUKI_API_URL = import.meta.env.VITE_YUKI_API_URL || "https://rocket-accessories-contain-ride.trycloudflare.com";

  // 1. Fetch Thumbnail and Info
  const handleFetchInfo = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoadingInfo(true);
    setInfoError('');
    setVideoInfo(null);
    setStreamLink('');

    try {
      const res = await axios.get(`${YUKI_API_URL}/info?url=${encodeURIComponent(url)}`);
      if (res.data.status === 'success') {
        setVideoInfo(res.data);
      }
    } catch (err) {
      setInfoError(err.response?.data?.detail || "Failed to fetch video info.");
    } finally {
      setLoadingInfo(false);
    }
  };

  // 2. Generate Token and Prepare Download/Stream Link
  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    setStreamLink('');
    try {
      // Backend pe /download hit karke token lenge
      const res = await axios.get(`${YUKI_API_URL}/download`, {
        params: {
          url: videoInfo.video_id,
          type: selectedFormat,
          quality: selectedFormat === 'video' ? selectedQuality : 'best'
        }
      });

      if (res.data.status === 'success') {
        const token = res.data.download_token;
        const vidId = res.data.video_id;
        // Direct stream link ban gaya
        const finalUrl = `${YUKI_API_URL}/stream/${vidId}?token=${token}`;
        setStreamLink(finalUrl);
      }
    } catch (err) {
      setInfoError("Failed to process media. Server might be busy.");
    } finally {
      setGeneratingLink(false);
    }
  };

  // Helper to format duration
  const formatTime = (seconds) => {
    if (!seconds) return "Unknown";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}` : `${m}:${s < 10 ? '0'+s : s}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans p-4 relative overflow-hidden flex flex-col items-center pb-20">
      <Background />
      
      {/* Navigation */}
      <nav className="w-full max-w-4xl z-50 mb-4 mt-2 flex justify-start">
        <Link to="/dashboard" className="text-gray-400 hover:text-white font-bold text-sm transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-white/10">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </nav>

      <div className="w-full max-w-4xl z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl mb-4 border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Youtube className="text-red-500" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">YUKI Media Engine</h1>
          <p className="text-gray-400 text-sm mt-2">High-speed processing bypasses protections to extract raw audio and video.</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFetchInfo} className="relative mb-8 max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-500" size={20} />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube Link here..."
            className="w-full bg-white/[0.02] border border-white/10 hover:border-red-500/30 focus:border-red-500 text-white placeholder-gray-600 rounded-2xl px-4 py-4 pl-12 pr-32 outline-none transition-all focus:shadow-[0_0_30px_rgba(239,68,68,0.15)] backdrop-blur-md"
          />
          <button
            type="submit"
            disabled={loadingInfo || !url}
            className="absolute inset-y-2 right-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg"
          >
            {loadingInfo ? <Loader2 size={18} className="animate-spin" /> : 'Fetch'}
          </button>
        </form>

        {/* Error State */}
        <AnimatePresence>
          {infoError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-8 max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold backdrop-blur-md"
            >
              <AlertTriangle size={18} className="shrink-0" />
              <p>{infoError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Area */}
        <AnimatePresence>
          {videoInfo && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-8"
            >
              {/* Left: Thumbnail & Details */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 bg-black group shadow-lg">
                  <img src={videoInfo.thumbnail} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold font-mono text-white backdrop-blur-md">
                    {formatTime(videoInfo.duration)}
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight line-clamp-2" title={videoInfo.title}>{videoInfo.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{videoInfo.uploader}</p>
                </div>
              </div>

              {/* Right: Controls & Download */}
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                
                {!streamLink ? (
                  // Selection & Generate UI
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">1. Select Format</p>
                      <div className="flex gap-3">
                        <button onClick={() => setSelectedFormat('video')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border ${selectedFormat === 'video' ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/20'}`}>
                          <Monitor size={18}/> Video
                        </button>
                        <button onClick={() => setSelectedFormat('audio')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border ${selectedFormat === 'audio' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/20'}`}>
                          <Headphones size={18}/> MP3 Audio
                        </button>
                      </div>
                    </div>

                    {selectedFormat === 'video' && (
                      <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">2. Select Quality</p>
                        <select 
                          value={selectedQuality} 
                          onChange={(e) => setSelectedQuality(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-red-500 appearance-none font-bold"
                        >
                          <option value="1080p">1080p Full HD</option>
                          <option value="720p">720p HD</option>
                          <option value="480p">480p SD</option>
                          <option value="best">Best Available</option>
                        </select>
                      </motion.div>
                    )}

                    <button 
                      onClick={handleGenerateLink}
                      disabled={generatingLink}
                      className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2"
                    >
                      {generatingLink ? <><Loader2 className="animate-spin" size={20}/> Processing Media...</> : <><Play size={20} className="fill-white"/> Process & Generate Engine Link</>}
                    </button>
                  </div>
                ) : (
                  // Ready UI: Player & Direct Download Button
                  <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="space-y-6 flex flex-col items-center justify-center h-full">
                    
                    <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mb-2">
                      <CheckCircle className="text-green-400 w-10 h-10" />
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-white font-black text-xl mb-1">Processing Complete!</h3>
                      <p className="text-gray-400 text-sm">Media has been extracted to our cache servers.</p>
                    </div>

                    <div className="w-full flex flex-col gap-3 mt-4">
                      {/* Direct Browser Download */}
                      <a 
                        href={streamLink} 
                        download 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-3.5 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={20} /> Download File Native
                      </a>
                      
                      <p className="text-[10px] text-gray-500 text-center uppercase font-bold tracking-widest mt-2 mb-1">Live Preview</p>
                      
                      {/* Browser Built-in Player */}
                      <div className="w-full bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        {selectedFormat === 'video' ? (
                          <video controls src={streamLink} className="w-full aspect-video" preload="none" controlsList="nodownload" />
                        ) : (
                          <audio controls src={streamLink} className="w-full" preload="none" controlsList="nodownload" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
              }
