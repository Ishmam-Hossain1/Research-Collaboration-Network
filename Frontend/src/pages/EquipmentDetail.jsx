import React, { useState, useEffect, useMemo } from "react";
import api from "../lib/api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import SplashCursor from "../components/SplashCursor";
import {
  ArrowLeft, MapPin, CheckCircle, XCircle, Wrench, Gift,
  Zap, Calendar, Clock, User, Send, AlertTriangle, ChevronLeft, ChevronRight,
  Info, Tag, BookOpen, Layers, ShieldCheck, ArrowRight, RefreshCw, X
} from "lucide-react";


const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_STYLES = {
  available: { 
    label: "Available", 
    icon: <CheckCircle size={14} />, 
    className: "bg-emerald-100 text-emerald-700 border-emerald-200" 
  },
  unavailable: { 
    label: "Unavailable", 
    icon: <XCircle size={14} />, 
    className: "bg-rose-100 text-rose-700 border-rose-200" 
  },
  maintenance: { 
    label: "Maintenance", 
    icon: <Wrench size={14} />, 
    className: "bg-amber-100 text-amber-700 border-amber-200" 
  },
};

// Modernized high-visibility calendar
function AvailabilityCalendar({ approvedDates, blockedDates, availabilitySchedule }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const isBooked = (date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return approvedDates.some((b) => {
      const start = new Date(b.startDate);
      start.setHours(0,0,0,0);
      const end = new Date(b.endDate);
      end.setHours(0,0,0,0);
      return d >= start && d <= end;
    });
  };

  const isBlocked = (date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return (blockedDates || []).some((b) => {
      const start = new Date(b.start);
      start.setHours(0,0,0,0);
      const end = new Date(b.end);
      end.setHours(0,0,0,0);
      return d >= start && d <= end;
    });
  };

  const isPast = (date) => new Date(date) < today;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
          <Calendar size={16} className="text-blue-600" /> Availability
        </h3>
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button onClick={prevMonth} className="rounded-xl p-2 hover:bg-white hover:text-blue-600 transition-all shadow-sm active:scale-95">
            <ChevronLeft size={16} />
          </button>
          <span className="text-[11px] font-black text-slate-800 min-w-[110px] text-center uppercase tracking-widest">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} className="rounded-xl p-2 hover:bg-white hover:text-blue-600 transition-all shadow-sm active:scale-95">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2.5 mb-4 text-center">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2.5 text-center">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const d = new Date(viewYear, viewMonth, day);
          const past = isPast(dateStr);
          const booked = isBooked(dateStr);
          const blockedByDate = isBlocked(dateStr);
          
          const hasSchedule = availabilitySchedule && availabilitySchedule.length > 0;
          const isOffDay = hasSchedule && !availabilitySchedule.some(slot => slot.dayOfWeek === d.getDay());
          
          const blocked = blockedByDate || isOffDay;

          let cls = "h-10 flex items-center justify-center rounded-2xl text-[11px] font-black transition-all duration-300 ";
          
          if (past) {
            cls += "text-slate-200 cursor-default opacity-40";
          } else if (booked) {
            cls += "bg-rose-600 text-white shadow-lg shadow-rose-200 scale-95 ring-2 ring-rose-100 ring-offset-2 ring-offset-white cursor-help";
          } else if (blocked) {
            cls += "bg-amber-500 text-white shadow-lg shadow-amber-200 scale-95 ring-2 ring-amber-100 ring-offset-2 ring-offset-white cursor-help";
          } else {
            cls += "bg-blue-600 text-white hover:bg-blue-500 cursor-pointer hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:scale-90 shadow-md shadow-blue-900/10";
          }

          return (
            <div 
              key={dateStr} 
              className={cls} 
              title={booked ? "Reserved" : blocked ? "Unavailable" : past ? "Historical Date" : "Available"}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-3 gap-3">
        {[
          { color: "bg-blue-600", label: "Free", sub: "Open" },
          { color: "bg-rose-600", label: "Booked", sub: "Taken" },
          { color: "bg-amber-500", label: "Blocked", sub: "Closed" },
        ].map(({ color, label, sub }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className={`h-2 w-2 rounded-full ${color} shadow-sm shadow-black/10`} />
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-tighter">{label}</p>
              <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvedDates, setApprovedDates] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Booking form
  const [booking, setBooking] = useState({ startDate: "", endDate: "", purpose: "", projectName: "", requesterNotes: "" });
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("researchConnectUser") || "null");
    } catch { return null; }
  }, []);
  
  const currentUserId = currentUser?._id || currentUser?.id;
  const token = localStorage.getItem("researchConnectToken");
  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [eqRes, datesRes] = await Promise.all([
          api.get(`/equipment/${id}`),
          api.get(`/equipment/${id}/approved-dates`),
        ]);
        setEquipment(eqRes.data);
        setApprovedDates(datesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load equipment details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAll();
  }, [id, authHeaders]);

  const handleBookingChange = (e) => {
    setBooking({ ...booking, [e.target.name]: e.target.value });
    setBookingError("");
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }

    const { startDate, endDate, purpose } = booking;
    if (!startDate || !endDate || !purpose.trim()) {
      setBookingError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setBookingError("");
    setBookingSuccess("");
    try {
      await api.post(`/equipment/${id}/bookings`, booking);
      setBookingSuccess("✅ Booking request submitted! The owner has been notified.");
      setBooking({ startDate: "", endDate: "", purpose: "", projectName: "", requesterNotes: "" });
      const datesRes = await api.get(`/equipment/${id}/approved-dates`);
      setApprovedDates(datesRes.data);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Booking submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <RefreshCw size={48} className="animate-spin text-blue-600 opacity-20" />
    </div>
  );

  if (error || !equipment) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle size={64} className="mx-auto text-rose-500 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{error || "Equipment Not Found"}</h2>
        <button onClick={() => navigate("/equipment")} className="text-blue-600 hover:underline">Back to Library</button>
      </div>
    </div>
  );

  const isOwner = equipment.owner?._id === currentUserId;
  const st = STATUS_STYLES[equipment.status] || STATUS_STYLES.available;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-900">
      <div className="absolute inset-0 z-0"><SplashCursor /></div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section - Semi Dark */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 pt-32 pb-24 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="mx-auto max-w-6xl px-4 relative z-10">
            <Link to="/equipment" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 mb-8 transition">
              <ArrowLeft size={14} /> Back to Library
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-3">
                  {equipment.category}
                </p>
                <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl tracking-tight">
                  {equipment.name}
                </h1>
                
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${st.className} border-none`}>
                    {st.icon} {st.label}
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20">
                    <ShieldCheck size={14} className="text-blue-400" /> {equipment.condition} condition
                  </div>
                  {equipment.requiresTraining && (
                    <div className="flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300 backdrop-blur-md border border-white/10">
                      <Zap size={14} /> Training Required
                    </div>
                  )}
                </div>
              </div>

              {/* Price Card - Semi Dark Glass */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative shrink-0 rounded-[32px] border border-white/20 bg-white/10 p-8 text-center backdrop-blur-xl shadow-2xl min-w-[300px]"
              >
                <div className="absolute -top-4 -right-4 h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                  <Gift size={24} className="text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-200 opacity-60 mb-2">Rental Pricing</p>
                {equipment.isFree ? (
                  <h2 className="text-4xl font-serif font-bold text-emerald-400">FREE</h2>
                ) : (
                  <h2 className="text-4xl font-serif font-bold">
                    {equipment.rentalPricePerDay} <small className="text-lg font-sans opacity-50 font-medium">TK/DAY</small>
                  </h2>
                )}
                <p className="mt-4 text-xs font-medium text-blue-100/60 leading-relaxed">
                  {equipment.isFree ? "Available for research collaboration at no cost." : "Secure payments handled via Research Connect."}
                </p>
                
                {isOwner ? (
                  <button onClick={() => navigate(`/equipment/edit/${id}`)} className="mt-8 w-full rounded-2xl bg-white py-4 text-sm font-bold text-slate-900 transition hover:bg-blue-50">
                    Edit Equipment
                  </button>
                ) : equipment.status === "available" ? (
                  <button onClick={() => setActiveTab("book")} className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-900/30">
                    Request Booking
                  </button>
                ) : (
                  <div className="mt-8 w-full rounded-2xl bg-white/5 py-4 text-sm font-bold text-white/50 border border-white/10">
                    Currently Unavailable
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Tab System */}
        <div className="mx-auto -mt-8 max-w-6xl px-4 relative z-20">
          <div className="flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-xl md:w-fit">
            {[
              { id: "overview", label: "General Information", icon: <Info size={16} /> },
              ...(!isOwner && equipment.status === "available" ? [{ id: "book", label: "Request to Book", icon: <Calendar size={16} /> }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold transition-all ${
                  activeTab === tab.id ? "text-white" : "text-slate-500 hover:text-blue-600"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 rounded-full bg-blue-600" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon} {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Light Background */}
        <div className="mx-auto max-w-6xl px-4 py-12 pb-32">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* Left Content Area */}
            <div className="space-y-10">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-lg">
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <BookOpen size={28} />
                      </div>
                      <h2 className="text-2xl font-serif font-bold text-slate-800 mb-6">Equipment Description</h2>
                      <p className="text-lg leading-relaxed text-slate-600 whitespace-pre-wrap font-serif">
                        {equipment.description}
                      </p>
                      
                      {equipment.specifications && (
                        <div className="mt-12 pt-12 border-t border-slate-100">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Layers size={14} className="text-blue-500" /> Technical Specifications
                          </h3>
                          <div className="text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-6 rounded-2xl border border-slate-100 font-medium">
                            {equipment.specifications}
                          </div>
                        </div>
                      )}
                    </section>

                    {equipment.usageInstructions && (
                      <section className="rounded-[32px] border border-amber-100 bg-amber-50/30 p-10">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                          <AlertTriangle size={28} />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">Standard Operating Procedures</h2>
                        <p className="text-amber-800/80 leading-relaxed whitespace-pre-wrap font-medium">
                          {equipment.usageInstructions}
                        </p>
                      </section>
                    )}

                    {equipment.availabilitySchedule?.length > 0 && (
                      <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-lg">
                        <h2 className="text-xl font-serif font-bold text-slate-800 mb-8 flex items-center gap-3">
                          <Clock size={22} className="text-blue-500" /> Weekly Operation Hours
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {equipment.availabilitySchedule.sort((a,b)=>a.dayOfWeek-b.dayOfWeek).map((slot, i) => (
                            <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 shadow-sm transition hover:shadow-md">
                              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                                {FULL_DAY_NAMES[slot.dayOfWeek]}
                              </p>
                              <p className="text-sm font-bold text-slate-700">
                                {slot.startTime} <span className="text-slate-300 mx-1">—</span> {slot.endTime}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {equipment.tags?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-3">
                        <Tag size={16} className="text-slate-300" />
                        {equipment.tags.map((t) => (
                          <span key={t} className="rounded-full bg-white border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-blue-600 hover:text-white">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "book" && !isOwner && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl"
                  >
                    <h2 className="text-3xl font-serif font-bold text-slate-800 mb-8">Scheduling Request</h2>

                    {!currentUser ? (
                      <div className="rounded-3xl bg-blue-50 p-10 text-center border border-blue-100 shadow-inner">
                        <p className="text-slate-600 mb-6 font-medium">Authentication required to process equipment bookings.</p>
                        <button onClick={() => navigate("/login")} className="rounded-2xl bg-blue-600 px-10 py-4 text-sm font-bold text-white shadow-lg hover:bg-blue-500 transition">
                          Sign In to Continue
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitBooking} className="space-y-8">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Start Date</label>
                            <input
                              type="date"
                              name="startDate"
                              value={booking.startDate}
                              onChange={handleBookingChange}
                              min={new Date().toISOString().split("T")[0]}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">End Date</label>
                            <input
                              type="date"
                              name="endDate"
                              value={booking.endDate}
                              onChange={handleBookingChange}
                              min={booking.startDate || new Date().toISOString().split("T")[0]}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Purpose of Usage</label>
                          <textarea
                            name="purpose"
                            value={booking.purpose}
                            onChange={handleBookingChange}
                            rows={4}
                            placeholder="Briefly describe your research objectives..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                            required
                          />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Project Name</label>
                            <input
                              type="text"
                              name="projectName"
                              value={booking.projectName}
                              onChange={handleBookingChange}
                              placeholder="Optional"
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Special Notes</label>
                            <input
                              type="text"
                              name="requesterNotes"
                              value={booking.requesterNotes}
                              onChange={handleBookingChange}
                              placeholder="Logistics, etc."
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        {bookingError && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-rose-50 p-5 text-sm font-bold text-rose-600 border border-rose-100 flex items-center gap-3">
                            <AlertTriangle size={18} /> {bookingError}
                          </motion.div>
                        )}
                        {bookingSuccess && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-emerald-50 p-5 text-sm font-bold text-emerald-700 border border-emerald-100 shadow-sm">
                            {bookingSuccess}
                          </motion.div>
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-sm font-bold text-white shadow-xl shadow-blue-900/20 hover:bg-blue-500 disabled:opacity-60 transition-all hover:scale-[1.01]"
                        >
                          {submitting ? (
                            <><RefreshCw size={18} className="animate-spin" /> Verifying...</>
                          ) : (
                            <><Send size={18} /> Send Booking Request</>
                          )}
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Area */}
            <div className="space-y-10">
              {/* Owner Info - Card Like Box */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-lg"
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <User size={14} className="text-blue-500" /> Lab Controller
                </h3>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-[24px] bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white">
                    {equipment.owner?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-lg font-bold text-slate-800 truncate">{equipment.owner?.username}</p>
                    <p className="text-xs font-medium text-slate-400 truncate mt-1">{equipment.owner?.email}</p>
                  </div>
                </div>
                {equipment.location && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <MapPin size={16} className="shrink-0 text-blue-500 mt-0.5" /> 
                    <span className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-wider">{equipment.location}</span>
                  </div>
                )}
                {!isOwner && (
                  <Link
                    to={`/researchers/${equipment.owner?._id}`}
                    className="mt-8 flex items-center justify-center gap-2 w-full rounded-2xl bg-white border border-slate-100 py-4 text-xs font-bold text-blue-600 shadow-sm hover:shadow-md transition hover:bg-blue-50"
                  >
                    View Researcher Profile <ArrowRight size={14} />
                  </Link>
                )}
              </motion.div>

              {/* Dynamic Calendar - Card Like Box */}
              <AvailabilityCalendar 
                approvedDates={approvedDates} 
                blockedDates={equipment.blockedDates || []} 
                availabilitySchedule={equipment.availabilitySchedule || []}
              />

              {/* Resource Summary - Card Like Box */}
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-lg space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-4">
                  Resource Summary
                </h3>
                <div className="space-y-5">
                  {[
                    { label: "Category", val: equipment.category, icon: <Layers size={14} /> },
                    { label: "Max Rental", val: `${equipment.maxBookingDays} Days`, icon: <Clock size={14} /> },
                    { label: "Policy", val: equipment.requiresTraining ? "Supervised" : "Self-Service", icon: <ShieldCheck size={14} /> },
                    { label: "Listed On", val: formatDate(equipment.createdAt), icon: <Calendar size={14} /> },
                  ].map(({ label, val, icon }) => (
                    <div key={label} className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-300 flex items-center gap-1.5">
                        {icon} {label}
                      </span>
                      <span className="text-sm font-bold text-slate-700">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
