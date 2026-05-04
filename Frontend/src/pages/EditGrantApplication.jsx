import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeDollarSign,
  BookOpen,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  PencilLine,
  Sparkles,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../lib/api";

const EditGrantApplication = ({
  isOpen = true,
  onClose,
  onUpdated,
  applicationId,
}) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  const id = applicationId || routeId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    projectTitle: "",
    abstract: "",
    requestedFunding: "",
    researchField: "",
  });

  useEffect(() => {
    if (!isOpen || !id) return;

    const fetchApplication = async () => {
      try {
        setLoading(true);

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
  }, [id, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const closeForm = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/funding");
    }
  };

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

      setShowSuccess(true);

      setTimeout(() => {
        if (onUpdated) {
          onUpdated();
        } else {
          navigate("/grant-applications/mine");
        }
      }, 1300);
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
        {!applicationId && <Navbar />}

        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-8 text-center shadow-[0_28px_90px_rgba(15,23,42,0.28)]">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 font-semibold text-slate-600">
              Loading application...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {!applicationId && <Navbar />}

      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-md">
        <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]">
          <button
            type="button"
            onClick={closeForm}
            disabled={saving}
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={19} />
          </button>

          <div className="border-b border-slate-100 bg-white px-7 py-6 sm:px-9">
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              Edit Grant Application
            </h1>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Update your submitted project details, field, abstract, and
              requested funding amount.
            </p>
          </div>

          <div className="overflow-y-auto px-7 py-7 sm:px-9">
            <div className="mb-7 overflow-hidden rounded-[26px] bg-gradient-to-b from-slate-50 via-white to-blue-50/60 px-6 py-7 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-sm">
                <PencilLine size={30} />
              </div>

              <h2 className="mt-5 text-lg font-black text-slate-950">
                Refine Your Application
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">
                Make your application clearer so the funding owner can quickly
                understand your research goal, field, and budget request.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                    <FileText size={16} className="text-blue-600" />
                    Project Title
                  </label>

                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    required
                    placeholder="Enter project title"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                      <BadgeDollarSign size={16} className="text-blue-600" />
                      Requested Funding
                    </label>

                    <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                      <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
                        USD
                      </span>

                      <input
                        type="number"
                        name="requestedFunding"
                        value={formData.requestedFunding}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="Amount"
                        className="w-full px-4 py-3.5 text-sm text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                      <BookOpen size={16} className="text-blue-600" />
                      Research Field
                    </label>

                    <input
                      type="text"
                      name="researchField"
                      value={formData.researchField}
                      onChange={handleChange}
                      required
                      placeholder="Example: Machine Learning"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                    <Sparkles size={16} className="text-blue-600" />
                    Abstract
                  </label>

                  <textarea
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Write a clear summary of your research proposal..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-7 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-600">
                      <Info size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        Editing tip
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Keep the abstract focused on your research problem,
                        method, expected outcome, and why the requested funding
                        is needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[28px] border border-white/70 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 size={34} />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950">
                Application Updated
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your grant application changes have been saved successfully.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EditGrantApplication;
