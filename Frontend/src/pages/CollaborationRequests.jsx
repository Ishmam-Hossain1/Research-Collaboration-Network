import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_BASEURL}/api`;

const tabs = [
  { id: "received", label: "Received" },
  { id: "sent", label: "Sent" },
];

const gridContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const cardReveal = {
  hidden: {
    opacity: 0,
    y: 42,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function CollaborationRequests() {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("researchConnectUser")) || null;
    } catch {
      return null;
    }
  }, []);

  const currentUserId = storedUser?.id || storedUser?._id || "";

  const [activeTab, setActiveTab] = useState("received");
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

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

  const getRequestKey = (request) => {
    const userId = getId(request?.user || request);
    const projectId = getId(request?.project);

    return `${userId}-${projectId}`;
  };

  const getRequestUser = (request) => {
    if (!request) return null;

    if (request.user && typeof request.user === "object") {
      return request.user;
    }

    return request;
  };

  const getRequestProject = (request) => {
    if (!request) return null;

    if (request.project && typeof request.project === "object") {
      return request.project;
    }

    return null;
  };

  const buildVisibleChips = (
    primaryList = [],
    secondaryList = [],
    maxVisible = 3
  ) => {
    const primary = primaryList.slice(0, 2);
    const remainingSlots = Math.max(maxVisible - primary.length, 0);
    const secondary = secondaryList.slice(0, remainingSlots);

    const totalCount = primaryList.length + secondaryList.length;
    const visibleCount = primary.length + secondary.length;
    const hiddenCount = Math.max(totalCount - visibleCount, 0);

    return { primary, secondary, hiddenCount };
  };

  const fetchRequests = async () => {
    if (!currentUserId) {
      setLoading(false);
      setError("User not logged in");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const [receivedRes, sentRes] = await Promise.all([
        axios.get(
          `${API_BASE_URL}/users/${currentUserId}/collaboration-requests`
        ),
        axios.get(
          `${API_BASE_URL}/users/${currentUserId}/sent-collaboration-requests`
        ),
      ]);

      setReceivedRequests(receivedRes.data?.requests || []);
      setSentRequests(sentRes.data?.requests || []);
    } catch (err) {
      console.error("Failed to load collaboration requests", err);
      setError(err.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUserId]);

  const handleAccept = async (request) => {
    if (!currentUserId) return;

    const requesterUser = getRequestUser(request);
    const project = getRequestProject(request);

    const requesterUserId = getId(requesterUser);
    const projectId = getId(project);
    const requestKey = getRequestKey(request);

    if (!requesterUserId || !projectId) {
      setError("Invalid collaboration request data");
      return;
    }

    try {
      setActionLoadingId(requestKey);
      setError("");
      setSuccessMessage("");

      const res = await axios.post(
        `${API_BASE_URL}/users/collaboration-request/accept`,
        {
          currentUserId,
          requesterUserId,
          projectId,
        }
      );

      setReceivedRequests((prev) =>
        prev.filter((item) => getRequestKey(item) !== requestKey)
      );

      setSuccessMessage(
        res.data?.message || "Collaboration request accepted successfully"
      );
    } catch (err) {
      console.error("Failed to accept collaboration request", err);
      setError(
        err.response?.data?.message || "Failed to accept collaboration request"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleReject = async (request) => {
    if (!currentUserId) return;

    const requesterUser = getRequestUser(request);
    const project = getRequestProject(request);

    const requesterUserId = getId(requesterUser);
    const projectId = getId(project);
    const requestKey = getRequestKey(request);

    if (!requesterUserId || !projectId) {
      setError("Invalid collaboration request data");
      return;
    }

    try {
      setActionLoadingId(requestKey);
      setError("");
      setSuccessMessage("");

      const res = await axios.post(
        `${API_BASE_URL}/users/collaboration-request/reject`,
        {
          currentUserId,
          requesterUserId,
          projectId,
        }
      );

      setReceivedRequests((prev) =>
        prev.filter((item) => getRequestKey(item) !== requestKey)
      );

      setSuccessMessage(
        res.data?.message || "Collaboration request rejected successfully"
      );
    } catch (err) {
      console.error("Failed to reject collaboration request", err);
      setError(
        err.response?.data?.message || "Failed to reject collaboration request"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleCancelSentRequest = async (request) => {
    if (!currentUserId) return;

    const receiverUser = getRequestUser(request);
    const project = getRequestProject(request);

    const toUserId = getId(receiverUser);
    const projectId = getId(project);
    const requestKey = getRequestKey(request);

    if (!toUserId || !projectId) {
      setError("Invalid sent request data");
      return;
    }

    try {
      setActionLoadingId(requestKey);
      setError("");
      setSuccessMessage("");

      const res = await axios.post(
        `${API_BASE_URL}/users/collaboration-request/cancel`,
        {
          fromUserId: currentUserId,
          toUserId,
          projectId,
        }
      );

      setSentRequests((prev) =>
        prev.filter((item) => getRequestKey(item) !== requestKey)
      );

      setSuccessMessage(
        res.data?.message || "Collaboration request cancelled successfully"
      );
    } catch (err) {
      console.error("Failed to cancel collaboration request", err);

      const backendMessage =
        err.response?.data?.message || "Failed to cancel collaboration request";

      if (
        backendMessage.toLowerCase().includes("not found") ||
        backendMessage.toLowerCase().includes("no pending")
      ) {
        setSentRequests((prev) =>
          prev.filter((item) => getRequestKey(item) !== requestKey)
        );
        setSuccessMessage("No pending request found");
        setError("");
      } else {
        setError(backendMessage);
      }
    } finally {
      setActionLoadingId("");
    }
  };

  const requestsToShow =
    activeTab === "received" ? receivedRequests : sentRequests;

  const renderRequestCard = (request) => {
    const researcher = getRequestUser(request);
    const project = getRequestProject(request);

    const researcherId = getId(researcher);
    const projectId = getId(project);
    const requestKey = getRequestKey(request);

    const profilePictureUrl = researcher?.profilePictureId
      ? `${API_BASE_URL}/auth/profile-picture/${researcher.profilePictureId}`
      : "";

    const isProcessing = actionLoadingId === requestKey;

    const interests = researcher?.researchInterests || [];
    const skills = researcher?.skills || [];

    const {
      primary: visibleInterests,
      secondary: visibleSkills,
      hiddenCount,
    } = buildVisibleChips(interests, skills, 3);

    return (
      <motion.div key={requestKey} variants={cardReveal}>
        <div className="solution_cards_box">
          <article className="solution_card request_solution_card">
            <div className="hover_color_bubble"></div>

            <div className="solu_badges">
              <span className="solu_badge solu_badge_primary">
                {activeTab === "received" ? "Received" : "Sent"}
              </span>

              <span className="solu_badge solu_badge_match">Project Request</span>

              <span className="solu_badge solu_badge_warning">Pending</span>
            </div>

            <div className="solu_top_row">
              <Link
                to={researcherId ? `/researchers/${researcherId}` : "#"}
                className="so_top_icon"
              >
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={researcher?.username || "User"}
                  />
                ) : (
                  <span>
                    {researcher?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="solu_meta">
                  {activeTab === "received"
                    ? "Request From"
                    : "Request Sent To"}
                </div>

                <Link
                  to={researcherId ? `/researchers/${researcherId}` : "#"}
                  className="solu_title block"
                >
                  <div>{researcher?.username || "Unknown user"}</div>
                </Link>

                <div className="solu_email">
                  {researcher?.email || "No email available"}
                </div>
              </div>
            </div>

            <div className="solu_metrics">
              <div className="solu_metric_box">
                <span className="solu_metric_label">Project</span>
                <span className="solu_metric_value">
                  {project?.title || "Untitled"}
                </span>
              </div>

              <div className="solu_metric_box">
                <span className="solu_metric_label">Field</span>
                <span className="solu_metric_value">
                  {project?.researchField || "General"}
                </span>
              </div>

              <div className="solu_metric_box">
                <span className="solu_metric_label">Interests</span>
                <span className="solu_metric_value">{interests.length}</span>
              </div>

              <div className="solu_metric_box">
                <span className="solu_metric_label">Skills</span>
                <span className="solu_metric_value">{skills.length}</span>
              </div>
            </div>

            <div className="mb-3">
              <span className="solu_section_label">Request Summary</span>

              <p className="request_summary_text">
                {activeTab === "received" ? (
                  <>
                    {researcher?.username || "This user"} wants to collaborate
                    on{" "}
                    <Link
                      to={projectId ? `/projects/${projectId}` : "#"}
                      className="request_inline_link"
                    >
                      {project?.title || "Untitled Project"}
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    You sent {researcher?.username || "this user"} a
                    collaboration request for{" "}
                    <Link
                      to={projectId ? `/projects/${projectId}` : "#"}
                      className="request_inline_link"
                    >
                      {project?.title || "Untitled Project"}
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>

            <div className="mb-4">
              <span className="solu_section_label">Interests & Skills</span>

              <div className="solu_chip_group">
                {visibleInterests.map((interest) => (
                  <span key={interest} className="solu_chip">
                    {interest}
                  </span>
                ))}

                {visibleSkills.map((skill) => (
                  <span key={skill} className="solu_chip">
                    {skill}
                  </span>
                ))}

                {hiddenCount > 0 && (
                  <span className="solu_chip">+{hiddenCount} more</span>
                )}

                {hiddenCount === 0 &&
                  visibleInterests.length === 0 &&
                  visibleSkills.length === 0 && (
                    <span className="solu_chip">No profile tags</span>
                  )}
              </div>
            </div>

            <div className="request_actions">
              {activeTab === "received" ? (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAccept(request)}
                    className="request_action_button request_accept_button"
                  >
                    {isProcessing ? "Processing..." : "Accept"}
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleReject(request)}
                    className="request_action_button request_reject_button"
                  >
                    {isProcessing ? "Processing..." : "Reject"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleCancelSentRequest(request)}
                  className="request_action_button request_cancel_button"
                >
                  {isProcessing ? "Cancelling..." : "Cancel Request"}
                </button>
              )}

              {researcherId && (
                <Link
                  to={`/researchers/${researcherId}`}
                  className="request_action_button request_secondary_button"
                >
                  View Researcher
                </Link>
              )}

              {projectId && (
                <Link
                  to={`/projects/${projectId}`}
                  className="request_action_button request_project_button"
                >
                  View Project
                </Link>
              )}
            </div>
          </article>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen text-[#191c1e] selection:bg-[#dbe1ff] selection:text-[#00174b] mesh-bg">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

          .mesh-bg {
            background-color: #f7f9fb;
            background-image:
              radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.06) 0px, transparent 50%),
              radial-gradient(at 100% 0%, rgba(37, 99, 235, 0.06) 0px, transparent 50%);
            background-size: 200% 200%;
            animation: gradientMove 14s ease infinite;
          }

          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.72);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.45);
            box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.04);
          }

          .section_our_solution .row {
            align-items: center;
          }

          .our_solution_category {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
            gap: 20px;
            align-items: stretch;
          }

          .our_solution_category .solution_cards_box {
            display: flex;
            width: 100%;
            height: 100%;
            min-width: 0;
          }

          .solution_cards_box .solution_card {
            width: 100%;
            min-height: 420px;
            background: #fff;
            box-shadow:
              0 2px 4px 0 rgba(136, 144, 195, 0.2),
              0 5px 15px 0 rgba(37, 44, 97, 0.15);
            border-radius: 18px;
            margin: 0;
            padding: 20px 20px 16px;
            position: relative;
            z-index: 1;
            overflow: hidden;
            transition: transform 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
            border: 1px solid rgba(226, 232, 240, 0.9);
            display: flex;
            flex-direction: column;
          }

          .solution_cards_box .solution_card:hover {
            background: #309df0;
            color: #fff;
            transform: translateY(-8px) scale(1.01);
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.14);
            z-index: 9;
          }

          .solution_cards_box .solution_card:hover::before {
            background: rgb(85 108 214 / 10%);
          }

          .solution_cards_box .solution_card:hover .solu_title div,
          .solution_cards_box .solution_card:hover .solu_meta,
          .solution_cards_box .solution_card:hover .solu_metric_label,
          .solution_cards_box .solution_card:hover .solu_metric_value,
          .solution_cards_box .solution_card:hover .solu_section_label,
          .solution_cards_box .solution_card:hover .solu_email,
          .solution_cards_box .solution_card:hover .request_summary_text,
          .solution_cards_box .solution_card:hover .request_inline_link {
            color: #fff;
          }

          .solution_cards_box .solution_card:hover .solu_chip {
            background: rgba(255, 255, 255, 0.18);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.24);
          }

          .solution_cards_box .solution_card:before {
            content: "";
            position: absolute;
            background: rgb(85 108 214 / 5%);
            width: 170px;
            height: 400px;
            z-index: -1;
            transform: rotate(42deg);
            right: -56px;
            top: -23px;
            border-radius: 35px;
          }

          .hover_color_bubble {
            position: absolute;
            background: rgb(54 81 207 / 15%);
            width: 100rem;
            height: 100rem;
            z-index: -1;
            top: 16rem;
            border-radius: 50%;
            transform: rotate(-36deg);
            left: -18rem;
            transition: 0.7s;
          }

          .solution_cards_box .solution_card:hover .hover_color_bubble {
            top: 0rem;
          }

          .solution_cards_box .solution_card .so_top_icon {
            width: 74px;
            height: 74px;
            min-width: 74px;
            border-radius: 50%;
            background: #fff;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
            border: 1px solid rgba(226, 232, 240, 0.85);
            text-decoration: none;
          }

          .solution_cards_box .solution_card .so_top_icon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s ease;
          }

          .solution_cards_box .solution_card:hover .so_top_icon img {
            transform: scale(1.12);
          }

          .solution_cards_box .solution_card .so_top_icon span {
            font-size: 1.35rem;
            font-weight: 700;
            color: #475569;
          }

          .solution_card .solu_title {
            text-decoration: none;
            color: inherit;
          }

          .solution_card .solu_title div {
            color: #212121;
            font-size: 1.4rem;
            margin-top: 6px;
            margin-bottom: 6px;
            font-weight: 700;
            line-height: 1.15;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .solu_badges {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 12px;
            min-height: 32px;
          }

          .solu_badge {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            padding: 7px 13px;
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            transition: transform 0.3s ease;
          }

          .solution_card:hover .solu_badge {
            transform: translateY(-1px);
          }

          .solu_badge_primary {
            background: rgba(59, 130, 246, 0.12);
            color: #0369a1;
          }

          .solu_badge_success {
            background: rgba(34, 197, 94, 0.14);
            color: #15803d;
          }

          .solu_badge_match {
            background: rgba(139, 92, 246, 0.14);
            color: #6d28d9;
          }

          .solu_badge_warning {
            background: rgba(245, 158, 11, 0.14);
            color: #b45309;
          }

          .solu_top_row {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
            min-height: 86px;
          }

          .solu_meta {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #64748b;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .solu_email {
            font-size: 0.95rem;
            color: #64748b;
            margin-top: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .solu_metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 6px;
            margin-bottom: 12px;
          }

          .solu_metric_box {
            border-left: 2px solid rgba(48, 157, 240, 0.16);
            padding-left: 12px;
          }

          .solu_metric_label {
            font-size: 0.68rem;
            text-transform: uppercase;
            color: rgba(15, 23, 42, 0.5);
            margin-bottom: 6px;
            display: block;
            font-weight: 600;
          }

          .solu_metric_value {
            font-size: 1.05rem;
            font-weight: 600;
            color: #1e293b;
            word-break: break-word;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .solu_section_label {
            font-size: 0.72rem;
            text-transform: uppercase;
            color: rgba(15, 23, 42, 0.5);
            margin-bottom: 10px;
            display: block;
            font-weight: 700;
            letter-spacing: 0.08em;
          }

          .solu_chip_group {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 12px;
            min-height: auto;
            align-content: flex-start;
          }

          .solu_chip {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            padding: 7px 13px;
            font-size: 0.74rem;
            font-weight: 600;
            border: 1px solid rgba(148, 163, 184, 0.22);
            background: rgba(248, 250, 252, 0.95);
            color: #334155;
            max-width: 150px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
          }

          .solu_chip:hover {
            transform: scale(1.05);
          }

          .request_summary_text {
            color: #475569;
            font-size: 0.92rem;
            line-height: 1.6;
            min-height: 44px;
            transition: color 0.35s ease;
          }

          .request_inline_link {
            color: #0369a1;
            font-weight: 800;
            text-decoration: none;
            transition: color 0.35s ease;
          }

          .request_inline_link:hover {
            text-decoration: underline;
          }

          .request_actions {
            margin-top: auto;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
          }

          .request_action_button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            padding: 10px 13px;
            font-size: 0.78rem;
            font-weight: 800;
            border: 1px solid transparent;
            transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
            text-decoration: none;
            cursor: pointer;
          }

          .request_action_button:hover {
            transform: translateY(-2px);
          }

          .request_action_button:disabled {
            cursor: not-allowed;
            opacity: 0.6;
            transform: none;
          }

          .request_accept_button {
            background: #10b981;
            color: #fff;
          }

          .request_reject_button {
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
            border-color: rgba(239, 68, 68, 0.18);
          }

          .request_cancel_button {
            background: rgba(249, 115, 22, 0.1);
            color: #ea580c;
            border-color: rgba(249, 115, 22, 0.18);
          }

          .request_secondary_button {
            background: rgba(15, 23, 42, 0.04);
            color: #475569;
            border-color: rgba(148, 163, 184, 0.22);
          }

          .request_project_button {
            background: linear-gradient(
              140deg,
              #42c3ca 0%,
              #42c3ca 50%,
              #42c3cac7 75%
            );
            color: #fff;
          }

          .solution_cards_box .solution_card:hover .request_secondary_button,
          .solution_cards_box .solution_card:hover .request_reject_button,
          .solution_cards_box .solution_card:hover .request_cancel_button {
            background: rgba(255, 255, 255, 0.18);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.28);
          }

          .solution_cards_box .solution_card:hover .request_project_button,
          .solution_cards_box .solution_card:hover .request_accept_button {
            background: #fff;
            color: #309df0;
          }

          @media (min-width: 1280px) {
            .our_solution_category {
              grid-template-columns: repeat(3, minmax(320px, 365px));
            }
          }

          @media (min-width: 768px) and (max-width: 1279px) {
            .our_solution_category {
              grid-template-columns: repeat(2, minmax(300px, 1fr));
            }
          }

          @media (max-width: 767px) {
            .our_solution_category {
              grid-template-columns: 1fr;
            }

            .solution_cards_box .solution_card {
              width: 100%;
              min-height: 400px;
              padding: 18px;
            }

            .solution_card .solu_title div {
              font-size: 1.3rem;
            }
          }
        `}
      </style>

      <Navbar />

      <main className="mx-auto max-w-[1280px] px-6 py-12 md:px-8 md:py-16">
        <header className="mb-8">
          <div className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700">
            Collaboration requests
          </div>

          <h1 className="font-serif text-4xl font-semibold text-slate-900 md:text-5xl">
            Manage your <span className="text-blue-600">collaborations</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
            Review project collaboration requests you received and track the
            ones you already sent.
          </p>
        </header>

        <div className="mb-8 flex gap-6 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError("");
                setSuccessMessage("");
              }}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-b-2 border-sky-500 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="glass-card flex flex-col items-center rounded-3xl p-12 text-center text-slate-500">
            <span className="material-symbols-outlined mb-4 animate-spin text-4xl">
              progress_activity
            </span>
            Loading requests...
          </div>
        )}

        {!loading && error && (
          <div className="glass-card mb-6 rounded-3xl border-red-200 bg-red-50/50 p-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && successMessage && (
          <div className="glass-card mb-6 rounded-3xl border-emerald-200 bg-emerald-50/50 p-6 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {!loading && !error && requestsToShow.length === 0 && (
          <div className="glass-card rounded-3xl p-12 text-center text-slate-500">
            No {activeTab} requests yet.
          </div>
        )}

        {!loading && requestsToShow.length > 0 && (
          <motion.section
            className="section_our_solution"
            variants={gridContainer}
            initial="hidden"
            animate="visible"
          >
            <div className="our_solution_category">
              {requestsToShow.map(renderRequestCard)}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}