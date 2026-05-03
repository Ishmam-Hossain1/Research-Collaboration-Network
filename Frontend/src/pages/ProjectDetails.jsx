import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Star,
  FlaskConical,
  Target,
  Microscope,
  Sparkles,
  CheckCircle2,
  Clock3,
  BarChart3,
  Users,
  Tags,
  Landmark,
  FolderKanban,
  ArrowRight,
  Atom,
  Dna,
  Telescope,
  Brain,
  Network,
  MessageSquareText,
  UserPlus,
  XCircle,
  Trash2,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../lib/api";
import FeedbackModal from "../components/FeedbackModal";

const API_BASE_URL = "http://localhost:5000/api";

const FloatingResearchDecor = () => {
  const items = [
    {
      icon: Atom,
      className: "left-5 top-36",
      bg: "from-cyan-200/90 to-blue-200/70",
      color: "text-cyan-700",
      animation: "animate-[floatOne_8s_ease-in-out_infinite]",
    },
    {
      icon: Dna,
      className: "left-8 bottom-24",
      bg: "from-emerald-200/90 to-cyan-200/70",
      color: "text-emerald-700",
      animation: "animate-[floatTwo_9s_ease-in-out_infinite]",
    },
    {
      icon: Telescope,
      className: "right-6 top-40",
      bg: "from-violet-200/90 to-fuchsia-200/70",
      color: "text-violet-700",
      animation: "animate-[floatThree_8s_ease-in-out_infinite]",
    },
    {
      icon: Brain,
      className: "right-10 bottom-24",
      bg: "from-amber-200/90 to-orange-200/70",
      color: "text-amber-700",
      animation: "animate-[floatOne_9s_ease-in-out_infinite]",
    },
  ];

  return (
    <>
      <style>
        {`
          @keyframes floatOne {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-18px) rotate(6deg); }
          }

          @keyframes floatTwo {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-14px) translateX(8px); }
          }

          @keyframes floatThree {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.06); }
          }

          @keyframes toastSlideDown {
            0% {
              opacity: 0;
              transform: translate(-50%, -20px) scale(0.96);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0) scale(1);
            }
          }
        `}
      </style>

      <div className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden xl:block">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className={`absolute ${item.className} ${item.animation} flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/80 bg-gradient-to-br ${item.bg} shadow-[0_18px_45px_rgba(37,99,235,0.14)] backdrop-blur-xl`}
            >
              <div className="absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.72),transparent_58%)]" />
              <Icon size={27} className={`relative ${item.color}`} />
            </div>
          );
        })}
      </div>
    </>
  );
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("researchConnectUser")) || null;
    } catch {
      return null;
    }
  }, []);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [isRequestSent, setIsRequestSent] = useState(false);
  const [checkingRequestStatus, setCheckingRequestStatus] = useState(false);
  const [collaborationLoading, setCollaborationLoading] = useState(false);
  const [collaboratorProfiles, setCollaboratorProfiles] = useState({});
  const [removingCollaboratorId, setRemovingCollaboratorId] = useState("");

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    if (!message) return;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      visible: true,
      message,
      type,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const getId = (value) => {
    if (!value) return "";

    if (typeof value === "string") return value;

    if (value._id) {
      if (typeof value._id === "string") return value._id;
      if (value._id.$oid) return value._id.$oid;
      return value._id.toString();
    }

    if (value.id) {
      if (typeof value.id === "string") return value.id;
      if (value.id.$oid) return value.id.$oid;
      return value.id.toString();
    }

    return "";
  };

  const getCollaboratorDisplayObject = (collaborator) => {
    if (!collaborator) return null;

    if (typeof collaborator === "string") {
      return (
        collaboratorProfiles[collaborator] || {
          _id: collaborator,
          username: "",
          email: "",
          profilePictureId: null,
        }
      );
    }

    const collaboratorId = getId(collaborator);

    if (
      collaboratorId &&
      (!collaborator.username || !collaborator.email) &&
      collaboratorProfiles[collaboratorId]
    ) {
      return {
        ...collaborator,
        ...collaboratorProfiles[collaboratorId],
      };
    }

    return collaborator;
  };

  const getCollaboratorProfilePictureUrl = (collaborator) => {
    if (!collaborator?.profilePictureId) return "";
    return `${API_BASE_URL}/auth/profile-picture/${collaborator.profilePictureId}`;
  };

  const getCollaboratorName = (collaborator, index) => {
    const collaboratorObject = getCollaboratorDisplayObject(collaborator);

    return (
      collaboratorObject?.username ||
      collaboratorObject?.name ||
      collaboratorObject?.email ||
      `Collaborator ${index + 1}`
    );
  };

  const getCollaboratorEmail = (collaborator) => {
    const collaboratorObject = getCollaboratorDisplayObject(collaborator);
    return collaboratorObject?.email || "No email available";
  };

  const isSameId = (first, second) => {
    const firstId = getId(first) || String(first || "");
    const secondId = getId(second) || String(second || "");

    return (
      firstId &&
      secondId &&
      firstId.toString().trim() === secondId.toString().trim()
    );
  };

  const isOldValidationMessage = (message) => {
    const text = String(message || "").toLowerCase();

    return (
      text.includes("validation failed") &&
      (text.includes("requestedcollaborations") ||
        text.includes("sentcollaborations")) &&
      text.includes("path") &&
      (text.includes("project") || text.includes("user"))
    );
  };

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/projects/${id}`);
      const projectData = res.data?.project || res.data;

      setProject(projectData);
    } catch (error) {
      console.error("Failed to fetch project details", error);
      showToast("Failed to load project details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  useEffect(() => {
    const fetchMissingCollaboratorProfiles = async () => {
      if (!project?.collaborators?.length) return;

      const idsToFetch = project.collaborators
        .map((collaborator) => getId(collaborator))
        .filter(Boolean)
        .filter((collaboratorId) => {
          const originalCollaborator = project.collaborators.find(
            (item) => getId(item) === collaboratorId
          );

          const alreadyHasUserData =
            originalCollaborator &&
            typeof originalCollaborator === "object" &&
            (originalCollaborator.username || originalCollaborator.email);

          return !alreadyHasUserData && !collaboratorProfiles[collaboratorId];
        });

      if (idsToFetch.length === 0) return;

      try {
        const uniqueIdsToFetch = [...new Set(idsToFetch)];

        const results = await Promise.allSettled(
          uniqueIdsToFetch.map((collaboratorId) =>
            api.get(`/users/${collaboratorId}`)
          )
        );

        const fetchedProfiles = {};

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const collaboratorId = uniqueIdsToFetch[index];
            fetchedProfiles[collaboratorId] = result.value.data;
          }
        });

        if (Object.keys(fetchedProfiles).length > 0) {
          setCollaboratorProfiles((prev) => ({
            ...prev,
            ...fetchedProfiles,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch collaborator profiles", error);
      }
    };

    fetchMissingCollaboratorProfiles();
  }, [project?.collaborators]);

  const projectOwnerId = getId(project?.owner);
  const currentUserId = storedUser?.id || storedUser?._id || "";

  const isOwnProject =
    currentUserId &&
    projectOwnerId &&
    currentUserId.toString() === projectOwnerId.toString();

  const isProjectCollaborator = useMemo(() => {
    if (!currentUserId || !project?.collaborators?.length) return false;

    return project.collaborators.some((collaborator) =>
      isSameId(collaborator, currentUserId)
    );
  }, [project?.collaborators, currentUserId]);

  const requestMatchesThisProject = (request) => {
    if (!request) return false;

    const requestReceiverId = getId(request.user || request);
    const requestProjectId = getId(request.project);

    return (
      requestReceiverId &&
      requestProjectId &&
      requestReceiverId.toString() === projectOwnerId.toString() &&
      requestProjectId.toString() === id.toString()
    );
  };

  const fetchSentRequestStatus = async () => {
    if (
      !currentUserId ||
      !projectOwnerId ||
      !id ||
      isOwnProject ||
      isProjectCollaborator
    ) {
      setIsRequestSent(false);
      return;
    }

    try {
      setCheckingRequestStatus(true);

      const sentRes = await api.get(
        `/users/${currentUserId}/sent-collaboration-requests`
      );

      const sentRequests = sentRes.data?.requests || [];
      const requestAlreadySent = sentRequests.some(requestMatchesThisProject);

      setIsRequestSent(requestAlreadySent);
    } catch (error) {
      console.error("Failed to fetch sent collaboration request status", error);
      setIsRequestSent(false);
    } finally {
      setCheckingRequestStatus(false);
    }
  };

  useEffect(() => {
    fetchSentRequestStatus();
  }, [currentUserId, projectOwnerId, id, isOwnProject, isProjectCollaborator]);

  const handleSendCollaborationRequest = async () => {
    const freshProjectOwnerId = getId(project?.owner);

    if (!currentUserId) {
      showToast("Please log in first", "error");
      return;
    }

    if (!freshProjectOwnerId) {
      showToast("Project owner not found", "error");
      return;
    }

    if (!id) {
      showToast("Project not found", "error");
      return;
    }

    if (currentUserId.toString() === freshProjectOwnerId.toString()) {
      showToast("You cannot collaborate with your own project", "error");
      return;
    }

    if (isProjectCollaborator) {
      showToast("You are already collaborating on this project", "error");
      return;
    }

    try {
      setCollaborationLoading(true);

      await api.post("/users/collaboration-request", {
        fromUserId: currentUserId,
        toUserId: freshProjectOwnerId,
        projectId: id,
      });

      setIsRequestSent(true);
      showToast("Collaboration request sent successfully", "success");
    } catch (error) {
      console.error("Failed to send collaboration request", error);

      const backendMessage =
        error.response?.data?.message || "Failed to send collaboration request";

      if (
        backendMessage.toLowerCase().includes("already sent") ||
        backendMessage
          .toLowerCase()
          .includes("collaboration request already sent") ||
        isOldValidationMessage(backendMessage)
      ) {
        setIsRequestSent(true);
        showToast("Collaboration request sent successfully", "success");
        return;
      }

      showToast(backendMessage, "error");
    } finally {
      setCollaborationLoading(false);
    }
  };

  const handleCancelCollaborationRequest = async () => {
    const freshProjectOwnerId = getId(project?.owner);

    if (!currentUserId) {
      showToast("Please log in first", "error");
      return;
    }

    if (!freshProjectOwnerId) {
      showToast("Project owner not found", "error");
      return;
    }

    if (!id) {
      showToast("Project not found", "error");
      return;
    }

    try {
      setCollaborationLoading(true);

      await api.post("/users/collaboration-request/cancel", {
        fromUserId: currentUserId,
        toUserId: freshProjectOwnerId,
        projectId: id,
      });

      setIsRequestSent(false);
      showToast("Collaboration request cancelled successfully", "success");
    } catch (error) {
      console.error("Failed to cancel collaboration request", error);

      const backendMessage =
        error.response?.data?.message ||
        "Failed to cancel collaboration request";

      if (
        backendMessage.toLowerCase().includes("not found") ||
        backendMessage.toLowerCase().includes("no pending") ||
        isOldValidationMessage(backendMessage)
      ) {
        setIsRequestSent(false);
        showToast("No pending request found", "success");
        return;
      }

      showToast(backendMessage, "error");
    } finally {
      setCollaborationLoading(false);
    }
  };

  const handleRemoveCollaboration = async () => {
    if (!currentUserId) {
      showToast("Please log in first", "error");
      return;
    }

    if (!id) {
      showToast("Project not found", "error");
      return;
    }

    try {
      setCollaborationLoading(true);

      const res = await api.post("/users/project-collaboration/remove", {
        currentUserId,
        projectId: id,
      });

      const updatedProject = res.data?.project;

      if (updatedProject) {
        setProject(updatedProject);
      } else {
        await fetchProjectDetails();
      }

      setIsRequestSent(false);
      showToast("Collaboration removed successfully", "success");
    } catch (error) {
      console.error("Failed to remove collaboration", error);

      showToast(
        error.response?.data?.message || "Failed to remove collaboration",
        "error"
      );
    } finally {
      setCollaborationLoading(false);
    }
  };

  const handleOwnerRemoveCollaborator = async (collaboratorUserId) => {
    if (!currentUserId) {
      showToast("Please log in first", "error");
      return;
    }

    if (!isOwnProject) {
      showToast("Only the project owner can remove collaborators", "error");
      return;
    }

    if (!id || !collaboratorUserId) {
      showToast("Project or collaborator not found", "error");
      return;
    }

    try {
      setRemovingCollaboratorId(collaboratorUserId);

      const res = await api.post("/users/project-collaboration/remove", {
        currentUserId,
        projectId: id,
        collaboratorUserId,
      });

      const updatedProject = res.data?.project;

      if (updatedProject) {
        setProject(updatedProject);
      } else {
        setProject((prev) => ({
          ...prev,
          collaborators: (prev?.collaborators || []).filter(
            (collaborator) => !isSameId(collaborator, collaboratorUserId)
          ),
        }));
      }

      showToast("Collaborator removed successfully", "success");
    } catch (error) {
      console.error("Failed to remove collaborator", error);

      showToast(
        error.response?.data?.message || "Failed to remove collaborator",
        "error"
      );
    } finally {
      setRemovingCollaboratorId("");
    }
  };

  let CollaborationIcon = UserPlus;
  let collaborationButtonLabel = "Collaborate";
  let collaborationButtonClass =
    "border-blue-100 bg-white/85 text-slate-700 hover:border-blue-300 hover:text-blue-700";
  let collaborationButtonAction = handleSendCollaborationRequest;

  if (isProjectCollaborator) {
    CollaborationIcon = XCircle;
    collaborationButtonLabel = collaborationLoading
      ? "Removing..."
      : "Remove Collaboration";
    collaborationButtonClass =
      "border-rose-200 bg-white/85 text-rose-600 hover:border-rose-300 hover:text-rose-700";
    collaborationButtonAction = handleRemoveCollaboration;
  } else if (isRequestSent) {
    CollaborationIcon = XCircle;
    collaborationButtonLabel = collaborationLoading
      ? "Cancelling..."
      : "Cancel Request";
    collaborationButtonClass =
      "border-orange-200 bg-white/85 text-orange-600 hover:border-orange-300 hover:text-orange-700";
    collaborationButtonAction = handleCancelCollaborationRequest;
  } else {
    CollaborationIcon = UserPlus;
    collaborationButtonLabel = collaborationLoading
      ? "Sending..."
      : "Collaborate";
    collaborationButtonAction = handleSendCollaborationRequest;
  }

  if (checkingRequestStatus) {
    collaborationButtonLabel = "Checking...";
  }

  const formattedCreatedAt = useMemo(() => {
    if (!project?.createdAt) return "Not available";
    return new Date(project.createdAt).toLocaleDateString();
  }, [project]);

  const formattedStartDate = useMemo(() => {
    if (!project?.startDate) return "Not set";
    return new Date(project.startDate).toLocaleDateString();
  }, [project]);

  const formattedEndDate = useMemo(() => {
    if (!project?.endDate) return "Not set";
    return new Date(project.endDate).toLocaleDateString();
  }, [project]);

  const progressValue = Number(project?.progress || 0);

  const statusText =
    project?.status === "completed"
      ? "Completed"
      : project?.status === "ongoing"
      ? "Ongoing"
      : "Pending";

  const statusBadgeClass =
    project?.status === "completed"
      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
      : project?.status === "ongoing"
      ? "bg-amber-100 text-amber-700 border border-amber-200"
      : "bg-slate-100 text-slate-700 border border-slate-200";

  const progressColor =
    project?.status === "completed"
      ? "from-emerald-400 to-teal-500"
      : progressValue >= 75
      ? "from-blue-500 to-cyan-500"
      : progressValue >= 40
      ? "from-amber-400 to-orange-500"
      : "from-rose-400 to-pink-500";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef5ff]">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="rounded-[32px] border border-white/80 bg-white/80 p-10 text-center text-slate-500 shadow-[0_24px_70px_rgba(37,99,235,0.10)]">
            Loading project details...
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#eef5ff]">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="rounded-[32px] border border-white/80 bg-white/80 p-10 text-center shadow-[0_24px_70px_rgba(37,99,235,0.10)]">
            <h2 className="text-2xl font-black text-slate-900">
              Project not found
            </h2>

            <button
              onClick={() => navigate("/projects")}
              className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef5ff]">
      <Navbar />
      <FloatingResearchDecor />

      {toast.visible && (
        <div
          className={`fixed left-1/2 top-5 z-[9999] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-black shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl ${
            toast.type === "error"
              ? "border-rose-200 bg-white text-rose-600"
              : "border-emerald-200 bg-white text-emerald-700"
          }`}
          style={{ animation: "toastSlideDown 0.22s ease-out" }}
        >
          {toast.type === "error" ? (
            <XCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span className="whitespace-nowrap">{toast.message}</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-300/40 blur-[120px]" />
        <div className="absolute right-[-100px] top-20 h-[420px] w-[420px] rounded-full bg-cyan-300/30 blur-[130px]" />
        <div className="absolute bottom-[-160px] left-[22%] h-[520px] w-[520px] rounded-full bg-violet-200/35 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.30]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.12) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white/80 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            onClick={() => navigate(`/projects/${id}/milestones`)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(37,99,235,0.20)] transition hover:-translate-y-0.5"
          >
            <FolderKanban size={17} />
            Open Milestones
          </button>
        </div>

        <section className="mb-8 overflow-hidden rounded-[34px] border border-white/80 bg-white/75 shadow-[0_24px_70px_rgba(37,99,235,0.12)] backdrop-blur-xl">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#dbeafe] via-[#eef6ff] to-[#cfe7ff] px-6 py-8 md:px-8">
            <div
              className="absolute inset-0 opacity-[0.22]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.18) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />

            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/35 blur-3xl" />
            <div className="absolute bottom-[-90px] left-1/3 h-64 w-64 rounded-full bg-violet-300/25 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-black text-blue-700 shadow-sm">
                    {project.researchField || "General Research"}
                  </span>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black ${statusBadgeClass}`}
                  >
                    {statusText}
                  </span>
                </div>

                <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-950 md:text-6xl">
                  {project.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
                  <div className="inline-flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white shadow">
                      {(project.owner?.username || "R").charAt(0).toUpperCase()}
                    </div>

                    <span>
                      By{" "}
                      <span className="font-black text-slate-900">
                        {project.owner?.username || "Researcher"}
                      </span>
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2">
                    <CalendarDays size={16} className="text-blue-500" />
                    Created on {formattedCreatedAt}
                  </div>

                  <div className="inline-flex items-center gap-2">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    {project.feedbackCount || project.reviewCount || 0} reviews
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:items-end">
                <div className="flex flex-wrap items-center justify-start gap-3 sm:justify-end">
                  <button
                    onClick={() => setFeedbackOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white/85 px-5 py-3 font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700"
                  >
                    <Star size={17} className="fill-amber-400 text-amber-400" />
                    Give Feedback
                  </button>

                  {currentUserId && !isOwnProject && (
                    <>
                      <button
                        onClick={collaborationButtonAction}
                        disabled={collaborationLoading || checkingRequestStatus}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-black shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${collaborationButtonClass}`}
                      >
                        <CollaborationIcon size={17} />
                        {collaborationButtonLabel}
                      </button>

                      {isProjectCollaborator && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                          <CheckCircle2 size={16} />
                          Collaborating
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
          <div className="space-y-6">
            <InfoSection
              title="Abstract"
              icon={FlaskConical}
              content={project.abstract}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
            />

            <InfoSection
              title="Objectives"
              icon={Target}
              content={project.objective}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-100"
            />

            <InfoSection
              title="Methodology"
              icon={Microscope}
              content={project.methodology}
              iconColor="text-violet-600"
              iconBg="bg-violet-100"
            />

            <InfoSection
              title="Expected Outcome"
              icon={Sparkles}
              content={project.expectedOutcome}
              iconColor="text-amber-600"
              iconBg="bg-amber-100"
            />

            <section className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_20px_55px_rgba(37,99,235,0.10)] backdrop-blur-xl">
              <h3 className="mb-5 text-2xl font-black text-slate-950">
                Project Overview
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <MiniCard
                  icon={CalendarDays}
                  title="Start Date"
                  value={formattedStartDate}
                  iconColor="text-blue-600"
                  iconBg="bg-blue-100"
                />

                <MiniCard
                  icon={CalendarDays}
                  title="End Date"
                  value={formattedEndDate}
                  iconColor="text-cyan-600"
                  iconBg="bg-cyan-100"
                />

                <MiniCard
                  icon={Landmark}
                  title="Funding Source"
                  value={project.fundingSource || "Not specified"}
                  iconColor="text-violet-600"
                  iconBg="bg-violet-100"
                />

                <MiniCard
                  icon={FolderKanban}
                  title="Research Field"
                  value={project.researchField || "Not specified"}
                  iconColor="text-emerald-600"
                  iconBg="bg-emerald-100"
                />
              </div>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_20px_55px_rgba(37,99,235,0.10)] backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-3">
                  <Tags size={20} className="text-blue-600" />
                </div>

                <h3 className="text-2xl font-black text-slate-950">
                  Keywords
                </h3>
              </div>

              {project.keywords?.length ? (
                <div className="flex flex-wrap gap-3">
                  {project.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No keywords added yet.</p>
              )}
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_20px_55px_rgba(37,99,235,0.10)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-3">
                    <Users size={20} className="text-emerald-600" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-950">
                      Collaborators
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Project research network
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  {project.collaborators?.length || 0}
                </span>
              </div>

              {project.collaborators?.length ? (
                <div className="space-y-3">
                  {project.collaborators.map((collaborator, index) => {
                    const collaboratorObject =
                      getCollaboratorDisplayObject(collaborator);
                    const collaboratorId = getId(collaboratorObject);
                    const collaboratorName = getCollaboratorName(
                      collaborator,
                      index
                    );
                    const collaboratorEmail = getCollaboratorEmail(collaborator);
                    const collaboratorPictureUrl =
                      getCollaboratorProfilePictureUrl(collaboratorObject);
                    const isRemovingThisCollaborator =
                      removingCollaboratorId &&
                      collaboratorId &&
                      removingCollaboratorId.toString() ===
                        collaboratorId.toString();

                    return (
                      <div
                        key={collaboratorId || index}
                        className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                      >
                        <Link
                          to={
                            collaboratorId
                              ? `/researchers/${collaboratorId}`
                              : "#"
                          }
                          className="flex min-w-0 flex-1 items-center gap-4"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-lg font-black text-emerald-700">
                            {collaboratorPictureUrl ? (
                              <img
                                src={collaboratorPictureUrl}
                                alt={collaboratorName || "Collaborator"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              collaboratorName?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-black text-slate-900">
                              {collaboratorName}
                            </p>

                            <p className="truncate text-sm font-semibold text-slate-500">
                              {collaboratorEmail}
                            </p>
                          </div>

                          <ArrowRight
                            size={17}
                            className="shrink-0 text-slate-400"
                          />
                        </Link>

                        {isOwnProject && collaboratorId && (
                          <button
                            type="button"
                            disabled={Boolean(isRemovingThisCollaborator)}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleOwnerRemoveCollaborator(collaboratorId);
                            }}
                            title="Remove collaborator"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 transition hover:border-rose-200 hover:bg-rose-100 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <Users size={22} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-bold text-slate-800">
                    No collaborators yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Accepted project collaborators will appear here.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_20px_55px_rgba(37,99,235,0.10)] backdrop-blur-xl">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                Project Stats
              </p>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-[#f8fbff] to-[#e7f2ff] p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`rounded-2xl p-3 ${
                        project.status === "completed"
                          ? "bg-emerald-100"
                          : project.status === "ongoing"
                          ? "bg-amber-100"
                          : "bg-slate-100"
                      }`}
                    >
                      {project.status === "completed" ? (
                        <CheckCircle2 size={20} className="text-emerald-600" />
                      ) : (
                        <Clock3
                          size={20}
                          className={
                            project.status === "ongoing"
                              ? "text-amber-600"
                              : "text-slate-600"
                          }
                        />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-slate-900">
                        {statusText}
                      </h4>

                      <p className="text-sm text-slate-500">
                        Status is updated automatically from milestone progress.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-blue-100 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <BarChart3 size={18} className="text-blue-500" />

                      <span className="text-lg font-black text-slate-900">
                        Overall Progress
                      </span>
                    </div>

                    <span className="text-3xl font-black text-slate-950">
                      {progressValue}%
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-4 rounded-full bg-gradient-to-r ${progressColor}`}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    This progress bar is linked directly to completed milestones
                    and subtasks.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_20px_55px_rgba(37,99,235,0.10)] backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-100 p-3">
                  <Network size={20} className="text-cyan-600" />
                </div>

                <h3 className="text-xl font-black text-slate-950">
                  Quick Summary
                </h3>
              </div>

              <div className="space-y-4">
                <QuickStat
                  label="Research Field"
                  value={project.researchField || "Not specified"}
                />
                <QuickStat label="Current Status" value={statusText} />
                <QuickStat
                  label="Milestone Progress"
                  value={`${progressValue}%`}
                />
                <QuickStat label="Start Date" value={formattedStartDate} />
                <QuickStat label="End Date" value={formattedEndDate} />
              </div>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-gradient-to-br from-[#f7fbff] to-[#eaf4ff] p-6 shadow-[0_20px_55px_rgba(37,99,235,0.10)] backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-violet-100 p-3">
                  <MessageSquareText size={20} className="text-violet-600" />
                </div>

                <h3 className="text-xl font-black text-slate-950">
                  Research Note
                </h3>
              </div>

              <p className="text-sm leading-7 text-slate-600">
                To keep this project fully synchronized, update milestone
                titles, deadlines, completion, and subtasks from the Milestones
                page. The project card progress and current status will update
                automatically.
              </p>

              <button
                onClick={() => navigate(`/projects/${id}/milestones`)}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(37,99,235,0.20)] transition hover:-translate-y-0.5"
              >
                <FolderKanban size={17} />
                Manage Milestones
              </button>
            </section>
          </div>
        </section>
      </main>

      {feedbackOpen && (
        <FeedbackModal
          project={project}
          onClose={() => {
            setFeedbackOpen(false);
            fetchProjectDetails();
          }}
        />
      )}
    </div>
  );
};

const InfoSection = ({
  title,
  content,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-100",
}) => {
  return (
    <section className="rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_20px_55px_rgba(37,99,235,0.10)] backdrop-blur-xl">
      <div className="mb-5 flex items-center gap-3">
        <div className={`rounded-2xl p-3 ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>

        <h3 className="text-2xl font-black text-slate-950">{title}</h3>
      </div>

      <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-white to-[#f7fbff] p-5">
        <p className="text-base leading-8 text-slate-600">
          {content?.trim() ? content : "No information added yet."}
        </p>
      </div>
    </section>
  );
};

const MiniCard = ({ icon: Icon, title, value, iconColor, iconBg }) => {
  return (
    <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-white to-[#f7fbff] p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className={`rounded-2xl p-3 ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>

        <span className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
          {title}
        </span>
      </div>

      <p className="text-base font-bold text-slate-800">{value}</p>
    </div>
  );
};

const QuickStat = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
};

export default ProjectDetails;