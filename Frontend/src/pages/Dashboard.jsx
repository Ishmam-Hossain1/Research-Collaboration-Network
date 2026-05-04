import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FolderKanban,
  Clock3,
  CheckCircle2,
  FlaskConical,
  Filter,
  CalendarDays,
  Users,
  Tags,
  Landmark,
  Trash2,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  Pencil,
  Plus,
  BarChart3,
  Layers3,
  Atom,
  Microscope,
  Dna,
  Network,
  CircuitBoard,
  Cpu,
  Telescope,
  Binary,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import CreateProjectModal from "../components/CreateProjectModal";
import EditProjectModal from "../components/EditProjectModal";

const ALL_RESEARCH_FIELDS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Data Science",
  "Big Data Analytics",
  "Cybersecurity",
  "Blockchain",
  "Cloud Computing",
  "Internet of Things",
  "Computer Vision",
  "Natural Language Processing",
  "Bioinformatics",
  "Health Informatics",
  "Robotics",
  "Networking",
  "Software Engineering",
  "Human-Computer Interaction",
  "Information Systems",
  "Distributed Systems",
  "Quantum Computing",
  "Augmented Reality",
  "Virtual Reality",
  "Digital Signal Processing",
  "Embedded Systems",
  "Computational Biology",
  "E-commerce Technology",
  "Educational Technology",
  "Smart Agriculture",
  "Renewable Energy Systems",
];

const FloatingResearchObjects = () => {
  const objects = [
    {
      icon: Atom,
      className: "left-4 top-32",
      color: "text-cyan-600",
      bg: "from-cyan-200/85 to-blue-200/65",
      animation: "animate-[floatOne_7s_ease-in-out_infinite]",
    },
    {
      icon: Microscope,
      className: "left-5 top-[46%]",
      color: "text-violet-600",
      bg: "from-violet-200/85 to-fuchsia-200/65",
      animation: "animate-[floatTwo_8s_ease-in-out_infinite]",
    },
    {
      icon: Dna,
      className: "left-8 bottom-28",
      color: "text-emerald-600",
      bg: "from-emerald-200/85 to-cyan-200/65",
      animation: "animate-[floatThree_9s_ease-in-out_infinite]",
    },
    {
      icon: Telescope,
      className: "left-20 top-[68%]",
      color: "text-blue-600",
      bg: "from-blue-200/85 to-indigo-200/65",
      animation: "animate-[floatOne_8s_ease-in-out_infinite]",
    },
    {
      icon: Network,
      className: "right-4 top-36",
      color: "text-blue-600",
      bg: "from-blue-200/85 to-cyan-200/65",
      animation: "animate-[floatTwo_7s_ease-in-out_infinite]",
    },
    {
      icon: CircuitBoard,
      className: "right-5 top-[50%]",
      color: "text-amber-600",
      bg: "from-amber-200/85 to-orange-200/65",
      animation: "animate-[floatThree_8s_ease-in-out_infinite]",
    },
    {
      icon: Binary,
      className: "right-8 bottom-28",
      color: "text-pink-600",
      bg: "from-pink-200/85 to-violet-200/65",
      animation: "animate-[floatOne_9s_ease-in-out_infinite]",
    },
    {
      icon: Cpu,
      className: "right-20 top-[70%]",
      color: "text-cyan-600",
      bg: "from-cyan-200/85 to-teal-200/65",
      animation: "animate-[floatTwo_8s_ease-in-out_infinite]",
    },
  ];

  return (
    <>
      <style>
        {`
          @keyframes floatOne {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-18px) rotate(7deg);
            }
          }

          @keyframes floatTwo {
            0%, 100% {
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-14px) translateX(8px) rotate(-6deg);
            }
          }

          @keyframes floatThree {
            0%, 100% {
              transform: translateY(0px) scale(1);
            }
            50% {
              transform: translateY(-20px) scale(1.06);
            }
          }
        `}
      </style>

      <div className="pointer-events-none fixed inset-0 z-[5] hidden overflow-hidden xl:block">
        {objects.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className={`absolute ${item.className} ${item.animation} flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/80 bg-gradient-to-br ${item.bg} shadow-[0_18px_45px_rgba(37,99,235,0.16)] backdrop-blur-xl`}
            >
              <div className="absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.75),transparent_58%)]" />
              <Icon size={27} className={`relative ${item.color}`} />
            </div>
          );
        })}
      </div>
    </>
  );
};

const Dashboard = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("researchConnectUser"));

  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    researchFields: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [search, setSearch] = useState("");
  const [field, setField] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("latest");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();

      if (search.trim()) queryParams.append("search", search.trim());
      if (field) queryParams.append("field", field);
      if (status) queryParams.append("status", status);
      if (sort) queryParams.append("sort", sort);

      const queryString = queryParams.toString();
      const projectsUrl = queryString
        ? `/projects/my?${queryString}`
        : "/projects/my";

      const [projectsRes, statsRes] = await Promise.all([
        api.get(projectsUrl),
        api.get("/projects/my/stats"),
      ]);

      setProjects(projectsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search, field, status, sort, location.key]);

  const handleProjectCreated = () => {
    fetchDashboardData();
  };

  const handleProjectUpdated = (updatedProject) => {
    if (updatedProject?._id) {
      setProjects((prev) =>
        prev.map((project) =>
          project._id === updatedProject._id ? updatedProject : project
        )
      );
    }

    fetchDashboardData();
  };

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/projects/${projectId}`);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete project");
    }
  };

  const allFields = useMemo(() => {
    const projectFields = projects
      .map((project) => project.researchField)
      .filter(Boolean);

    return [...new Set([...ALL_RESEARCH_FIELDS, ...projectFields])].sort();
  }, [projects]);

  const averageProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (total, project) => total + Number(project.progress || 0),
            0
          ) / projects.length
        )
      : 0;

  const clearFilters = () => {
    setSearch("");
    setField("");
    setStatus("");
    setSort("latest");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef5ff]">
      <Navbar />
      <FloatingResearchObjects />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-300/45 blur-[120px]" />
        <div className="absolute right-[-100px] top-20 h-[420px] w-[420px] rounded-full bg-cyan-300/35 blur-[130px]" />
        <div className="absolute bottom-[-160px] left-[22%] h-[520px] w-[520px] rounded-full bg-violet-200/45 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.14) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8">
        <section className="mb-8 overflow-hidden rounded-[34px] border border-white/80 bg-white/70 shadow-[0_24px_70px_rgba(37,99,235,0.14)] backdrop-blur-xl">
          <div className="relative bg-gradient-to-br from-[#dbeafe] via-[#eef6ff] to-[#cfe7ff] px-6 py-8 md:px-8">
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

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-sm font-black text-blue-700 shadow-sm backdrop-blur">
                  <Sparkles size={16} />
                  Research Dashboard
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                  Welcome back, {user?.username || "Researcher"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                  Manage your research portfolio, track milestone-based
                  progress, and keep your academic work organized in one place.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-white/90 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-2 text-blue-700">
                      <FolderKanban size={16} />
                      <span className="text-sm font-black">
                        {stats.totalProjects} Total Projects
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/90 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <BarChart3 size={16} />
                      <span className="text-sm font-black">
                        {averageProgress}% Avg Progress
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/90 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-2 text-violet-700">
                      <Layers3 size={16} />
                      <span className="text-sm font-black">
                        {stats.researchFields} Fields
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-black text-white shadow-[0_16px_35px_rgba(37,99,235,0.26)] transition hover:-translate-y-0.5 hover:from-cyan-400 hover:to-blue-500"
              >
                <Plus size={18} />
                Create New Project
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={FolderKanban}
            iconBg="bg-blue-100"
            iconColor="text-blue-700"
            accent="from-blue-500 to-cyan-500"
          />

          <StatCard
            title="Ongoing"
            value={stats.ongoingProjects}
            icon={Clock3}
            iconBg="bg-amber-100"
            iconColor="text-amber-700"
            accent="from-amber-400 to-orange-500"
          />

          <StatCard
            title="Completed"
            value={stats.completedProjects}
            icon={CheckCircle2}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-700"
            accent="from-emerald-400 to-teal-500"
          />

          <StatCard
            title="Research Fields"
            value={stats.researchFields}
            icon={FlaskConical}
            iconBg="bg-violet-100"
            iconColor="text-violet-700"
            accent="from-violet-500 to-fuchsia-500"
          />
        </section>

        <section className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/75 p-6 shadow-[0_24px_70px_rgba(37,99,235,0.12)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_24%)]" />

          <div className="relative mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                <FolderKanban size={14} />
                My Project Space
              </div>

              <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
                My Research Projects
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Search, filter, and manage project details. Progress is
                automatically synchronized from milestones.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
              <Filter size={16} className="text-blue-600" />
              {projects.length} project{projects.length !== 1 ? "s" : ""} shown
            </div>
          </div>

          <div className="relative mb-7 overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-[#eaf4ff] via-[#f8fbff] to-[#dcecff] p-5 shadow-[0_16px_38px_rgba(37,99,235,0.12)]">
            <div
              className="absolute inset-0 opacity-[0.20]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.18) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
                <Filter size={17} />
              </div>
              Intelligent Research Filters
            </div>

            <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FilterField label="Search Projects">
                <div className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                  />

                  <input
                    type="text"
                    placeholder="Search by title, abstract, keyword..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-blue-100 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </FilterField>

              <FilterField label="Research Field">
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">All Fields</option>
                  {allFields.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField label="Project Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">All Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </FilterField>

              <FilterField label="Sort By">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="title_desc">Title Z-A</option>
                  <option value="progress_high">Progress High-Low</option>
                  <option value="progress_low">Progress Low-High</option>
                </select>
              </FilterField>
            </div>

            <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                <ArrowUpDown size={16} className="text-blue-500" />
                Filter your projects more effectively
              </div>

              <button
                onClick={clearFilters}
                className="rounded-2xl border border-blue-100 bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-dashed border-blue-200 bg-white/70 p-10 text-center text-slate-500">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-blue-200 bg-white/70 p-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <FolderKanban className="text-blue-500" size={24} />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                No projects found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your filters or create a new project to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onEdit={() => setEditingProject(project)}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onProjectUpdated={handleProjectUpdated}
      />
    </div>
  );
};

const FilterField = ({ label, children }) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-blue-700">
        {label}
      </label>
      {children}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, accent }) => {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_18px_40px_rgba(37,99,235,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(37,99,235,0.16)]">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-100/60 blur-2xl transition group-hover:bg-cyan-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h3 className="mt-3 text-4xl font-black text-slate-950">{value}</h3>
        </div>

        <div className={`rounded-2xl p-3 ${iconBg}`}>
          <Icon className={iconColor} size={22} />
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const formattedStartDate = project.startDate
    ? new Date(project.startDate).toLocaleDateString()
    : null;

  const formattedEndDate = project.endDate
    ? new Date(project.endDate).toLocaleDateString()
    : null;

  const progressValue = Number(project.progress || 0);

  const progressColor =
    project.status === "completed"
      ? "from-emerald-400 to-teal-500"
      : progressValue >= 75
      ? "from-blue-500 to-cyan-500"
      : progressValue >= 40
      ? "from-amber-400 to-orange-500"
      : "from-rose-400 to-pink-500";

  return (
    <div className="group relative min-h-[500px] overflow-hidden rounded-[30px] border border-white/80 bg-white/85 p-[1px] shadow-[0_20px_45px_rgba(37,99,235,0.12)] backdrop-blur-xl transition hover:-translate-y-1.5 hover:shadow-[0_28px_65px_rgba(37,99,235,0.18)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.13),transparent_24%),linear-gradient(135deg,#ffffff_0%,#f4f9ff_48%,#e8f2ff_100%)]" />

      <div className="relative flex h-full flex-col rounded-[29px] p-5">
        <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-200/45 blur-3xl transition group-hover:bg-cyan-300/45" />
        <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-violet-200/45 blur-3xl transition group-hover:bg-violet-300/45" />

        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.18) 1px, transparent 0)",
            backgroundSize: "21px 21px",
          }}
        />

        <div className="relative mb-5 flex items-start justify-between gap-3">
          <span className="line-clamp-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 shadow-sm">
            {project.researchField || "General Research"}
          </span>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-black capitalize ${
              project.status === "completed"
                ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
                : "border border-amber-200 bg-amber-100 text-amber-700"
            }`}
          >
            {project.status || "ongoing"}
          </span>
        </div>

        <div className="relative mb-5 overflow-hidden rounded-[26px] border border-white/70 bg-gradient-to-br from-[#255a94] via-[#3675b8] to-[#4d8ee0] p-5 shadow-[0_18px_45px_rgba(37,99,235,0.20)]">
          <div
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-cyan-100 backdrop-blur">
            <FlaskConical size={22} />
          </div>

          <h3 className="relative line-clamp-2 text-2xl font-black leading-tight text-white drop-shadow-sm">
            {project.title}
          </h3>
        </div>

        <p className="relative line-clamp-3 text-sm leading-6 text-slate-600">
          {project.abstract || "No abstract provided for this project."}
        </p>

        <div className="relative mt-5 space-y-3">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
              <span className="font-bold">Milestone Progress</span>
              <span className="font-black text-slate-950">{progressValue}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${progressColor}`}
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>

          {(formattedStartDate || formattedEndDate) && (
            <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-white/75 px-3 py-2 text-sm text-slate-600 backdrop-blur">
              <CalendarDays size={16} className="mt-0.5 shrink-0 text-blue-500" />
              <span className="line-clamp-1">
                {formattedStartDate ? `Start: ${formattedStartDate}` : ""}
                {formattedStartDate && formattedEndDate ? " • " : ""}
                {formattedEndDate ? `End: ${formattedEndDate}` : ""}
              </span>
            </div>
          )}

          {project.fundingSource && (
            <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-white/75 px-3 py-2 text-sm text-slate-600 backdrop-blur">
              <Landmark size={16} className="mt-0.5 shrink-0 text-violet-500" />
              <span className="line-clamp-1">{project.fundingSource}</span>
            </div>
          )}

          {project.collaborators?.length > 0 && (
            <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-white/75 px-3 py-2 text-sm text-slate-600 backdrop-blur">
              <Users size={16} className="mt-0.5 shrink-0 text-emerald-500" />
              <span>
                {project.collaborators.length} collaborator
                {project.collaborators.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {project.keywords?.length > 0 && (
            <div className="flex items-start gap-2 pt-1">
              <Tags size={16} className="mt-1 shrink-0 text-slate-500" />
              <div className="flex flex-wrap gap-2">
                {project.keywords.slice(0, 4).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-blue-100 bg-white/75 px-2.5 py-1 text-xs font-bold text-slate-600"
                  >
                    {keyword}
                  </span>
                ))}

                {project.keywords.length > 4 && (
                  <span className="rounded-full border border-blue-100 bg-white/75 px-2.5 py-1 text-xs font-bold text-slate-600">
                    +{project.keywords.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative mt-auto grid grid-cols-3 gap-2 border-t border-blue-100 pt-5">
          <button
            onClick={() => {
              window.location.href = `/projects/${project._id}`;
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
          >
            <ExternalLink size={15} />
            Details
          </button>

          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-100 px-3 py-2.5 text-sm font-black text-amber-700 transition hover:-translate-y-0.5 hover:bg-amber-200"
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            onClick={() => onDelete(project._id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-red-200 bg-red-100 px-3 py-2.5 text-sm font-black text-red-700 transition hover:-translate-y-0.5 hover:bg-red-200"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
