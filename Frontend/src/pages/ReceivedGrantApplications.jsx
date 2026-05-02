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

const ReceivedGrantApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/grant-applications/received");
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error("Error fetching received applications:", error);
      alert("Failed to load received grant applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (applicationId, status, reviewerNote = "") => {
    try {
      setUpdatingId(applicationId);

      const response = await api.put(`/grant-applications/${applicationId}/status`, {
        status,
        reviewerNote,
      });

      setApplications((prev) =>
        prev.map((application) =>
          application._id === applicationId
            ? response.data.application
            : application
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

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
              Received Applications
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight">
              Review grant applications
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/85">
              Manage applications submitted to funding opportunities you posted.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-slate-500">
              Loading received applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-slate-500">
              No applications have been submitted to your funding opportunities
              yet.
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

                      <p className="mt-1 text-sm text-slate-500">
                        Applicant:{" "}
                        <span className="font-semibold text-slate-700">
                          {application.applicant?.username ||
                            application.applicant?.email ||
                            "Unknown"}
                        </span>
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
                    </div>

                    <div className="w-full space-y-3 lg:w-[240px]">
                      <button
                        onClick={() =>
                          handleDownload(
                            application._id,
                            application.proposalFileName
                          )
                        }
                        className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Download Proposal
                      </button>

                      <button
                        disabled={updatingId === application._id}
                        onClick={() =>
                          handleStatusChange(
                            application._id,
                            "under_review",
                            "Application is currently under review."
                          )
                        }
                        className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                      >
                        Mark Under Review
                      </button>

                      <button
                        disabled={updatingId === application._id}
                        onClick={() =>
                          handleStatusChange(
                            application._id,
                            "approved",
                            "Congratulations. Your grant application has been approved."
                          )
                        }
                        className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                      >
                        Approve
                      </button>

                      <button
                        disabled={updatingId === application._id}
                        onClick={() =>
                          handleStatusChange(
                            application._id,
                            "rejected",
                            "Your grant application was not selected for this opportunity."
                          )
                        }
                        className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
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

export default ReceivedGrantApplications;