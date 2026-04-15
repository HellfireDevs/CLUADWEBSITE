import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, ArrowLeft, CheckCircle, AlertCircle, Loader2, Gift, ShieldCheck, QrCode, CreditCard, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background'; // Ensure ye path sahi ho

export default function Payment() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Payment States
  const basePrice = 299; // Base price in INR
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [transactionId, setTransactionId] = useState("");

  // 🛡️ AUTH GUARD
  useEffect(() => {
    const apiKey = localStorage.getItem("cloud_api_key");
    if (!apiKey) navigate('/login');
  }, [navigate]);

  // Calculate Final Price
  const finalPrice = Math.max(0, basePrice - (basePrice * discountPercent) / 100).toFixed(0);

  // 🎟️ VERIFY COUPON API
  const handleApplyCoupon = async () => {
    if (!couponCode) {
      setError("Please enter a coupon code first!");
      return;
    }
    
    setIsCheckingCoupon(true);
    setError("");
    setSuccess("");
    
    const API_KEY = localStorage.getItem("cloud_api_key");
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    try {
      // Backend pe tera coupon verify wala endpoint
      const response = await axios.post(`${API_URL}/api/verify-coupon`, {
        code: couponCode
      }, { headers: { "x-api-key": API_KEY } });

      if (response.data.status === "success") {
        setDiscountPercent(response.data.discount_percentage);
        setSuccess(`🎉 Coupon Applied! ${response.data.discount_percentage}% OFF.`);
      }
    } catch (err) {
      setDiscountPercent(0);
      setError(err.response?.data?.detail || "Invalid or Expired Coupon!");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  // 💸 SUBMIT PAYMENT FOR TELEGRAM APPROVAL
  const handleCheckout = async () => {
    if (!transactionId || transactionId.length < 8) {
      setError("Please enter a valid Transaction/UTR ID!");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    const API_KEY = localStorage.getItem("cloud_api_key");
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    try {
      const payload = {
        transaction_id: transactionId,
        amount: finalPrice,
        coupon_used: discountPercent > 0 ? couponCode : null,
        plan: "NEX Premium 1 Month"
      };

      // Ye endpoint Telegram bot ko message bhejega
      const response = await axios.post(`${API_URL}/api/submit-payment`, payload, { 
        headers: { "x-api-key": API_KEY } 
      });

      if (response.data.status === "success") {
        setSuccess("✅ Payment details submitted! Waiting for Admin Approval.");
        setTimeout(() => navigate('/dashboard'), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit payment details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative selection:bg-purple-500/30 pb-20">
      <Background />
      
      {/* 🚀 TOP NAVBAR */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-xl tracking-widest hover:scale-105 transition-transform">
            <Server className="text-purple-500 w-6 h-6" /> NEX<span className="text-purple-500">CLOUD</span>
          </Link>
          <Link to="/dashboard" className="text-gray-400 hover:text-white font-bold text-sm transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-10 relative z-10">
        
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 flex items-center justify-center sm:justify-start gap-3">
            <Zap className="text-yellow-400" /> Upgrade to Premium
          </h1>
          <p className="text-gray-400">Unlock unlimited deployments, faster builds, and priority support.</p>
        </div>

        {/* Global Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg">
              <AlertCircle size={18} className="shrink-0" /> <p>{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg">
              <CheckCircle size={18} className="shrink-0" /> <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ================= LEFT: PAYMENT INSTRUCTIONS & QR ================= */}
          <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <ShieldCheck className="text-green-400 w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold text-white">Manual Verification</h3>
                <p className="text-xs text-gray-500">Secured via Telegram Admin Approval</p>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                <QrCode className="w-32 h-32 text-purple-500" />
              </div>
              
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Scan & Pay via UPI</h4>
              
              {/* Fake QR Box - Isko apne asli QR image tag se replace kar lena */}
              <div className="w-48 h-48 bg-white p-2 rounded-xl mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                  alt="UPI QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-lg font-mono text-white mb-1">your_upi_id@ybl</p>
              <p className="text-xs text-purple-400 font-bold mb-4">Name: NEX Cloud Hosting</p>

              <div className="bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs p-3 rounded-xl text-left">
                <strong>💡 Note:</strong> After successful payment, copy the 12-digit UTR or Transaction ID from your app (GPay/PhonePe/Paytm) and paste it in the checkout form.
              </div>
            </div>
          </div>

          {/* ================= RIGHT: CHECKOUT & COUPON FORM ================= */}
          <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
            
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="text-purple-500" /> Order Summary
              </h3>

              {/* Pricing Breakdown */}
              <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">NEX Premium (1 Month)</span>
                  <span className="text-white font-mono">₹{basePrice}</span>
                </div>
                
                {discountPercent > 0 && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center text-green-400 font-bold">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-mono">- ₹{((basePrice * discountPercent) / 100).toFixed(0)}</span>
                  </motion.div>
                )}
                
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total Amount</span>
                  <span className="text-2xl font-black text-purple-500 font-mono">₹{finalPrice}</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Have a Coupon?</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><Gift size={16} /></div>
                    <input 
                      type="text" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                      placeholder="e.g. NEXFREE"
                      disabled={discountPercent > 0}
                      className="w-full bg-[#0a0a0a] border border-white/10 focus:border-purple-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 pl-10 outline-none transition-all focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] disabled:opacity-50" 
                    />
                  </div>
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={isCheckingCoupon || discountPercent > 0 || !couponCode}
                    className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white font-bold px-6 py-3 rounded-xl transition-all"
                  >
                    {isCheckingCoupon ? <Loader2 size={18} className="animate-spin" /> : discountPercent > 0 ? "Applied" : "Apply"}
                  </button>
                </div>
              </div>

              {/* Transaction ID Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Transaction / UTR ID <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={transactionId} 
                  onChange={(e) => setTransactionId(e.target.value)} 
                  placeholder="Enter 12-digit UTR from your payment app"
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-purple-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none transition-all focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono" 
                />
              </div>
            </div>

            {/* Checkout Button */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <button 
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                {isLoading ? <><Loader2 size={20} className="animate-spin" /> Verifying Payment...</> : <><ShieldCheck size={20} /> Submit for Approval (₹{finalPrice})</>}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
          }
