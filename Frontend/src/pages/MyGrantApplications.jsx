import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../lib/api";

const statusStyles = {
  submitted: "bg-blue-50 text-blue-700 border-blue-100",
  under_review: "bg-amber-50 text-amber-700 border-amber-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
};

const formatStatus = (status) => {
  if (status === "under_review") return "Under Review";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const MyGrantApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/grant-applications/mine");
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      alert("Failed to load your grant applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDownload = async (applicationId, fileName) => {
    try {
      const response = await api.get(
        `/grant-applications/${applicationId}/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", fileName || "proposal-document");
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading proposal:", error);
      alert("Failed to download proposal");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-[30px] bg-gradient-to-r from-[#0f172a] via-[#102a4c] to-[#0b5c8e] p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">
              My Grant Applications
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight">
              Track your submitted applications
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/85">
              View proposal details, download submitted documents, and monitor
              the review workflow.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-slate-500">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-slate-500">
              You have not submitted any grant applications yet.
            </div>
          ) : (
            <div className="space-y-5">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900">
                          {application.projectTitle}
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusStyles[application.status] ||
                            "border-slate-100 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {formatStatus(application.status)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium text-blue-600">
                        {application.fundingOpportunity?.grantTitle}
                      </p>

                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {application.abstract}
                      </p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Requested
                          </p>
                          <p className="mt-1 font-bold text-slate-800">
                            ${application.requestedFunding}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Field
                          </p>
                          <p className="mt-1 font-bold text-slate-800">
                            {application.researchField}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Submitted
                          </p>
                          <p className="mt-1 font-bold text-slate-800">
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {application.reviewerNote && (
                        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase text-blue-500">
                            Reviewer Note
                          </p>
                          <p className="mt-2 text-sm leading-6 text-blue-800">
                            {application.reviewerNote}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        handleDownload(
                          application._id,
                          application.proposalFileName
                        )
                      }
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Download Proposal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyGrantApplications;