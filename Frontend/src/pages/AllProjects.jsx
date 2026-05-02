import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FolderKanban,
  FlaskConical,
  CalendarDays,
  Users,
  Tags,
  Landmark,
  ArrowUpDown,
  ExternalLink,
  Star,
  Atom,
  Layers3,
  Database,
  Filter,
  CircuitBoard,
  Microscope,
  BarChart3,
  Orbit,
  Dna,
  Network,
  Activity,
  Binary,
  ShieldCheck,
  Cpu,
  Telescope,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import FeedbackModal from "../components/FeedbackModal";

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const FloatingResearchObjects = () => {
  const leftObjects = [
    {
      icon: Atom,
      className: "left-3 top-32",
      color: "text-cyan-500",
      bg: "from-cyan-400/25 to-blue-500/15",
      delay: 0,
    },
    {
      icon: Microscope,
      className: "left-4 top-[46%]",
      color: "text-violet-500",
      bg: "from-violet-400/25 to-fuchsia-500/15",
      delay: 0.7,
    },
    {
      icon: Dna,
      className: "left-6 bottom-28",
      color: "text-emerald-500",
      bg: "from-emerald-400/25 to-cyan-500/15",
      delay: 1.2,
    },
    {
      icon: Telescope,
      className: "left-20 top-[68%]",
      color: "text-sky-500",
      bg: "from-sky-400/25 to-indigo-500/15",
      delay: 1.8,
    },
  ];

  const rightObjects = [
    {
      icon: Network,
      className: "right-3 top-36",
      color: "text-blue-500",
      bg: "from-blue-400/25 to-cyan-500/15",
      delay: 0.4,
    },
    {
      icon: CircuitBoard,
      className: "right-4 top-[50%]",
      color: "text-amber-500",
      bg: "from-amber-400/25 to-orange-500/15",
      delay: 1,
    },
    {
      icon: Binary,
      className: "right-6 bottom-28",
      color: "text-pink-500",
      bg: "from-pink-400/25 to-violet-500/15",
      delay: 1.6,
    },
    {
      icon: Cpu,
      className: "right-20 top-[70%]",
      color: "text-cyan-500",
      bg: "from-cyan-400/25 to-teal-500/15",
      delay: 2.2,
    },
  ];

  const allObjects = [...leftObjects, ...rightObjects];

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] hidden xl:block">      {allObjects.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={index}
            animate={{
              y: [0, -18, 0],
              x: [0, index % 2 === 0 ? 8 : -8, 0],
              rotate: [0, index % 2 === 0 ? 8 : -8, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6 + (index % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
            className={`absolute ${item.className} flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/60 bg-gradient-to-br ${item.bg} shadow-[0_18px_55px_rgba(14,165,233,0.18)] backdrop-blur-xl`}
          >
            <div className="absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45),transparent_55%)]" />
            <Icon size={27} className={`relative ${item.color}`} />
          </motion.div>
        );
      })}
    </div>
  );
};

const FilterField = ({ label, children }) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
        {label}
      </label>
      {children}
    </div>
  );
};

const AllProjects = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("researchConnectUser"));

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackProject, setFeedbackProject] = useState(null);

  const [search, setSearch] = useState("");
  const [field, setField] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("latest");

  const fetchAllProjects = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append("search", search.trim());
      if (field) queryParams.append("field", field);
      if (status) queryParams.append("status", status);
      if (sort) queryParams.append("sort", sort);

      const queryString = queryParams.toString();
      const url = queryString ? `/projects?${queryString}` : "/projects";

      const res = await api.get(url);
      setProjects(res.data);
    } catch (error) {
      console.error("Failed to load all projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, [search, field, status, sort]);

  const allFields = useMemo(() => {
    const projectFields = projects
      .map((project) => project.researchField)
      .filter(Boolean);

    return [...new Set([...ALL_RESEARCH_FIELDS, ...projectFields])].sort();
  }, [projects]);

  const completedCount = projects.filter(
    (project) => project.status === "completed"
  ).length;

  const ongoingCount = projects.filter(
    (project) => project.status !== "completed"
  ).length;

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

  const matrixItems = [
    {
      label: "Project Count",
      value: projects.length,
      icon: Database,
      color: "from-cyan-400 to-blue-500",
      progress: "86%",
    },
    {
      label: "Ongoing Research",
      value: ongoingCount,
      icon: FlaskConical,
      color: "from-blue-400 to-indigo-500",
      progress: "78%",
    },
    {
      label: "Completed Work",
      value: completedCount,
      icon: ShieldCheck,
      color: "from-emerald-400 to-teal-500",
      progress: "58%",
    },
    {
      label: "Active Domains",
      value: allFields.length,
      icon: Activity,
      color: "from-violet-400 to-fuchsia-500",
      progress: "92%",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#edf4ff] text-slate-900">
      <Navbar />
      <FloatingResearchObjects />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-36 -top-36 h-[520px] w-[520px] rounded-full bg-blue-300/40 blur-[130px]" />
        <div className="absolute -right-32 top-24 h-[460px] w-[460px] rounded-full bg-violet-300/35 blur-[130px]" />
        <div className="absolute bottom-[-220px] left-[22%] h-[560px] w-[560px] rounded-full bg-cyan-200/45 blur-[150px]" />
        <div className="absolute bottom-12 right-[20%] h-[360px] w-[360px] rounded-full bg-fuchsia-200/35 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.32]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.14) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(59,130,246,0.14) 0 1px, transparent 1px), linear-gradient(45deg, rgba(168,85,247,0.10) 0 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative mb-10 overflow-hidden rounded-[40px] border border-white/70 bg-[#dbeafe]/85 shadow-[0_28px_90px_rgba(37,99,235,0.18)] backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.20),transparent_30%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_30%),linear-gradient(135deg,#dbeafe_0%,#eaf3ff_42%,#dcecff_100%)]" />

          <div
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(30,64,175,0.22) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-[45%] h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative grid gap-8 px-6 py-8 md:px-9 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div>
              <motion.div
                variants={fadeUp}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-black text-blue-700 shadow-sm backdrop-blur"
              >
                <FlaskConical size={16} />
                All Research Projects
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl"
              >
                Explore a cinematic database of research innovation.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-2xl text-base leading-7 text-slate-600"
              >
                Dive into AI, cybersecurity, health informatics, cloud systems,
                blockchain, and more through a premium research discovery
                interface with live project intelligence.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-7 flex flex-wrap gap-3"
              >
                <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-lg backdrop-blur">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Database size={17} />
                    <span className="text-sm font-black">
                      {projects.length} Projects
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-lg backdrop-blur">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <BarChart3 size={17} />
                    <span className="text-sm font-black">
                      {averageProgress}% Avg Progress
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-lg backdrop-blur">
                  <div className="flex items-center gap-2 text-violet-700">
                    <Layers3 size={17} />
                    <span className="text-sm font-black">Research Atlas</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="relative hidden lg:block">
              <div className="relative ml-auto max-w-md rounded-[32px] border border-white/70 bg-white/55 p-4 shadow-[0_20px_65px_rgba(30,64,175,0.20)] backdrop-blur-xl">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-violet-400/20 blur-3xl" />

                <div className="relative overflow-hidden rounded-[26px] border border-white/60 bg-[#24466f] p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.15),transparent_25%),linear-gradient(135deg,#24466f_0%,#2c5b91_50%,#1d3e67_100%)]" />

                  <div
                    className="absolute inset-0 opacity-[0.18]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.38) 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  <div className="relative mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100">
                        Live Research Pulse
                      </p>
                      <h3 className="mt-2 text-2xl font-black text-white">
                        Project Matrix
                      </h3>
                    </div>

                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="rounded-2xl border border-white/20 bg-white/15 p-3 text-cyan-100"
                    >
                      <Orbit size={24} />
                    </motion.div>
                  </div>

                  <div className="relative grid gap-3">
                    {matrixItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/20 bg-white/14 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.14)] backdrop-blur"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}
                              >
                                <Icon size={19} className="text-white" />
                              </div>

                              <div>
                                <p className="text-sm font-black text-white">
                                  {item.label}
                                </p>
                                <p className="text-xs text-blue-100">
                                  Live platform insight
                                </p>
                              </div>
                            </div>

                            <p className="text-2xl font-black text-white">
                              {item.value}
                            </p>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/20">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: item.progress }}
                              transition={{ duration: 1.2, delay: 0.3 }}
                              className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="relative overflow-hidden rounded-[38px] border border-white/70 bg-white/72 p-5 shadow-[0_28px_90px_rgba(37,99,235,0.16)] backdrop-blur-xl md:p-7"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_24%),linear-gradient(135deg,#f8fbff_0%,#eaf3ff_40%,#ddecff_100%)]" />

          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.16) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                <FolderKanban size={14} />
                Project Directory
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Browse the full research catalog
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Search, filter, and inspect projects created by researchers
                across the platform.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {user && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-2xl border border-blue-100 bg-white/80 px-5 py-3 text-sm font-black text-slate-800 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  My Projects
                </button>
              )}

              <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_rgba(14,165,233,0.24)]">
                <Database size={16} />
                {projects.length} project{projects.length !== 1 ? "s" : ""} found
              </div>
            </div>
          </div>

          <div className="relative mb-8 overflow-hidden rounded-[30px] border border-white/70 bg-gradient-to-br from-[#2f5f92] via-[#3970aa] to-[#4f82bd] p-5 shadow-[0_18px_55px_rgba(37,99,235,0.22)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_20%)]" />

            <div
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.28) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />

            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-7 top-5 hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cyan-100 shadow-lg backdrop-blur xl:flex"
            >
              <Filter size={22} />
            </motion.div>

            <div className="relative mb-4 flex items-center gap-2 text-sm font-black text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                <Filter size={17} />
              </div>
              Intelligent Research Filters
            </div>

            <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <FilterField label="Search Projects">
                <div className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Search all projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-white/70 bg-white px-11 py-3.5 text-sm font-bold text-slate-800 shadow-lg outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50"
                  />
                </div>
              </FilterField>

              <FilterField label="Research Field">
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 shadow-lg outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50"
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
                  className="w-full rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 shadow-lg outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50"
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
                  className="w-full rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 shadow-lg outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50"
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
              <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-50">
                <ArrowUpDown size={16} className="text-cyan-100" />
                Sort and explore the complete research ecosystem
              </div>

              <button
                onClick={clearFilters}
                className="rounded-2xl border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-black text-white shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/25"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-dashed border-blue-200 bg-white/75 p-12 text-center text-slate-500">
              Loading all projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-blue-200 bg-white/75 p-12 text-center text-slate-500">
              No projects found.
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-7 md:grid-cols-2 xl:grid-cols-3"
            >
              {projects.map((project, index) => (
                <PublicProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  onFeedbackClick={setFeedbackProject}
                />
              ))}
            </motion.div>
          )}
        </motion.section>
      </main>

      {feedbackProject && (
        <FeedbackModal
          project={feedbackProject}
          onClose={() => setFeedbackProject(null)}
        />
      )}
    </div>
  );
};

const PublicProjectCard = ({ project, onFeedbackClick, index }) => {
  const formattedStartDate = project.startDate
    ? new Date(project.startDate).toLocaleDateString()
    : null;

  const formattedEndDate = project.endDate
    ? new Date(project.endDate).toLocaleDateString()
    : null;

  const progressValue = Number(project.progress || 0);

  const progressColor =
    project.status === "completed"
      ? "from-emerald-400 via-teal-400 to-cyan-400"
      : progressValue >= 75
      ? "from-cyan-400 via-blue-500 to-indigo-500"
      : progressValue >= 40
      ? "from-amber-400 via-orange-400 to-rose-400"
      : "from-rose-400 via-pink-400 to-fuchsia-500";

  const statusClasses =
    project.status === "completed"
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200 border border-emerald-200"
      : "bg-amber-100 text-amber-700 ring-amber-200 border border-amber-200";

  const visualIcons = [
    Atom,
    Dna,
    Network,
    CircuitBoard,
    Binary,
    Cpu,
    Microscope,
    Telescope,
  ];
  const VisualIcon = visualIcons[index % visualIcons.length];

  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.45, delay: index * 0.03 }}
      whileHover={{
        y: -10,
        rotateX: 2,
        rotateY: -2,
      }}
      className="group relative min-h-[500px] overflow-hidden rounded-[34px] border border-white/80 bg-white/70 p-[1px] shadow-[0_24px_70px_rgba(37,99,235,0.16)] transition-all duration-300 hover:border-cyan-300 hover:shadow-[0_34px_90px_rgba(14,165,233,0.18)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_24%),linear-gradient(135deg,#ffffff_0%,#edf6ff_50%,#dfeeff_100%)] opacity-95" />

      <div className="relative h-full overflow-hidden rounded-[33px] border border-white/80 bg-[#f8fbff] p-6">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl transition duration-500 group-hover:bg-cyan-300/35" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-violet-300/25 blur-3xl transition duration-500 group-hover:bg-violet-300/35" />
        <div className="absolute right-10 bottom-36 h-24 w-24 rounded-full bg-blue-300/20 blur-2xl" />

        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.20) 1px, transparent 0)",
            backgroundSize: "21px 21px",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(34,211,238,0.16) 0 1px, transparent 1px), linear-gradient(45deg, rgba(168,85,247,0.12) 0 1px, transparent 1px)",
            backgroundSize: "54px 54px",
          }}
        />

        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.25,
          }}
          className="absolute right-5 top-20 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/70 text-blue-600 shadow-lg backdrop-blur-xl"
        >
          <VisualIcon size={24} />
        </motion.div>

        <div className="relative flex h-full flex-col">
          <div className="mb-5 flex items-start justify-between gap-3">
            <span className="line-clamp-1 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-black text-cyan-700 shadow-sm">
              {project.researchField || "General Research"}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-black capitalize ring-1 ${statusClasses}`}
            >
              {project.status || "ongoing"}
            </span>
          </div>

          <div className="relative mb-5 overflow-hidden rounded-[28px] border border-white/70 bg-[#24528a] p-4 shadow-[0_18px_45px_rgba(37,99,235,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.17),transparent_25%),linear-gradient(135deg,#24528a_0%,#3469a6_45%,#4477bd_100%)]" />

            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.32) 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />

            <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-violet-300/18 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-cyan-100 backdrop-blur">
                <FlaskConical size={23} />
              </div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 14,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 text-violet-100 backdrop-blur"
              >
                <Orbit size={22} />
              </motion.div>
            </div>

            <h3 className="relative mt-5 line-clamp-2 text-xl font-black leading-snug text-white drop-shadow-sm">
              {project.title}
            </h3>
          </div>

          <p className="relative line-clamp-3 text-sm leading-6 text-slate-600">
            {project.abstract || "No abstract provided for this research project."}
          </p>

          {project.owner && (
            <p className="relative mt-3 text-sm text-slate-500">
              By{" "}
              <span className="font-black text-slate-900">
                {project.owner.username}
              </span>
            </p>
          )}

          <div className="relative mt-5 space-y-3">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                <span className="font-bold">Research Progress</span>
                <span className="font-black text-slate-900">{progressValue}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progressValue}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.15 }}
                  className={`h-3 rounded-full bg-gradient-to-r ${progressColor} shadow-[0_0_20px_rgba(34,211,238,0.22)]`}
                />
              </div>
            </div>

            <div className="grid gap-2">
              {(formattedStartDate || formattedEndDate) && (
                <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-600 backdrop-blur">
                  <CalendarDays
                    size={16}
                    className="mt-0.5 shrink-0 text-blue-500"
                  />
                  <span className="line-clamp-1">
                    {formattedStartDate ? `Start: ${formattedStartDate}` : ""}
                    {formattedStartDate && formattedEndDate ? " • " : ""}
                    {formattedEndDate ? `End: ${formattedEndDate}` : ""}
                  </span>
                </div>
              )}

              {project.fundingSource && (
                <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-600 backdrop-blur">
                  <Landmark
                    size={16}
                    className="mt-0.5 shrink-0 text-violet-500"
                  />
                  <span className="line-clamp-1">{project.fundingSource}</span>
                </div>
              )}

              {project.collaborators?.length > 0 && (
                <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-600 backdrop-blur">
                  <Users
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <span>
                    {project.collaborators.length} collaborator
                    {project.collaborators.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            {project.keywords?.length > 0 && (
              <div className="flex items-start gap-2 pt-1">
                <Tags size={16} className="mt-1 shrink-0 text-slate-500" />
                <div className="flex flex-wrap gap-2">
                  {project.keywords.slice(0, 4).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-blue-100 bg-white/80 px-2.5 py-1 text-xs font-black text-slate-600 backdrop-blur"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-blue-100 pt-5">
            <button
              onClick={() => onFeedbackClick(project)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-black text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-100"
            >
              <Star size={15} className="fill-amber-400 text-amber-400" />
              Feedback
            </button>

            <button
              onClick={() => (window.location.href = `/projects/${project._id}`)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl"
            >
              <ExternalLink size={16} />
              Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AllProjects;