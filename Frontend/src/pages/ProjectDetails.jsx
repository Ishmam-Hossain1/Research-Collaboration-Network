import { useEffect, useMemo, useState } from "react";
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
  Clock3,
  CheckCircle2,
  CircleDashed,
  PlayCircle,
  BarChart3,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import FeedbackModal from "../components/FeedbackModal";
import MilestoneTracker from "../components/MilestoneTracker";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("researchConnectUser"));

  const [project, setProject] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectRes, feedbackRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/feedback/${id}`),
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
  }, [id, refreshTrigger]);

  const refreshProjectData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

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

      if (isEditing) {
        setFeedbacks(
          feedbacks.map((f) =>
            f._id === editingFeedbackId ? res.data.feedback : f
          )
        );
      } else {
        const existingIdx = feedbacks.findIndex(
          (f) => f.user?._id === user.id || f.user === user.id
        );

        if (existingIdx !== -1) {
          const updatedFeedbacks = [...feedbacks];
          updatedFeedbacks[existingIdx] = res.data.feedback;
          setFeedbacks(updatedFeedbacks);
        } else {
          setFeedbacks([res.data.feedback, ...feedbacks]);
        }
      }

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
    const feedbackForm = document.getElementById("feedback-form");
    if (feedbackForm) {
      window.scrollTo({
        top: feedbackForm.offsetTop - 100,
        behavior: "smooth",
      });
    }
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
      setFeedbacks(feedbacks.filter((f) => f._id !== feedbackId));

      if (editingFeedbackId === feedbackId) {
        handleCancelEdit();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete feedback");
    }
  };

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length
        ).toFixed(1)
      : 0;

  const derivedStatus = useMemo(() => {
    const progress = Number(project?.progress ?? 0);

    if (progress >= 100) {
      return {
        label: "Completed",
        key: "completed",
        badgeClass: "bg-emerald-500/20 text-emerald-300",
        icon: CheckCircle2,
        statCardClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }

    if (progress > 0) {
      return {
        label: "Ongoing",
        key: "ongoing",
        badgeClass: "bg-amber-500/20 text-amber-300",
        icon: PlayCircle,
        statCardClass: "border-amber-200 bg-amber-50 text-amber-700",
      };
    }

    return {
      label: "Pending",
      key: "pending",
      badgeClass: "bg-slate-500/20 text-slate-200",
      icon: CircleDashed,
      statCardClass: "border-slate-200 bg-slate-100 text-slate-700",
    };
  }, [project?.progress]);

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

  const StatusIcon = derivedStatus.icon;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />

        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-10 text-white md:px-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                  {project.researchField}
                </span>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${derivedStatus.badgeClass}`}
                >
                  <StatusIcon size={16} />
                  {derivedStatus.label}
                </span>
              </div>

              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                {project.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-slate-300">
                {project.owner && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-bold uppercase text-white">
                      {project.owner.username?.charAt(0) || "U"}
                    </div>
                    <span>
                      By{" "}
                      <span className="font-semibold text-white">
                        {project.owner.username}
                      </span>
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <CalendarDays size={18} />
                  <span>
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Star size={18} className="fill-amber-400 text-amber-400" />
                  <span>
                    {averageRating} ({feedbacks.length} reviews)
                  </span>
                </div>

                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="ml-auto flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white transition-all backdrop-blur hover:bg-white/20"
                >
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  Give Feedback
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="space-y-10 p-6 md:col-span-2 md:p-10">
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-slate-900">
                    <FlaskConical className="text-blue-600" /> Abstract
                  </h2>
                  <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-600">
                    {project.abstract}
                  </p>
                </div>

                {project.objective && (
                  <div>
                    <h2 className="mb-3 text-xl font-bold text-slate-900">
                      Objectives
                    </h2>
                    <p className="leading-relaxed text-slate-600">
                      {project.objective}
                    </p>
                  </div>
                )}

                {project.methodology && (
                  <div>
                    <h2 className="mb-3 text-xl font-bold text-slate-900">
                      Methodology
                    </h2>
                    <p className="leading-relaxed text-slate-600">
                      {project.methodology}
                    </p>
                  </div>
                )}

                {project.expectedOutcome && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                    <h2 className="mb-3 text-xl font-bold text-blue-900">
                      Expected Outcomes
                    </h2>
                    <p className="leading-relaxed text-blue-800/80">
                      {project.expectedOutcome}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-8 bg-slate-50/50 p-6 md:p-10">
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Project Stats
                  </h3>

                  <div className="space-y-4">
                    <div className={`rounded-2xl border p-4 ${derivedStatus.statCardClass}`}>
                      <div className="flex items-center gap-2">
                        <StatusIcon size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wide">
                          {derivedStatus.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm opacity-80">
                        Status is updated automatically from milestone progress.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <BarChart3 size={16} />
                          Overall Progress
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                          {project.progress ?? 0}%
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${project.progress ?? 0}%` }}
                        />
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        This progress bar is linked directly to completed milestones and subtasks.
                      </p>
                    </div>
                  </div>
                </div>

                {project.keywords?.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
                        >
                          <Tags size={14} className="text-slate-400" /> {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.fundingSource && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                      Funding
                    </h3>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                        <Landmark size={20} />
                      </div>
                      <span className="font-medium text-slate-700">
                        {project.fundingSource}
                      </span>
                    </div>
                  </div>
                )}

                {(project.startDate || project.endDate) && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                      Timeline
                    </h3>
                    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                      {project.startDate && (
                        <div className="flex items-center justify-between">
                          <span>Start Date</span>
                          <span className="font-medium text-slate-900">
                            {new Date(project.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {project.endDate && (
                        <div className="flex items-center justify-between">
                          <span>End Date</span>
                          <span className="font-medium text-slate-900">
                            {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {project.collaborators?.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                      Collaborators
                    </h3>
                    <div className="space-y-2">
                      {project.collaborators.map((person) => (
                        <div
                          key={person}
                          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                            <Users size={16} />
                          </div>
                          <span className="text-sm font-medium text-slate-600">
                            {person}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="mt-12">
            <MilestoneTracker
              projectId={id}
              progress={project.progress ?? 0}
              onMilestoneChange={refreshProjectData}
            />
          </div>

          <section className="mt-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
                <MessageSquare className="text-blue-600" /> Feedback & Ratings
              </h2>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2">
                <Star className="fill-amber-400 text-amber-400" size={20} />
                <span className="text-xl font-bold text-slate-900">
                  {averageRating}
                </span>
                <span className="text-slate-400">/ 5</span>
                <span className="ml-2 border-l pl-3 text-sm text-slate-500">
                  {feedbacks.length} reviews
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1" id="feedback-form">
                <div className="sticky top-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-2 text-xl font-bold text-slate-900">
                    {isEditing ? "Edit Your Review" : "Leave a Review"}
                  </h3>
                  <p className="mb-6 text-sm text-slate-500">
                    {isEditing
                      ? "Modify your existing thoughts and rating."
                      : "Share your thoughts and rate this project."}
                  </p>

                  {user ? (
                    <form onSubmit={handleSubmitFeedback} className="space-y-6">
                      <div>
                        <label className="mb-3 block text-sm font-semibold text-slate-700">
                          Rating Scale
                        </label>
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
                                className={`${
                                  (hoverRating || rating) >= star
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                } transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Review Comments
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="What do you think about this research?"
                          className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      {error && (
                        <p className="text-sm font-medium text-red-500">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <>
                            <Send size={18} />{" "}
                            {isEditing ? "Update Review" : "Submit Review"}
                          </>
                        )}
                      </button>

                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          <X size={18} /> Cancel Edit
                        </button>
                      )}
                    </form>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="mb-4 font-medium text-slate-600">
                        Please sign in to leave a review.
                      </p>
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

              <div className="space-y-4 lg:col-span-2">
                {feedbacks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-12 text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <p className="text-lg font-medium text-slate-500">
                      No reviews yet. Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  feedbacks.map((f) => (
                    <div
                      key={f._id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md md:p-8"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="flex gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-lg font-bold text-blue-700">
                            {f.user?.username?.charAt(0) || "U"}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold uppercase tracking-tight text-slate-900">
                              {f.user?.username || "Researcher"}
                            </h4>
                            <div className="mt-1 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={
                                    star <= f.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {user &&
                            (f.user?._id === user.id || f.user === user.id) && (
                              <div className="mr-2 flex items-center gap-2">
                                <button
                                  onClick={() => handleEditFeedback(f)}
                                  className="rounded-xl p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit Review"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteFeedback(f._id)}
                                  className="rounded-xl p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                                  title="Delete Review"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            )}
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-slate-400">
                            <Clock3 size={14} />{" "}
                            {new Date(f.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {f.comment && (
                        <p className="mt-6 text-lg italic leading-relaxed text-slate-600">
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