import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../lib/api";

const EditGrantApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    projectTitle: "",
    abstract: "",
    requestedFunding: "",
    researchField: "",
  });

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await api.get(`/grant-applications/${id}`);
        const application = response.data.application;

        setFormData({
          projectTitle: application.projectTitle || "",
          abstract: application.abstract || "",
          requestedFunding: application.requestedFunding || "",
          researchField: application.researchField || "",
        });
      } catch (error) {
        console.error("Error loading application:", error);
        alert("Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.put(`/grant-applications/${id}`, formData);

      alert("Application updated successfully");
      navigate("/grant-applications/mine");
    } catch (error) {
      console.error("Error updating application:", error);
      alert(error.response?.data?.message || "Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 px-6 py-12 text-center text-slate-500">
          Loading application...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded-[30px] bg-gradient-to-r from-[#0f172a] via-[#102a4c] to-[#0b5c8e] p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">
              Edit Application
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight">
              Update your grant application
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/85">
              You can edit applications while they are Submitted or Under Review.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] sm:p-8"
          >
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Project Title
                </label>
                <input
                  type="text"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Abstract
                </label>
                <textarea
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Requested Funding
                  </label>
                  <input
                    type="number"
                    name="requestedFunding"
                    value={formData.requestedFunding}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Research Field
                  </label>
                  <input
                    type="text"
                    name="researchField"
                    value={formData.researchField}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/funding")}
                className="rounded-2xl bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditGrantApplication;