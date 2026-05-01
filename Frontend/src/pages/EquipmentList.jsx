import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FlaskConical, Search, Filter, Calendar, Clock, MapPin,
  DollarSign, Star, ChevronDown, X, CheckCircle, AlertCircle,
  Loader2, Beaker, Cpu, Microscope, Zap, Package
} from "lucide-react";

const API = "http://localhost:5000/api";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CATEGORY_ICONS = {
  "Microscopy": Microscope,
  "Spectroscopy": Zap,
  "Chromatography": Beaker,
  "Thermal Analysis": Zap,
  "Imaging & Scanning": FlaskConical,
  "Computing & Data": Cpu,
  "Molecular Biology": FlaskConical,
  "Chemistry": Beaker,
  "Physics": Zap,
  "Other": Package,
};

const CATEGORIES = [
  "All", "Microscopy", "Spectroscopy", "Chromatography",
  "Thermal Analysis", "Imaging & Scanning", "Computing & Data",
  "Molecular Biology", "Chemistry", "Physics", "Other"
];

const CONDITION_COLORS = {
  Excellent: "bg-emerald-100 text-emerald-700",
  Good: "bg-blue-100 text-blue-700",
  Fair: "bg-amber-100 text-amber-700",
};

const PRICE_COLORS = {
  1: "bg-green-100 text-green-700",
  2: "bg-lime-100 text-lime-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-red-100 text-red-700",
};

function PriceBar({ price }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`h-1.5 w-4 rounded-full transition-all ${n <= price ? "bg-blue-500" : "bg-slate-200"}`}
        />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-blue-700">{price} tk/day</span>
    </div>
  );
}

function BookingModal({ equipment, onClose, onBooked }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("researchConnectUser"));
  const token = localStorage.getItem("researchConnectToken");

  const totalDays = (() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  })();

  const totalCost = parseFloat((totalDays * equipment.pricePerDay).toFixed(2));

  const today = new Date().toISOString().split("T")[0];

  const availableDays = equipment.availabilitySchedule
    ?.filter((s) => s.isAvailable)
    .map((s) => s.dayOfWeek) || [];

  const checkAvailability = (start, end) => {
    if (!start || !end) return { valid: true };
    let curr = new Date(start);
    const stop = new Date(end);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    while (curr <= stop) {
      const dayName = dayNames[curr.getDay()];
      if (!availableDays.includes(dayName)) {
        return { valid: false, day: dayName };
      }
      curr.setDate(curr.getDate() + 1);
    }
    return { valid: true };
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    
    if (totalDays < 1) return setError("Booking must be at least 1 day.");

    const availability = checkAvailability(startDate, endDate);
    if (!availability.valid) {
      return setError(`Equipment is not available on ${availability.day}s. Please check the schedule.`);
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/equipment/bookings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          equipmentId: equipment._id,
          startDate,
          endDate,
          totalDays,
          purpose,
          // Compatibility for stale backend processes
          bookingDate: startDate,
          startTime: "09:00",
          endTime: "17:00",
          totalHours: totalDays * 8,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");
      onBooked(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">Book Equipment</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{equipment.name}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {equipment.category} &bull; {equipment.pricePerDay} tk/day
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {availableDays.map(d => (
                <span key={d} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-100">
                  {d.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Research Purpose (Optional)</label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Mention how you will use the equipment..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Cost summary */}
          {totalDays > 0 && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <div className="flex justify-between text-sm text-slate-700">
                <span>Duration</span>
                <span className="font-semibold">{totalDays} day{totalDays !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-700 mt-1">
                <span>Rate</span>
                <span className="font-semibold">{equipment.pricePerDay} tk/day</span>
              </div>
              <div className="mt-2 border-t border-blue-200 pt-2 flex justify-between font-bold text-blue-800">
                <span>Total Payment</span>
                <span>{totalCost} tk</span>
              </div>
              <p className="mt-1.5 text-xs text-blue-600 flex items-center gap-1">
                <CheckCircle size={12} /> Payment will be processed immediately on booking
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || totalDays < 1}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? "Processing..." : `Pay ${totalCost > 0 ? totalCost + " tk & " : ""}Book`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EquipmentCard({ item, currentUserId, onBook }) {
  const Icon = CATEGORY_ICONS[item.category] || Package;
  const availableDays = item.availabilitySchedule
    ?.filter((s) => s.isAvailable)
    .map((s) => s.dayOfWeek.slice(0, 3))
    .join(", ");

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Color band */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

      <div className="flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">{item.name}</h3>
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {item.category}
            </span>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600 leading-6 line-clamp-3">{item.description}</p>

        {/* Meta */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Star size={12} className="shrink-0" />
            <span className={`rounded-full px-2 py-0.5 font-medium text-xs ${CONDITION_COLORS[item.condition]}`}>
              {item.condition}
            </span>
          </div>
          {item.location && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {availableDays && (
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <Calendar size={12} className="mt-0.5 shrink-0" />
              <span className="leading-5">{availableDays}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DollarSign size={12} className="shrink-0 text-slate-400" />
            <PriceBar price={item.pricePerDay} />
          </div>
        </div>

        {/* Owner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {item.owner?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{item.owner?.username}</p>
              <p className="text-xs text-slate-400 truncate">{item.owner?.email}</p>
            </div>
          </div>

          {currentUserId && item.owner?._id !== currentUserId ? (
            <button
              onClick={() => onBook(item)}
              className="ml-3 shrink-0 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
            >
              Book
            </button>
          ) : currentUserId === item.owner?._id ? (
            <span className="ml-3 shrink-0 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
              Your listing
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function EquipmentList() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("researchConnectUser"));
  const token = localStorage.getItem("researchConnectToken");

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category !== "All") params.set("category", category);
      const res = await fetch(`${API}/equipment?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEquipment(data);
    } catch (err) {
      setError(err.message || "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  async function fetchMyBookings() {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API}/equipment/bookings/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMyBookings(data);
    } catch { }
    setBookingsLoading(false);
  }

  function handleBook(item) {
    if (!token) return navigate("/login");
    setSelectedEquipment(item);
  }

  function handleBooked(booking) {
    setSelectedEquipment(null);
    setSuccessMsg(`✅ Booked "${booking.equipment?.name || "equipment"}" — ${booking.totalCost} tk paid!`);
    setTimeout(() => setSuccessMsg(""), 5000);
  }

  const STATUS_STYLE = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <Navbar />
      <div className="pt-[78px]">
        {/* Hero banner */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-4 py-14 sm:px-8 md:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Research Connect</p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-white sm:text-5xl">Lab Equipment Rental</h1>
            <p className="mt-3 max-w-xl text-slate-300 text-base leading-7">
              Discover and rent advanced research equipment from fellow researchers. Pay securely in tk per day.
            </p>

            {/* Search */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search equipment, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:bg-white/15 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 backdrop-blur"
                />
              </div>
              {user && (
                <button
                  onClick={() => { setShowBookings((v) => !v); if (!showBookings) fetchMyBookings(); }}
                  className="rounded-xl bg-white/10 border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition backdrop-blur"
                >
                  {showBookings ? "Hide" : "My Bookings"}
                </button>
              )}
              <button
                onClick={() => navigate("/equipment/manage")}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/30"
              >
                + List Equipment
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 md:px-12">
          {/* Success message */}
          {successMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-medium text-emerald-800">
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          {/* My Bookings panel */}
          {showBookings && (
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">My Booking Requests</h2>
                <button onClick={() => setShowBookings(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              {bookingsLoading ? (
                <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-blue-500" /></div>
              ) : myBookings.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">No bookings yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myBookings.map((b) => (
                    <div key={b._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{b.equipment?.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {b.startDate} to {b.endDate} &bull; {b.totalCost} tk paid
                        </p>
                        {b.ownerNote && <p className="mt-1 text-xs text-slate-500 italic">Owner: "{b.ownerNote}"</p>}
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${STATUS_STYLE[b.status]}`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Category filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition border ${
                  category === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!loading && (
            <p className="mb-5 text-sm text-slate-500">
              {equipment.length} equipment{equipment.length !== 1 ? " items" : ""} found
              {category !== "All" ? ` in "${category}"` : ""}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-8 text-center text-red-700">
              <AlertCircle size={24} className="mx-auto mb-2" />
              {error}
            </div>
          ) : equipment.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
              <FlaskConical size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">No equipment found</p>
              <p className="mt-1 text-sm text-slate-400">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {equipment.map((item) => (
                <EquipmentCard
                  key={item._id}
                  item={item}
                  currentUserId={user?._id || user?.id}
                  onBook={handleBook}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedEquipment && (
        <BookingModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onBooked={handleBooked}
        />
      )}
    </div>
  );
}
