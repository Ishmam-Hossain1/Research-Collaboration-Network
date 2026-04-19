import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Plus, Cpu, CheckCircle, XCircle, Wrench, Clock, Inbox,
  Trash2, Edit, Eye, AlertTriangle, ChevronDown, ChevronUp,
  CheckSquare, XSquare, User, Calendar, History, Gift, DollarSign,
  Star, RefreshCw,
} from "lucide-react";

const API = "http://localhost:5000";

const STATUS_STYLES = {
  pending: { cls: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Pending" },
  approved: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Approved" },
  rejected: { cls: "bg-red-100 text-red-700 border-red-200", label: "Rejected" },
  cancelled: { cls: "bg-slate-100 text-slate-600 border-slate-200", label: "Cancelled" },
  completed: { cls: "bg-blue-100 text-blue-700 border-blue-200", label: "Completed" },
};

const EQ_STATUS = {
  available: { cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle size={12} />, label: "Available" },
  unavailable: { cls: "bg-red-100 text-red-700", icon: <XCircle size={12} />, label: "Unavailable" },
  maintenance: { cls: "bg-amber-100 text-amber-700", icon: <Wrench size={12} />, label: "Maintenance" },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl text-center">
        <AlertTriangle size={36} className="mx-auto mb-3 text-red-400" />
        <p className="text-slate-700 font-medium mb-5">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} disabled={loading} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-50">
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
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
    await action === "approve" ? onApprove(booking._id, ownerNotes)
      : action === "reject" ? onReject(booking._id, ownerNotes)
      : onComplete(booking._id);
    setActionLoading(null);
  };

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${booking.status === "pending" ? "border-yellow-200 ring-1 ring-yellow-100" : "border-slate-200"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-slate-800">{booking.requester?.username}</span>
            <span className={`text-xs font-semibold rounded-full border px-2.5 py-0.5 ${st.cls}`}>{st.label}</span>
          </div>
          <p className="text-xs text-slate-400 mb-1">{booking.requester?.email}</p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(booking.startDate)} – {formatDate(booking.endDate)}</span>
            <span className="flex items-center gap-1"><Cpu size={11} /> {booking.equipment?.name}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition shrink-0"
        >
          Details {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Purpose</p>
            <p className="text-sm text-slate-700">{booking.purpose}</p>
          </div>
          {booking.projectName && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Project</p>
              <p className="text-sm text-slate-700">{booking.projectName}</p>
            </div>
          )}
          {booking.requesterNotes && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes from Requester</p>
              <p className="text-sm text-slate-700">{booking.requesterNotes}</p>
            </div>
          )}

          {booking.status === "pending" && (
            <div className="pt-2 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Your Notes (optional)</label>
                <textarea
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  rows={2}
                  placeholder="Reason for approval/rejection…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction("approve")}
                  disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
                >
                  {actionLoading === "approve" ? <><div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Approving…</> : <><CheckSquare size={15} /> Approve</>}
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                >
                  {actionLoading === "reject" ? "Rejecting…" : <><XSquare size={15} /> Reject</>}
                </button>
              </div>
            </div>
          )}

          {booking.status === "approved" && (
            <button
              onClick={() => handleAction("complete")}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
            >
              {actionLoading === "complete" ? "Marking…" : <><CheckCircle size={14} /> Mark as Completed</>}
            </button>
          )}

          {booking.ownerNotes && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold text-slate-400 mb-0.5">Your Notes</p>
              <p className="text-sm text-slate-600">{booking.ownerNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const MyEquipment = () => {
  const navigate = useNavigate();
  const [myEquipment, setMyEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingEq, setLoadingEq] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeView, setActiveView] = useState("equipment"); // equipment | requests | history
  const [bookingFilter, setBookingFilter] = useState("pending");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("researchConnectToken");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const currentUser = JSON.parse(localStorage.getItem("researchConnectUser") || "null");
  if (!currentUser || !token) { navigate("/login"); }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMyEquipment = useCallback(async () => {
    setLoadingEq(true);
    try {
      const res = await axios.get(`${API}/api/equipment/mine`, { headers: authHeaders });
      setMyEquipment(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEq(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const params = {};
      if (bookingFilter !== "all") params.status = bookingFilter;
      const res = await axios.get(`${API}/api/equipment/bookings/dashboard`, { headers: authHeaders, params });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  }, [bookingFilter]);

  useEffect(() => { fetchMyEquipment(); }, [fetchMyEquipment]);
  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleApprove = async (bookingId, ownerNotes) => {
    try {
      await axios.put(`${API}/api/equipment/bookings/${bookingId}/approve`, { ownerNotes }, { headers: authHeaders });
      showToast("Booking approved!");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to approve.", "error");
    }
  };

  const handleReject = async (bookingId, ownerNotes) => {
    try {
      await axios.put(`${API}/api/equipment/bookings/${bookingId}/reject`, { ownerNotes }, { headers: authHeaders });
      showToast("Booking rejected.");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reject.", "error");
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      await axios.put(`${API}/api/equipment/bookings/${bookingId}/complete`, {}, { headers: authHeaders });
      showToast("Marked as completed!");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to complete.", "error");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/equipment/${deleteTarget}`, { headers: authHeaders });
      setMyEquipment((prev) => prev.filter((e) => e._id !== deleteTarget));
      showToast("Equipment deleted.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition ${toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#102a4c] to-[#0b5c8e] px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-200">Equipment Management</span>
              <h1 className="mt-1 text-3xl font-bold">My Lab Equipment</h1>
              <p className="mt-1 text-sm text-blue-100/80">Manage your listed equipment and incoming booking requests</p>
            </div>
            <button
              onClick={() => navigate("/equipment/new")}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-400 transition"
            >
              <Plus size={16} /> List New Equipment
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Equipment", val: myEquipment.length },
              { label: "Available", val: myEquipment.filter((e) => e.status === "available").length },
              { label: "Pending Requests", val: pendingCount },
              { label: "Total Bookings", val: bookings.length },
            ].map(({ label, val }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
                <p className="text-xl font-bold">{val}</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-blue-100/70 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex">
            {[
              { id: "equipment", label: "My Equipment", icon: <Cpu size={14} /> },
              { id: "requests", label: `Booking Requests${pendingCount > 0 ? ` (${pendingCount})` : ""}`, icon: <Inbox size={14} /> },
              { id: "history", label: "Usage History", icon: <History size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 px-5 py-3.5 text-sm font-semibold transition ${activeView === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                {tab.icon} {tab.label}
                {tab.id === "requests" && pendingCount > 0 && (
                  <span className="ml-1 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Equipment list */}
        {activeView === "equipment" && (
          <>
            {loadingEq ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : myEquipment.length === 0 ? (
              <div className="rounded-2xl bg-white p-16 text-center shadow-sm ring-1 ring-slate-100">
                <Cpu size={48} className="mx-auto mb-4 text-slate-200" />
                <h3 className="text-lg font-semibold text-slate-600">No equipment listed yet</h3>
                <p className="mt-1 text-sm text-slate-400">Start sharing your lab resources with the community.</p>
                <button
                  onClick={() => navigate("/equipment/new")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                >
                  <Plus size={15} /> List Equipment
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myEquipment.map((eq) => {
                  const st = EQ_STATUS[eq.status] || EQ_STATUS.available;
                  return (
                    <div key={eq._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">{eq.category}</span>
                          <h3 className="font-bold text-slate-800 truncate">{eq.name}</h3>
                        </div>
                        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${st.cls}`}>
                          {st.icon} {st.label}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{eq.description}</p>

                      <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                        <span className="flex items-center gap-1">
                          {eq.isFree ? <><Gift size={11} className="text-emerald-500" /> Free</> : <><DollarSign size={11} />${eq.rentalPricePerDay}/day</>}
                        </span>
                        <span>Max {eq.maxBookingDays} days</span>
                        <span>{new Date(eq.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/equipment/${eq._id}`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                          <Eye size={13} /> View
                        </Link>
                        <Link
                          to={`/equipment/${eq._id}/edit`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                        >
                          <Edit size={13} /> Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(eq._id)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Booking requests */}
        {activeView === "requests" && (
          <>
            <div className="mb-5 flex flex-wrap gap-2">
              {["pending", "approved", "rejected", "cancelled", "all"].map((s) => (
                <button
                  key={s}
                  onClick={() => setBookingFilter(s)}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold capitalize transition ${bookingFilter === s ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {s === "all" ? "All" : STATUS_STYLES[s]?.label}
                </button>
              ))}
              <button onClick={fetchBookings} className="ml-auto flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {loadingBookings ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
                <Inbox size={40} className="mx-auto mb-3 text-slate-200" />
                <p className="text-slate-500 font-medium">No {bookingFilter !== "all" ? bookingFilter : ""} requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <BookingRequestCard
                    key={b._id}
                    booking={b}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Usage history */}
        {activeView === "history" && (
          <>
            {loadingBookings ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : (() => {
              const completed = bookings.filter((b) => b.status === "completed");
              return completed.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
                  <History size={40} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-slate-500 font-medium">No completed bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completed.map((b) => (
                    <div key={b._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <User size={13} className="text-slate-400" />
                            <span className="font-semibold text-slate-800">{b.requester?.username}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Completed</span>
                          </div>
                          <span className="text-xs text-slate-400">{b.equipment?.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">{formatDate(b.startDate)} – {formatDate(b.endDate)}</p>
                          {b.rating && (
                            <div className="flex items-center gap-1 mt-1 justify-end">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} size={12} className={s <= b.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                              ))}
                              <span className="text-xs text-slate-500 ml-1">{b.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {b.reviewComment && <p className="mt-2 text-sm text-slate-600 italic">"{b.reviewComment}"</p>}
                      {b.purpose && <p className="mt-2 text-xs text-slate-400">Purpose: {b.purpose}</p>}
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <ConfirmModal
          message="Are you sure you want to delete this equipment? All pending/approved bookings will be cancelled."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default MyEquipment;
