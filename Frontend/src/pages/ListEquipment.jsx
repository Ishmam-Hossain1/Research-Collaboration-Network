import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ArrowLeft, Plus, X, Cpu, AlertTriangle, CheckCircle, Info,
} from "lucide-react";

const API = "http://localhost:5000";

const CATEGORIES = [
  "Microscopy", "Spectroscopy", "Chromatography", "Computing",
  "Imaging", "Electronics", "Biology", "Chemistry", "Physics", "Other",
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
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
  const [newBlock, setNewBlock] = useState({ start: "", end: "", reason: "Unavailable" });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("researchConnectToken");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const currentUser = JSON.parse(localStorage.getItem("researchConnectUser") || "null");
  if (!currentUser || !token) { navigate("/login"); }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const addSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) { setError("Slot must have start and end time."); return; }
    if (newSlot.startTime >= newSlot.endTime) { setError("Start time must be before end time."); return; }
    setAvailabilitySchedule((p) => [...p, { ...newSlot, dayOfWeek: parseInt(newSlot.dayOfWeek) }]);
    setNewSlot({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });
    setError("");
  };
  const removeSlot = (i) => setAvailabilitySchedule((p) => p.filter((_, idx) => idx !== i));

  const addBlock = () => {
    if (!newBlock.start || !newBlock.end) { setError("Block date range must have start and end."); return; }
    if (new Date(newBlock.start) >= new Date(newBlock.end)) { setError("Block end date must be after start."); return; }
    setBlockedDates((p) => [...p, { ...newBlock }]);
    setNewBlock({ start: "", end: "", reason: "Unavailable" });
    setError("");
  };
  const removeBlock = (i) => setBlockedDates((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      setError("Name and description are required.");
      return;
    }
    if (!form.isFree && (!form.rentalPricePerDay || Number(form.rentalPricePerDay) < 0)) {
      setError("Please enter a valid rental price.");
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
      setError(err.response?.data?.message || "Failed to list equipment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      <Navbar />

      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <button
            onClick={() => navigate("/equipment")}
            className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={15} /> Back to Equipment
          </button>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Cpu size={22} className="text-blue-600" /> List New Equipment
          </h1>
          <p className="mt-1 text-sm text-slate-500">Share your lab equipment with the research community</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-sm">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
            <h3 className="text-xl font-bold text-emerald-800">Equipment Listed Successfully!</h3>
            <p className="mt-1 text-sm text-emerald-600">Redirecting to your equipment page…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-700 border-b border-slate-100 pb-3">Basic Information</h2>

              <Field label="Equipment Name" required>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Olympus BX53 Fluorescence Microscope"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  required
                />
              </Field>

              <Field label="Description" required>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the equipment, its capabilities, and typical use cases…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category" required>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Location">
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g., Lab 204, Building A"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </Field>
              </div>

              <Field label="Specifications">
                <textarea
                  name="specifications"
                  value={form.specifications}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Technical specifications, model info, resolution, etc…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </Field>

              <Field label="Usage Instructions">
                <textarea
                  name="usageInstructions"
                  value={form.usageInstructions}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any safety requirements or usage notes for borrowers…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </Field>

              <Field label="Tags" hint="Comma-separated keywords to help people find your equipment">
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="fluorescence, confocal, cell imaging…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </Field>
            </div>

            {/* Rental & Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-700 border-b border-slate-100 pb-3">Rental & Status</h2>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFree"
                  name="isFree"
                  checked={form.isFree}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                />
                <label htmlFor="isFree" className="text-sm font-semibold text-slate-700">Free to borrow (no rental fee)</label>
              </div>

              {!form.isFree && (
                <Field label="Rental Price Per Day (USD)" required>
                  <input
                    type="number"
                    name="rentalPricePerDay"
                    value={form.rentalPricePerDay}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </Field>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Status">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </Field>

                <Field label="Condition">
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </Field>

                <Field label="Max Booking (days)">
                  <input
                    type="number"
                    name="maxBookingDays"
                    value={form.maxBookingDays}
                    onChange={handleChange}
                    min="1"
                    max="365"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </Field>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requiresTraining"
                  name="requiresTraining"
                  checked={form.requiresTraining}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                />
                <label htmlFor="requiresTraining" className="text-sm font-semibold text-slate-700">Training required before use</label>
              </div>
            </div>

            {/* Availability Schedule */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-700 border-b border-slate-100 pb-3 mb-5">Weekly Availability Schedule</h2>
              <p className="text-xs text-slate-400 mb-4 flex items-center gap-1"><Info size={12} /> Define which days and times the equipment is generally available for bookings.</p>

              {availabilitySchedule.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {availabilitySchedule.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5">
                      <span className="text-xs font-semibold text-blue-700">{DAY_NAMES[s.dayOfWeek]} {s.startTime}–{s.endTime}</span>
                      <button type="button" onClick={() => removeSlot(i)} className="text-blue-400 hover:text-red-500 transition">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Day</label>
                  <select
                    value={newSlot.dayOfWeek}
                    onChange={(e) => setNewSlot((p) => ({ ...p, dayOfWeek: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
                  >
                    {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">From</label>
                  <input type="time" value={newSlot.startTime} onChange={(e) => setNewSlot((p) => ({ ...p, startTime: e.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">To</label>
                  <input type="time" value={newSlot.endTime} onChange={(e) => setNewSlot((p) => ({ ...p, endTime: e.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <button type="button" onClick={addSlot} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition">
                  <Plus size={13} /> Add Slot
                </button>
              </div>
            </div>

            {/* Blocked dates */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-700 border-b border-slate-100 pb-3 mb-5">Blocked Dates (optional)</h2>
              <p className="text-xs text-slate-400 mb-4 flex items-center gap-1"><Info size={12} /> Block specific date ranges for maintenance, personal use, or conferences.</p>

              {blockedDates.length > 0 && (
                <div className="mb-4 space-y-2">
                  {blockedDates.map((b, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                      <span className="text-xs font-semibold text-amber-700">{b.start} → {b.end}: {b.reason}</span>
                      <button type="button" onClick={() => removeBlock(i)} className="text-amber-400 hover:text-red-500 transition"><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Start</label>
                  <input type="date" value={newBlock.start} onChange={(e) => setNewBlock((p) => ({ ...p, start: e.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">End</label>
                  <input type="date" value={newBlock.end} onChange={(e) => setNewBlock((p) => ({ ...p, end: e.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Reason</label>
                  <input type="text" value={newBlock.reason} onChange={(e) => setNewBlock((p) => ({ ...p, reason: e.target.value }))} placeholder="Maintenance" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none" />
                </div>
                <button type="button" onClick={addBlock} className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
                  <Plus size={13} /> Block Dates
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pb-8">
              <button
                type="button"
                onClick={() => navigate("/equipment")}
                className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {submitting ? (
                  <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Listing…</>
                ) : (
                  <><Plus size={16} /> List Equipment</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ListEquipment;
