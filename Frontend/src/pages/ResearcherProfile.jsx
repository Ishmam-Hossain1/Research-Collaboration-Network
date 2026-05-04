import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  Mail,
  UserRound,
  Sparkles,
  Users,
  BookOpen,
  BadgeCheck,
  ArrowRight,
  ShieldCheck,
  Globe,
  BriefcaseBusiness,
  FolderKanban,
  MessageCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useChatSidebar } from "../context/ChatSidebarContext";
import profileHeroImage from "../assets/janko-ferlic-sfL_QOnmy00-unsplash.jpg";

const truncateText = (text, maxLength = 120) => {
  if (!text) return "";
  return text.length > maxLength
    ? `${text.slice(0, maxLength).trim()}...`
    : text;
};

export default function ResearcherProfile() {
  const { id } = useParams();

  const storedUser =
    JSON.parse(localStorage.getItem("researchConnectUser")) || null;

  const { openChatSidebar, setActiveChat } = useChatSidebar();

  const [profile, setProfile] = useState(null);
  const [researcherProjects, setResearcherProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openingChat, setOpeningChat] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 2600);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setLoading(false);
        setError("Researcher id is missing");
        return;
      }

      try {
        const profileRes = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/${id}`
        );

        setProfile(profileRes.data);

        try {
          const projectsRes = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/projects/user/${id}`
          );

          setResearcherProjects(
            Array.isArray(projectsRes.data)
              ? projectsRes.data
              : projectsRes.data.projects || []
          );
        } catch (projectErr) {
          console.error("Failed to load researcher projects", projectErr);
          setResearcherProjects([]);
        }
      } catch (err) {
        console.error("Failed to load researcher profile", err);
        setError("Failed to load researcher profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleOpenChat = async () => {
    if (!storedUser?.id) {
      showToast("Please log in first", "error");
      return;
    }

    if (!id || storedUser.id === id) {
      showToast("You cannot message yourself", "error");
      return;
    }

    try {
      setOpeningChat(true);

      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/chats`, {
        senderId: storedUser.id,
        receiverId: id,
      });

      const chat = res.data?.chat || res.data;

      const normalizedChat = {
        ...chat,
        otherUser: {
          _id: profile?._id || id,
          username: profile?.username || "Researcher",
          email: profile?.email || "",
          profilePictureId: profile?.profilePictureId || null,
        },
        members:
          Array.isArray(chat?.members) && chat.members.length > 0
            ? chat.members
            : [
                {
                  _id: storedUser.id,
                  username: storedUser.username,
                  email: storedUser.email,
                  profilePictureId: storedUser.profilePictureId || null,
                },
                {
                  _id: profile?._id || id,
                  username: profile?.username || "Researcher",
                  email: profile?.email || "",
                  profilePictureId: profile?.profilePictureId || null,
                },
              ],
      };

      setActiveChat(normalizedChat);
      openChatSidebar();
      showToast("Chat opened", "success");
    } catch (err) {
      console.error("Failed to open chat", err);
      showToast(err.response?.data?.message || "Failed to open chat", "error");
    } finally {
      setOpeningChat(false);
    }
  };

  const displayName = profile?.username || "";
  const email = profile?.email || "";
  const collaborators = profile?.collaborators || [];
  const projects = researcherProjects;
  const featuredProjects = projects;

  const profilePictureUrl = profile?.profilePictureId
    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile-picture/${profile.profilePictureId}`
    : "";

  const isOwnProfile = storedUser?.id === id;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <Navbar />

      <style>
        {`
          .researcher-card-link {
            text-decoration: none;
            color: inherit;
            display: block;
            height: 100%;
          }

          .researcher-card-link:hover {
            text-decoration: none;
            color: inherit;
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
            min-height: 365px;
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
          .solution_cards_box .solution_card:hover .solu_email {
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
            color: #475569;
          }

          .solution_cards_box .solution_card .so_top_icon span {
            font-size: 1.35rem;
            font-weight: 700;
            color: #475569;
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

          .project_description_text {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.55;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            min-height: 4.65em;
            transition: color 0.35s ease;
          }

          .solution_cards_box .solution_card:hover .project_description_text {
            color: #fff;
          }

          .collaborator_list {
            background: transparent;
            padding: 0;
          }

          .collaborator_card {
            position: relative;
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            overflow: hidden;
            border-radius: 20px;
            border: 1px solid rgba(226, 232, 240, 0.95);
            background: rgba(255, 255, 255, 0.96);
            padding: 12px;
            box-shadow:
              0 2px 4px rgba(136, 144, 195, 0.12),
              0 8px 18px rgba(37, 44, 97, 0.08);
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease,
              background 0.3s ease,
              border-color 0.3s ease,
              color 0.3s ease;
          }

          .collaborator_card::before {
            content: "";
            position: absolute;
            inset: auto -35px -70px auto;
            width: 120px;
            height: 120px;
            border-radius: 999px;
            background: rgba(54, 81, 207, 0.1);
            transition: transform 0.45s ease, background 0.3s ease;
            z-index: 0;
          }

          .collaborator_card:hover {
            background: #309df0;
            border-color: rgba(48, 157, 240, 0.45);
            color: #fff;
            transform: translateY(-3px);
            box-shadow: 0 16px 28px rgba(15, 23, 42, 0.14);
          }

          .collaborator_card:hover::before {
            transform: scale(2.2);
            background: rgba(255, 255, 255, 0.12);
          }

          .collaborator_avatar {
            position: relative;
            z-index: 1;
            display: flex;
            height: 46px;
            width: 46px;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 999px;
            background: #f1f5f9;
            color: #475569;
            font-size: 0.9rem;
            font-weight: 900;
            border: 1px solid rgba(226, 232, 240, 0.9);
            box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
            transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
          }

          .collaborator_card:hover .collaborator_avatar {
            background: rgba(255, 255, 255, 0.18);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.28);
          }

          .collaborator_avatar img {
            height: 100%;
            width: 100%;
            object-fit: cover;
          }

          .collaborator_content {
            position: relative;
            z-index: 1;
            min-width: 0;
            flex: 1;
          }

          .collaborator_name {
            font-size: 0.92rem;
            font-weight: 800;
            color: #0f172a;
            transition: color 0.3s ease;
          }

          .collaborator_email {
            margin-top: 2px;
            font-size: 0.78rem;
            color: #64748b;
            transition: color 0.3s ease;
          }

          .collaborator_card:hover .collaborator_name,
          .collaborator_card:hover .collaborator_email {
            color: #fff;
          }

          .collaborator_arrow {
            position: relative;
            z-index: 1;
            flex-shrink: 0;
            color: #94a3b8;
            transition: transform 0.3s ease, color 0.3s ease;
          }

          .collaborator_card:hover .collaborator_arrow {
            color: #fff;
            transform: translateX(4px);
          }

          .collaborator_empty {
            border-radius: 20px;
            border: 1px dashed rgba(148, 163, 184, 0.45);
            background: rgba(248, 250, 252, 0.95);
            padding: 20px;
            text-align: center;
            color: #64748b;
            transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
          }

          .collaborator_empty:hover {
            background: #309df0;
            color: #fff;
            border-color: rgba(48, 157, 240, 0.45);
          }

          .collaborator_empty:hover svg,
          .collaborator_empty:hover p {
            color: #fff;
          }

          .project_view_more {
            margin-top: auto;
            display: inline-flex;
            width: fit-content;
            align-items: center;
            gap: 6px;
            border-radius: 14px;
            background: linear-gradient(
              140deg,
              #42c3ca 0%,
              #42c3ca 50%,
              #42c3cac7 75%
            );
            color: #fff;
            font-size: 0.92rem;
            font-weight: 700;
            padding: 11px 16px;
            transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease;
          }

          .solution_cards_box .solution_card:hover .project_view_more {
            background: #fff;
            color: #309df0;
            transform: translateX(4px);
          }

          .message_profile_button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: rgba(255, 255, 255, 0.12);
            color: #fff;
            padding: 12px 16px;
            font-size: 0.875rem;
            font-weight: 800;
            box-shadow: 0 18px 35px rgba(15, 23, 42, 0.18);
            backdrop-filter: blur(12px);
            transition:
              transform 0.25s ease,
              background 0.25s ease,
              color 0.25s ease,
              border-color 0.25s ease;
          }

          .message_profile_button:hover:not(:disabled) {
            transform: translateY(-2px);
            background: #fff;
            color: #0f172a;
            border-color: rgba(255, 255, 255, 0.9);
          }

          .message_profile_button:disabled {
            cursor: not-allowed;
            opacity: 0.6;
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
              min-height: 340px;
              padding: 18px;
            }
          }
        `}
      </style>

      {toast.show && (
        <div className="pointer-events-none fixed left-1/2 top-24 z-[9999] -translate-x-1/2 px-4">
          <div
            className={`animate-toast-center-pop flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold shadow-2xl ring-1 backdrop-blur-md ${
              toast.type === "success"
                ? "bg-white/95 text-emerald-700 ring-emerald-200"
                : "bg-white/95 text-red-700 ring-red-200"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                toast.type === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {toast.type === "success" ? "✓" : "!"}
            </span>

            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <main className="profile-page-enter">
        <section
          className="relative overflow-hidden bg-slate-950"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.74), rgba(15, 23, 42, 0.5)), url(${profileHeroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(56,189,248,0.24),transparent_32%),radial-gradient(circle_at_15%_70%,rgba(99,102,241,0.2),transparent_30%)]" />

          <div className="relative mx-auto max-w-7xl px-4 pb-32 pt-14 sm:px-6 lg:px-8 lg:pb-40 lg:pt-20">
            <div className="max-w-3xl profile-reveal profile-delay-1">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur">
                <Sparkles size={16} className="text-sky-300" />
                Researcher Profile
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Explore this researcher’s work.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                View their expertise, research interests, collaborators, and
                projects before starting a new project collaboration.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenChat}
                  disabled={openingChat || isOwnProfile}
                  className="message_profile_button"
                  title="Open chat"
                  aria-label="Open chat"
                >
                  <MessageCircle size={17} />
                  <span>{openingChat ? "Opening..." : "Message"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto -mt-24 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
            <section className="min-w-0 profile-reveal profile-delay-2">
              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <FeatureCard
                  icon={ShieldCheck}
                  title="Verified workspace"
                  text="Review profile details clearly before connecting."
                />

                <FeatureCard
                  icon={Globe}
                  title="Discoverable research"
                  text="See their fields, topics, and academic direction."
                />

                <FeatureCard
                  icon={BriefcaseBusiness}
                  title="Collaboration ready"
                  text="Visit project details to request project collaboration."
                />
              </div>

              <div className="rounded-[34px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
                <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      Profile Details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Learn more about this researcher and their work.
                    </p>
                  </div>
                </div>

                {loading && (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm font-semibold text-slate-500">
                    Loading researcher profile...
                  </div>
                )}

                {!loading && error && (
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-600">
                    {error}
                  </div>
                )}

                {!loading && !error && (
                  <OverviewTab
                    aboutMe={profile?.aboutMe}
                    relationshipStatus={profile?.relationshipStatus}
                    researchInterests={profile?.researchInterests}
                    skills={profile?.skills}
                  />
                )}
              </div>
            </section>

            <aside className="h-fit rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] profile-reveal profile-delay-3">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-[7px] border-white bg-gradient-to-br from-slate-200 to-slate-100 text-5xl font-black text-slate-500 shadow-2xl">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : displayName ? (
                      displayName.charAt(0).toUpperCase()
                    ) : (
                      <UserRound size={48} />
                    )}
                  </div>
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-950">
                  {displayName || "Researcher"}
                </h2>

                <p className="mt-2 flex max-w-full items-center justify-center gap-2 text-sm text-slate-500">
                  <Mail size={15} />
                  <span className="truncate">
                    {email || "No email available"}
                  </span>
                </p>
              </div>

              <div className="mt-7 border-t border-slate-100 pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                      Collaborators
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Research network
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    {collaborators.length}
                  </span>
                </div>

                <div className="scroll-list-container w-full">
                  <div className="scroll-list no-scrollbar collaborator_list max-h-[300px] space-y-3 rounded-3xl">
                    {collaborators.length > 0 ? (
                      collaborators.map((collaborator, index) => {
                        const collaboratorPictureUrl =
                          collaborator?.profilePictureId
                            ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile-picture/${collaborator.profilePictureId}`
                            : "";

                        return (
                          <Link
                            key={collaborator._id || index}
                            to={`/researchers/${collaborator._id}`}
                            className="collaborator_card"
                          >
                            <div className="collaborator_avatar">
                              {collaboratorPictureUrl ? (
                                <img
                                  src={collaboratorPictureUrl}
                                  alt={collaborator.username || "Collaborator"}
                                />
                              ) : (
                                collaborator?.username
                                  ?.charAt(0)
                                  .toUpperCase() || "U"
                              )}
                            </div>

                            <div className="collaborator_content">
                              <p className="collaborator_name truncate">
                                {collaborator.username ||
                                  `Collaborator ${index + 1}`}
                              </p>

                              <p className="collaborator_email truncate">
                                {collaborator.email || "No email available"}
                              </p>
                            </div>

                            <ArrowRight
                              size={15}
                              className="collaborator_arrow"
                            />
                          </Link>
                        );
                      })
                    ) : (
                      <div className="collaborator_empty">
                        <Users
                          size={22}
                          className="mx-auto mb-2 text-slate-400 transition"
                        />
                        <p className="text-sm font-bold text-slate-800 transition">
                          No collaborators yet
                        </p>
                        <p className="mt-1 text-xs text-slate-500 transition">
                          Accepted collaborators will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-8 profile-reveal profile-delay-4">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Project Showcase
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Projects owned by this researcher.
                </p>
              </div>
            </div>

            {loading && (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm font-semibold text-slate-500">
                Loading projects...
              </div>
            )}

            {!loading && projects.length > 0 && (
              <section className="section_our_solution">
                <div className="our_solution_category">
                  {featuredProjects.map((project, index) => {
                    const projectTitle =
                      project?.title || project?.name || `Project ${index + 1}`;

                    const projectDescription =
                      project?.abstract ||
                      project?.description ||
                      "No project description available yet.";

                    const projectStatus =
                      project?.status || project?.stage || "Ongoing";

                    const projectTag =
                      project?.researchField ||
                      project?.field ||
                      project?.category ||
                      project?.domain ||
                      "Research Project";

                    const projectUrl = project?._id
                      ? `/projects/${project._id}`
                      : "#";

                    return (
                      <Link
                        key={project?._id || index}
                        to={projectUrl}
                        className="researcher-card-link profile-card-reveal"
                      >
                        <div className="solution_cards_box">
                          <article className="solution_card">
                            <div className="hover_color_bubble"></div>

                            <div className="solu_badges">
                              <span className="solu_badge solu_badge_primary">
                                Project
                              </span>
                            </div>

                            <div className="mb-4 min-w-0 overflow-hidden">
                              <div className="solu_meta">
                                Research Connect Project
                              </div>
                              <div className="solu_title">
                                <div>{projectTitle}</div>
                              </div>
                            </div>

                            <div className="solu_metrics">
                              <div className="solu_metric_box">
                                <span className="solu_metric_label">Field</span>
                                <span className="solu_metric_value">
                                  {projectTag}
                                </span>
                              </div>

                              <div className="solu_metric_box">
                                <span className="solu_metric_label">Status</span>
                                <span className="solu_metric_value">
                                  {projectStatus}
                                </span>
                              </div>
                            </div>

                            <div className="mb-5">
                              <span className="solu_section_label">
                                Project Description
                              </span>
                              <p className="project_description_text">
                                {projectDescription}
                              </p>
                            </div>

                            <span className="project_view_more">
                              View more
                              <ArrowRight size={15} />
                            </span>
                          </article>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {!loading && projects.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <FolderKanban
                  size={26}
                  className="mx-auto mb-3 text-slate-400"
                />
                <h3 className="text-base font-black text-slate-800">
                  No projects to showcase yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Projects owned by this researcher will appear here once they
                  are created.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </article>
  );
}

function OverviewTab({
  aboutMe = "",
  relationshipStatus = "",
  researchInterests = [],
  skills = [],
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr,0.85fr]">
      <section className="space-y-6">
        <InfoPanel title="About Me" icon={UserRound}>
          <p className="text-sm leading-8 text-slate-600">
            {aboutMe || "No information added yet."}
          </p>
        </InfoPanel>

        <InfoPanel title="Relationship Status" icon={Users}>
          <p className="text-sm leading-8 text-slate-600">
            {relationshipStatus || "Not added yet."}
          </p>
        </InfoPanel>
      </section>

      <section className="space-y-6">
        <TagPanel
          title="Research Interests"
          icon={BookOpen}
          items={researchInterests}
          emptyText="No research interests added yet."
          color="sky"
        />

        <TagPanel
          title="Core Skills"
          icon={BadgeCheck}
          items={skills}
          emptyText="No skills added yet."
          color="violet"
        />
      </section>
    </div>
  );
}

function InfoPanel({ title, icon: Icon, children }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Icon size={18} />
        </div>
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
      </div>
      {children}
    </article>
  );
}

function TagPanel({ title, icon: Icon, items = [], emptyText, color }) {
  const isSky = color === "sky";

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            isSky ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"
          } ring-1 ${isSky ? "ring-sky-100" : "ring-violet-100"}`}
        >
          <Icon size={18} />
        </div>

        <h3 className="text-lg font-black text-slate-950">{title}</h3>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition hover:-translate-y-0.5 ${
                isSky
                  ? "bg-sky-50 text-sky-700 ring-sky-100"
                  : "bg-violet-50 text-violet-700 ring-violet-100"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
      )}
    </article>
  );
}
