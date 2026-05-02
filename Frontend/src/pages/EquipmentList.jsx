import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import SplashCursor from "../components/SplashCursor";
import {
  Search, 
  Filter, 
  Cpu, 
  Clock, 
  CheckCircle, 
  XCircle,
  Wrench, 
  Gift, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Plus, 
  MapPin, 
  Zap,
  Sparkles,
  ChevronDown,
  RefreshCw,
  ArrowRight,
  CreditCard
} from "lucide-react";
import labBg from "../assets/chemistry-laboratory-with-colorful-liquids-and-glassware_70423754.jpg";
import heroBg from "../assets/240_F_867695305_neYfOrKo5im0RxBj0QpDlc627zOSy4vF.jpg";

const API = "http://localhost:5000";

const CATEGORIES = [
  "All", "Microscopy", "Spectroscopy", "Chromatography", "Computing",
  "Imaging", "Electronics", "Biology", "Chemistry", "Physics", "Other",
];

const STATUS_STYLES = {
  available: { 
    label: "Available", 
    icon: <CheckCircle size={12} />, 
    className: "bg-emerald-100 text-emerald-700 border-emerald-200" 
  },
  unavailable: { 
    label: "Unavailable", 
    icon: <XCircle size={12} />, 
    className: "bg-rose-100 text-rose-700 border-rose-200" 
  },
  maintenance: { 
    label: "Maintenance", 
    icon: <Wrench size={12} />, 
    className: "bg-amber-100 text-amber-700 border-amber-200" 
  },
};

const CONDITION_STYLES = {
  excellent: "bg-emerald-50 text-emerald-600",
  good: "bg-blue-50 text-blue-600",
  fair: "bg-amber-50 text-amber-600",
  poor: "bg-rose-50 text-rose-600",
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const EquipmentCard = ({ eq, currentUserId }) => {
  const st = STATUS_STYLES[eq.status] || STATUS_STYLES.available;
  const condCls = CONDITION_STYLES[eq.condition] || CONDITION_STYLES.good;

  return (
    <motion.div
      variants={fadeUpVariant}
      layout
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-lg transition-all hover:bg-white hover:shadow-2xl hover:shadow-blue-900/10 cursor-pointer"
    >
      <div className="flex flex-col h-full">
        {/* Category & Status */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
            <Cpu size={24} />
          </div>
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${st.className}`}>
            {st.icon} {st.label}
          </div>
        </div>

        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-blue-500/70">
          {eq.category}
        </div>
        <h3 className="font-serif text-2xl font-black text-slate-950 mb-3 line-clamp-1 group-hover:text-blue-700 transition-colors">
          {eq.name}
        </h3>
        <p className="text-sm leading-relaxed text-slate-700 font-medium line-clamp-2 mb-6">
          {eq.description || "High-precision laboratory equipment for advanced research and data collection."}
        </p>

        {/* Info Rows */}
        <div className="space-y-2 mb-6">
          {eq.location && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <MapPin size={12} className="text-blue-400" /> {eq.location}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${condCls}`}>
              {eq.condition}
            </span>
            {eq.requiresTraining && (
              <span className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-100">
                <Zap size={10} /> Training Required
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
              {eq.owner?.username?.substring(0, 2).toUpperCase() || "EQ"}
            </div>
            <div className="text-[11px]">
              <p className="font-black text-slate-900 line-clamp-1">{eq.owner?.username || "Researcher"}</p>
              <p className="text-slate-500 font-bold">Verified Owner</p>
            </div>
          </div>
          <div className="text-right">
            {eq.isFree ? (
              <span className="flex items-center gap-1 text-sm font-bold text-emerald-600"><Gift size={14} /> Free</span>
            ) : (
              <p className="text-sm font-bold text-slate-800">
                {eq.rentalPricePerDay} <span className="text-[10px] text-slate-400 uppercase">tk/day</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-white/95 backdrop-blur-md border-t border-slate-100 flex gap-2">
          <Link
            to={`/equipment/${eq._id}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition"
          >
            View Details <ArrowRight size={14} />
          </Link>
          {eq.owner?._id === currentUserId && (
            <Link
              to={`/equipment/edit/${eq._id}`}
              className="flex items-center justify-center p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
            >
              <Wrench size={14} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const EquipmentList = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("researchConnectUser") || "null");
    } catch {
      return null;
    }
  }, []);
  
  const currentUserId = currentUser?._id || currentUser?.id;
  const token = localStorage.getItem("researchConnectToken");
  
  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      if (statusFilter !== "all") params.status = statusFilter;
      if (freeOnly) params.isFree = "true";

      const res = await axios.get(`${API}/api/equipment`, { params, headers: authHeaders });
      setEquipment(res.data.equipment || []);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load equipment library.");
    } finally {
      setLoading(false);
    }
  }, [search, category, statusFilter, freeOnly, page, authHeaders]);

  const fetchPendingPayments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/equipment/bookings/mine`, {
        headers: authHeaders,
        params: { status: "approved" }
      });
      const pending = res.data.filter(b => b.paymentStatus !== "paid" && b.totalCost > 0);
      setPendingPaymentCount(pending.length);
    } catch (err) {
      console.error("Payment check failed:", err);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  useEffect(() => {
    setPage(1);
  }, [search, category, statusFilter, freeOnly]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0f1a] text-slate-900">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src={labBg} 
          alt="Background" 
          className="h-full w-full object-cover opacity-30 blur-[4px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-[#fef8fa]" />
      </div>

      {/* Splash Cursor */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <SplashCursor />
      </div>
      <div className="fixed inset-0 z-[2] bg-white/10 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <div className="relative overflow-hidden pt-32 pb-20 text-white shadow-2xl">
          {/* Hero Image Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src={heroBg} 
              alt="Scientific Equipment" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-blue-900/40" />
            <div className="absolute inset-0 bg-slate-950/20" />
          </div>
          
          <div className="mx-auto max-w-6xl px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-4">
                Shared Infrastructure
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                Scientific <span className="text-blue-400">Equipment</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-blue-100/80 leading-relaxed font-serif">
                Access high-precision instrumentation from leading laboratories. 
                Collaborate, book, and advance your research with our shared resource network.
              </p>
              
              <div className="mt-10 flex flex-wrap gap-4 items-center">
                {currentUser && (
                  <button
                    onClick={() => navigate("/equipment/new")}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500 hover:-translate-y-0.5 active:scale-95"
                  >
                    <Plus size={18} />
                    List Your Equipment
                  </button>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate("/equipment/manage")}
                    className="rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur active:scale-95"
                  >
                    My Listings
                  </button>
                  <button
                    onClick={() => navigate("/equipment/my-bookings")}
                    className="rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur active:scale-95"
                  >
                    My Bookings
                  </button>
                  
                  {pendingPaymentCount > 0 && (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => navigate("/equipment/my-bookings?status=approved")}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 hover:-translate-y-0.5 active:scale-95 animate-pulse"
                    >
                      <CreditCard size={18} />
                      Pay Now ({pendingPaymentCount})
                    </motion.button>
                  )}
                </div>
              </div>

              {pendingPaymentCount > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 inline-flex items-center gap-4 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 p-4 backdrop-blur-md"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center animate-pulse">
                    <Zap size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Pending Payments Detected</p>
                    <button 
                      onClick={() => navigate("/equipment/my-bookings?status=approved")}
                      className="text-xs font-bold text-indigo-300 underline underline-offset-4 hover:text-indigo-200"
                    >
                      Process {pendingPaymentCount} booking{pendingPaymentCount > 1 ? 's' : ''} now →
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Filters - Floating Bar */}
        <div className="mx-auto -mt-10 max-w-6xl px-4 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-2xl shadow-slate-200/50 backdrop-blur-2xl"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 rounded-full bg-slate-50/50 px-6 py-3.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-400 focus-within:bg-white transition-all">
                <Search size={20} className="text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, category, location..."
                  className="w-full bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="relative group">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="appearance-none rounded-full border border-slate-200 bg-white/80 pl-6 pr-12 py-3.5 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition cursor-pointer hover:bg-slate-50"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                </div>

                <div className="relative group">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none rounded-full border border-slate-200 bg-white/80 pl-6 pr-12 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition cursor-pointer hover:bg-slate-50"
                  >
                    <option value="all">Any Status</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <button
                  onClick={() => setFreeOnly(!freeOnly)}
                  className={`flex items-center gap-2 rounded-full border px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${freeOnly ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                >
                  <Gift size={16} /> Free
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-4 pb-24">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center py-32"
              >
                <RefreshCw size={48} className="animate-spin text-blue-600 opacity-20" />
              </motion.div>
            ) : equipment.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-[32px] border border-white/70 bg-white/60 p-20 text-center backdrop-blur-xl shadow-xl"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-400">
                  <Cpu size={40} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-800">No Equipment Found</h3>
                <p className="mt-2 text-slate-500 max-w-sm mx-auto">
                  We couldn't find any equipment matching your criteria. Try adjusting your filters or search terms.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Infrastructure Library ({total})
                  </p>
                </div>

                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {equipment.map((eq) => (
                    <EquipmentCard key={eq._id} eq={eq} currentUserId={currentUserId} />
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-6">
                    <button
                      disabled={page === 1}
                      onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-20"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-bold text-slate-500">
                      Page <span className="text-slate-900">{page}</span> of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-20"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EquipmentList;

