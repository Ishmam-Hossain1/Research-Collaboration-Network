import { useMemo, useState } from "react";
import {
  X,
  Loader2,
  Sparkles,
  LibraryBig,
  Link as LinkIcon,
  FileText,
  Layers3,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
// import api from "../api";
import api from "../lib/api";

const CATEGORY_OPTIONS = [
  "Journal Database",
  "Institutional Access Service",
  "Plagiarism Checker",
  "Reference Manager",
  "Academic Tool",
];

const CreateResourceModal = ({ isOpen, onClose, onResourceCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    link: "",
  });

  const [loading, setLoading] = useState(false);

  const descriptionCount = useMemo(
    () => formData.description.trim().length,
    [formData.description]
  );

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      description: "",
      link: "",
    });
  };

  const isValidUrl = (value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("researchConnectUser") || "null");

    if (!user?.id) {
      toast.error("Please log in first");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Resource title is required");
      return;
    }

    if (!formData.category.trim()) {
      toast.error("Please choose a category");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!formData.link.trim()) {
      toast.error("Resource link is required");
      return;
    }

    if (!isValidUrl(formData.link.trim())) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        link: formData.link.trim(),
        createdBy: user.id,
      };

      const res = await api.post("/resources", payload);

      resetForm();
      onResourceCreated?.(res.data.resource);
      toast.success(res.data.message || "Resource created successfully");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create resource");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="shrink-0 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 px-6 py-5 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-blue-700 shadow-sm">
                <Sparkles size={16} />
                Research Resource Workspace
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Add New Resource
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
                Create a useful entry for academic tools, services, or platforms
                so researchers can discover and use them easily.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
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
                    <LibraryBig size={18} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Core Information
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Resource Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Zotero, OpenAthens, Scopus"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Description <span className="text-rose-500">*</span>
                      </label>
                      <div className="mb-2 text-xs text-slate-500">
                        {descriptionCount} characters
                      </div>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="6"
                        placeholder="Explain what this resource does and why it is useful for researchers..."
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <LinkIcon size={16} />
                        Resource URL <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6 md:col-span-5">
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Layers3 size={18} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Category
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {CATEGORY_OPTIONS.map((item) => {
                      const active = formData.category === item;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, category: item }))
                          }
                          className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                            active
                              ? "border-blue-600 bg-blue-600 text-white shadow-md"
                              : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Preview
                  </h3>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {formData.category || "Category"}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-slate-900">
                      {formData.title || "Your resource title will appear here"}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {formData.description ||
                        "A short explanation of the resource will appear here."}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                      <ExternalLink size={14} />
                      {formData.link
                        ? formData.link.replace(/^https?:\/\//, "")
                        : "Resource link"}
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <FileText size={16} />
                      Submission tips
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li>• Use a clear and recognizable title</li>
                      <li>• Explain why the resource is useful</li>
                      <li>• Provide a valid public URL</li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 md:px-8">
            <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? "Adding Resource..." : "Create Resource"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateResourceModal;
