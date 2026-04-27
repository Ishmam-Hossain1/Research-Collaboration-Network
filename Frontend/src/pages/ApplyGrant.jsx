import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../lib/api";

const ApplyGrant = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [funding, setFunding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [formData, setFormData] = useState({
    projectTitle: "",
    abstract: "",
    requestedFunding: "",
    researchField: "",
    proposal: null,
  });

  useEffect(() => {
    const fetchFunding = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/funding/${id}`);
        const data = await response.json();

        if (response.ok) {
          setFunding(data);
          setFormData((prev) => ({
            ...prev,
            requestedFunding: data.fundingAmount || "",
          }));
        } else {
          alert(data.message || "Failed to load funding opportunity");
        }
      } catch (error) {
        console.error("Funding fetch error:", error);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchFunding();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "proposal") {
      setFormData((prev) => ({
        ...prev,
        proposal: files[0],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("researchConnectToken");

    if (!token) {
      alert("Please log in before applying.");
      navigate("/login");
      return;
    }

    if (!formData.proposal) {
      alert("Please upload your proposal document.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("fundingOpportunity", id);
      payload.append("projectTitle", formData.projectTitle);
      payload.append("abstract", formData.abstract);
      payload.append("requestedFunding", formData.requestedFunding);
      payload.append("researchField", formData.researchField);
      payload.append("proposal", formData.proposal);

      const response = await fetch("http://localhost:5000/api/grant-applications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      setShowPopup(true);

      setTimeout(() => {
        navigate("/grant-applications/mine");
      }, 2000);
    } catch (error) {
      console.error("Submit application error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center text-slate-500 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            Loading application form...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className={`min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-10 ${showPopup ? "blur-sm" : ""}`}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#0f172a] via-[#102a4c] to-[#0b5c8e] p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] sm:p-10">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100 backdrop-blur">
              Grant application
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Apply for <span className="text-blue-400">{funding?.grantTitle}</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/85 sm:text-base">
              Submit your project title, abstract, funding request, research field, and proposal document.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Opportunity details
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">Funding Amount</p>
                  <p className="mt-1 text-xl font-bold text-emerald-600">
                    ${funding?.fundingAmount}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">Deadline</p>
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    {new Date(funding?.deadline).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">Eligibility</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {funding?.eligibilityCriteria}
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] sm:p-8"
            >
              <div className="space-y-6">
                <div>
                  <label className="mb-2.5 block text-sm font-semibold text-slate-700">
                    Project Title
                  </label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="Enter your research project title"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-sm font-semibold text-slate-700">
                    Abstract
                  </label>
                  <textarea
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="Write a short abstract for your proposal"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">
                      Requested Funding
                    </label>
                    <input
                      type="number"
                      name="requestedFunding"
                      value={formData.requestedFunding}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">
                      Research Field
                    </label>
                    <input
                      type="text"
                      name="researchField"
                      value={formData.researchField}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      placeholder="e.g. AI, Biology, Public Health"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-sm font-semibold text-slate-700">
                    Proposal Document
                  </label>
                  <input
                    type="file"
                    name="proposal"
                    onChange={handleChange}
                    required
                    accept=".pdf,.doc,.docx"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-700 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/funding")}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-600">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Application Submitted
            </h2>
            <p className="mt-2 text-slate-500">
              Redirecting to your applications...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyGrant;