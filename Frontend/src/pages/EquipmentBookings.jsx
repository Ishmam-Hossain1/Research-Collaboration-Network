import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Clock, CheckCircle, XCircle, Inbox, Calendar, Cpu,
  AlertTriangle, Star, X, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";

const API = "http://localhost:5000";

const STATUS_INFO = {
  pending: { cls: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Pending Review", icon: <Clock size={12} /> },
  approved: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Approved", icon: <CheckCircle size={12} /> },
  rejected: { cls: "bg-red-100 text-red-700 border-red-200", label: "Rejected", icon: <XCircle size={12} /> },
  cancelled: { cls: "bg-slate-100 text-slate-600 border-slate-200", label: "Cancelled", icon: <X size={12} /> },
  completed: { cls: "bg-blue-100 text-blue-700 border-blue-200", label: "Completed", icon: <CheckCircle size={12} /> },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition"
        >
          <Star
            size={22}
            className={(hovered || value) >= s ? "fill-amber-400 text-amber-400" : "text-slate-300"}
          />
        </button>
      ))}
    </div>
  );
}

function BookingCard({ booking, onCancel, onRate }) {
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

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${booking.status === "pending" ? "border-yellow-200" : "border-slate-200"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>
              {st.icon} {st.label}
            </span>
          </div>
          <Link to={`/equipment/${eq?._id}`} className="hover:text-blue-700 font-bold text-slate-800 transition">
            {eq?.name || "Equipment"}
          </Link>
          <p className="text-xs text-slate-400 mt-0.5">{eq?.category} · {eq?.location}</p>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <Calendar size={11} /> {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
          </p>
        </div>

        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700 transition shrink-0"
        >
          Details {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Purpose</p>
              <p className="text-sm text-slate-700">{booking.purpose}</p>
            </div>
            {booking.projectName && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Project</p>
                <p className="text-sm text-slate-700">{booking.projectName}</p>
              </div>
            )}
          </div>

          {booking.ownerNotes && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold text-slate-400 mb-0.5">Owner's Response</p>
              <p className="text-sm text-slate-600">{booking.ownerNotes}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Cpu size={11} /> Owned by {eq?.owner?.username}
          </div>

          {/* Cancel button */}
          {["pending", "approved"].includes(booking.status) && (
            <>
              {!showCancelForm ? (
                <button
                  onClick={() => setShowCancelForm(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  <X size={13} /> Cancel Request
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows={2}
                    placeholder="Reason for cancellation (optional)…"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleCancel} disabled={actionLoading} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50 transition">
                      {actionLoading ? "Cancelling…" : "Confirm Cancel"}
                    </button>
                    <button onClick={() => setShowCancelForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">Back</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Rate after completion */}
          {booking.status === "completed" && !booking.rating && (
            <>
              {!rateMode ? (
                <button onClick={() => setRateMode(true)} className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition">
                  <Star size={13} /> Rate This Equipment
                </button>
              ) : (
                <div className="space-y-3">
                  <StarPicker value={rating} onChange={setRating} />
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={2}
                    placeholder="Share your experience (optional)…"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200 transition"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleRate} disabled={!rating || actionLoading} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50 transition">
                      {actionLoading ? "Submitting…" : "Submit Review"}
                    </button>
                    <button onClick={() => setRateMode(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}

          {booking.status === "completed" && booking.rating && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              Rated:
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={13} className={s <= booking.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
              ))}
              <span>{booking.rating}/5</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const EquipmentBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("researchConnectToken");
  const authHeaders = { Authorization: `Bearer ${token}` };
  const currentUser = JSON.parse(localStorage.getItem("researchConnectUser") || "null");

  useEffect(() => {
    if (!currentUser || !token) { navigate("/login"); }
  }, [currentUser, token, navigate]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const res = await axios.get(`${API}/api/equipment/bookings/mine`, { headers: authHeaders, params });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (bookingId, cancellationReason) => {
    try {
      await axios.put(`${API}/api/equipment/bookings/${bookingId}/cancel`, { cancellationReason }, { headers: authHeaders });
      showToast("Booking cancelled.");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel.", "error");
    }
  };

  const handleRate = async (bookingId, rating, reviewComment) => {
    try {
      await axios.put(`${API}/api/equipment/bookings/${bookingId}/rate`, { rating, reviewComment }, { headers: authHeaders });
      showToast("Review submitted! Thank you.");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit review.", "error");
    }
  };

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      <Navbar />

      {toast && (
        <div className={`fixed top-24 right-4 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg ${toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#102a4c] to-[#0b5c8e] px-6 py-10 text-white pt-24">
        <div className="mx-auto max-w-4xl">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-200">Equipment Rentals</span>
          <h1 className="mt-1 text-3xl font-bold">My Booking Requests</h1>
          <p className="mt-1 text-sm text-blue-100/80">Track your equipment booking requests and manage their status</p>

          <div className="mt-5 flex gap-3 flex-wrap">
            {["pending", "approved", "completed", "rejected"].map((s) => (
              <div key={s} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-center backdrop-blur-sm min-w-[80px]">
                <p className="text-lg font-bold">{counts[s] || 0}</p>
                <p className="text-[10px] font-medium capitalize text-blue-100/70 mt-0.5">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            {["all", "pending", "approved", "completed", "rejected", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold capitalize transition ${statusFilter === s ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {s === "all" ? "All" : STATUS_INFO[s]?.label || s}
                {s !== "all" && counts[s] ? ` (${counts[s]})` : ""}
              </button>
            ))}
            <button onClick={fetchBookings} className="ml-auto flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm ring-1 ring-slate-100">
            <Inbox size={48} className="mx-auto mb-4 text-slate-200" />
            <h3 className="text-lg font-semibold text-slate-600">No bookings found</h3>
            <p className="mt-1 text-sm text-slate-400">
              {statusFilter !== "all" ? `No ${STATUS_INFO[statusFilter]?.label?.toLowerCase()} bookings` : "You haven't requested any equipment yet."}
            </p>
            <button
              onClick={() => navigate("/equipment")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
            >
              Browse Equipment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <BookingCard key={b._id} booking={b} onCancel={handleCancel} onRate={handleRate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentBookings;
