import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import applicationHero from "../assets/submit-application.jpg";

const statusStyles = {
  submitted: "bg-blue-50 text-blue-700 border-blue-100",
  under_review: "bg-amber-50 text-amber-700 border-amber-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
};

const formatStatus = (status) => {
  if (!status) return "Submitted";
  if (status === "under_review") return "Under Review";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount));
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

  const stats = useMemo(() => {
    return {
      total: applications.length,
      underReview: applications.filter(
        (application) => application.status === "under_review"
      ).length,
      approved: applications.filter(
        (application) => application.status === "approved"
      ).length,
      rejected: applications.filter(
        (application) => application.status === "rejected"
      ).length,
    };
  }, [applications]);

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

  const pageStyles = `
    .grant-hero {
      position: relative;
      overflow: hidden;
      border-radius: 34px;
      padding: 34px;
      background:
        radial-gradient(circle at top left, rgba(56, 189, 248, 0.2), transparent 30%),
        radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.16), transparent 28%),
        linear-gradient(135deg, #ffffff 0%, #f0f9ff 45%, #eef2ff 100%);
      border: 1px solid rgba(226, 232, 240, 0.95);
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 28px;
      align-items: center;
      margin-bottom: 34px;
    }

    .grant-hero::before {
      content: "";
      position: absolute;
      width: 320px;
      height: 320px;
      border-radius: 999px;
      background: rgba(59, 130, 246, 0.1);
      left: -110px;
      bottom: -160px;
    }

    .grant-hero-content {
      position: relative;
      z-index: 2;
    }

    .grant-hero-eyebrow {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 8px 15px;
      background: rgba(14, 165, 233, 0.1);
      color: #0369a1;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .grant-hero-title {
      margin-top: 18px;
      font-size: clamp(2rem, 4vw, 3.25rem);
      line-height: 1.05;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.04em;
    }

    .grant-hero-title span {
      color: #2563eb;
    }

    .grant-hero-description {
      margin-top: 16px;
      max-width: 650px;
      font-size: 1rem;
      line-height: 1.8;
      color: #475569;
    }

    .grant-hero-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 25px;
    }

    .grant-hero-stat {
      min-width: 150px;
      padding: 14px 16px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.76);
      border: 1px solid rgba(226, 232, 240, 0.95);
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
      backdrop-filter: blur(12px);
    }

    .grant-hero-stat span {
      display: block;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 8px;
    }

    .grant-hero-stat strong {
      font-size: 1.55rem;
      font-weight: 900;
      color: #0f172a;
    }

    .grant-hero-visual {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .grant-hero-image-card {
      width: 100%;
      max-width: 345px;
      padding: 18px;
      border-radius: 30px;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(226, 232, 240, 0.95);
      box-shadow: 0 20px 55px rgba(15, 23, 42, 0.1);
      transform: rotate(1.5deg);
    }

    .grant-hero-image-card img {
      width: 100%;
      display: block;
      object-fit: contain;
    }

    .grant-state-card {
      border-radius: 26px;
      padding: 52px 24px;
      text-align: center;
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.95);
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
    }

    .grant-state-card h3 {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 10px;
    }

    .grant-state-card p {
      max-width: 620px;
      margin: 0 auto;
      color: #64748b;
      line-height: 1.7;
    }

    .grant-applications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
      gap: 22px;
      align-items: stretch;
    }

    .grant-application-card-wrap {
      display: flex;
      width: 100%;
      height: 100%;
      min-width: 0;
    }

    .grant-application-card {
      width: 100%;
      min-height: 430px;
      background: #fff;
      box-shadow:
        0 2px 4px 0 rgba(136, 144, 195, 0.15),
        0 8px 24px 0 rgba(37, 44, 97, 0.1);
      border-radius: 22px;
      margin: 0;
      padding: 22px 22px 20px;
      position: relative;
      z-index: 1;
      overflow: hidden;
      transition: 0.45s ease;
      border: 1px solid rgba(226, 232, 240, 0.9);
      display: flex;
      flex-direction: column;
    }

    .grant-application-card:hover {
      background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 55%, #6366f1 100%);
      color: #fff;
      transform: translateY(-6px);
      z-index: 9;
    }

    .grant-application-card::before {
      content: "";
      position: absolute;
      background: rgba(59, 130, 246, 0.06);
      width: 170px;
      height: 400px;
      z-index: -1;
      transform: rotate(42deg);
      right: -56px;
      top: -23px;
      border-radius: 35px;
    }

    .grant-hover-bubble {
      position: absolute;
      background: rgba(59, 130, 246, 0.12);
      width: 100rem;
      height: 100rem;
      z-index: -1;
      top: 16rem;
      border-radius: 50%;
      transform: rotate(-36deg);
      left: -18rem;
      transition: 0.7s;
    }

    .grant-application-card:hover .grant-hover-bubble {
      top: 0rem;
    }

    .grant-card-badges {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 14px;
      min-height: 32px;
    }

    .grant-card-badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 7px 13px;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border: 1px solid transparent;
    }

    .grant-badge-submitted {
      background: rgba(59, 130, 246, 0.12);
      color: #0369a1;
    }

    .grant-badge-review {
      background: rgba(245, 158, 11, 0.14);
      color: #b45309;
    }

    .grant-badge-approved {
      background: rgba(34, 197, 94, 0.14);
      color: #15803d;
    }

    .grant-badge-rejected {
      background: rgba(239, 68, 68, 0.14);
      color: #b91c1c;
    }

    .grant-badge-field {
      background: rgba(139, 92, 246, 0.14);
      color: #6d28d9;
    }

    .grant-card-top {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
      min-height: 86px;
    }

    .grant-card-icon {
      width: 76px;
      height: 76px;
      min-width: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
      border: 1px solid rgba(226, 232, 240, 0.85);
      font-size: 1.55rem;
      font-weight: 900;
      color: #2563eb;
    }

    .grant-card-title-wrap {
      min-width: 0;
      flex: 1;
    }

    .grant-card-title {
      color: #0f172a;
      font-size: 1.38rem;
      margin-top: 4px;
      margin-bottom: 6px;
      font-weight: 900;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .grant-card-meta {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #64748b;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    .grant-card-date {
      font-size: 0.95rem;
      color: #64748b;
      margin-top: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .grant-card-description {
      font-size: 15px;
      margin-bottom: 12px;
      line-height: 1.65;
      color: #475569;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 74px;
    }

    // .grant-card-metrics {
    //   display: grid;
    //   grid-template-columns: 1fr 1fr;
    //   gap: 16px;
    //   margin-top: 6px;
    //   margin-bottom: 16px;
    //   min-height: 95px;
    // }

    .grant-card-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-top: 4px;
      margin-bottom: 12px;
      min-height: 72px;
    }

    .grant-card-metric {
      border-left: 2px solid rgba(48, 157, 240, 0.16);
      padding-left: 12px;
    }

    .grant-card-metric-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      color: rgba(15, 23, 42, 0.5);
      margin-bottom: 6px;
      display: block;
      font-weight: 800;
      letter-spacing: 0.06em;
    }

    .grant-card-metric-value {
      font-size: 1.02rem;
      font-weight: 800;
      color: #1e293b;
      word-break: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .grant-card-section-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      color: rgba(15, 23, 42, 0.5);
      margin-bottom: 10px;
      display: block;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    // .grant-card-chip-group {
    //   display: flex;
    //   flex-wrap: wrap;
    //   gap: 8px;
    //   margin-bottom: 18px;
    //   min-height: 72px;
    //   align-content: flex-start;
    // }
    .grant-card-chip-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
      min-height: 48px;
      align-content: flex-start;
    }

    .grant-card-chip {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 7px 13px;
      font-size: 0.74rem;
      font-weight: 700;
      border: 1px solid rgba(148, 163, 184, 0.22);
      background: rgba(248, 250, 252, 0.95);
      color: #334155;
      max-width: 180px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .grant-reviewer-note {
      margin-bottom: 12px;
      padding: 12px 14px;
      border-radius: 16px;
      border: 1px solid rgba(191, 219, 254, 0.9);
      background: #eff6ff;
    }

    .grant-reviewer-note-label {
      display: block;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #2563eb;
      margin-bottom: 8px;
    }

    .grant-reviewer-note p {
      color: #1e3a8a;
      line-height: 1.65;
      font-size: 0.95rem;
      margin: 0;
    }

    .grant-card-action-wrap {
      margin-top: auto;
    }

    .grant-card-action {
      border: 0;
      border-radius: 14px;
      background: linear-gradient(140deg, #42c3ca 0%, #3b82f6 100%);
      color: #fff;
      font-weight: 800;
      font-size: 0.95rem;
      padding: 12px 18px;
      cursor: pointer;
      transition: 0.3s ease;
      width: 100%;
    }

    .grant-card-action:hover {
      transform: translateY(-1px);
    }

    .grant-application-card:hover .grant-card-title,
    .grant-application-card:hover .grant-card-meta,
    .grant-application-card:hover .grant-card-date,
    .grant-application-card:hover .grant-card-description,
    .grant-application-card:hover .grant-card-metric-label,
    .grant-application-card:hover .grant-card-metric-value,
    .grant-application-card:hover .grant-card-section-label,
    .grant-application-card:hover .grant-reviewer-note-label,
    .grant-application-card:hover .grant-reviewer-note p {
      color: #fff;
    }

    .grant-application-card:hover .grant-card-chip,
    .grant-application-card:hover .grant-card-badge {
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.28);
    }

    .grant-application-card:hover .grant-reviewer-note {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.22);
    }

    .grant-application-card:hover .grant-card-action {
      background: #fff;
      color: #2563eb;
    }

    @media (min-width: 1280px) {
      .grant-applications-grid {
        grid-template-columns: repeat(3, minmax(320px, 1fr));
      }
    }

    @media (max-width: 1024px) {
      .grant-hero {
        grid-template-columns: 1fr;
      }

      .grant-hero-visual {
        order: -1;
      }

      .grant-hero-image-card {
        max-width: 280px;
      }
    }

    @media (min-width: 768px) and (max-width: 1279px) {
      .grant-applications-grid {
        grid-template-columns: repeat(2, minmax(300px, 1fr));
      }
    }

    @media (max-width: 767px) {
      .grant-hero {
        padding: 24px;
      }

      .grant-hero-stats {
        flex-direction: column;
      }

      .grant-hero-stat {
        width: 100%;
      }

      .grant-applications-grid {
        grid-template-columns: 1fr;
      }

      .grant-application-card {
        width: 100%;
        min-height: 400px;
        padding: 18px 16px 16px;
      }

      .grant-card-title {
        font-size: 1.25rem;
      }

      .grant-card-description {
        min-height: 88px;
      }

      .grant-card-metrics {
        grid-template-columns: 1fr;
        min-height: auto;
      }
    }
  `;

  return (
    <>
      <style>{pageStyles}</style>
      <Navbar />

      <div className="min-h-screen bg-[#f7fafc] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grant-hero">
            <div className="grant-hero-content">
              <span className="grant-hero-eyebrow">Funding Workspace</span>

              <h1 className="grant-hero-title">
                My Grant <span>Applications</span>
              </h1>

              <p className="grant-hero-description">
                Track submitted proposals, review application progress, download
                proposal documents, and stay updated on every funding request you
                have made.
              </p>

              <div className="grant-hero-stats">
                <div className="grant-hero-stat">
                  <span>Total</span>
                  <strong>{stats.total}</strong>
                </div>

                <div className="grant-hero-stat">
                  <span>Under Review</span>
                  <strong>{stats.underReview}</strong>
                </div>

                <div className="grant-hero-stat">
                  <span>Approved</span>
                  <strong>{stats.approved}</strong>
                </div>

                <div className="grant-hero-stat">
                  <span>Rejected</span>
                  <strong>{stats.rejected}</strong>
                </div>
              </div>
            </div>

            <div className="grant-hero-visual">
              <div className="grant-hero-image-card">
                <img
                  src={applicationHero}
                  alt="Grant application illustration"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grant-state-card">
              <h3>Loading applications...</h3>
              <p>Please wait while we fetch your submitted grant applications.</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="grant-state-card">
              <h3>No grant applications yet</h3>
              <p>
                Once you submit a grant application, it will appear here with
                its status, proposal details, and downloadable document.
              </p>
            </div>
          ) : (
            <div className="grant-applications-grid">
              {applications.map((application) => {
                const statusClass =
                  application.status === "approved"
                    ? "grant-badge-approved"
                    : application.status === "rejected"
                    ? "grant-badge-rejected"
                    : application.status === "under_review"
                    ? "grant-badge-review"
                    : "grant-badge-submitted";

                return (
                  <div
                    key={application._id}
                    className="grant-application-card-wrap"
                  >
                    <div className="grant-application-card">
                      <div className="grant-hover-bubble" />

                      <div className="grant-card-badges">
                        <span className={`grant-card-badge ${statusClass}`}>
                          {formatStatus(application.status)}
                        </span>

                        <span className="grant-card-badge grant-badge-field">
                          {application.researchField || "Research"}
                        </span>
                      </div>

                      <div className="grant-card-top">
                        <div className="grant-card-icon">
                          {application.projectTitle?.charAt(0)?.toUpperCase() ||
                            "G"}
                        </div>

                        <div className="grant-card-title-wrap">
                          <h2 className="grant-card-title">
                            {application.projectTitle || "Untitled Project"}
                          </h2>

                          <p className="grant-card-meta">
                            {application.fundingOpportunity?.grantTitle ||
                              "Funding Opportunity"}
                          </p>

                          <p className="grant-card-date">
                            Submitted on{" "}
                            {application.createdAt
                              ? new Date(
                                  application.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <p className="grant-card-description">
                        {application.abstract ||
                          "No abstract was provided for this application."}
                      </p>

                      <div className="grant-card-metrics">
                        <div className="grant-card-metric">
                          <span className="grant-card-metric-label">
                            Requested Funding
                          </span>
                          <div className="grant-card-metric-value">
                            {formatCurrency(application.requestedFunding)}
                          </div>
                        </div>

                        <div className="grant-card-metric">
                          <span className="grant-card-metric-label">
                            Current Status
                          </span>
                          <div className="grant-card-metric-value">
                            {formatStatus(application.status)}
                          </div>
                        </div>
                      </div>

                      <span className="grant-card-section-label">
                        Application Details
                      </span>

                      <div className="grant-card-chip-group">
                        <span className="grant-card-chip">
                          {application.researchField || "Research Field"}
                        </span>

                        <span className="grant-card-chip">
                          {application.proposalFileName || "Proposal File"}
                        </span>

                        <span className="grant-card-chip">
                          {application.createdAt
                            ? new Date(application.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>

                      {application.reviewerNote && (
                        <div className="grant-reviewer-note">
                          <span className="grant-reviewer-note-label">
                            Reviewer Note
                          </span>
                          <p>{application.reviewerNote}</p>
                        </div>
                      )}

                      <div className="grant-card-action-wrap">
                        <button
                          onClick={() =>
                            handleDownload(
                              application._id,
                              application.proposalFileName
                            )
                          }
                          className="grant-card-action"
                        >
                          Download Proposal
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyGrantApplications;