import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FlaskConical,
    CalendarDays,
    Users,
    Tags,
    Landmark,
    MessageSquare,
    Star,
    ArrowLeft,
    Loader2,
    Send,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import FeedbackModal from "../components/FeedbackModal";

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("researchConnectUser"));

    const [project, setProject] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Feedback Form State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editingFeedbackId, setEditingFeedbackId] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const [projectRes, feedbackRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/feedback/${id}`)
            ]);
            setProject(projectRes.data);
            setFeedbacks(feedbackRes.data);
        } catch (error) {
            console.error("Failed to load project details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please login to leave feedback");
            return;
        }
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            let res;
            if (isEditing && editingFeedbackId) {
                res = await api.put(`/feedback/${editingFeedbackId}`, { rating, comment });
            } else {
                res = await api.post(`/feedback/${id}`, { rating, comment });
            }

            // Update local feedback list
            if (isEditing) {
                setFeedbacks(feedbacks.map(f => f._id === editingFeedbackId ? res.data.feedback : f));
            } else {
                const existingIdx = feedbacks.findIndex(f => f.user?._id === user._id || f.user === user._id);
                if (existingIdx !== -1) {
                    const updatedFeedbacks = [...feedbacks];
                    updatedFeedbacks[existingIdx] = res.data.feedback;
                    setFeedbacks(updatedFeedbacks);
                } else {
                    setFeedbacks([res.data.feedback, ...feedbacks]);
                }
            }

            // Reset form
            setComment("");
            setRating(0);
            setIsEditing(false);
            setEditingFeedbackId(null);
            alert(res.data.message);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to submit feedback");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditFeedback = (f) => {
        setRating(f.rating);
        setComment(f.comment);
        setIsEditing(true);
        setEditingFeedbackId(f._id);
        // Scroll to form
        window.scrollTo({ top: document.getElementById('feedback-form').offsetTop - 100, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setRating(0);
        setComment("");
        setIsEditing(false);
        setEditingFeedbackId(null);
    };

    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            await api.delete(`/feedback/${feedbackId}`);
            setFeedbacks(feedbacks.filter(f => f._id !== feedbackId));

            // If we were editing this one, cancel it
            if (editingFeedbackId === feedbackId) {
                handleCancelEdit();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete feedback");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
                <h2 className="text-2xl font-bold text-slate-900">Project Not Found</h2>
                <button
                    onClick={() => navigate("/projects")}
                    className="mt-4 flex items-center gap-2 text-blue-600 hover:underline"
                >
                    <ArrowLeft size={20} /> Back to Projects
                </button>
            </div>
        );
    }

    const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
        : 0;

    return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <Navbar />

            <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 font-medium text-slate-500 transition hover:text-slate-900"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-10 text-white md:px-10">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                                {project.researchField}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${project.status === "completed" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                                }`}>
                                {project.status}
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold md:text-5xl leading-tight">
                            {project.title}
                        </h1>

                        <div className="mt-6 flex flex-wrap items-center gap-6 text-slate-300">
                            {project.owner && (
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                                        {project.owner.username.charAt(0)}
                                    </div>
                                    <span>By <span className="font-semibold text-white">{project.owner.username}</span></span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <CalendarDays size={18} />
                                <span>Created on {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star size={18} className="text-amber-400 fill-amber-400" />
                                <span>{averageRating} ({feedbacks.length} reviews)</span>
                            </div>
                            <button
                                onClick={() => setShowFeedbackModal(true)}
                                className="ml-auto flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm font-bold text-white transition-all backdrop-blur"
                            >
                                <Star size={15} className="text-amber-400 fill-amber-400" />
                                Give Feedback
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        <div className="md:col-span-2 p-6 md:p-10 space-y-10">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <FlaskConical className="text-blue-600" /> Abstract
                                </h2>
                                <p className="text-lg leading-relaxed text-slate-600 whitespace-pre-wrap">
                                    {project.abstract}
                                </p>
                            </div>

                            {project.objective && (
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-3">Objectives</h2>
                                    <p className="text-slate-600 leading-relaxed">{project.objective}</p>
                                </div>
                            )}

                            {project.methodology && (
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-3">Methodology</h2>
                                    <p className="text-slate-600 leading-relaxed">{project.methodology}</p>
                                </div>
                            )}

                            {project.expectedOutcome && (
                                <div className="rounded-2xl bg-blue-50 p-6 border border-blue-100">
                                    <h2 className="text-xl font-bold text-blue-900 mb-3">Expected Outcomes</h2>
                                    <p className="text-blue-800/80 leading-relaxed">{project.expectedOutcome}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 md:p-10 bg-slate-50/50 space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Project Stats</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-slate-500">Overall Progress</span>
                                            <span className="font-bold text-slate-900">{project.progress}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 transition-all duration-500"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {project.keywords?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Keywords</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.keywords.map(kw => (
                                            <span key={kw} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-600">
                                                <Tags size={14} className="text-slate-400" /> {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {project.fundingSource && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Funding</h3>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                            <Landmark size={20} />
                                        </div>
                                        <span className="font-medium text-slate-700">{project.fundingSource}</span>
                                    </div>
                                </div>
                            )}

                            {project.collaborators?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Collaborators</h3>
                                    <div className="space-y-2">
                                        {project.collaborators.map(person => (
                                            <div key={person} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                                    <Users size={16} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600">{person}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Feedback Section */}
                <section className="mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <MessageSquare className="text-blue-600" /> Feedback & Ratings
                        </h2>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200">
                            <Star className="text-amber-400 fill-amber-400" size={20} />
                            <span className="text-xl font-bold text-slate-900">{averageRating}</span>
                            <span className="text-slate-400">/ 5</span>
                            <span className="ml-2 text-sm text-slate-500 border-l pl-3">{feedbacks.length} reviews</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Submit Feedback Form */}
                        <div className="lg:col-span-1" id="feedback-form">
                            <div className="sticky top-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {isEditing ? "Edit Your Review" : "Leave a Review"}
                                </h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    {isEditing ? "Modify your existing thoughts and rating." : "Share your thoughts and rate this project."}
                                </p>

                                {user ? (
                                    <form onSubmit={handleSubmitFeedback} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">Rating Scale</label>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        className="p-1 transition-transform active:scale-90"
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        <Star
                                                            size={32}
                                                            className={`${(hoverRating || rating) >= star
                                                                ? "text-amber-400 fill-amber-400"
                                                                : "text-slate-200"
                                                                } transition-colors`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Review Comments</label>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="What do you think about this research?"
                                                className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                                            ></textarea>
                                        </div>

                                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <Send size={18} /> {isEditing ? "Update Review" : "Submit Review"}
                                                </>
                                            )}
                                        </button>

                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                                            >
                                                <X size={18} /> Cancel Edit
                                            </button>
                                        )}
                                    </form>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-slate-600 mb-4 font-medium">Please sign in to leave a review.</p>
                                        <button
                                            onClick={() => navigate("/login")}
                                            className="w-full rounded-2xl bg-slate-900 py-3 font-bold text-white transition hover:bg-slate-800"
                                        >
                                            Sign In
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Feedback List */}
                        <div className="lg:col-span-2 space-y-4">
                            {feedbacks.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-12 text-center">
                                    <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-medium text-lg">No reviews yet. Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                feedbacks.map((f) => (
                                    <div key={f._id} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm transition hover:shadow-md">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                                    {f.user?.username?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">
                                                        {f.user?.username || "Researcher"}
                                                    </h4>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={14}
                                                                className={star <= f.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {user && (f.user?._id === user._id || f.user === user._id) && (
                                                    <div className="flex items-center gap-2 mr-2">
                                                        <button
                                                            onClick={() => handleEditFeedback(f)}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                            title="Edit Review"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFeedback(f._id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Delete Review"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                                <span className="text-sm text-slate-400 font-medium flex items-center gap-1.5 whitespace-nowrap">
                                                    <Clock3 size={14} /> {new Date(f.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {f.comment && (
                                            <p className="mt-6 text-slate-600 leading-relaxed text-lg italic">
                                                &ldquo;{f.comment}&rdquo;
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>

        {/* Feedback Modal */}
        {showFeedbackModal && project && (
            <FeedbackModal
                project={project}
                onClose={() => setShowFeedbackModal(false)}
            />
        )}
        </>
    );
};

export default ProjectDetails;
