import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import underReviewImg from "../assets/under-review.jpg";

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

const ActionIcon = ({ type }) => {
  const icons = {
    download: (
      <path d="M12 3v10m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    ),
    review: (
      <path d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    ),
    approve: <path d="M20 6 9 17l-5-5" />,
    reject: <path d="M18 6 6 18M6 6l12 12" />,
  };

  return (
    <svg
      className="h-5 w-5 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[type]}
    </svg>
  );
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

      const response = await api.put(
        `/grant-applications/${applicationId}/status`,
        {
          status,
          reviewerNote,
        }
      );

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

  const actionButton =
    "group flex w-full items-center gap-3 rounded-2xl border-l-4 px-4 py-3 text-left text-sm font-bold shadow-sm transition duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          
           <div className="mb-8 overflow-hidden rounded-[32px] border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
               {/* LEFT SIDE  */}
              <div>
                <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-700">
                  Received Applications
                </span>

                <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Review grant applications
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                  Manage, review, approve, or reject applications submitted to
                  the funding opportunities you posted.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 shadow-sm">
                    {applications.length} applications
                  </div>

                  <div className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 shadow-sm">
                    Received by you
                  </div>

                  <div className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 shadow-sm">
                    Review queue
                  </div>
                </div>
              </div>

               {/* RIGHT SIDE IMAGE  */}
              <img
                src={underReviewImg}
                alt="Under Review"
                className="w-48 rotate-[-10deg] opacity-85 transition duration-300 hover:scale-105"
              />
            </div>
          </div>
           
          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white/90 px-6 py-16 text-center text-slate-500 shadow-sm">
              Loading received applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white/90 px-6 py-16 text-center text-slate-500 shadow-sm">
              No applications have been submitted to your funding opportunities
              yet.
            </div>
          ) : (


             <div className="space-y-6">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className="group relative z-[1] overflow-hidden rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_2px_4px_rgba(136,144,195,0.2),0_5px_15px_rgba(37,44,97,0.15)] transition-all duration-500 ease-in-out hover:-translate-y-1.5 hover:bg-[#309df0] hover:text-white hover:shadow-[0_22px_70px_rgba(48,157,240,0.32)]"
                >
                  {/* angled background shape */}
                  <div className="absolute -right-14 -top-8 z-[-1] h-[380px] w-[170px] rotate-[42deg] rounded-[35px] bg-[#556cd6]/5 transition duration-500 group-hover:bg-white/10" />

                  {/* hover bubble */}
                  <div className="absolute -left-72 top-64 z-[-1] h-[900px] w-[900px] rotate-[-36deg] rounded-full bg-[#3651cf]/15 transition-all duration-700 group-hover:top-0" />

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
                    {/* LEFT CONTENT */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black transition duration-300 ${
                            statusStyles[application.status] ||
                            "border-slate-100 bg-slate-50 text-slate-600"
                          } group-hover:border-white/30 group-hover:bg-white/20 group-hover:text-white`}
                        >
                          {formatStatus(application.status)}
                        </span>

                        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700 transition duration-300 group-hover:border-white/30 group-hover:bg-white/20 group-hover:text-white">
                          Grant Application
                        </span>
                      </div>

                      <h2 className="mt-4 line-clamp-1 text-2xl font-black text-slate-950 transition duration-300 group-hover:text-white">
                        {application.projectTitle}
                      </h2>

                      <p className="mt-2 line-clamp-1 text-sm font-bold text-blue-600 transition duration-300 group-hover:text-white">
                        {application.fundingOpportunity?.grantTitle}
                      </p>

                      <p className="mt-2 text-sm text-slate-500 transition duration-300 group-hover:text-white/90">
                        Applicant:{" "}
                        <span className="font-bold text-slate-700 transition duration-300 group-hover:text-white">
                          {application.applicant?.username ||
                            application.applicant?.email ||
                            "Unknown"}
                        </span>
                      </p>

                      <p className="mt-5 line-clamp-2 text-sm leading-7 text-slate-600 transition duration-300 group-hover:text-white/90">
                        {application.abstract}
                      </p>

                      <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="border-l-2 border-blue-200 pl-3 transition duration-300 group-hover:border-white/35">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 transition duration-300 group-hover:text-white/70">
                            Requested
                          </p>
                          <p className="mt-1 font-black text-slate-900 transition duration-300 group-hover:text-white">
                            ${application.requestedFunding}
                          </p>
                        </div>

                        <div className="border-l-2 border-blue-200 pl-3 transition duration-300 group-hover:border-white/35">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 transition duration-300 group-hover:text-white/70">
                            Field
                          </p>
                          <p className="mt-1 line-clamp-1 font-black text-slate-900 transition duration-300 group-hover:text-white">
                            {application.researchField}
                          </p>
                        </div>

                        <div className="border-l-2 border-blue-200 pl-3 transition duration-300 group-hover:border-white/35">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 transition duration-300 group-hover:text-white/70">
                            Submitted
                          </p>
                          <p className="mt-1 font-black text-slate-900 transition duration-300 group-hover:text-white">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT ACTION BOX */}
                    <div className="w-full rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.10)] transition duration-500 group-hover:scale-[1.01] group-hover:border-white group-hover:shadow-[0_18px_45px_rgba(15,23,42,0.18)] lg:w-[270px]">
                      <div className="space-y-3">
                        <button
                          onClick={() =>
                            handleDownload(application._id, application.proposalFileName)
                          }
                          className="flex w-full items-center rounded-lg border-l-4 border-blue-500 bg-blue-100 p-2 text-left text-blue-900 transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-200"
                        >
                          <span className="mr-2 text-blue-600">
                            <ActionIcon type="download" />
                          </span>
                          <span className="text-xs font-semibold">
                            Download Proposal
                          </span>
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
                          className="flex w-full items-center rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-2 text-left text-yellow-900 transition duration-300 ease-in-out hover:scale-105 hover:bg-yellow-200 disabled:opacity-60"
                        >
                          <span className="mr-2 text-yellow-600">
                            <ActionIcon type="review" />
                          </span>
                          <span className="text-xs font-semibold">
                            Mark Under Review
                          </span>
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
                          className="flex w-full items-center rounded-lg border-l-4 border-green-500 bg-green-100 p-2 text-left text-green-900 transition duration-300 ease-in-out hover:scale-105 hover:bg-green-200 disabled:opacity-60"
                        >
                          <span className="mr-2 text-green-600">
                            <ActionIcon type="approve" />
                          </span>
                          <span className="text-xs font-semibold">
                            Approve
                          </span>
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
                          className="flex w-full items-center rounded-lg border-l-4 border-red-500 bg-red-100 p-2 text-left text-red-900 transition duration-300 ease-in-out hover:scale-105 hover:bg-red-200 disabled:opacity-60"
                        >
                          <span className="mr-2 text-red-600">
                            <ActionIcon type="reject" />
                          </span>
                          <span className="text-xs font-semibold">
                            Reject
                          </span>
                        </button>
                      </div>
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