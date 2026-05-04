import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import SplashCursor from "../components/SplashCursor";
import {
  Plus, Cpu, CheckCircle, XCircle, Wrench, Clock, Inbox,
  Trash2, Edit, Eye, AlertTriangle, ChevronDown, ChevronUp,
  CheckSquare, XSquare, User, Calendar, History, Gift,
  Star, RefreshCw, ArrowRight, Zap, Layers, ShieldCheck
} from "lucide-react";
import inventoryBg from "../assets/inventory.jpg";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_STYLES = {
  pending: { className: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending Review" },
  approved: { className: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Approved" },
  rejected: { className: "bg-rose-100 text-rose-700 border-rose-200", label: "Rejected" },
  cancelled: { className: "bg-slate-100 text-slate-600 border-slate-200", label: "Cancelled" },
  completed: { className: "bg-blue-100 text-blue-700 border-blue-200", label: "Completed" },
};

const EQ_STATUS = {
  available: { className: "bg-emerald-100 text-emerald-700", icon: <CheckCircle size={12} />, label: "Active" },
  unavailable: { className: "bg-rose-100 text-rose-700", icon: <XCircle size={12} />, label: "Inactive" },
  maintenance: { className: "bg-amber-100 text-amber-700", icon: <Wrench size={12} />, label: "Maintenance" },
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

function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-[32px] border border-white/80 bg-white/95 p-8 shadow-2xl text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">Are you sure?</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 rounded-2xl border border-slate-100 py-3 text-sm font-bold text-slate-400 hover:bg-slate-50 transition">
            Keep Asset
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-900/20 hover:bg-rose-500 transition disabled:opacity-50">
            {loading ? <RefreshCw size={16} className="animate-spin mx-auto" /> : "Confirm Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function BookingRequestCard({ booking, onApprove, onReject, onComplete }) {
  const [expanded, setExpanded] = useState(false);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const st = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;

  const handleAction = async (action) => {
    setActionLoading(action);
    if (action === "approve") await onApprove(booking._id, ownerNotes);
    else if (action === "reject") await onReject(booking._id, ownerNotes);
    else await onComplete(booking._id);
    setActionLoading(null);
  };

  return (
    <motion.div 
      variants={fadeUpVariant}
      whileHover={{ scale: 1.01 }}
      className={`group rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-lg transition hover:bg-white ${booking.status === "pending" ? "ring-2 ring-amber-400/20 shadow-amber-900/5" : ""}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-bold text-sm shadow-inner">
            {booking.requester?.username?.[0]?.toUpperCase() || "R"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-serif text-lg font-bold text-slate-800 truncate">{booking.requester?.username}</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest rounded-full border px-2.5 py-1 ${st.className} border-none`}>{st.label}</span>
            </div>
            <p className="text-xs font-medium text-slate-400">{booking.requester?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Rental Item</p>
            <p className="text-sm font-bold text-blue-600">{booking.equipment?.name}</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-6 border-t border-slate-100 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50/50 p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Calendar size={12}/> Dates</p>
                  <p className="text-xs font-bold text-slate-700">{formatDate(booking.startDate)} — {formatDate(booking.endDate)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50/50 p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Layers size={12}/> Project</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{booking.projectName || "Standard Research"}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Usage Purpose</p>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{booking.purpose}</p>
              </div>

              {booking.status === "pending" && (
                <div className="space-y-4 pt-2">
                  <textarea
                    value={ownerNotes}
                    onChange={(e) => setOwnerNotes(e.target.value)}
                    rows={2}
                    placeholder="Add approval notes or special instructions for the researcher..."
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction("approve")}
                      disabled={!!actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 disabled:opacity-50 transition"
                    >
                      {actionLoading === "approve" ? <RefreshCw size={18} className="animate-spin" /> : <><CheckSquare size={18} /> Approve Booking</>}
                    </button>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={!!actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 py-4 text-sm font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition"
                    >
                      {actionLoading === "reject" ? "Processing..." : <><XSquare size={18} /> Reject</>}
                    </button>
                  </div>
                </div>
              )}

              {booking.status === "approved" && (
                <button
                  onClick={() => handleAction("complete")}
                  disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition disabled:opacity-50"
                >
                  {actionLoading === "complete" ? <RefreshCw size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Mark as Rental Completed</>}
                </button>
              )}

              {booking.ownerNotes && (
                <div className="rounded-2xl border border-blue-50 bg-blue-50/50 p-5">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">My Response</p>
                  <p className="text-xs font-bold text-blue-800 leading-relaxed italic">"{booking.ownerNotes}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const MyEquipment = () => {
  const navigate = useNavigate();
  const [myEquipment, setMyEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingEq, setLoadingEq] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeView, setActiveView] = useState("equipment");
  const [bookingFilter, setBookingFilter] = useState("pending");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("researchConnectToken");
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("researchConnectUser") || "null"); }
    catch { return null; }
  }, []);

  useEffect(() => {
    if (!currentUser || !token) navigate("/login");
  }, [currentUser, token, navigate]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMyEquipment = useCallback(async () => {
    setLoadingEq(true);
    try {
      const res = await axios.get(`${API}/api/equipment/mine`, { headers: authHeaders });
      setMyEquipment(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingEq(false); }
  }, [authHeaders]);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const params = {};
      if (bookingFilter !== "all") params.status = bookingFilter;
      const res = await axios.get(`${API}/api/equipment/bookings/dashboard`, { headers: authHeaders, params });
      setBookings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingBookings(false); }
  }, [bookingFilter, authHeaders]);

  useEffect(() => { fetchMyEquipment(); }, [fetchMyEquipment]);
  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleApprove = async (bookingId, ownerNotes) => {
    try {
      await axios.put(`${API}/api/equipment/bookings/${bookingId}/approve`, { ownerNotes }, { headers: authHeaders });
      showToast("Booking request approved!");
      fetchBookings();
    } catch (err) { showToast(err.response?.data?.message || "Operation failed.", "error"); }
  };

  const handleReject = async (bookingId, ownerNotes) => {
    try {
      await axios.put(`${API}/api/equipment/bookings/${bookingId}/reject`, { ownerNotes }, { headers: authHeaders });
      showToast("Booking request rejected.");
      fetchBookings();
    } catch (err) { showToast(err.response?.data?.message || "Operation failed.", "error"); }
  };

  const handleComplete = async (bookingId) => {
    try {
      await axios.put(`${API}/api/equipment/bookings/${bookingId}/complete`, {}, { headers: authHeaders });
      showToast("Status updated to completed.");
      fetchBookings();
    } catch (err) { showToast(err.response?.data?.message || "Operation failed.", "error"); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/equipment/${deleteTarget}`, { headers: authHeaders });
      setMyEquipment((prev) => prev.filter((e) => e._id !== deleteTarget));
      showToast("Asset removed from library.");
      setDeleteTarget(null);
    } catch (err) { showToast(err.response?.data?.message || "Deletion failed.", "error"); }
    finally { setDeleting(false); }
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fef8fa] text-slate-900">
      <div className="absolute inset-0 z-[1]"><SplashCursor /></div>
      <div className="absolute inset-0 z-[2] bg-white/35 backdrop-blur-[0.5px]" />

      <div className="relative z-10">
        <Navbar />

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className={`fixed top-24 right-4 z-[200] rounded-[20px] px-6 py-4 text-sm font-bold shadow-2xl backdrop-blur-xl ${toast.type === "error" ? "bg-rose-600 text-white shadow-rose-900/20" : "bg-emerald-600 text-white shadow-emerald-900/20"}`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Banner */}
        <div className="relative overflow-hidden pt-32 pb-20 text-white shadow-2xl">
          {/* Hero Image Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src={inventoryBg} 
              alt="Inventory" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-blue-900/40" />
            <div className="absolute inset-0 bg-slate-950/20" />
          </div>

          <div className="mx-auto max-w-6xl px-4 relative z-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-3">Asset Management</p>
                <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Inventory <span className="text-blue-400">&</span> Requests</h1>
                <p className="mt-4 max-w-xl text-blue-100/70 font-serif text-lg leading-relaxed">
                  Monitor your research infrastructure, approve rental inquiries, and scale your collaborative reach.
                </p>
              </motion.div>
              <button
                onClick={() => navigate("/equipment/new")}
                className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-5 text-sm font-bold text-white shadow-xl shadow-blue-900/30 hover:bg-blue-500 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Plus size={20} /> List New Asset
              </button>
            </div>

            {/* Dashboard Stats */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "My Library", val: myEquipment.length },
                { label: "Active Items", val: myEquipment.filter(e => e.status === "available").length },
                { label: "Pending Inquiries", val: pendingCount, pulse: pendingCount > 0 },
                { label: "Lifetime Rentals", val: bookings.filter(b => b.status === "completed").length },
              ].map(({ label, val, pulse }) => (
                <div key={label} className={`rounded-[24px] border border-blue-400/20 bg-white/10 p-6 backdrop-blur-md transition hover:bg-white/20 ${pulse ? 'ring-2 ring-blue-400/50' : ''}`}>
                  <p className={`text-3xl font-serif font-bold ${pulse ? 'text-blue-400 animate-pulse' : 'text-white'}`}>{val}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 opacity-60 mt-2">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Tab Bar */}
        <div className="mx-auto -mt-8 max-w-6xl px-4 relative z-20">
          <div className="flex flex-wrap gap-2 rounded-full border border-white/70 bg-white/80 p-2 shadow-2xl backdrop-blur-2xl md:w-fit">
            {[
              { id: "equipment", label: "Asset Inventory", icon: <Layers size={16} /> },
              { id: "requests", label: "Rental Inquiries", icon: <Inbox size={16} /> },
              { id: "history", label: "Rental History", icon: <History size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`relative flex items-center gap-2 rounded-full px-8 py-4 text-xs font-bold transition-all ${activeView === tab.id ? "text-white" : "text-slate-500 hover:text-blue-600"}`}
              >
                {activeView === tab.id && (
                  <motion.div layoutId="viewTab" className="absolute inset-0 rounded-full bg-blue-600 shadow-lg shadow-blue-900/20" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon} {tab.label}
                  {tab.id === "requests" && pendingCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] font-black text-blue-600 shadow-sm">{pendingCount}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="mx-auto max-w-6xl px-4 py-16 pb-32">
          <AnimatePresence mode="wait">
            {activeView === "equipment" && (
              <motion.div key="eq" initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
                {loadingEq ? (
                  <div className="flex justify-center py-20"><RefreshCw size={48} className="animate-spin text-blue-600 opacity-20" /></div>
                ) : myEquipment.length === 0 ? (
                  <div className="rounded-[40px] border border-blue-100 bg-white p-24 text-center shadow-xl shadow-blue-900/5">
                    <Cpu size={64} className="mx-auto mb-6 text-slate-200" />
                    <h3 className="text-2xl font-serif font-bold text-slate-800">Your Library is Empty</h3>
                    <button onClick={() => navigate("/equipment/new")} className="mt-8 rounded-2xl bg-blue-600 px-10 py-4 text-sm font-bold text-white transition hover:bg-blue-500">
                      Add First Resource
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {myEquipment.map((eq) => {
                      const st = EQ_STATUS[eq.status] || EQ_STATUS.available;
                      return (
                        <motion.div 
                          key={eq._id} 
                          variants={fadeUpVariant} 
                          whileHover={{ scale: 1.03 }}
                          className="group relative rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-lg transition hover:shadow-xl hover:bg-white"
                        >
                          <div className="flex items-start justify-between gap-4 mb-6">
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{eq.category}</span>
                              <h3 className="font-serif text-xl font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors mt-1">{eq.name}</h3>
                            </div>
                            <span className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${st.className} border-none shadow-sm`}>
                              {st.icon} {st.label}
                            </span>
                          </div>

                          <p className="text-sm text-slate-500 line-clamp-2 mb-8 font-medium leading-relaxed">{eq.description}</p>

                          <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-800">{eq.isFree ? "Free" : `${eq.rentalPricePerDay} TK`}</span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Pricing Model</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Link to={`/equipment/${eq._id}`} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition shadow-sm"><Eye size={18} /></Link>
                              <Link to={`/equipment/edit/${eq._id}`} className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"><Edit size={18} /></Link>
                              <button onClick={() => setDeleteTarget(eq._id)} className="p-3 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition shadow-sm"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeView === "requests" && (
              <motion.div key="req" initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
                <div className="flex flex-wrap gap-2 items-center mb-8">
                  {["pending", "approved", "rejected", "all"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setBookingFilter(s)}
                      className={`rounded-full px-6 py-2.5 text-xs font-bold capitalize transition-all ${bookingFilter === s ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "bg-white/80 border border-white text-slate-400 hover:text-blue-600"}`}
                    >
                      {s === "all" ? "Full Registry" : STATUS_STYLES[s]?.label || s}
                    </button>
                  ))}
                  <button onClick={fetchBookings} className="ml-auto p-3 rounded-full bg-white/80 border border-white text-slate-400 hover:text-blue-600 transition shadow-sm">
                    <RefreshCw size={14} className={loadingBookings ? "animate-spin" : ""} />
                  </button>
                </div>

                {loadingBookings ? (
                  <div className="flex justify-center py-20"><RefreshCw size={48} className="animate-spin text-blue-600 opacity-20" /></div>
                ) : bookings.length === 0 ? (
                  <div className="rounded-[40px] border border-blue-100 bg-white p-24 text-center shadow-xl shadow-blue-900/5">
                    <Inbox size={64} className="mx-auto mb-6 text-slate-200" />
                    <h3 className="text-2xl font-serif font-bold text-slate-800">No {bookingFilter} inquiries</h3>
                    <p className="mt-2 text-slate-400 max-w-sm mx-auto">Collaboration requests from other researchers will appear here for your review.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookings.map((b) => (
                      <BookingRequestCard
                        key={b._id} booking={b}
                        onApprove={handleApprove} onReject={handleReject} onComplete={handleComplete}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeView === "history" && (
              <motion.div key="hist" initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
                {loadingBookings ? (
                  <div className="flex justify-center py-20"><RefreshCw size={48} className="animate-spin text-blue-600 opacity-20" /></div>
                ) : (() => {
                  const completed = bookings.filter((b) => b.status === "completed");
                  return completed.length === 0 ? (
                    <div className="rounded-[40px] border border-blue-100 bg-white p-24 text-center shadow-xl shadow-blue-900/5">
                      <History size={64} className="mx-auto mb-6 text-slate-200" />
                      <h3 className="text-2xl font-serif font-bold text-slate-800">Archived Rentals</h3>
                      <p className="mt-2 text-slate-400">Finalized transactions and historical rental records will be stored here.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {completed.map((b) => (
                        <motion.div key={b._id} variants={fadeUpVariant} className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-lg transition hover:shadow-xl hover:bg-white">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                {b.requester?.username?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-serif text-lg font-bold text-slate-800">{b.requester?.username}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 inline-block mt-1">Archived Transaction</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Duration</p>
                                <p className="text-sm font-bold text-slate-600">{formatDate(b.startDate)} — {formatDate(b.endDate)}</p>
                              </div>
                              {b.rating && (
                                <div className="rounded-2xl bg-amber-50 px-5 py-3 border border-amber-100 flex flex-col items-center">
                                  <StarRating value={b.rating} />
                                  <span className="text-[10px] font-black text-amber-700 mt-1 uppercase tracking-tighter">Researcher Rating</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {b.reviewComment && (
                            <div className="mt-8 rounded-2xl bg-slate-50/50 p-6 border border-slate-100">
                              <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{b.reviewComment}"</p>
                            </div>
                          )}
                          
                          <div className="mt-8 flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-6">
                            <span className="flex items-center gap-2"><Cpu size={14}/> {b.equipment?.name}</span>
                            <span className="flex items-center gap-2 font-black text-emerald-600"><Gift size={14}/> Revenue: {b.totalCost || 0} TK</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal
          message="This action will permanently remove the asset and cancel all associated inquiries."
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting}
        />
      )}
    </div>
  );
};

export default MyEquipment;
