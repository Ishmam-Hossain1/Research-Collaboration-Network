import { useEffect, useMemo, useState } from "react";
import {
  X,
  FileText,
  Layers3,
  Loader2,
  Sparkles,
  Target,
  Users,
  Tags,
  CalendarDays,
  Landmark,
} from "lucide-react";
import api from "../lib/api";

const RESEARCH_FIELDS = [
  "Artificial Intelligence",
  "Data Science",
  "Cybersecurity",
  "Bioinformatics",
  "Networking",
  "Machine Learning",
  "Robotics",
  "Software Engineering",
  "Other",
];

const EditProjectModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    researchField: "",
    objective: "",
    methodology: "",
    expectedOutcome: "",
    fundingSource: "",
    startDate: "",
    endDate: "",
  });

  const [customField, setCustomField] = useState("");
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);

  const abstractCount = useMemo(
    () => formData.abstract.trim().length,
    [formData.abstract]
  );

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        abstract: project.abstract || "",
        researchField: project.researchField || "",
        objective: project.objective || "",
        methodology: project.methodology || "",
        expectedOutcome: project.expectedOutcome || "",
        fundingSource: project.fundingSource || "",
        startDate: project.startDate ? project.startDate.split("T")[0] : "",
        endDate: project.endDate ? project.endDate.split("T")[0] : "",
      });

      setCollaborators(project.collaborators || []);
      setKeywords(project.keywords || []);

      const knownField = RESEARCH_FIELDS.includes(project.researchField);
      setCustomField(knownField ? "" : project.researchField || "");
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const projectProgress = Number(project.progress || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFieldSelect = (field) => {
    if (field === "Other") {
      setFormData((prev) => ({
        ...prev,
        researchField: customField.trim() || prev.researchField || "Other",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      researchField: field,
    }));
  };

  const handleCustomFieldApply = () => {
    if (!customField.trim()) return;

    setFormData((prev) => ({
      ...prev,
      researchField: customField.trim(),
    }));
  };

  const addCollaborator = () => {
    const value = collaboratorInput.trim();
    if (!value || collaborators.includes(value)) return;

    setCollaborators((prev) => [...prev, value]);
    setCollaboratorInput("");
  };

  const removeCollaborator = (value) => {
    setCollaborators((prev) => prev.filter((item) => item !== value));
  };

  const addKeyword = () => {
    const value = keywordInput.trim();
    if (!value || keywords.includes(value)) return;

    setKeywords((prev) => [...prev, value]);
    setKeywordInput("");
  };

  const removeKeyword = (value) => {
    setKeywords((prev) => prev.filter((item) => item !== value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Project title is required");
      return;
    }

    if (!formData.abstract.trim()) {
      alert("Abstract is required");
      return;
    }

    if (!formData.researchField.trim()) {
      alert("Please select or enter a research field");
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      alert("End date must be after start date");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        researchField: formData.researchField.trim(),
        objective: formData.objective.trim(),
        methodology: formData.methodology.trim(),
        expectedOutcome: formData.expectedOutcome.trim(),
        fundingSource: formData.fundingSource.trim(),
        collaborators,
        keywords,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      const res = await api.put(`/projects/${project._id}`, payload);

      onProjectUpdated?.(res.data.project);
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  const TagList = ({ items, onRemove, emptyText }) => (
    <div className="mt-3 flex min-h-[44px] flex-wrap gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-3">
      {items.length === 0 ? (
        <span className="text-sm text-slate-400">{emptyText}</span>
      ) : (
        items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              disabled={loading}
              className="text-blue-700 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ×
            </button>
          </span>
        ))
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="shrink-0 border-b border-slate-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-6 py-5 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-amber-700 shadow-sm">
                <Sparkles size={16} />
                Edit Project Details
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Update Research Project
              </h2>

              <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
                Update project information only. Progress and status are
                controlled automatically by milestones.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-8">
            <div className="grid gap-8 md:grid-cols-12">
              <div className="space-y-6 md:col-span-7">
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-amber-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Core Information
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Project Title <span className="text-rose-500">*</span>
                      </label>

                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g. Deep Learning for Medical Imaging"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-700">
                          Abstract <span className="text-rose-500">*</span>
                        </label>

                        <span className="text-xs text-slate-500">
                          {abstractCount} characters
                        </span>
                      </div>

                      <textarea
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleChange}
                        rows="5"
                        disabled={loading}
                        placeholder="Summarize the problem, approach, and significance of the project..."
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Objective
                      </label>

                      <textarea
                        name="objective"
                        value={formData.objective}
                        onChange={handleChange}
                        rows="3"
                        disabled={loading}
                        placeholder="What is the main goal of this research?"
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Methodology
                      </label>

                      <textarea
                        name="methodology"
                        value={formData.methodology}
                        onChange={handleChange}
                        rows="3"
                        disabled={loading}
                        placeholder="Describe methods, tools, datasets, or experimental approach..."
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Expected Outcome
                      </label>

                      <textarea
                        name="expectedOutcome"
                        value={formData.expectedOutcome}
                        onChange={handleChange}
                        rows="3"
                        disabled={loading}
                        placeholder="What do you expect the project to achieve or produce?"
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Layers3 size={18} className="text-amber-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Research Field
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {RESEARCH_FIELDS.map((field) => {
                      const active =
                        formData.researchField === field ||
                        (field === "Other" &&
                          formData.researchField &&
                          !RESEARCH_FIELDS.includes(formData.researchField));

                      return (
                        <button
                          key={field}
                          type="button"
                          disabled={loading}
                          onClick={() => handleFieldSelect(field)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            active
                              ? "border-amber-600 bg-amber-600 text-white shadow-md"
                              : "border-slate-300 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50"
                          }`}
                        >
                          {field}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row">
                    <input
                      type="text"
                      value={customField}
                      disabled={loading}
                      onChange={(e) => setCustomField(e.target.value)}
                      placeholder="Custom research field"
                      className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleCustomFieldApply}
                      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Apply
                    </button>
                  </div>
                </section>
              </div>

              <div className="space-y-6 md:col-span-5">
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Target size={18} className="text-amber-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Timeline & Funding
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="font-semibold text-slate-900">
                        Progress is milestone-based
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        You can edit project details here. Complete milestones
                        in the roadmap to update progress and status.
                      </div>

                      <div className="mt-2 text-sm font-medium text-amber-700">
                        Current progress: {projectProgress}%
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <CalendarDays size={16} />
                          Start Date
                        </label>

                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          disabled={loading}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <CalendarDays size={16} />
                          End Date
                        </label>

                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          disabled={loading}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Landmark size={16} />
                        Funding Source
                      </label>

                      <input
                        type="text"
                        name="fundingSource"
                        value={formData.fundingSource}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g. University Grant, Self-funded, External Sponsor"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Users size={18} className="text-amber-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Collaborators
                    </h3>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={collaboratorInput}
                      disabled={loading}
                      onChange={(e) => setCollaboratorInput(e.target.value)}
                      placeholder="Add collaborator name"
                      className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />

                    <button
                      type="button"
                      onClick={addCollaborator}
                      disabled={loading}
                      className="rounded-2xl bg-amber-600 px-5 py-3 font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Add
                    </button>
                  </div>

                  <TagList
                    items={collaborators}
                    onRemove={removeCollaborator}
                    emptyText="No collaborators added yet"
                  />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Tags size={18} className="text-amber-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Keywords
                    </h3>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={keywordInput}
                      disabled={loading}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keyword"
                      className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />

                    <button
                      type="button"
                      onClick={addKeyword}
                      disabled={loading}
                      className="rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Add
                    </button>
                  </div>

                  <TagList
                    items={keywords}
                    onRemove={removeKeyword}
                    emptyText="No keywords added yet"
                  />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Preview
                  </h3>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        {formData.researchField || "Research Field"}
                      </span>

                      <span className="text-sm capitalize text-slate-500">
                        {project.status || "ongoing"}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-slate-900">
                      {formData.title || "Your project title will appear here"}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {formData.abstract ||
                        "A short project summary will appear here."}
                    </p>

                    {keywords.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {keywords.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                      Progress is automatic and currently {projectProgress}%
                      based on milestone completion.

                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
                          <span>Milestone Progress</span>
                          <span>{projectProgress}%</span>
                        </div>

                        <div className="h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-amber-600 transition-all"
                            style={{ width: `${projectProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-8px_20px_rgba(15,23,42,0.04)] md:px-8">
            <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-2xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Updating Project..." : "Update Details"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
