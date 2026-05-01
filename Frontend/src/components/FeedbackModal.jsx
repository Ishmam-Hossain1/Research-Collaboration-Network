import { useState, useEffect, useCallback } from "react";
import {
    Star,
    X,
    Send,
    Loader2,
    MessageSquare,
    Pencil,
    Trash2,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
} from "lucide-react";
import api from "../lib/api";

/* ─────────────────────────────────────────────
   Tiny Clock SVG (lucide-react does not export Clock3)
───────────────────────────────────────────── */
const ClockIcon = ({ size = 14, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

/* ─────────────────────────────────────────────
   Star Rating Input
───────────────────────────────────────────── */
const StarRatingInput = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);
    const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => onChange(star)}
                        className="p-1 transition-all active:scale-90 focus:outline-none"
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                        <Star
                            size={40}
                            className={`transition-all duration-150 drop-shadow-sm ${
                                (hover || value) >= star
                                    ? "text-amber-400 fill-amber-400 scale-110"
                                    : "text-slate-200 fill-slate-100"
                            }`}
                        />
                    </button>
                ))}
            </div>
            <span
                className={`text-sm font-semibold transition-colors ${
                    (hover || value) > 0
                        ? "text-amber-500"
                        : "text-slate-400"
                }`}
            >
                {labels[hover || value] || "Select a rating"}
            </span>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Rating distribution bar
───────────────────────────────────────────── */
const RatingBar = ({ star, count, total }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-4 text-right font-semibold text-slate-500">{star}</span>
            <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="w-5 text-right text-slate-400">{count}</span>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main FeedbackModal
───────────────────────────────────────────── */
const FeedbackModal = ({ project, onClose }) => {
    const user = JSON.parse(localStorage.getItem("researchConnectUser"));

    const [feedbacks, setFeedbacks] = useState([]);
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

    // form fields
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // edit mode
    const [editingId, setEditingId] = useState(null);

    const fetchFeedbacks = useCallback(async () => {
        try {
            setLoadingFeedbacks(true);
            const res = await api.get(`/feedback/${project._id}`);
            setFeedbacks(res.data);
        } catch {
            /* silent */
        } finally {
            setLoadingFeedbacks(false);
        }
    }, [project._id]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    // lock body scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const averageRating =
        feedbacks.length > 0
            ? (feedbacks.reduce((a, c) => a + c.rating, 0) / feedbacks.length).toFixed(1)
            : 0;

    const ratingCounts = [5, 4, 3, 2, 1].map((s) => ({
        star: s,
        count: feedbacks.filter((f) => f.rating === s).length,
    }));

    /* ── Submit / Update ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setFormError("Please sign in to leave feedback.");
            return;
        }
        if (rating === 0) {
            setFormError("Please select a star rating.");
            return;
        }

        try {
            setSubmitting(true);
            setFormError("");
            setSuccessMsg("");

            let res;
            if (editingId) {
                res = await api.put(`/feedback/${editingId}`, { rating, comment });
                setFeedbacks((prev) =>
                    prev.map((f) => (f._id === editingId ? res.data.feedback : f))
                );
                setSuccessMsg("Review updated successfully!");
            } else {
                res = await api.post(`/feedback/${project._id}`, { rating, comment });
                const existingIdx = feedbacks.findIndex(
                    (f) => f.user?._id === user.id || f.user === user.id
                );
                if (existingIdx !== -1) {
                    const updated = [...feedbacks];
                    updated[existingIdx] = res.data.feedback;
                    setFeedbacks(updated);
                } else {
                    setFeedbacks((prev) => [res.data.feedback, ...prev]);
                }
                setSuccessMsg(res.data.message || "Review submitted!");
            }

            // reset form
            setRating(0);
            setComment("");
            setEditingId(null);
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Edit ── */
    const handleEdit = (f) => {
        setEditingId(f._id);
        setRating(f.rating);
        setComment(f.comment || "");
        setFormError("");
        setSuccessMsg("");
        // scroll form into view
        document.getElementById("fm-form-top")?.scrollIntoView({ behavior: "smooth" });
    };

    /* ── Delete ── */
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this review permanently?")) return;
        try {
            await api.delete(`/feedback/${id}`);
            setFeedbacks((prev) => prev.filter((f) => f._id !== id));
            if (editingId === id) {
                setEditingId(null);
                setRating(0);
                setComment("");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete review.");
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setRating(0);
        setComment("");
        setFormError("");
        setSuccessMsg("");
    };

    /* ── Dismiss success msg after 3 s ── */
    useEffect(() => {
        if (!successMsg) return;
        const t = setTimeout(() => setSuccessMsg(""), 3000);
        return () => clearTimeout(t);
    }, [successMsg]);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Modal shell */}
            <div
                className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
                style={{ background: "linear-gradient(160deg,#0f172a 0%,#1e293b 100%)" }}
            >
                {/* ── Gradient accent strip ── */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400" />

                {/* ── Header ── */}
                <div className="flex-shrink-0 px-6 pt-7 pb-5 border-b border-white/10">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare size={18} className="text-violet-400 shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                                    Project Feedback
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-white leading-snug line-clamp-2">
                                {project.title}
                            </h2>
                            <p className="mt-1 text-xs text-slate-400 font-medium">
                                {project.researchField}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Rating summary strip */}
                    <div className="mt-4 flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-4xl font-black text-white tabular-nums">
                                {averageRating}
                            </span>
                            <div>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            size={14}
                                            className={
                                                s <= Math.round(Number(averageRating))
                                                    ? "text-amber-400 fill-amber-400"
                                                    : "text-slate-600 fill-slate-700"
                                            }
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {feedbacks.length} review{feedbacks.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>

                        {feedbacks.length > 0 && (
                            <div className="flex-1 min-w-[140px] space-y-0.5">
                                {ratingCounts.map(({ star, count }) => (
                                    <RatingBar
                                        key={star}
                                        star={star}
                                        count={count}
                                        total={feedbacks.length}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="ml-auto flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
                            <TrendingUp size={16} className="text-emerald-400" />
                            <span className="text-xs font-semibold text-slate-300">
                                Avg&nbsp;
                                <span className="text-white font-black">{averageRating}</span>
                                &nbsp;/ 5
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-5 min-h-full">
                        {/* ── Left: Submit Form ── */}
                        <div
                            id="fm-form-top"
                            className="md:col-span-2 p-6 border-b md:border-b-0 md:border-r border-white/10"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">
                                {editingId ? "Edit Your Review" : "Write a Review"}
                            </h3>

                            {!user ? (
                                <div className="text-center py-8">
                                    <MessageSquare size={36} className="mx-auto mb-3 text-slate-600" />
                                    <p className="text-slate-400 text-sm mb-4">
                                        Sign in to leave a review.
                                    </p>
                                    <a
                                        href="/login"
                                        className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition"
                                    >
                                        Sign In <ChevronRight size={16} />
                                    </a>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Star input */}
                                    <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                            Your Rating *
                                        </label>
                                        <StarRatingInput value={rating} onChange={setRating} />
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                            Review Comments
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Share your thoughts about this research project…"
                                            rows={5}
                                            className="w-full rounded-2xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 p-4 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Alert messages */}
                                    {formError && (
                                        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-400/20 px-4 py-3 text-sm text-red-300">
                                            <AlertCircle size={16} className="shrink-0" />
                                            {formError}
                                        </div>
                                    )}
                                    {successMsg && (
                                        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-400/20 px-4 py-3 text-sm text-emerald-300">
                                            <CheckCircle2 size={16} className="shrink-0" />
                                            {successMsg}
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 py-3 text-sm font-bold text-white hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-900/30"
                                    >
                                        {submitting ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                {editingId ? "Update Review" : "Submit Review"}
                                            </>
                                        )}
                                    </button>

                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            <X size={16} /> Cancel Edit
                                        </button>
                                    )}
                                </form>
                            )}
                        </div>

                        {/* ── Right: Reviews List ── */}
                        <div className="md:col-span-3 p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">
                                All Reviews
                            </h3>

                            {loadingFeedbacks ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 size={28} className="animate-spin text-slate-500" />
                                </div>
                            ) : feedbacks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <MessageSquare size={40} className="text-slate-700 mb-3" />
                                    <p className="text-slate-500 font-medium">No reviews yet.</p>
                                    <p className="mt-1 text-xs text-slate-600">
                                        Be the first to share your thoughts!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {feedbacks.map((f) => {
                                        const isOwner =
                                            user &&
                                            (f.user?._id === user.id || f.user === user.id);
                                        const initial =
                                            f.user?.username?.charAt(0)?.toUpperCase() || "U";
                                        const palette = [
                                            "from-violet-500 to-purple-600",
                                            "from-blue-500 to-cyan-500",
                                            "from-emerald-500 to-teal-500",
                                            "from-amber-500 to-orange-500",
                                            "from-pink-500 to-rose-500",
                                        ];
                                        const colorClass =
                                            palette[
                                                (f.user?.username?.charCodeAt(0) || 0) %
                                                    palette.length
                                            ];

                                        return (
                                            <div
                                                key={f._id}
                                                className={`rounded-2xl border p-4 transition-all ${
                                                    editingId === f._id
                                                        ? "border-violet-500/40 bg-violet-500/5"
                                                        : "border-white/10 bg-white/5 hover:bg-white/8"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        {/* Avatar */}
                                                        <div
                                                            className={`flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-sm font-black shadow`}
                                                        >
                                                            {initial}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">
                                                                {f.user?.username || "Researcher"}
                                                                {isOwner && (
                                                                    <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </p>
                                                            {/* Stars */}
                                                            <div className="flex items-center gap-0.5 mt-0.5">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <Star
                                                                        key={s}
                                                                        size={12}
                                                                        className={
                                                                            s <= f.rating
                                                                                ? "text-amber-400 fill-amber-400"
                                                                                : "text-slate-700"
                                                                        }
                                                                    />
                                                                ))}
                                                                <span className="ml-1.5 text-xs text-slate-500">
                                                                    {f.rating}/5
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* actions + date */}
                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        <div className="flex items-center gap-1">
                                                            {isOwner && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleEdit(f)}
                                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
                                                                        title="Edit"
                                                                    >
                                                                        <Pencil size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(f._id)}
                                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-slate-600">
                                                            <ClockIcon size={11} />
                                                            {new Date(f.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                {f.comment && (
                                                    <p className="mt-3 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 italic">
                                                        &ldquo;{f.comment}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
