import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import SplashCursor from "../components/SplashCursor";
import {
  ArrowLeft, Plus, X, Cpu, AlertTriangle, CheckCircle, Info, Save,
  Zap, MapPin, Layers, Clock, ShieldCheck, Tag, Gift, Calendar, RefreshCw, ChevronDown
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

const EditEquipment = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [availabilitySchedule, setAvailabilitySchedule] = useState([]);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlock, setNewBlock] = useState({ start: "", end: "", reason: "Maintenance" });

  const [loading, setLoading] = useState(true);
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
    if (!currentUser || !token) { navigate("/login"); return; }
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/api/equipment/${id}`, { headers: authHeaders });
        const eq = res.data;
        setForm({
          name: eq.name,
          description: eq.description,
          category: eq.category,
          location: eq.location || "",
          specifications: eq.specifications || "",
          usageInstructions: eq.usageInstructions || "",
          rentalPricePerDay: eq.rentalPricePerDay || "",
          isFree: eq.isFree,
          status: eq.status,
          maxBookingDays: eq.maxBookingDays,
          requiresTraining: eq.requiresTraining,
          condition: eq.condition,
          tags: eq.tags?.join(", ") || "",
        });
        setAvailabilitySchedule(eq.availabilitySchedule || []);
        setBlockedDates((eq.blockedDates || []).map((b) => ({
          start: b.start?.split("T")[0] || "",
          end: b.end?.split("T")[0] || "",
          reason: b.reason || "Maintenance",
        })));
      } catch (err) {
        setError("Could not retrieve asset data for editing.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate, token, currentUser, authHeaders]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const addSlot = () => {
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
      await axios.put(`${API}/api/equipment/${id}`, payload, { headers: authHeaders });
      setSuccess(true);
      setTimeout(() => navigate(`/equipment/manage`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Modification update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8fbff]">
      <Navbar />
      <div className="flex items-center justify-center py-48"><RefreshCw size={48} className="animate-spin text-blue-600 opacity-20" /></div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8fbff] text-slate-900">
      <div className="absolute inset-0 z-[1]"><SplashCursor /></div>
      <div className="absolute inset-0 z-[2] bg-white/35 backdrop-blur-[0.5px]" />

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 pt-32 pb-20 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="mx-auto max-w-4xl px-4 relative z-10">
            <button onClick={() => navigate("/equipment/manage")} className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition">
              <ArrowLeft size={16} /> Exit Editor
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Modify <span className="text-blue-400">Asset Data</span></h1>
              <p className="mt-4 text-blue-100/70 font-serif text-lg truncate max-w-2xl">Editing: {form?.name || "Equipment Resource"}</p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 -mt-10 pb-32">
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[40px] border border-white/70 bg-white/90 p-20 text-center shadow-2xl backdrop-blur-2xl">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-emerald-50 text-emerald-500">
                <CheckCircle size={56} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">Registry Updated!</h2>
              <p className="text-slate-500 font-medium">Modifications have been synchronized with the research network.</p>
              <div className="mt-12 flex justify-center"><RefreshCw size={32} className="animate-spin text-blue-600 opacity-20" /></div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur-xl space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-800">Resource Identity</h2>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5">Edit Basic Identifiers</p>
                  </div>
                </div>

                <div className="grid gap-8">
                  <Field label="Asset Title" required>
                    <input
                      type="text" name="name" value={form.name} onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                      required
                    />
                  </Field>

                  <Field label="Resource Description" required>
                    <textarea
                      name="description" value={form.description} onChange={handleChange} rows={4}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                      required
                    />
                  </Field>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Field label="Category" required>
                      <div className="relative">
                        <select
                          name="category" value={form.category} onChange={handleChange}
                          className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                        >
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                      </div>
                    </Field>

                    <Field label="Lab Location">
                      <div className="relative">
                        <input
                          type="text" name="location" value={form.location} onChange={handleChange}
                          className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                        />
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                      </div>
                    </Field>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Field label="Technical Specs">
                      <textarea name="specifications" value={form.specifications} onChange={handleChange} rows={2} className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all" />
                    </Field>
                    <Field label="Usage SOP">
                      <textarea name="usageInstructions" value={form.usageInstructions} onChange={handleChange} rows={2} className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all" />
                    </Field>
                  </div>

                  <Field label="Metadata Tags" hint="Comma-separated identifiers">
                    <div className="relative">
                      <input
                        type="text" name="tags" value={form.tags} onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-14 pr-6 py-4 font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                      />
                      <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                    </div>
                  </Field>
                </div>
              </motion.div>

              {/* Status & Terms */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur-xl space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-800">Terms & Availability</h2>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5">Configure Pricing & Status</p>
                  </div>
                </div>

                <div className="grid gap-8">
                  <div className="flex items-center gap-4 rounded-[24px] bg-slate-50/50 p-6 border border-slate-100">
                    <input type="checkbox" id="isFree" name="isFree" checked={form.isFree} onChange={handleChange} className="h-6 w-6 rounded-lg text-blue-600 cursor-pointer" />
                    <label htmlFor="isFree" className="text-sm font-bold text-slate-800 cursor-pointer">Open Research Access (Free)</label>
                  </div>

                  {!form.isFree && (
                    <Field label="Daily Rate (TK)" required>
                      <input type="number" name="rentalPricePerDay" value={form.rentalPricePerDay} onChange={handleChange} className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-black text-slate-800 focus:bg-white focus:outline-none transition-all" />
                    </Field>
                  )}

                  <div className="grid gap-6 md:grid-cols-3">
                    <Field label="State">
                      <select name="status" value={form.status} onChange={handleChange} className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-bold text-slate-700">
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </Field>
                    <Field label="Condition">
                      <select name="condition" value={form.condition} onChange={handleChange} className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-bold text-slate-700">
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </Field>
                    <Field label="Max Term">
                      <input type="number" name="maxBookingDays" value={form.maxBookingDays} onChange={handleChange} className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 font-bold text-slate-700" />
                    </Field>
                  </div>

                  <div className="flex items-center gap-4 rounded-[24px] bg-slate-50/50 p-6 border border-slate-100">
                    <input type="checkbox" id="requiresTraining" name="requiresTraining" checked={form.requiresTraining} onChange={handleChange} className="h-6 w-6 rounded-lg text-indigo-600 cursor-pointer" />
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-indigo-500" />
                      <label htmlFor="requiresTraining" className="text-sm font-bold text-slate-800 cursor-pointer">Training/Supervision Required</label>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Operational Sections */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur-xl space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-800">Operational Log</h2>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5">Schedules & Blackouts</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weekly Hours</h3>
                    {availabilitySchedule.map((s, i) => (
                      <div key={i} className="flex items-center justify-between rounded-2xl bg-blue-50 border border-blue-100 p-4">
                        <span className="text-sm font-bold text-blue-700">{DAY_NAMES[s.dayOfWeek]} {s.startTime} — {s.endTime}</span>
                        <button type="button" onClick={() => removeSlot(i)} className="p-2 text-blue-400 hover:text-rose-500 transition"><X size={18} /></button>
                      </div>
                    ))}
                    <div className="grid gap-4 md:grid-cols-4 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <select value={newSlot.dayOfWeek} onChange={(e) => setNewSlot((p) => ({ ...p, dayOfWeek: e.target.value }))} className="rounded-xl border-none bg-white px-4 py-2 text-xs font-bold">
                        {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                      </select>
                      <input type="time" value={newSlot.startTime} onChange={(e) => setNewSlot((p) => ({ ...p, startTime: e.target.value }))} className="rounded-xl border-none bg-white px-4 py-2 text-xs font-bold" />
                      <input type="time" value={newSlot.endTime} onChange={(e) => setNewSlot((p) => ({ ...p, endTime: e.target.value }))} className="rounded-xl border-none bg-white px-4 py-2 text-xs font-bold" />
                      <button type="button" onClick={addSlot} className="bg-white text-blue-600 border border-blue-100 font-bold py-2 rounded-xl text-xs hover:bg-blue-600 hover:text-white transition-all">Add</button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Blackout Periods</h3>
                    {blockedDates.map((b, i) => (
                      <div key={i} className="flex items-center justify-between rounded-2xl bg-amber-50 border border-amber-100 p-4">
                        <span className="text-sm font-bold text-amber-700">{b.start} → {b.end} ({b.reason})</span>
                        <button type="button" onClick={() => removeBlock(i)} className="p-2 text-amber-400 hover:text-rose-500 transition"><X size={18} /></button>
                      </div>
                    ))}
                    <div className="grid gap-4 md:grid-cols-4 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <input type="date" value={newBlock.start} onChange={(e) => setNewBlock((p) => ({ ...p, start: e.target.value }))} className="rounded-xl border-none bg-white px-4 py-2 text-[10px] font-bold" />
                      <input type="date" value={newBlock.end} onChange={(e) => setNewBlock((p) => ({ ...p, end: e.target.value }))} className="rounded-xl border-none bg-white px-4 py-2 text-[10px] font-bold" />
                      <input type="text" value={newBlock.reason} onChange={(e) => setNewBlock((p) => ({ ...p, reason: e.target.value }))} className="rounded-xl border-none bg-white px-4 py-2 text-[10px] font-bold" />
                      <button type="button" onClick={addBlock} className="bg-white text-amber-600 border border-amber-100 font-bold py-2 rounded-xl text-xs hover:bg-amber-600 hover:text-white transition-all">Block</button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Submit Area */}
              <div className="flex gap-4">
                <button type="button" onClick={() => navigate(`/equipment/manage`)} className="flex-1 rounded-2xl border border-slate-200 py-5 text-sm font-bold text-slate-400 hover:bg-white transition-all">Cancel Edits</button>
                <button type="submit" disabled={submitting} className="flex-[2] flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-sm font-bold text-white shadow-xl hover:bg-blue-500 transition-all">
                  {submitting ? <RefreshCw size={20} className="animate-spin" /> : <><Save size={20} /> Update Registry</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditEquipment;
