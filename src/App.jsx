import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 📦 Importing all pages from 'pages' folder
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Deploy from './pages/Deploy';
import Profile from './pages/Profile';
import Payment from './pages/Payment'; // 🔥 Tera naya Payment page import ho gaya

export default function App() {
  return (
    <Router>
      {/* Yeh Routes define karte hain ki kaunse URL pe kaunsa page khulega.
        Jaise Heroku mein hota hai: dash.heroku.com/apps (Dashboard)
      */}
      <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-purple-500/30 font-sans">
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Auth System */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Cloud Dashboard & Operations */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deploy" element={<Deploy />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment" element={<Payment />} /> {/* 💸 Payment Route Add kar diya */}
          
          {/* 404 Page (Agar koi galat URL daale) */}
          <Route path="*" element={
            <div className="h-screen flex flex-col items-center justify-center text-center">
              <h1 className="text-6xl font-black text-purple-600 mb-4">404</h1>
              <p className="text-gray-400 text-xl font-bold uppercase tracking-widest">System Not Found</p>
              <a href="/" className="mt-8 text-purple-400 hover:text-white transition-colors border border-purple-500/30 hover:border-purple-500 px-6 py-2 rounded-lg">
                Return to Base
              </a>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}
