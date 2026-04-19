import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ArrowLeft, MapPin, CheckCircle, XCircle, Wrench, Gift, DollarSign,
  Zap, Calendar, Clock, User, Star, Send, AlertTriangle, ChevronLeft, ChevronRight,
  Info, Tag, BookOpen,
} from "lucide-react";

const API = "http://localhost:5000";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_STYLES = {
  available: { label: "Available", icon: <CheckCircle size={14} />, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  unavailable: { label: "Unavailable", icon: <XCircle size={14} />, cls: "bg-red-100 text-red-700 border-red-200" },
  maintenance: { label: "Maintenance", icon: <Wrench size={14} />, cls: "bg-amber-100 text-amber-700 border-amber-200" },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Simple mini-calendar showing approved bookings
function AvailabilityCalendar({ approvedDates, blockedDates }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const isBooked = (date) => {
    const d = new Date(date);
    return approvedDates.some(
      (b) => d >= new Date(b.startDate) && d <= new Date(b.endDate)
    );
  };
  const isBlocked = (date) => {
    const d = new Date(date);
    return blockedDates.some(
      (b) => d >= new Date(b.start) && d <= new Date(b.end)
    );
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Calendar size={15} /> Availability</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-lg p-1.5 hover:bg-slate-100 transition"><ChevronLeft size={15} /></button>
          <span className="text-sm font-semibold text-slate-700">{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} className="rounded-lg p-1.5 hover:bg-slate-100 transition"><ChevronRight size={15} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const past = isPast(dateStr);
          const booked = isBooked(dateStr);
          const blocked = isBlocked(dateStr);

          let cls = "rounded-lg py-1 text-center text-xs font-medium transition ";
          if (past) cls += "text-slate-300 cursor-default";
          else if (booked) cls += "bg-red-100 text-red-600 cursor-default";
          else if (blocked) cls += "bg-amber-100 text-amber-600 cursor-default";
          else cls += "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-default";

          return (
            <div key={dateStr} className={cls} title={booked ? "Booked" : blocked ? "Blocked" : past ? "Past" : "Available"}>
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {[
          { cls: "bg-emerald-100", label: "Free" },
          { cls: "bg-red-100", label: "Booked" },
          { cls: "bg-amber-100", label: "Blocked" },
          { cls: "bg-slate-100", label: "Past" },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded ${cls}`} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={13} className={s <= value ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
      ))}
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
  const [reviews, setReviews] = useState([]);

  // Booking form
  const [booking, setBooking] = useState({ startDate: "", endDate: "", purpose: "", projectName: "", requesterNotes: "" });
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState("overview"); // overview | book | reviews

  const currentUser = JSON.parse(localStorage.getItem("researchConnectUser") || "null");
  const currentUserId = currentUser?._id || currentUser?.id;
  const token = localStorage.getItem("researchConnectToken");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const isOwner = equipment && equipment.owner?._id === currentUserId;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [eqRes, datesRes] = await Promise.all([
          axios.get(`${API}/api/equipment/${id}`, { headers: authHeaders }),
          axios.get(`${API}/api/equipment/${id}/approved-dates`, { headers: authHeaders }),
        ]);
        setEquipment(eqRes.data);
        setApprovedDates(datesRes.data);

        // Load reviews from usage history (public bookings rated)
        try {
          const histRes = await axios.get(`${API}/api/equipment/${id}/usage-history`, { headers: authHeaders });
          setReviews(histRes.data.filter((b) => b.rating));
        } catch (_) {
          // Not owner, can't see
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load equipment.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleBookingChange = (e) => {
    setBooking({ ...booking, [e.target.name]: e.target.value });
    setBookingError("");
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }

    const { startDate, endDate, purpose } = booking;
    if (!startDate || !endDate || !purpose.trim()) {
      setBookingError("Start date, end date, and purpose are required.");
      return;
    }
    if (new Date(startDate) < new Date()) {
      setBookingError("Start date cannot be in the past.");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setBookingError("End date must be after start date.");
      return;
    }

    setSubmitting(true);
    setBookingError("");
    setBookingSuccess("");
    try {
      await axios.post(`${API}/api/equipment/${id}/bookings`, booking, { headers: authHeaders });
      setBookingSuccess("✅ Booking request submitted! The owner will review it.");
      setBooking({ startDate: "", endDate: "", purpose: "", projectName: "", requesterNotes: "" });

      // Refresh approved dates
      const datesRes = await axios.get(`${API}/api/equipment/${id}/approved-dates`, { headers: authHeaders });
      setApprovedDates(datesRes.data);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Failed to submit booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    </div>
  );

  if (error || !equipment) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-400" />
        <p className="text-slate-600">{error || "Equipment not found."}</p>
        <button onClick={() => navigate("/equipment")} className="mt-4 text-blue-600 hover:underline">← Back to Equipment</button>
      </div>
    </div>
  );

  const st = STATUS_STYLES[equipment.status] || STATUS_STYLES.available;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Navbar />

      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <button
            onClick={() => navigate("/equipment")}
            className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={15} /> Back to Equipment
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">{equipment.category}</span>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">{equipment.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${st.cls}`}>
                  {st.icon} {st.label}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  equipment.condition === "excellent" ? "bg-emerald-50 text-emerald-600" :
                  equipment.condition === "good" ? "bg-blue-50 text-blue-600" :
                  equipment.condition === "fair" ? "bg-amber-50 text-amber-600" :
                  "bg-red-50 text-red-600"
                }`}>
                  {equipment.condition} condition
                </span>
                {equipment.requiresTraining && (
                  <span className="flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                    <Zap size={11} /> Training Required
                  </span>
                )}
                {avgRating && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {avgRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              {equipment.isFree ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold text-xl justify-center"><Gift size={18} /> Free</span>
                  <p className="text-xs text-emerald-600 mt-0.5">No rental fee</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-center">
                  <span className="flex items-center gap-1 text-blue-700 font-bold text-xl justify-center"><DollarSign size={18} />{equipment.rentalPricePerDay}</span>
                  <p className="text-xs text-blue-600 mt-0.5">per day</p>
                </div>
              )}
              {isOwner && (
                <button
                  onClick={() => navigate(`/equipment/${id}/edit`)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-0">
            {[
              { id: "overview", label: "Overview", icon: <Info size={14} /> },
              ...(!isOwner && equipment.status === "available" ? [{ id: "book", label: "Book Now", icon: <Calendar size={14} /> }] : []),
              { id: "reviews", label: `Reviews${reviews.length ? ` (${reviews.length})` : ""}`, icon: <Star size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 px-5 py-3.5 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="space-y-6">
            {activeTab === "overview" && (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-lg font-bold text-slate-800 flex items-center gap-2"><BookOpen size={16} /> Description</h2>
                  <p className="text-slate-600 leading-relaxed">{equipment.description}</p>
                </div>

                {equipment.specifications && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-lg font-bold text-slate-800 flex items-center gap-2"><Info size={16} /> Specifications</h2>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{equipment.specifications}</p>
                  </div>
                )}

                {equipment.usageInstructions && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
                    <h2 className="mb-3 text-lg font-bold text-amber-800 flex items-center gap-2"><AlertTriangle size={16} /> Usage Instructions</h2>
                    <p className="text-amber-700 leading-relaxed whitespace-pre-wrap">{equipment.usageInstructions}</p>
                  </div>
                )}

                {/* Availability Schedule */}
                {equipment.availabilitySchedule?.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2"><Clock size={16} /> Weekly Availability</h2>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {equipment.availabilitySchedule.map((slot, i) => (
                        <div key={i} className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                          <p className="text-xs font-bold text-blue-700">{DAY_NAMES[slot.dayOfWeek]}</p>
                          <p className="text-xs text-blue-600">{slot.startTime} – {slot.endTime}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {equipment.tags?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag size={14} className="text-slate-400" />
                    {equipment.tags.map((t) => (
                      <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{t}</span>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "book" && !isOwner && equipment.status === "available" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Calendar size={18} /> Request to Book
                </h2>

                {!currentUser ? (
                  <div className="rounded-xl bg-blue-50 p-5 text-center">
                    <p className="text-slate-600 mb-3">You need to be logged in to book equipment.</p>
                    <button onClick={() => navigate("/login")} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
                      Log In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBooking} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start Date <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          name="startDate"
                          value={booking.startDate}
                          onChange={handleBookingChange}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">End Date <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          name="endDate"
                          value={booking.endDate}
                          onChange={handleBookingChange}
                          min={booking.startDate || new Date().toISOString().split("T")[0]}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Purpose / Research Goal <span className="text-red-500">*</span></label>
                      <textarea
                        name="purpose"
                        value={booking.purpose}
                        onChange={handleBookingChange}
                        rows={3}
                        placeholder="Describe what you'll use this equipment for…"
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Project Name (optional)</label>
                      <input
                        type="text"
                        name="projectName"
                        value={booking.projectName}
                        onChange={handleBookingChange}
                        placeholder="e.g., Climate Sensor Study 2025"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Notes to Owner (optional)</label>
                      <textarea
                        name="requesterNotes"
                        value={booking.requesterNotes}
                        onChange={handleBookingChange}
                        rows={2}
                        placeholder="Any special requirements or questions…"
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    {equipment.maxBookingDays && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Info size={12} /> Max booking duration: {equipment.maxBookingDays} days
                      </p>
                    )}

                    {bookingError && (
                      <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle size={15} /> {bookingError}
                      </div>
                    )}
                    {bookingSuccess && (
                      <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{bookingSuccess}</div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-60 transition"
                    >
                      {submitting ? (
                        <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                      ) : (
                        <><Send size={15} /> Submit Booking Request</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <Star size={36} className="mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-500">No reviews yet</p>
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div key={r._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-800">{r.requester?.username || "Anonymous"}</p>
                          <p className="text-xs text-slate-400">{formatDate(r.actualEndDate || r.endDate)}</p>
                        </div>
                        <StarRating value={r.rating} />
                      </div>
                      {r.reviewComment && <p className="text-sm text-slate-600 leading-relaxed">{r.reviewComment}</p>}
                      {r.projectName && <p className="mt-2 text-xs text-slate-400">Project: {r.projectName}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Owner card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-700 flex items-center gap-2"><User size={14} /> Equipment Owner</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {equipment.owner?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{equipment.owner?.username}</p>
                  <p className="text-xs text-slate-400">{equipment.owner?.email}</p>
                </div>
              </div>
              {equipment.location && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={12} /> {equipment.location}
                </div>
              )}
              {!isOwner && (
                <Link
                  to={`/researchers/${equipment.owner?._id}`}
                  className="mt-3 block text-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                  View Profile
                </Link>
              )}
            </div>

            {/* Availability Calendar */}
            <AvailabilityCalendar approvedDates={approvedDates} blockedDates={equipment.blockedDates || []} />

            {/* Quick facts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-700">Quick Info</h3>
              {[
                { label: "Category", val: equipment.category },
                { label: "Max booking", val: `${equipment.maxBookingDays} days` },
                { label: "Training", val: equipment.requiresTraining ? "Required" : "Not required" },
                { label: "Listed", val: formatDate(equipment.createdAt) },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-medium text-slate-700">{val}</span>
                </div>
              ))}
            </div>

            {/* Book CTA if not owner and not on book tab */}
            {!isOwner && equipment.status === "available" && activeTab !== "book" && (
              <button
                onClick={() => setActiveTab("book")}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 transition"
              >
                Book This Equipment
              </button>
            )}
            {!isOwner && equipment.status !== "available" && (
              <div className="rounded-2xl border border-red-100 bg-red-50 py-3.5 text-center text-sm font-medium text-red-600">
                Not available for booking right now
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
