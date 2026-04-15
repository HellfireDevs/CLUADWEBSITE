import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
import Terminal from './pages/Terminal'; // 🔥 YAHAN TERMINAL IMPORT KIYA HAI

// ==========================================
// 🛡️ AUTH GUARD (Bina Login ke andar aane nahi dega)
// ==========================================
const RequireAuth = ({ children }) => {
  const apiKey = localStorage.getItem("cloud_api_key");
  // Agar API key nahi hai, toh seedha Login pe phek do
  return apiKey ? children : <Navigate to="/login" replace />;
};

// ==========================================
// 👑 PREMIUM GUARD (Bina Premium ke Deploy nahi karne dega)
// ==========================================
const RequirePremium = ({ children }) => {
  const isPremium = localStorage.getItem("cloud_is_premium") === "true";
  
  // Agar koi smart ban ke /deploy type karta hai aur premium nahi hai:
  if (!isPremium) {
    // Wapas Dashboard bhejo aur state me showPaywall true kardo taaki modal khul jaye
    return <Navigate to="/dashboard" state={{ showPaywall: true }} replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-purple-500/30 font-sans">
        <Routes>
          {/* Main Landing Page (Public) */}
          <Route path="/" element={<Home />} />

          {/* Auth System (Public) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ========================================== */}
          {/* 🔒 PROTECTED ROUTES (Sirf Logged-in users ke liye) */}
          {/* ========================================== */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          } />
          
          <Route path="/profile" element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          } />
          
          <Route path="/payment" element={
            <RequireAuth>
              <Payment />
            </RequireAuth>
          } />
          
          <Route path="/support" element={
            <RequireAuth>
              <Support />
            </RequireAuth>
          } />

          {/* 🔥 NEW: TERMINAL ROUTE (Ab 404 nahi aayega!) */}
          <Route path="/app/:appName" element={
            <RequireAuth>
              <Terminal />
            </RequireAuth>
          } />

          {/* ========================================== */}
          {/* 👑 PREMIUM ONLY ROUTE (Login + Premium dono chahiye) */}
          {/* ========================================== */}
          <Route path="/deploy" element={
            <RequireAuth>
              <RequirePremium>
                <Deploy />
              </RequirePremium>
            </RequireAuth>
          } />
          
          {/* ========================================== */}
          {/* 404 Page (Agar koi galat URL daale) */}
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
