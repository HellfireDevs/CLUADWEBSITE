import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Settings, AlertTriangle } from 'lucide-react'; 
import axios from 'axios';

// 📦 Importing all pages from 'pages' folder
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Deploy from './pages/Deploy';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import Support from './pages/Support'; 
import Terminal from './pages/Terminal'; 

// 🔥 NAYE COMPONENTS IMPORT KIYE HAIN
import Suspended from './pages/Suspended';
import BroadcastBanner from './components/BroadcastBanner';

// ==========================================
// 🛑 MAINTENANCE SCREEN UI (Tera Awesome Design)
// ==========================================
const MaintenanceScreen = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 text-center bg-white/[0.02] border border-red-500/20 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="flex justify-center mb-6 relative">
          <Settings className="w-20 h-20 text-red-500 animate-[spin_4s_linear_infinite]" />
          <AlertTriangle className="w-8 h-8 text-yellow-400 absolute bottom-0 right-[35%] bg-[#050505] rounded-full" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-widest mb-2 uppercase">System Offline</h1>
        <p className="text-red-400 font-bold tracking-widest text-sm mb-6">TEMPORARY SHUTDOWN</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          NEX<span className="text-blue-500">CLOUD</span> is currently undergoing scheduled maintenance and core upgrades. We will be back online shortly. 
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Engine Down
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🛡️ AUTH GUARD (Bina Login ke andar aane nahi dega)
// ==========================================
const RequireAuth = ({ children }) => {
  const apiKey = localStorage.getItem("cloud_api_key");
  return apiKey ? children : <Navigate to="/login" replace />;
};

// ==========================================
// 👑 PREMIUM GUARD (Bina Premium ke Deploy nahi karne dega)
// ==========================================
const RequirePremium = ({ children }) => {
  const isPremium = localStorage.getItem("cloud_is_premium") === "true";
  if (!isPremium) {
    return <Navigate to="/dashboard" state={{ showPaywall: true }} replace />;
  }
  return children;
};

// ==========================================
// 🚫 SUSPENDED GUARD (Kharab users ko block karega)
// ==========================================
const RequireActiveAccount = ({ children }) => {
  const isSuspended = localStorage.getItem("cloud_is_suspended") === "true";
  // Agar suspended hai, toh seedha Suspended page pe phenk do
  if (isSuspended) {
    return <Navigate to="/suspended" replace />;
  }
  return children;
};

export default function App() {
  
  // 🔴 DYNAMIC MAINTENANCE MODE LOGIC
  const [isMaintenance, setIsMaintenance] = useState(false);
  const HARDCODED_MAINTENANCE_MODE = false; // Emergency ke liye manually 'true' kar sakta hai yahan se

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const response = await axios.get(`${API_URL}/api/admin/system-status`);
        setIsMaintenance(response.data.maintenance);
      } catch (err) {
        console.error("System status check failed.");
      }
    };

    checkSystemStatus();
    // Har 30 seconds mein background mein check karega ki Maintenance lagani hai ya nahi
    const interval = setInterval(checkSystemStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  // AGAR MAINTENANCE ON HAI (API se ya Hardcode se) TOH SEEDHA KICK OUT MARO
  if (HARDCODED_MAINTENANCE_MODE || isMaintenance) {
    return <MaintenanceScreen />;
  }

  // ✅ NORMAL APP ROUTING
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-purple-500/30 font-sans relative">
        
        {/* 📢 DYNAMIC BROADCAST BANNER (Ye har screen ke top pe dikhega) */}
        <BroadcastBanner />

        <Routes>
          {/* Main Landing Page (Public) */}
          <Route path="/" element={<Home />} />

          {/* Auth System (Public) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ========================================== */}
          {/* 🔒 PROTECTED & ACTIVE ROUTES */}
          {/* ========================================== */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <RequireActiveAccount>
                <Dashboard />
              </RequireActiveAccount>
            </RequireAuth>
          } />
          
          <Route path="/profile" element={
            <RequireAuth>
              <RequireActiveAccount>
                <Profile />
              </RequireActiveAccount>
            </RequireAuth>
          } />
          
          <Route path="/payment" element={
            <RequireAuth>
              <RequireActiveAccount>
                <Payment />
              </RequireActiveAccount>
            </RequireAuth>
          } />

          <Route path="/app/:appName" element={
            <RequireAuth>
              <RequireActiveAccount>
                <Terminal />
              </RequireActiveAccount>
            </RequireAuth>
          } />

          {/* 👑 PREMIUM ONLY ROUTE */}
          <Route path="/deploy" element={
            <RequireAuth>
              <RequireActiveAccount>
                <RequirePremium>
                  <Deploy />
                </RequirePremium>
              </RequireActiveAccount>
            </RequireAuth>
          } />
          
          {/* ========================================== */}
          {/* 🎫 ROUTES ALLOWED EVEN IF SUSPENDED */}
          {/* ========================================== */}
          <Route path="/support" element={
            <RequireAuth>
              <Support /> {/* Bouncer nahi lagaya taaki user madad maang sake */}
            </RequireAuth>
          } />

          <Route path="/suspended" element={
            <RequireAuth>
              <Suspended /> {/* Laal Rang Wala Account Suspended Page */}
            </RequireAuth>
          } />

          {/* ========================================== */}
          {/* 404 Page */}
          {/* ========================================== */}
          <Route path="*" element={
            <div className="h-screen flex flex-col items-center justify-center text-center">
              <h1 className="text-6xl font-black text-purple-600 mb-4">404</h1>
              <p className="text-gray-400 text-xl font-bold uppercase tracking-widest">System Not Found</p>
              <a href="/dashboard" className="mt-8 text-purple-400 hover:text-white transition-colors border border-purple-500/30 hover:border-purple-500 px-6 py-2 rounded-lg">
                Return to Base
              </a>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}
