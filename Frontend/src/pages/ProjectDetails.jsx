import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  ChevronRight,
  Atom,
  Dna,
  Telescope,
  Brain,
  Network,
  MessageSquareText,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../lib/api";
import FeedbackModal from "../components/FeedbackModal";

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

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error("Failed to fetch project details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

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

              <button
                onClick={() => setFeedbackOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white/85 px-5 py-3 font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700"
              >
                <Star size={17} className="fill-amber-400 text-amber-400" />
                Give Feedback
              </button>
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
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3">
                  <Users size={20} className="text-emerald-600" />
                </div>

                <h3 className="text-2xl font-black text-slate-950">
                  Collaborators
                </h3>
              </div>

              {project.collaborators?.length ? (
                <div className="space-y-3">
                  {project.collaborators.map((collaborator, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl border border-blue-100 bg-slate-50 px-4 py-3"
                    >
                      <span className="font-semibold text-slate-700">
                        {collaborator}
                      </span>

                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No collaborators added yet.</p>
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