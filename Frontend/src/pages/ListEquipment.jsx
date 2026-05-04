import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import SplashCursor from "../components/SplashCursor";
import {
  ArrowLeft, Plus, X, Cpu, AlertTriangle, CheckCircle, Info,
  Zap, MapPin, Layers, Clock, ShieldCheck, Tag, Gift, Calendar, RefreshCw,
  ChevronDown
} from "lucide-react";
import React from "react";
import labBg from "../assets/chemistry-laboratory-with-colorful-liquids-and-glassware_70423754.jpg";
import heroBg from "../assets/240_F_867695305_neYfOrKo5im0RxBj0QpDlc627zOSy4vF.jpg";

const API = `${import.meta.env.VITE_BACKEND_BASEURL}`;

const CATEGORIES = [
  "Microscopy", "Spectroscopy", "Chromatography", "Computing",
  "Imaging", "Electronics", "Biology", "Chemistry", "Physics", "Other",
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block ml-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-slate-400 font-medium ml-1 leading-relaxed">{hint}</p>}
    </div>
  );
}

const ListEquipment = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Microscopy",
    location: "",
    specifications: "",
    usageInstructions: "",
    rentalPricePerDay: "",
    isFree: true,
    status: "available",
    maxBookingDays: 7,
    requiresTraining: false,
    condition: "good",
    tags: "",
  });

  const [availabilitySchedule, setAvailabilitySchedule] = useState([]);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlock, setNewBlock] = useState({ start: "", end: "", reason: "Maintenance" });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("researchConnectUser") || "null"); }
    catch { return null; }
  }, []);
  
  const token = localStorage.getItem("researchConnectToken");
  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  useEffect(() => {
    if (!currentUser || !token) navigate("/login");
  }, [currentUser, token, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const addSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) { setError("Please define both start and end times."); return; }
    if (newSlot.startTime >= newSlot.endTime) { setError("Operational start must precede end time."); return; }
    setAvailabilitySchedule((p) => [...p, { ...newSlot, dayOfWeek: parseInt(newSlot.dayOfWeek) }]);
    setNewSlot({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });
    setError("");
  };
  
  const removeSlot = (i) => setAvailabilitySchedule((p) => p.filter((_, idx) => idx !== i));

  const addBlock = () => {
    if (!newBlock.start || !newBlock.end) { setError("Please select a valid date range."); return; }
    if (new Date(newBlock.start) >= new Date(newBlock.end)) { setError("Block end date must be after start."); return; }
    setBlockedDates((p) => [...p, { ...newBlock }]);
    setNewBlock({ start: "", end: "", reason: "Maintenance" });
    setError("");
  };

  const removeBlock = (i) => setBlockedDates((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      setError("Equipment name and primary description are required.");
      return;
    }
    
    if (!form.isFree && (!form.rentalPricePerDay || Number(form.rentalPricePerDay) < 1 || Number(form.rentalPricePerDay) > 5000)) {
      setError("Please specify a valid rental price.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        rentalPricePerDay: form.isFree ? 0 : Number(form.rentalPricePerDay),
        maxBookingDays: Number(form.maxBookingDays),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        availabilitySchedule,
        blockedDates,
      };
      const res = await axios.post(`${API}/api/equipment`, payload, { headers: authHeaders });
      setSuccess(true);
      setTimeout(() => navigate(`/equipment/${res.data._id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registry submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0f1a] text-slate-900">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src={labBg} 
          alt="Background" 
          className="h-full w-full object-cover opacity-30 blur-[4px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-[#f8fbff]" />
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
              alt="Register Asset" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-blue-900/40" />
            <div className="absolute inset-0 bg-slate-950/20" />
          </div>
          <div className="mx-auto max-w-4xl px-4 relative z-10">
            <button onClick={() => navigate("/equipment")} className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition">
              <ArrowLeft size={16} /> Back to Library
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Register <span className="text-blue-400">New Asset</span></h1>
              <p className="mt-4 text-blue-100/70 font-serif text-lg">Introduce your lab infrastructure to the global research network.</p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 -mt-10 pb-32">
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[40px] border border-white/70 bg-white/90 p-20 text-center shadow-2xl backdrop-blur-2xl">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-emerald-50 text-emerald-500">
                <CheckCircle size={56} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">Asset Registered!</h2>
              <p className="text-slate-500 font-medium">Your equipment is now visible in the research library.</p>
              <div className="mt-12 flex justify-center"><RefreshCw size={32} className="animate-spin text-blue-600 opacity-20" /></div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Core Identity */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur-xl space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-800">Core Identity</h2>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5">Basic Asset Information</p>
                  </div>
                </div>

                <div className="grid gap-8">
                  <Field label="Asset Name" required hint="e.g., JEOL JSM-IT800 Ultrahigh Resolution FE-SEM">
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter official equipment name"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                      required
                    />
                  </Field>

                  <Field label="Comprehensive Description" required>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Detail the capabilities, primary uses, and technical advantages..."
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                      required
                    />
                  </Field>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Field label="Resource Category" required>
                      <div className="relative">
                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                        >
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                      </div>
                    </Field>

                    <Field label="Lab Physical Location" hint="e.g., Nano-Science Lab, Hall 4, Room 202">
                      <div className="relative">
                        <input
                          type="text"
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          placeholder="Internal lab coordinates"
                          className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                        />
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                      </div>
                    </Field>
                  </div>
                </div>
              </motion.div>

              {/* Technical Profile */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur-xl space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-800">Technical Profile</h2>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5">SOP & Specifications</p>
                  </div>
                </div>

                <div className="grid gap-8">
                  <Field label="Technical Specifications">
                    <textarea
                      name="specifications"
                      value={form.specifications}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Model numbers, resolution limits, laser types, power requirements..."
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                    />
                  </Field>

                  <Field label="Standard Operating Procedures (SOP)">
                    <textarea
                      name="usageInstructions"
                      value={form.usageInstructions}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Safety protocols, pre-usage checks, calibration steps..."
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                    />
                  </Field>

                  <Field label="Search Keywords" hint="Comma-separated tags (e.g., microscopy, nano-tech, optics)">
                    <div className="relative">
                      <input
                        type="text"
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="Add relevant metadata tags"
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                      />
                      <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                    </div>
                  </Field>
                </div>
              </motion.div>

              {/* Access & Economics */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur-xl space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-800">Access & Economics</h2>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5">Pricing & Constraints</p>
                  </div>
                </div>

                <div className="grid gap-8">
                  <div className="flex items-center gap-4 rounded-[24px] bg-slate-50/50 p-6 border border-slate-100">
                    <input
                      type="checkbox" id="isFree" name="isFree"
                      checked={form.isFree} onChange={handleChange}
                      className="h-6 w-6 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                    />
                    <div>
                      <label htmlFor="isFree" className="text-sm font-bold text-slate-800 cursor-pointer">Open Research Access</label>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">No rental fee required for this asset</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {!form.isFree && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <Field label="Daily Rental Rate (TK)" required hint="Price per 24-hour usage period">
                          <input
                            type="number" name="rentalPricePerDay" value={form.rentalPricePerDay} onChange={handleChange}
                            min="1" placeholder="e.g., 500"
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-black text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                          />
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid gap-6 md:grid-cols-3">
                    <Field label="Operational Status">
                      <select name="status" value={form.status} onChange={handleChange} className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all">
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </Field>
                    <Field label="Physical Condition">
                      <select name="condition" value={form.condition} onChange={handleChange} className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all">
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </Field>
                    <Field label="Max Duration (Days)">
                      <input type="number" name="maxBookingDays" value={form.maxBookingDays} onChange={handleChange} min="1" className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all" />
                    </Field>
                  </div>

                  <div className="flex items-center gap-4 rounded-[24px] bg-slate-50/50 p-6 border border-slate-100">
                    <input
                      type="checkbox" id="requiresTraining" name="requiresTraining"
                      checked={form.requiresTraining} onChange={handleChange}
                      className="h-6 w-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                    />
                    <div className="flex items-center gap-3">
                      <Zap size={18} className="text-indigo-500" />
                      <div>
                        <label htmlFor="requiresTraining" className="text-sm font-bold text-slate-800 cursor-pointer">Supervised Usage Only</label>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">BORROWERS REQUIRE TRAINING OR SUPERVISION</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Operational Calendar */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur-xl space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-800">Operational Calendar</h2>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5">Availability & Blackouts</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Weekly Standard Schedule</h3>
                    <AnimatePresence>
                      {availabilitySchedule.map((s, i) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} key={i} className="flex items-center justify-between rounded-2xl bg-blue-50/50 border border-blue-100 p-4">
                          <span className="text-sm font-bold text-blue-700">{DAY_NAMES[s.dayOfWeek]} @ {s.startTime} — {s.endTime}</span>
                          <button type="button" onClick={() => removeSlot(i)} className="p-2 text-blue-400 hover:text-rose-500 transition"><X size={18} /></button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <div className="grid gap-4 md:grid-cols-4 items-end bg-slate-50/50 p-6 rounded-[24px] border border-slate-100">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Day</label>
                        <select value={newSlot.dayOfWeek} onChange={(e) => setNewSlot((p) => ({ ...p, dayOfWeek: e.target.value }))} className="w-full appearance-none rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-100 focus:outline-none">
                          {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Opening</label>
                        <input type="time" value={newSlot.startTime} onChange={(e) => setNewSlot((p) => ({ ...p, startTime: e.target.value }))} className="w-full rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-100 focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Closing</label>
                        <input type="time" value={newSlot.endTime} onChange={(e) => setNewSlot((p) => ({ ...p, endTime: e.target.value }))} className="w-full rounded-xl border border-white bg-white px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-100 focus:outline-none" />
                      </div>
                      <button type="button" onClick={addSlot} className="h-[42px] flex items-center justify-center gap-2 rounded-xl bg-white text-blue-600 font-bold text-xs border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <Plus size={16} /> Add Hours
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Scheduled Blackouts (Maintenance, etc.)</h3>
                    <AnimatePresence>
                      {blockedDates.map((b, i) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} key={i} className="flex items-center justify-between rounded-2xl bg-amber-50/50 border border-amber-100 p-4">
                          <span className="text-sm font-bold text-amber-700">{b.start} → {b.end}: <span className="opacity-60">{b.reason}</span></span>
                          <button type="button" onClick={() => removeBlock(i)} className="p-2 text-amber-400 hover:text-rose-500 transition"><X size={18} /></button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <div className="grid gap-4 md:grid-cols-4 items-end bg-slate-50/50 p-6 rounded-[24px] border border-slate-100">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
                        <input type="date" value={newBlock.start} onChange={(e) => setNewBlock((p) => ({ ...p, start: e.target.value }))} className="w-full rounded-xl border border-white bg-white px-4 py-3 text-[10px] font-bold focus:ring-2 focus:ring-amber-100 focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">End Date</label>
                        <input type="date" value={newBlock.end} onChange={(e) => setNewBlock((p) => ({ ...p, end: e.target.value }))} className="w-full rounded-xl border border-white bg-white px-4 py-3 text-[10px] font-bold focus:ring-2 focus:ring-amber-100 focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Reason</label>
                        <input type="text" value={newBlock.reason} onChange={(e) => setNewBlock((p) => ({ ...p, reason: e.target.value }))} placeholder="Maintenance" className="w-full rounded-xl border border-white bg-white px-4 py-3 text-[10px] font-bold focus:ring-2 focus:ring-amber-100 focus:outline-none" />
                      </div>
                      <button type="button" onClick={addBlock} className="h-[42px] flex items-center justify-center gap-2 rounded-xl bg-white text-amber-600 font-bold text-xs border border-amber-100 hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                        <Plus size={16} /> Block Range
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="rounded-2xl bg-rose-50 p-6 text-sm font-bold text-rose-600 border border-rose-100 flex items-center gap-3">
                    <AlertTriangle size={20} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button" onClick={() => navigate("/equipment")}
                  className="flex-1 rounded-2xl border border-slate-200 py-5 text-sm font-bold text-slate-400 hover:bg-white transition-all"
                >
                  Discard Draft
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-sm font-bold text-white shadow-xl shadow-blue-900/20 hover:bg-blue-500 disabled:opacity-60 transition-all hover:scale-[1.01]"
                >
                  {submitting ? (
                    <><RefreshCw size={20} className="animate-spin" /> Publishing Resource Registry…</>
                  ) : (
                    <><Plus size={20} /> Publish to Library</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListEquipment;
