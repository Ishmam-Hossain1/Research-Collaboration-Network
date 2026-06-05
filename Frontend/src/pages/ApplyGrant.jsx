import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X,
  Sparkles,
  FileText,
  DollarSign,
  FlaskConical,
  UploadCloud,
  BookOpen,
  CalendarDays,
  BadgeCheck,
  Loader2,
} from "lucide-react";

const ApplyGrant = ({
  funding: fundingFromProps = null,
  fundingId = null,
  onClose = null,
  onSubmitted = null,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const resolvedFundingId = fundingId || id || fundingFromProps?._id;

  const [funding, setFunding] = useState(fundingFromProps);
  const [loading, setLoading] = useState(!fundingFromProps);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    projectTitle: "",
    abstract: "",
    requestedFunding: fundingFromProps?.fundingAmount || "",
    researchField: "",
    proposal: null,
  });

  useEffect(() => {
    if (fundingFromProps) {
      setFunding(fundingFromProps);
      setFormData((prev) => ({
        ...prev,
        requestedFunding: fundingFromProps.fundingAmount || "",
      }));
      setLoading(false);
      return;
    }

    const fetchFunding = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_BASEURL}/api/funding/${resolvedFundingId}`
        );
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
        alert("Something went wrong while loading the funding opportunity.");
      } finally {
        setLoading(false);
      }
    };

    if (resolvedFundingId) {
      fetchFunding();
    }
  }, [fundingFromProps, resolvedFundingId]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/funding");
    }
  };

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
      payload.append("fundingOpportunity", resolvedFundingId);
      payload.append("projectTitle", formData.projectTitle);
      payload.append("abstract", formData.abstract);
      payload.append("requestedFunding", formData.requestedFunding);
      payload.append("researchField", formData.researchField);
      payload.append("proposal", formData.proposal);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/grant-applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      setShowSuccess(true);

      setTimeout(() => {
        if (onSubmitted) {
          onSubmitted();
        }

        if (onClose) {
          onClose();
        } else {
          navigate("/grant-applications/mine");
        }
      }, 1600);
    } catch (error) {
      console.error("Submit application error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/45 px-4 py-6 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_35px_100px_rgba(15,23,42,0.35)]">
        <div className="flex items-start justify-between border-b border-slate-100 bg-white px-7 py-5 sm:px-9">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Apply for Grant
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Submit your research details, funding request, and proposal file
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
          >
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto px-7 py-6 sm:px-9">
          {loading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Loading application form...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-50 via-slate-50 to-white px-6 py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-[0_12px_30px_rgba(37,99,235,0.12)]">
                  <Sparkles size={30} />
                </div>

                <h3 className="mt-5 text-xl font-black text-slate-950">
                  {funding?.grantTitle || "Grant Application"}
                </h3>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Keep your application clear and focused. Add your project
                  title, abstract, research field, requested funding amount, and
                  proposal document.
                </p>
              </div>

              <div className="mb-7 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <DollarSign size={17} className="text-blue-600" />
                    Amount
                  </div>
                  <p className="text-lg font-black text-emerald-600">
                    USD {funding?.fundingAmount || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <CalendarDays size={17} className="text-blue-600" />
                    Deadline
                  </div>
                  <p className="text-sm font-bold text-red-500">
                    {funding?.deadline
                      ? new Date(funding.deadline).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <BadgeCheck size={17} className="text-blue-600" />
                    Eligibility
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                    {funding?.eligibilityCriteria || "Not specified"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                      <BookOpen size={16} className="text-blue-600" />
                      Project Title
                    </label>
                    <input
                      type="text"
                      name="projectTitle"
                      value={formData.projectTitle}
                      onChange={handleChange}
                      required
                      placeholder="Example: AI-Based Cancer Detection System"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                      <FileText size={16} className="text-blue-600" />
                      Abstract
                    </label>
                    <textarea
                      name="abstract"
                      value={formData.abstract}
                      onChange={handleChange}
                      required
                      rows="5"
                      placeholder="Write a short summary of your proposed research..."
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                        <DollarSign size={16} className="text-blue-600" />
                        Requested Funding
                      </label>

                      <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                        <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-500">
                          USD
                        </span>
                        <input
                          type="number"
                          name="requestedFunding"
                          value={formData.requestedFunding}
                          onChange={handleChange}
                          required
                          placeholder="Enter amount"
                          className="w-full px-4 py-3.5 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                        <FlaskConical size={16} className="text-blue-600" />
                        Research Field
                      </label>
                      <input
                        type="text"
                        name="researchField"
                        value={formData.researchField}
                        onChange={handleChange}
                        required
                        placeholder="e.g. AI, Biology, Public Health"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                      <UploadCloud size={16} className="text-blue-600" />
                      Proposal Document
                    </label>

                    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center transition hover:border-blue-300 hover:bg-blue-50/50">
                      <UploadCloud
                        size={34}
                        className="text-blue-600 transition group-hover:scale-110"
                      />

                      <p className="mt-3 text-sm font-black text-slate-800">
                        {formData.proposal
                          ? formData.proposal.name
                          : "Upload your proposal"}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        PDF, DOC, or DOCX files are accepted
                      </p>

                      <input
                        type="file"
                        name="proposal"
                        onChange={handleChange}
                        required
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="rounded-2xl bg-blue-50 px-5 py-4">
                    <p className="text-sm font-bold text-slate-700">
                      Posting tip
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      A clear abstract and complete proposal document can help
                      reviewers understand your research faster.
                    </p>
                  </div>
                </div>

                <div className="sticky bottom-0 mt-7 flex flex-col gap-3 border-t border-slate-100 bg-white pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-2xl bg-blue-600 px-7 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] border border-white/70 bg-white p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl text-green-600">
              ✓
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              Application Submitted
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your grant application has been submitted successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyGrant;
