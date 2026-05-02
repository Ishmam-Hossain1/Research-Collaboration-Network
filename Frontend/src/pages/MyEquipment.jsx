import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Plus, Cpu, CheckCircle, XCircle, Wrench, Clock, Inbox,
  Trash2, Edit, Eye, AlertTriangle, ChevronDown, ChevronUp,
  CheckSquare, XSquare, User, Calendar, History, Gift,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
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
    if (action === "approve") {
      await onApprove(booking._id, ownerNotes);
    } else if (action === "reject") {
      await onReject(booking._id, ownerNotes);
    } else {
      await onComplete(booking._id);
    }
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
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2 font-medium">
            <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(booking.startDate)} – {formatDate(booking.endDate)}</span>
            <span className="flex items-center gap-1"><Cpu size={11} /> {booking.equipment?.name}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition shrink-0"
        >
          {expanded ? "Collapse" : "Details"} {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-slate-100 pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Purpose</p>
            <p className="text-sm text-slate-700 leading-relaxed">{booking.purpose}</p>
          </div>
          {booking.projectName && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Project</p>
              <p className="text-sm text-slate-700">{booking.projectName}</p>
            </div>
          )}
          {booking.requesterNotes && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes from Requester</p>
              <p className="text-sm text-slate-700">{booking.requesterNotes}</p>
            </div>
          )}

          {booking.status === "pending" && (
            <div className="pt-2 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Your Feedback / Notes (optional)</label>
                <textarea
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Please bring your student ID, approved for lab usage..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction("approve")}
                  disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 transition"
                >
                  {actionLoading === "approve" ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Approving…</> : <><CheckSquare size={16} /> Approve Request</>}
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                >
                  {actionLoading === "reject" ? "Rejecting…" : <><XSquare size={16} /> Reject</>}
                </button>
              </div>
            </div>
          )}

          {booking.status === "approved" && (
            <button
              onClick={() => handleAction("complete")}
              disabled={!!actionLoading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition disabled:opacity-50"
            >
              {actionLoading === "complete" ? "Updating…" : <><CheckCircle size={16} /> Mark as Completed</>}
            </button>
          )}

          {booking.ownerNotes && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Response</p>
              <p className="text-sm text-slate-600 leading-relaxed">{booking.ownerNotes}</p>
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

  useEffect(() => {
    if (!currentUser || !token) { navigate("/login"); }
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEq(false);
    }
  }, [token]);

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
  }, [bookingFilter, token]);

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
        <div className={`fixed top-24 right-4 z-[200] rounded-xl px-5 py-3 text-sm font-bold shadow-2xl transition-all animate-in slide-in-from-right-full duration-300 ${toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#102a4c] to-[#0b5c8e] px-6 py-10 text-white pt-28 shadow-xl">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300">Management Dashboard</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">My Equipment & Requests</h1>
              <p className="mt-2 text-sm text-blue-100/70 max-w-lg">Monitor your lab assets, handle incoming rental requests, and track usage history all in one place.</p>
            </div>
            <button
              onClick={() => navigate("/equipment/new")}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-400 transition transform hover:scale-[1.02] active:scale-95"
            >
              <Plus size={18} /> List New Equipment
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Listings", val: myEquipment.length },
              { label: "Available", val: myEquipment.filter((e) => e.status === "available").length },
              { label: "Requests", val: pendingCount, highlight: pendingCount > 0 },
              { label: "Completed", val: bookings.filter(b => b.status === "completed").length },
            ].map(({ label, val, highlight }) => (
              <div key={label} className={`rounded-2xl border ${highlight ? "border-yellow-400/50 bg-yellow-400/10 ring-1 ring-yellow-400/30" : "border-white/10 bg-white/10"} px-5 py-4 backdrop-blur-md`}>
                <p className={`text-2xl font-bold ${highlight ? "text-yellow-400" : "text-white"}`}>{val}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100/60 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[78px] z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            {[
              { id: "equipment", label: "My Listings", icon: <Cpu size={14} /> },
              { id: "requests", label: `Incoming Requests`, icon: <Inbox size={14} /> },
              { id: "history", label: "Rental History", icon: <History size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition-all ${activeView === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                {tab.icon} {tab.label}
                {tab.id === "requests" && pendingCount > 0 && (
                  <span className="ml-1 rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-white ring-2 ring-yellow-500/20">{pendingCount}</span>
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
              <div className="flex items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : myEquipment.length === 0 ? (
              <div className="rounded-2xl bg-white p-20 text-center shadow-sm ring-1 ring-slate-200">
                <Cpu size={56} className="mx-auto mb-5 text-slate-200" />
                <h3 className="text-xl font-bold text-slate-700">No equipment listed</h3>
                <p className="mt-2 text-sm text-slate-400">Your lab resources will appear here once you list them.</p>
                <button
                  onClick={() => navigate("/equipment/new")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition"
                >
                  <Plus size={18} /> Add First Item
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {myEquipment.map((eq) => {
                  const st = EQ_STATUS[eq.status] || EQ_STATUS.available;
                  return (
                    <div key={eq._id} className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{eq.category}</span>
                          <h3 className="font-bold text-slate-800 text-lg truncate group-hover:text-blue-700 transition-colors">{eq.name}</h3>
                        </div>
                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shrink-0 shadow-sm border ${st.cls} border-current/20`}>
                          {st.icon} {st.label}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 line-clamp-2 mb-5 leading-relaxed font-medium">{eq.description}</p>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                            {eq.isFree ? <><Gift size={13} className="text-emerald-500" /> Free</> : <>{eq.rentalPricePerDay} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">tk/day</span></>}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Listed {formatDate(eq.createdAt)}</span>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/equipment/${eq._id}`}
                            className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition"
                            title="View Public Page"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/equipment/edit/${eq._id}`}
                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition"
                            title="Edit Listing"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(eq._id)}
                            className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition"
                            title="Delete Listing"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              {["pending", "approved", "rejected", "cancelled", "all"].map((s) => (
                <button
                  key={s}
                  onClick={() => setBookingFilter(s)}
                  className={`rounded-xl border px-5 py-2.5 text-xs font-bold capitalize transition-all ${bookingFilter === s ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                >
                  {s === "all" ? "All Requests" : STATUS_STYLES[s]?.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {bookings.length} requests</p>
                <button onClick={fetchBookings} className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-200 transition shadow-sm">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {loadingBookings ? (
              <div className="flex items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl bg-white p-16 text-center shadow-sm ring-1 ring-slate-200">
                <Inbox size={48} className="mx-auto mb-4 text-slate-200" />
                <h3 className="text-lg font-bold text-slate-600">No {bookingFilter !== "all" ? bookingFilter : ""} requests found</h3>
                <p className="mt-1 text-sm text-slate-400">Requests from other researchers will appear here.</p>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in duration-500">
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
              <div className="flex items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : (() => {
              const completed = bookings.filter((b) => b.status === "completed");
              return completed.length === 0 ? (
                <div className="rounded-2xl bg-white p-16 text-center shadow-sm ring-1 ring-slate-200">
                  <History size={48} className="mx-auto mb-4 text-slate-200" />
                  <h3 className="text-lg font-bold text-slate-600">No rental history</h3>
                  <p className="mt-1 text-sm text-slate-400">Completed bookings will be archived here for your records.</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-500">
                  {completed.map((b) => (
                    <div key={b._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                              {b.requester?.username?.[0]}
                            </div>
                            <span className="font-bold text-slate-800">{b.requester?.username}</span>
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-bold uppercase tracking-wider border border-blue-100">Completed Rental</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{b.equipment?.name}</span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Calendar size={12}/> {formatDate(b.startDate)} – {formatDate(b.endDate)}</p>
                          {b.rating && (
                            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                              <div className="flex">
                                {[1,2,3,4,5].map((s) => (
                                  <Star key={s} size={11} className={s <= b.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-amber-700">{b.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {b.reviewComment && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border-l-4 border-slate-200">
                          <p className="text-sm text-slate-600 italic leading-relaxed">"{b.reviewComment}"</p>
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Project: {b.projectName || "Standard Research"}</span>
                        <span>•</span>
                        <span>Total Revenue: {b.totalCost || 0} tk</span>
                      </div>
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
          message="Are you sure you want to remove this equipment? All pending/approved bookings will be cancelled."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default MyEquipment;
