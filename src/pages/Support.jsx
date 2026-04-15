import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, ArrowLeft, ReceiptText, LifeBuoy, Send, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Support() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'tickets'
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States
  const [transactions, setTransactions] = useState([]);
  const [tickets, setTickets] = useState([]);

  // Form State for New Ticket
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("cloud_api_key");
    if (!key) {
      navigate('/login');
      return;
    }
    setApiKey(key);
    fetchData(key, activeTab);
  }, [navigate, activeTab]);

  const fetchData = async (key, tab) => {
    setIsLoading(true);
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    
    try {
      if (tab === 'transactions') {
        const res = await axios.get(`${API_URL}/api/transaction-history`, { headers: { "x-api-key": key } });
        if (res.data.status === "success") setTransactions(res.data.transactions || []);
      } else {
        const res = await axios.get(`${API_URL}/api/support/list`, { headers: { "x-api-key": key } });
        if (res.data.status === "success") setTickets(res.data.tickets || []);
      }
    } catch (err) {
      console.error(`Failed to fetch ${tab}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) return alert("Please fill all fields!");
    
    setIsSubmitting(true);
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    
    try {
      await axios.post(`${API_URL}/api/support/create`, ticketForm, { headers: { "x-api-key": apiKey } });
      alert("✅ Ticket Created Successfully!");
      setTicketForm({ subject: "", message: "" });
      setShowTicketForm(false);
      fetchData(apiKey, 'tickets'); // Refresh list
    } catch (err) {
      alert("❌ Failed to create ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('success') || s.includes('answered')) return 'bg-green-500/10 border-green-500/30 text-green-400';
    if (s.includes('reject') || s.includes('fail') || s.includes('close')) return 'bg-red-500/10 border-red-500/30 text-red-400';
    return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'; // Pending / Open
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
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 mt-10 relative z-10">
        
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Help Center & Billing</h1>
          <p className="text-gray-400">View your transaction history and connect with our support team.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-white/[0.02] border border-white/10 rounded-2xl p-1 mb-8">
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'transactions' ? 'bg-purple-600/20 text-purple-400 shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ReceiptText size={18} /> Transactions
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'tickets' ? 'bg-blue-600/20 text-blue-400 shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LifeBuoy size={18} /> Support Tickets
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl min-h-[400px]">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <Clock size={40} className="animate-spin mb-4 text-purple-500" />
              <p className="text-sm tracking-widest uppercase font-bold text-gray-400">Loading Data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* ================= TAB 1: TRANSACTIONS ================= */}
              {activeTab === 'transactions' && (
                <motion.div key="txn" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-16 opacity-50">
                      <ReceiptText size={48} className="mx-auto mb-4 text-gray-500" />
                      <h3 className="text-xl font-bold text-white">No Transactions Found</h3>
                      <p className="text-sm text-gray-400 mt-2">You haven't made any payments yet.</p>
                    </div>
                  ) : (
                    transactions.map((txn, index) => (
                      <motion.div variants={fadeInUp} key={index} className="bg-[#0a0a0a] border border-white/5 hover:border-purple-500/30 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all group">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">₹{txn.amount} - Premium Plan</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${getStatusColor(txn.status)}`}>
                              {txn.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-mono">UTR: {txn.utr_number || txn.coupon_code || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1">
                            <Clock size={12}/> {new Date(txn.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {/* ================= TAB 2: SUPPORT TICKETS ================= */}
              {activeTab === 'tickets' && (
                <motion.div key="tkt" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
                  
                  {/* Create Ticket Header */}
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare size={20} className="text-blue-400"/> Your Inbox</h3>
                    <button 
                      onClick={() => setShowTicketForm(!showTicketForm)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-2"
                    >
                      {showTicketForm ? "Cancel" : <><Plus size={16}/> New Ticket</>}
                    </button>
                  </div>

                  {/* New Ticket Form (Toggleable) */}
                  <AnimatePresence>
                    {showTicketForm && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8">
                        <form onSubmit={handleCreateTicket} className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl space-y-4">
                          <div>
                            <label className="text-xs font-bold text-blue-300 uppercase tracking-widest ml-1 mb-1 block">Subject</label>
                            <input type="text" required value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} placeholder="What do you need help with?"
                              className="w-full bg-[#0a0a0a] border border-white/10 focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none text-sm transition-all" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-blue-300 uppercase tracking-widest ml-1 mb-1 block">Message</label>
                            <textarea required value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} placeholder="Describe your issue in detail..."
                              className="w-full bg-[#0a0a0a] border border-white/10 focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none text-sm transition-all h-32 resize-none" />
                          </div>
                          <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2 disabled:opacity-50">
                            {isSubmitting ? "Sending..." : <><Send size={16}/> Submit Ticket</>}
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tickets List */}
                  <div className="space-y-4">
                    {tickets.length === 0 ? (
                      <div className="text-center py-10 opacity-50">
                        <LifeBuoy size={48} className="mx-auto mb-4 text-gray-500" />
                        <h3 className="text-xl font-bold text-white">Inbox is Empty</h3>
                        <p className="text-sm text-gray-400 mt-2">Create a new ticket if you need assistance.</p>
                      </div>
                    ) : (
                      tickets.map((tkt, index) => (
                        <motion.div variants={fadeInUp} key={index} className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden group">
                          {/* Ticket Header */}
                          <div className="p-5 flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">{tkt.ticket_id}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${getStatusColor(tkt.status)}`}>{tkt.status}</span>
                              </div>
                              <h4 className="text-lg font-bold text-white mb-2">{tkt.subject}</h4>
                              <p className="text-sm text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">{tkt.message}</p>
                            </div>
                            <span className="text-xs text-gray-600 whitespace-nowrap">{new Date(tkt.created_at).toLocaleDateString()}</span>
                          </div>

                          {/* Admin Reply Section */}
                          {tkt.admin_reply && (
                            <div className="bg-blue-900/10 border-t border-blue-500/20 p-5 pl-8 relative">
                              <div className="absolute left-4 top-5 bottom-5 w-1 bg-blue-500/30 rounded-full"></div>
                              <h5 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Shield size={14}/> Support Team Reply
                              </h5>
                              <p className="text-sm text-gray-300 italic">{tkt.admin_reply}</p>
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          )}

        </div>
      </div>
    </div>
  );
  }
                
