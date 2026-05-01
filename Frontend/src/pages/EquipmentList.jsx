import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Search, Filter, Cpu, Clock, CheckCircle, XCircle,
  Wrench, Star, Gift, AlertTriangle, ChevronLeft, ChevronRight,
  Plus, MapPin, Tag, Zap,
} from "lucide-react";

const API = "http://localhost:5000";

const CATEGORIES = [
  "All", "Microscopy", "Spectroscopy", "Chromatography", "Computing",
  "Imaging", "Electronics", "Biology", "Chemistry", "Physics", "Other",
];

const STATUS_STYLES = {
  available: { label: "Available", icon: <CheckCircle size={12} />, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  unavailable: { label: "Unavailable", icon: <XCircle size={12} />, cls: "bg-red-100 text-red-700 border-red-200" },
  maintenance: { label: "Maintenance", icon: <Wrench size={12} />, cls: "bg-amber-100 text-amber-700 border-amber-200" },
};

const CONDITION_STYLES = {
  excellent: "bg-emerald-50 text-emerald-600",
  good: "bg-blue-50 text-blue-600",
  fair: "bg-amber-50 text-amber-600",
  poor: "bg-red-50 text-red-600",
};

function EquipmentCard({ eq, currentUserId }) {
  const st = STATUS_STYLES[eq.status] || STATUS_STYLES.available;
  const condCls = CONDITION_STYLES[eq.condition] || CONDITION_STYLES.good;

  return (
    <Link to={`/equipment/${eq._id}`} className="group block">
      <div className="relative h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-blue-500">
              {eq.category}
            </span>
            <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
              {eq.name}
            </h3>
          </div>
          <span className={`shrink-0 flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
            {st.icon} {st.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{eq.description}</p>

        {/* Location */}
        {eq.location && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-400 font-medium">
            <MapPin size={12} /> {eq.location}
          </div>
        )}

        {/* Tags */}
        {eq.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {eq.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${condCls}`}>
              {eq.condition}
            </span>
            {eq.requiresTraining && (
              <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600 border border-purple-100">
                <Zap size={10} /> Training
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm font-bold">
            {eq.isFree ? (
              <span className="flex items-center gap-1 text-emerald-600"><Gift size={14} /> Free</span>
            ) : (
              <span className="flex items-center gap-1 text-slate-700">
                {eq.rentalPricePerDay} <span className="text-[10px] font-medium text-slate-400">tk/day</span>
              </span>
            )}
          </div>
        </div>

        {/* Owner */}
        <p className="mt-3 text-[10px] font-medium uppercase tracking-widest text-slate-400">
          By <span className="text-slate-600 font-bold">{eq.owner?.username || "Unknown"}</span>
          {eq.owner?._id === currentUserId && (
            <span className="ml-1 text-blue-500 font-bold">(you)</span>
          )}
        </p>
      </div>
    </Link>
  );
}

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

  const currentUser = JSON.parse(localStorage.getItem("researchConnectUser") || "null");
  const currentUserId = currentUser?._id || currentUser?.id;
  const token = localStorage.getItem("researchConnectToken");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

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
      setEquipment(res.data.equipment);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load equipment.");
    } finally {
      setLoading(false);
    }
  }, [search, category, statusFilter, freeOnly, page, token]);

  useEffect(() => {
    setPage(1);
  }, [search, category, statusFilter, freeOnly]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#102a4c] to-[#0b5c8e] px-6 py-12 text-white shadow-xl pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-blue-200 backdrop-blur mb-4">
                Lab Equipment Rental
              </span>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Access World-Class <span className="text-blue-400">Equipment</span>
              </h1>
              <p className="mt-3 max-w-xl text-blue-100/80 text-sm leading-7">
                Browse and book scientific lab equipment from researchers across the network. List your own equipment to collaborate and share resources.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total", val: total },
                  { label: "Available", val: equipment.filter(e => e.status === "available").length },
                  { label: "Free", val: equipment.filter(e => e.isFree).length },
                ].map(({ label, val }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur-sm min-w-[90px]">
                    <p className="text-2xl font-bold">{val}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-blue-100/80 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            {currentUser && (
              <button
                onClick={() => navigate("/equipment/new")}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-400 transition"
              >
                <Plus size={16} /> List Your Equipment
              </button>
            )}
            {currentUser && (
              <button
                onClick={() => navigate("/equipment/manage")}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition backdrop-blur"
              >
                <Cpu size={16} /> My Listings
              </button>
            )}
            {currentUser && (
              <button
                onClick={() => navigate("/equipment/my-bookings")}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition backdrop-blur"
              >
                <Clock size={16} /> My Bookings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[78px] z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 ring-1 ring-slate-200 focus-within:ring-blue-300 focus-within:bg-white transition">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search equipment by name, tags, location…"
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="maintenance">Maintenance</option>
            </select>

            {/* Free only toggle */}
            <button
              onClick={() => setFreeOnly((p) => !p)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${freeOnly ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              <Gift size={15} /> Free Only
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-8 text-center text-red-600 ring-1 ring-red-200">
            <AlertTriangle size={32} className="mx-auto mb-3" />
            <p className="font-medium">{error}</p>
          </div>
        ) : equipment.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm ring-1 ring-slate-100">
            <Cpu size={48} className="mx-auto mb-4 text-slate-200" />
            <h3 className="text-lg font-semibold text-slate-600">No equipment found</h3>
            <p className="mt-1 text-sm text-slate-400">
              {search || category !== "All" || statusFilter !== "all" || freeOnly
                ? "Try adjusting your filters"
                : currentUser ? "Be the first to list your lab equipment!" : "No equipment listed yet."}
            </p>
            {currentUser && !search && (
              <button
                onClick={() => navigate("/equipment/new")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                <Plus size={15} /> List Equipment
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-800 font-bold">{equipment.length}</span> of{" "}
              <span className="text-slate-800 font-bold">{total}</span> items found
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {equipment.map((eq) => (
                <EquipmentCard key={eq._id} eq={eq} currentUserId={currentUserId} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                <span className="text-sm font-bold text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EquipmentList;
