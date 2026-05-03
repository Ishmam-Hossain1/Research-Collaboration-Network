
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import collaborateImage from "../assets/collaborate.jpg";

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

export default function Researchers() {
  const storedUser =
    JSON.parse(localStorage.getItem("researchConnectUser")) || null;

  const [researchers, setResearchers] = useState([]);
  const [suggestedResearchers, setSuggestedResearchers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [error, setError] = useState("");
  const [suggestionsError, setSuggestionsError] = useState("");

  const [search, setSearch] = useState("");
  const [researchInterest, setResearchInterest] = useState("");
  const [skill, setSkill] = useState("");

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

  const fetchResearchers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}/api/users`, {
        params: {
          search,
          researchInterest,
          skill,
          excludeUserId: storedUser?.id || "",
        },
      });

      setResearchers(res.data.researchers || []);
    } catch (err) {
      console.error("Failed to fetch researchers", err);
      setError(err.response?.data?.message || "Failed to load researchers");
      setResearchers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedResearchers = async () => {
    if (!storedUser?.id) {
      setSuggestedResearchers([]);
      return;
    }

    try {
      setSuggestionsLoading(true);
      setSuggestionsError("");

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/users/${storedUser.id}/suggested-collaborators`
      );

      setSuggestedResearchers(res.data.matches || []);
    } catch (err) {
      console.error("Failed to fetch suggested researchers", err);
      setSuggestionsError(
        err.response?.data?.message || "Failed to load suggested researchers"
      );
      setSuggestedResearchers([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchers();
    fetchSuggestedResearchers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResearchers();
  };

  const renderNormalCard = (researcher) => {
    const profilePictureUrl = researcher.profilePictureId
      ? `${import.meta.env.VITE_BACKEND_BASEURL}/api/auth/profile-picture/${researcher.profilePictureId}`
      : "";

    const isCollaborator =
      researcher.collaborators?.some(
        (collaboratorId) => collaboratorId?.toString?.() === storedUser?.id
      ) || false;

    const requestAlreadySent =
      researcher.requestedCollaborations?.some(
        (requesterId) => requesterId?.toString?.() === storedUser?.id
      ) || false;

    const interests = researcher.researchInterests || [];
    const skills = researcher.skills || [];

    const {
      primary: visibleInterests,
      secondary: visibleSkills,
      hiddenCount,
    } = buildVisibleChips(interests, skills, 3);

    return (
      <motion.div key={researcher._id} variants={cardReveal}>
        <Link
          to={`/researchers/${researcher._id}`}
          className="researcher-card-link"
        >
          <div className="solution_cards_box">
            <div className="solution_card">
              <div className="hover_color_bubble"></div>

              <div className="solu_badges">
                <span className="solu_badge solu_badge_primary">
                  Researcher
                </span>

                {isCollaborator && (
                  <span className="solu_badge solu_badge_success">
                    Collaborator
                  </span>
                )}

                {!isCollaborator && requestAlreadySent && (
                  <span className="solu_badge solu_badge_match">
                    Request Sent
                  </span>
                )}
              </div>

              <div className="solu_top_row">
                <div className="so_top_icon">
                  {profilePictureUrl ? (
                    <img src={profilePictureUrl} alt={researcher.username} />
                  ) : (
                    <span>
                      {researcher.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="solu_meta">Research Connect Directory</div>
                  <div className="solu_title">
                    <div>{researcher.username}</div>
                  </div>
                  <div className="solu_email">{researcher.email}</div>
                </div>
              </div>

              <div className="solu_metrics">
                <div className="solu_metric_box">
                  <span className="solu_metric_label">Interests</span>
                  <span className="solu_metric_value">{interests.length}</span>
                </div>

                <div className="solu_metric_box">
                  <span className="solu_metric_label">Skills</span>
                  <span className="solu_metric_value">{skills.length}</span>
                </div>

                <div className="solu_metric_box">
                  <span className="solu_metric_label">Status</span>
                  <span className="solu_metric_value">
                    {isCollaborator
                      ? "Connected"
                      : requestAlreadySent
                      ? "Pending"
                      : "Available"}
                  </span>
                </div>

                <div className="solu_metric_box">
                  <span className="solu_metric_label">Top Focus</span>
                  <span className="solu_metric_value">
                    {interests[0] || "General"}
                  </span>
                </div>
              </div>

              <div>
                <span className="solu_section_label">Interests & Skills</span>

                <div className="solu_chip_group">
                  {visibleInterests.map((interest) => (
                    <span key={interest} className="solu_chip">
                      {interest}
                    </span>
                  ))}

                  {visibleSkills.map((item) => (
                    <span key={item} className="solu_chip">
                      {item}
                    </span>
                  ))}

                  {hiddenCount > 0 && (
                    <span className="solu_chip">+{hiddenCount} more</span>
                  )}
                </div>
              </div>

              <div className="solu_footer_button">
                <span
                  className="researcher_view_more"
                  onClick={(e) => e.preventDefault()}
                >
                  View more
                  <span className="material-symbols-outlined researcher_view_more_icon">
                    arrow_forward
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  const renderSuggestedCard = (match) => {
    const researcher = match.user;
    if (!researcher) return null;

    const researcherId = researcher._id || researcher.id;

    const profilePictureUrl = researcher.profilePictureId
      ? `${import.meta.env.VITE_BACKEND_BASEURL}/api/auth/profile-picture/${researcher.profilePictureId}`
      : "";

    const sharedInterests = match.sharedInterests || [];
    const sharedSkills = match.sharedSkills || [];

    const {
      primary: visibleInterests,
      secondary: visibleSkills,
      hiddenCount,
    } = buildVisibleChips(sharedInterests, sharedSkills, 3);

    return (
      <motion.div key={researcherId} variants={cardReveal}>
        <Link
          to={`/researchers/${researcherId}`}
          className="researcher-card-link"
        >
          <div className="solution_cards_box">
            <div className="solution_card suggested_solution_card">
              <div className="hover_color_bubble"></div>

              <div className="solu_badges">
                <span className="solu_badge solu_badge_match">
                  AI Suggested
                </span>
                <span className="solu_badge solu_badge_primary">
                  {match.matchScore || 0}% Match
                </span>
              </div>

              <div className="solu_top_row">
                <div className="so_top_icon">
                  {profilePictureUrl ? (
                    <img src={profilePictureUrl} alt={researcher.username} />
                  ) : (
                    <span>
                      {researcher.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="solu_meta">Research Connect AI Match</div>
                  <div className="solu_title">
                    <div>{researcher.username}</div>
                  </div>
                  <div className="solu_email">{researcher.email}</div>
                </div>
              </div>

              <div className="solu_metrics">
                <div className="solu_metric_box">
                  <span className="solu_metric_label">Score</span>
                  <span className="solu_metric_value">
                    {match.matchScore || 0}%
                  </span>
                </div>

                <div className="solu_metric_box">
                  <span className="solu_metric_label">Shared Interests</span>
                  <span className="solu_metric_value">
                    {sharedInterests.length}
                  </span>
                </div>

                <div className="solu_metric_box">
                  <span className="solu_metric_label">Shared Skills</span>
                  <span className="solu_metric_value">
                    {sharedSkills.length}
                  </span>
                </div>

                <div className="solu_metric_box">
                  <span className="solu_metric_label">Top Focus</span>
                  <span className="solu_metric_value">
                    {researcher.researchInterests?.[0] || "General"}
                  </span>
                </div>
              </div>

              <div>
                <span className="solu_section_label">Shared Attributes</span>

                <div className="solu_chip_group">
                  {visibleInterests.map((item) => (
                    <span key={item} className="solu_chip">
                      {item}
                    </span>
                  ))}

                  {visibleSkills.map((item) => (
                    <span key={item} className="solu_chip">
                      {item}
                    </span>
                  ))}

                  {hiddenCount > 0 && (
                    <span className="solu_chip">+{hiddenCount} more</span>
                  )}
                </div>
              </div>

              <div className="solu_footer_button">
                <span
                  className="researcher_view_more"
                  onClick={(e) => e.preventDefault()}
                >
                  View more
                  <span className="material-symbols-outlined researcher_view_more_icon">
                    arrow_forward
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Link>
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

          .hero-overlay {
            background: linear-gradient(
              to bottom,
              rgba(0, 23, 75, 0.68),
              rgba(15, 23, 42, 0.9)
            );
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.72);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.45);
            box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.04);
          }

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

          .solution_cards_box .solution_card:hover .solu_description button {
            background: #fff !important;
            color: #309df0;
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

          .solution_card .solu_description {
            margin-top: auto;
          }

          .solution_card .solu_description button {
            border: 0;
            border-radius: 14px;
            background: linear-gradient(
              140deg,
              #42c3ca 0%,
              #42c3ca 50%,
              #42c3cac7 75%
            ) !important;
            color: #fff;
            font-weight: 600;
            font-size: 0.96rem;
            padding: 12px 18px;
            cursor: pointer;
            transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease;
          }

          .solution_card .solu_description button:hover {
            transform: translateX(4px);
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

          .solu_footer_button {
            margin-top: auto;
            display: flex;
            justify-content: flex-end;
            align-items: flex-end;
          }

          .researcher_view_more {
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
            cursor: default;
            transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease;
          }

          .researcher_view_more_icon {
            font-size: 16px;
            line-height: 1;
          }

          .solution_cards_box .solution_card:hover .researcher_view_more {
            background: #fff;
            color: #309df0;
            transform: translateX(4px);
          }

          .suggested_solution_card {
            animation: pulseGlow 2.8s infinite;
          }

          @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(48, 157, 240, 0.25); }
            70% { box-shadow: 0 0 0 12px rgba(48, 157, 240, 0); }
            100% { box-shadow: 0 0 0 0 rgba(48, 157, 240, 0); }
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

            .solution_card .solu_title div {
              font-size: 1.4rem;
            }
          }
        `}
      </style>

      <Navbar />

      <main>
        <section className="relative flex h-[614px] min-h-[500px] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="Grand Library"
              className="h-full w-full object-cover"
              src={collaborateImage}
            />
            <div className="hero-overlay absolute inset-0"></div>
          </div>

          <div className="relative z-10 mt-8 max-w-5xl px-6 text-center md:px-8">
            <span className="mb-4 block text-xs font-semibold uppercase tracking-widest text-blue-400">
              Global Research Network
            </span>

            <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-white md:text-5xl">
              Find Your Next Research Partner.
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-base text-slate-300 md:text-lg">
              Connect with researchers across disciplines. Bridge the gap
              between ideas, skills, projects, and collaboration opportunities.
            </p>

            <form
              onSubmit={handleSearch}
              className="glass-card mx-auto flex max-w-4xl flex-col items-center gap-2 rounded-2xl p-2 md:flex-row"
            >
              <div className="flex h-12 w-full flex-1 items-center gap-3 border-b border-slate-200/50 px-4 md:border-b-0 md:border-r">
                <span className="material-symbols-outlined text-slate-400">
                  person_search
                </span>
                <input
                  className="w-full border-none bg-transparent text-base text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-0"
                  placeholder="Search by name or email"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex h-12 w-full flex-1 items-center gap-3 border-b border-slate-200/50 px-4 md:border-b-0 md:border-r">
                <span className="material-symbols-outlined text-slate-400">
                  science
                </span>
                <input
                  className="w-full border-none bg-transparent text-base text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-0"
                  placeholder="Research interest"
                  type="text"
                  value={researchInterest}
                  onChange={(e) => setResearchInterest(e.target.value)}
                />
              </div>

              <div className="flex h-12 w-full flex-1 items-center gap-3 px-4 md:w-auto">
                <span className="material-symbols-outlined text-slate-400">
                  build
                </span>
                <input
                  className="w-full border-none bg-transparent text-base text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-0"
                  placeholder="Skill"
                  type="text"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 md:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">
                  search
                </span>
                Explore Directory
              </button>
            </form>
          </div>
        </section>

        {storedUser && (
          <section className="relative z-20 mx-auto mb-12 -mt-16 max-w-[1280px] px-6 md:px-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="font-serif text-2xl font-semibold text-white shadow-sm">
                AI-Matched Collaborators
              </h2>

              <div className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></span>
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-100">
                  Live Matching Active
                </span>
              </div>
            </div>

            {suggestionsLoading && (
              <div className="glass-card rounded-3xl p-6 text-center text-sm text-slate-500">
                Loading suggested collaborators...
              </div>
            )}

            {!suggestionsLoading && suggestionsError && (
              <div className="glass-card rounded-3xl border-amber-200 bg-amber-50/50 p-6 text-sm text-amber-700">
                {suggestionsError}
              </div>
            )}

            {!suggestionsLoading &&
              !suggestionsError &&
              suggestedResearchers.length > 0 && (
                <motion.section
                  className="section_our_solution"
                  variants={gridContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.18 }}
                >
                  <div className="our_solution_category">
                    {suggestedResearchers.map(renderSuggestedCard)}
                  </div>
                </motion.section>
              )}

            {!suggestionsLoading &&
              !suggestionsError &&
              suggestedResearchers.length === 0 && (
                <div className="glass-card rounded-3xl p-6 text-center text-sm text-slate-500">
                  No AI-matched collaborators found. Update your profile to get
                  better matches.
                </div>
              )}
          </section>
        )}

        <section
          className={`mx-auto max-w-[1280px] px-6 pb-20 md:px-8 ${
            !storedUser ? "mt-12 pt-20" : ""
          }`}
        >
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <h2 className="mb-4 font-serif text-4xl font-semibold text-slate-900">
                Researcher Directory
              </h2>
              <p className="text-base text-slate-500">
                Browse all researchers in the directory. Filter by expertise,
                interests, or skills to find your ideal research partner.
              </p>
            </div>


          </div>

          {loading && (
            <div className="glass-card flex flex-col items-center rounded-3xl p-12 text-center text-slate-500">
              <span className="material-symbols-outlined mb-4 animate-spin text-4xl">
                progress_activity
              </span>
              Loading researchers...
            </div>
          )}

          {!loading && error && (
            <div className="glass-card rounded-3xl border-red-200 bg-red-50/50 p-6 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && researchers.length === 0 && (
            <div className="glass-card rounded-3xl p-12 text-center text-slate-500">
              No researchers found matching your criteria.
            </div>
          )}

          {!loading && !error && researchers.length > 0 && (
            <motion.section
              className="section_our_solution"
              variants={gridContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
            >
              <div className="our_solution_category">
                {researchers.map(renderNormalCard)}
              </div>
            </motion.section>
          )}
        </section>
      </main>

      <footer className="mt-auto w-full border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-8 md:flex-row">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-serif text-xl font-bold italic text-slate-900">
              ResearchConnect
            </span>
            <p className="mt-2 text-sm text-slate-500">
              © 2026 ResearchConnect. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <a
              className="text-sm text-slate-500 underline decoration-blue-500/30 underline-offset-4 transition-all hover:text-slate-900"
              href="#"
            >
              About
            </a>
            <a
              className="text-sm text-slate-500 underline decoration-blue-500/30 underline-offset-4 transition-all hover:text-slate-900"
              href="#"
            >
              Methodology
            </a>
            <a
              className="text-sm text-slate-500 underline decoration-blue-500/30 underline-offset-4 transition-all hover:text-slate-900"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-sm text-slate-500 underline decoration-blue-500/30 underline-offset-4 transition-all hover:text-slate-900"
              href="#"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}