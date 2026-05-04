import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import SplashCursor from "../components/SplashCursor";
import {
  Clock, CheckCircle, XCircle, Inbox, Calendar, Cpu,
  AlertTriangle, Star, X, RefreshCw, ChevronDown, ChevronUp,
  CreditCard, ArrowRight, ShieldCheck, Zap, User
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_INFO = {
  pending: { className: "bg-amber-100 text-amber-700 border-amber-200", label: "Awaiting Review", icon: <Clock size={12} /> },
  approved: { className: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Approved", icon: <CheckCircle size={12} /> },
  rejected: { className: "bg-rose-100 text-rose-700 border-rose-200", label: "Rejected", icon: <XCircle size={12} /> },
  cancelled: { className: "bg-slate-100 text-slate-600 border-slate-200", label: "Cancelled", icon: <X size={12} /> },
  completed: { className: "bg-blue-100 text-blue-700 border-blue-200", label: "Completed", icon: <CheckCircle size={12} /> },
  pending_payment: { className: "bg-indigo-100 text-indigo-700 border-indigo-200", label: "Payment Required", icon: <CreditCard size={12} /> },
};

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-125"
        >
          <Star
            size={28}
            className={(hovered || value) >= s ? "fill-amber-400 text-amber-400" : "text-slate-200"}
          />
        </button>
      ))}
    </div>
  );
}

function BookingCard({ booking, onCancel, onRate, onPay }) {
  const [expanded, setExpanded] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [rateMode, setRateMode] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const st = STATUS_INFO[booking.status] || STATUS_INFO.pending;
  const eq = booking.equipment;

  const handleCancel = async () => {
    setActionLoading(true);
    await onCancel(booking._id, cancellationReason);
    setActionLoading(false);
    setShowCancelForm(false);
  };

  const handleRate = async () => {
    if (!rating) return;
    setActionLoading(true);
    await onRate(booking._id, rating, reviewComment);
    setActionLoading(false);
    setRateMode(false);
  };

  const handlePay = async () => {
    setActionLoading(true);
    await onPay(booking._id);
    setActionLoading(false);
  };

  return (
    <motion.div 
      variants={fadeUpVariant}
      whileHover={{ scale: 1.01 }}
      className={`group rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-lg transition hover:bg-white ${booking.status === 'pending_payment' ? 'ring-2 ring-indigo-400/20' : ''}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
            <Cpu size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${st.className} border-none`}>
                {st.icon} {st.label}
              </span>
              {booking.paymentStatus === 'paid' && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                  <CheckCircle size={10} /> Paid
                </span>
              )}
            </div>
            <Link to={`/equipment/${eq?._id}`} className="font-serif text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors block truncate">
              {eq?.name || "Equipment Resource"}
            </Link>
            <p className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Calendar size={12} className="text-blue-400" /> {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-6 border-t border-slate-100 pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Usage Purpose</p>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{booking.purpose}"</p>
                  </div>
                  {booking.projectName && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Project Reference</p>
                      <p className="text-xs font-bold text-slate-800">{booking.projectName}</p>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl bg-slate-50/50 p-5 border border-slate-100 space-y-3">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2"><User size={12}/> Asset Custodian</p>
                  <p className="text-xs font-bold text-slate-700">{eq?.owner?.username || "Researcher"}</p>
                  <p className="text-[10px] font-medium text-slate-400 truncate">{eq?.location || "Internal Lab Location"}</p>
                </div>
              </div>

              {booking.ownerNotes && (
                <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-5">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Custodian Instructions</p>
                  <p className="text-xs font-bold text-blue-800 leading-relaxed italic">"{booking.ownerNotes}"</p>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                {/* Payment Action */}
                {(booking.status === "approved" || booking.status === "pending_payment") && booking.paymentStatus !== "paid" && (
                  <button
                    onClick={handlePay}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-900/20 hover:from-indigo-500 hover:to-blue-500 transition-all hover:scale-[1.01]"
                  >
                    {actionLoading ? <RefreshCw size={18} className="animate-spin" /> : <><CreditCard size={18} /> Pay Rental Fee (৳{booking.totalCost || 0})</>}
                  </button>
                )}

                {/* Rating Action */}
                {booking.status === "completed" && !booking.rating && (
                  <div className="space-y-4 rounded-[24px] bg-amber-50/50 p-6 border border-amber-100">
                    {!rateMode ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-amber-800">Review this Equipment</h4>
                          <p className="text-[10px] font-medium text-amber-600">Share your findings and equipment performance.</p>
                        </div>
                        <button onClick={() => setRateMode(true)} className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-amber-400 transition">
                          Submit Review
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <StarPicker value={rating} onChange={setRating} />
                        <textarea
                          value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                          rows={2} placeholder="Brief technical feedback or researcher experience..."
                          className="w-full rounded-2xl border border-amber-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-400/10 transition-all"
                        />
                        <div className="flex gap-2">
                          <button onClick={handleRate} disabled={!rating || actionLoading} className="flex-1 rounded-xl bg-amber-500 py-3 text-xs font-bold text-white transition hover:bg-amber-400">
                            {actionLoading ? "Saving..." : "Publish Review"}
                          </button>
                          <button onClick={() => setRateMode(false)} className="px-6 rounded-xl border border-amber-200 text-xs font-bold text-amber-600 hover:bg-white transition">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cancellation Action */}
                {["pending", "approved"].includes(booking.status) && (
                  <div className="pt-2">
                    {!showCancelForm ? (
                      <button onClick={() => setShowCancelForm(true)} className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-rose-500 transition-colors">
                        Retract Request
                      </button>
                    ) : (
                      <div className="space-y-4 bg-rose-50/50 p-6 rounded-[24px] border border-rose-100">
                        <textarea
                          value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)}
                          rows={2} placeholder="Reason for retraction..."
                          className="w-full rounded-2xl border border-rose-100 bg-white px-5 py-4 text-sm font-medium text-rose-800 focus:outline-none transition-all"
                        />
                        <div className="flex gap-2">
                          <button onClick={handleCancel} disabled={actionLoading} className="flex-1 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white hover:bg-rose-500 transition">
                            {actionLoading ? "Processing..." : "Confirm Retraction"}
                          </button>
                          <button onClick={() => setShowCancelForm(false)} className="px-6 rounded-xl border border-rose-200 text-xs font-bold text-rose-400 hover:bg-white transition">Back</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {booking.status === "completed" && booking.rating && (
                  <div className="rounded-2xl bg-white/50 p-4 border border-slate-100 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={14} className={s <= booking.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                        ))}
                      </div>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Verified Feedback</span>
                    </div>
                    {booking.reviewComment && (
                      <p className="text-xs text-slate-500 font-medium italic pl-2 border-l-2 border-amber-200 leading-relaxed">
                        "{booking.reviewComment}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const EquipmentBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("researchConnectUser") || "null"); }
    catch { return null; }
  }, []);
  const token = localStorage.getItem("researchConnectToken");
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    if (!currentUser || !token) navigate("/login");
  }, [currentUser, token, navigate]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const success = searchParams.get("payment_success");
    const fail = searchParams.get("payment_fail");

    if (success) {
      showToast("Payment confirmed! Your booking is now completed.", "success");
      searchParams.delete("payment_success");
      setSearchParams(searchParams);
    } else if (fail) {
      const reason = searchParams.get("reason");
      if (reason === "no_tran_id") {
        showToast("Payment verification skipped (No Transaction ID). If you paid, it will update shortly.", "warning");
      } else {
        showToast("Payment failed or was cancelled.", "error");
      }
      searchParams.delete("payment_fail");
      searchParams.delete("reason");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const res = await axios.get(`${API}/api/equipment/bookings/mine`, { headers: authHeaders, params });
      setBookings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [statusFilter, authHeaders]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (bookingId, cancellationReason) => {
    try {
      await axios.put(`${API}/api/equipment/bookings/${bookingId}/cancel`, { cancellationReason }, { headers: authHeaders });
      showToast("Request retracted successfully.");
      fetchBookings();
    } catch (err) { showToast(err.response?.data?.message || "Operation failed.", "error"); }
  };

  const handleRate = async (bookingId, rating, reviewComment) => {
    try {
      await axios.put(`${API}/api/equipment/bookings/${bookingId}/rate`, { rating, reviewComment }, { headers: authHeaders });
      showToast("Thank you for your feedback!");
      fetchBookings();
    } catch (err) { showToast(err.response?.data?.message || "Review failed.", "error"); }
  };

  const handlePay = async (bookingId) => {
    try {
      const res = await axios.post(`${API}/api/equipment/bookings/${bookingId}/pay`, {}, { headers: authHeaders });
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        showToast("Payment status updated.");
        fetchBookings();
      }
    } catch (err) { showToast(err.response?.data?.message || "Gateway error.", "error"); }
  };

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fef8fa] text-slate-900">
      <div className="absolute inset-0 z-[1]"><SplashCursor /></div>
      <div className="absolute inset-0 z-[2] bg-white/35 backdrop-blur-[0.5px]" />

      <div className="relative z-10">
        <Navbar />

        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className={`fixed top-24 right-4 z-50 rounded-[20px] px-6 py-4 text-sm font-bold shadow-2xl backdrop-blur-xl ${toast.type === "error" ? "bg-rose-600 text-white shadow-rose-900/20" : "bg-emerald-600 text-white shadow-emerald-900/20"}`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 pt-32 pb-20 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="mx-auto max-w-5xl px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-3">Resource Acquisition</p>
              <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Rental <span className="text-blue-400">Ledger</span></h1>
              <p className="mt-4 max-w-2xl text-blue-100/70 font-serif text-lg leading-relaxed">
                Track your equipment access requests, manage pending payments, and review asset performance.
              </p>
            </motion.div>

            <div className="mt-10 flex flex-wrap gap-4">
              {["pending", "approved", "completed", "pending_payment"].map((s) => (
                <div key={s} className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-md transition hover:bg-white/20">
                  <p className="text-2xl font-serif font-bold text-white">{counts[s] || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 opacity-60 mt-1">{STATUS_INFO[s]?.label?.split(' ')[0] || s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mx-auto -mt-8 max-w-5xl px-4 relative z-20">
          <div className="flex flex-wrap gap-2 rounded-full border border-white/70 bg-white/80 p-2 shadow-2xl backdrop-blur-2xl md:w-fit">
            {["all", "pending", "approved", "pending_payment", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`relative flex items-center gap-2 rounded-full px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === s ? "text-white" : "text-slate-500 hover:text-blue-600"}`}
              >
                {statusFilter === s && <motion.div layoutId="filterTab" className="absolute inset-0 rounded-full bg-blue-600" />}
                <span className="relative z-10">{s === "all" ? "Registry" : STATUS_INFO[s]?.label || s}</span>
              </button>
            ))}
            <button onClick={fetchBookings} className="p-3.5 text-slate-400 hover:text-blue-600 transition ml-2">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-5xl px-4 py-16 pb-32">
          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw size={48} className="animate-spin text-blue-600 opacity-20" /></div>
          ) : bookings.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[40px] border border-blue-100 bg-white p-24 text-center shadow-2xl shadow-blue-900/10">
              <Inbox size={64} className="mx-auto mb-6 text-slate-200" />
              <h3 className="text-2xl font-serif font-bold text-slate-800">No Transactions Recorded</h3>
              <p className="mt-2 text-slate-400 max-w-sm mx-auto">You haven't initiated any equipment rental requests yet.</p>
              <button onClick={() => navigate("/equipment")} className="mt-10 rounded-2xl bg-blue-600 px-10 py-4 text-sm font-bold text-white shadow-xl shadow-blue-900/20 hover:bg-blue-500 transition-all hover:scale-105">
                Browse Research Library
              </button>
            </motion.div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
              {bookings.map((b) => (
                <BookingCard key={b._id} booking={b} onCancel={handleCancel} onRate={handleRate} onPay={handlePay} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentBookings;
