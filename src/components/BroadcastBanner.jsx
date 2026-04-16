import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BroadcastBanner() {
  const [broadcast, setBroadcast] = useState({ is_active: false, message: "", color: "yellow" });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        // Public endpoint hit kar rahe hain
        const response = await axios.get(`${API_URL}/api/admin/system-status`);
        
        // Agar maintenance ON hai, toh tu chahe toh yahan se seedha kisi /maintenance page pe redirect maar sakta hai
        if (response.data.maintenance) {
          // window.location.href = '/maintenance';
        }

        setBroadcast(response.data.broadcast);
      } catch (err) {
        console.error("Failed to fetch system status");
      }
    };

    fetchStatus();
    // Har 30 seconds mein check karega ki naya broadcast toh nahi aaya
    const interval = setInterval(fetchStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Colors set karna
  let bgClass = "bg-yellow-500/90 text-yellow-950";
  let icon = <AlertTriangle size={18} className="text-yellow-900" />;
  
  if (broadcast.color === "red") {
    bgClass = "bg-red-600/95 text-white";
    icon = <Zap size={18} className="text-white animate-pulse" />;
  } else if (broadcast.color === "blue") {
    bgClass = "bg-blue-600/95 text-white";
    icon = <Info size={18} className="text-white" />;
  }

  return (
    <AnimatePresence>
      {/* 🔥 FIX: Condition andar lagayi taaki EXIT animation smoothly kaam kare */}
      {broadcast.is_active && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          /* 🔥 FIX: 'fixed left-0' hata kar 'sticky' kar diya! Ab 3 dots nahi chhupenge! */
          className={`sticky top-0 w-full ${bgClass} px-4 py-2.5 flex items-center justify-center gap-3 z-[999] shadow-2xl backdrop-blur-md border-b border-white/10`}
        >
          {icon}
          <p className="text-sm font-bold tracking-wide text-center">
            {broadcast.message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
