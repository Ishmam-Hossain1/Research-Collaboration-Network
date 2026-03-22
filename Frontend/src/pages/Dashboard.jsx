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
  Pencil,
  Trash2,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
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

const Dashboard = () => {
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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
  }, [search, field, status, sort]);

  const handleProjectCreated = () => {
    fetchDashboardData();
  };

  const handleProjectUpdated = () => {
    fetchDashboardData();
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
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

  const clearFilters = () => {
    setSearch("");
    setField("");
    setStatus("");
    setSort("latest");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 px-6 py-8 text-white md:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
                  <Sparkles size={16} />
                  Research Dashboard
                </div>
                <h1 className="text-3xl font-bold md:text-4xl">
                  Welcome back, {user?.username || "Researcher"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-blue-50 md:text-base">
                  Manage your research portfolio, monitor progress, and keep your
                  academic work organized in one place.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-blue-700 shadow-sm transition hover:scale-[1.01] hover:bg-blue-50"
              >
                + Create New Project
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
          />
          <StatCard
            title="Ongoing"
            value={stats.ongoingProjects}
            icon={Clock3}
            iconBg="bg-amber-100"
            iconColor="text-amber-700"
          />
          <StatCard
            title="Completed"
            value={stats.completedProjects}
            icon={CheckCircle2}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-700"
          />
          <StatCard
            title="Research Fields"
            value={stats.researchFields}
            icon={FlaskConical}
            iconBg="bg-violet-100"
            iconColor="text-violet-700"
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                My Research Projects
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search, filter, sort, edit, and manage your projects.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              <Filter size={16} />
              {projects.length} project{projects.length !== 1 ? "s" : ""} shown
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by title, abstract, keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All Fields</option>
                {allFields.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="title_asc">Title A-Z</option>
                <option value="title_desc">Title Z-A</option>
                <option value="progress_high">Progress High-Low</option>
                <option value="progress_low">Progress Low-High</option>
              </select>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <ArrowUpDown size={16} />
                Filter your projects more effectively
              </div>

              <button
                onClick={clearFilters}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200">
                <FolderKanban className="text-slate-500" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                No projects found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try changing your filters or create a new project to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onEdit={handleEditProject}
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
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onProjectUpdated={handleProjectUpdated}
      />
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
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

  const progressColor =
    project.status === "completed"
      ? "bg-emerald-600"
      : project.progress >= 75
        ? "bg-blue-600"
        : project.progress >= 40
          ? "bg-amber-500"
          : "bg-slate-500";

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {project.researchField}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${project.status === "completed"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
            }`}
        >
          {project.status}
        </span>
      </div>

      <h3 className="line-clamp-2 text-xl font-bold text-slate-900">
        {project.title}
      </h3>

      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
        {project.abstract}
      </p>

      <div className="mt-5 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
            <span>Progress</span>
            <span className="font-semibold text-slate-700">
              {project.progress}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-200">
            <div
              className={`h-2.5 rounded-full transition-all ${progressColor}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {(formattedStartDate || formattedEndDate) && (
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <CalendarDays size={16} className="mt-0.5 shrink-0" />
            <span>
              {formattedStartDate ? `Start: ${formattedStartDate}` : ""}
              {formattedStartDate && formattedEndDate ? " • " : ""}
              {formattedEndDate ? `End: ${formattedEndDate}` : ""}
            </span>
          </div>
        )}

        {project.fundingSource && (
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <Landmark size={16} className="mt-0.5 shrink-0" />
            <span className="line-clamp-1">{project.fundingSource}</span>
          </div>
        )}

        {project.collaborators?.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <Users size={16} className="mt-0.5 shrink-0" />
            <span>
              {project.collaborators.length} collaborator
              {project.collaborators.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {project.keywords?.length > 0 && (
          <div className="flex items-start gap-2">
            <Tags size={16} className="mt-0.5 shrink-0 text-slate-500" />
            <div className="flex flex-wrap gap-2">
              {project.keywords.slice(0, 4).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {keyword}
                </span>
              ))}
              {project.keywords.length > 4 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  +{project.keywords.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={() => window.location.href = `/projects/${project._id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ExternalLink size={16} />
          Details
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(project)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            onClick={() => onDelete(project._id)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;