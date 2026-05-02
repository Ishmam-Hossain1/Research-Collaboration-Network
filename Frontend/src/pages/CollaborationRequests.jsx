import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const tabs = [
  { id: "received", label: "Received" },
  { id: "sent", label: "Sent" },
];

export default function CollaborationRequests() {
  const storedUser =
    JSON.parse(localStorage.getItem("researchConnectUser")) || null;

  const [activeTab, setActiveTab] = useState("received");
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      if (!storedUser?.id) {
        setLoading(false);
        setError("User not logged in");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [receivedRes, sentRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/users/${storedUser.id}/collaboration-requests`
          ),
          axios.get(
            `http://localhost:5000/api/users/${storedUser.id}/sent-collaboration-requests`
          ),
        ]);

        setReceivedRequests(receivedRes.data.requests || []);
        setSentRequests(sentRes.data.requests || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [storedUser?.id]);

  const handleAccept = async (requesterUserId) => {
    if (!storedUser?.id) return;

    try {
      setActionLoadingId(requesterUserId);
      setError("");

      await axios.post(
        "http://localhost:5000/api/users/collaboration-request/accept",
        {
          currentUserId: storedUser.id,
          requesterUserId,
        }
      );

      setReceivedRequests((prev) =>
        prev.filter((user) => user._id !== requesterUserId)
      );
    } catch (err) {
      console.error("Failed to accept collaboration request", err);
      setError(
        err.response?.data?.message || "Failed to accept collaboration request"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleReject = async (requesterUserId) => {
    if (!storedUser?.id) return;

    try {
      setActionLoadingId(requesterUserId);
      setError("");

      await axios.post(
        "http://localhost:5000/api/users/collaboration-request/reject",
        {
          currentUserId: storedUser.id,
          requesterUserId,
        }
      );

      setReceivedRequests((prev) =>
        prev.filter((user) => user._id !== requesterUserId)
      );
    } catch (err) {
      console.error("Failed to reject collaboration request", err);
      setError(
        err.response?.data?.message || "Failed to reject collaboration request"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleCancelSentRequest = async (toUserId) => {
    if (!storedUser?.id) return;

    try {
      setActionLoadingId(toUserId);
      setError("");

      await axios.post(
        "http://localhost:5000/api/users/collaboration-request/cancel",
        {
          fromUserId: storedUser.id,
          toUserId,
        }
      );

      setSentRequests((prev) => prev.filter((user) => user._id !== toUserId));
    } catch (err) {
      console.error("Failed to cancel collaboration request", err);
      setError(
        err.response?.data?.message || "Failed to cancel collaboration request"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const requestsToShow =
    activeTab === "received" ? receivedRequests : sentRequests;

  return (
    <div className="min-h-screen bg-white animated-bg">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        <header className="mb-8">
          <div className="hero-badge">Collaboration requests</div>
          <h1 className="hero-title">
            Manage your <span>collaborations</span>
          </h1>
          <p className="hero-subtitle">
            Review requests you received and track the ones you already sent.
          </p>
        </header>

        <div className="mb-8 flex gap-6 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError("");
              }}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-b-2 border-sky-500 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="rounded-xl border p-6 text-sm text-slate-500">
            Loading requests...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && requestsToShow.length === 0 && (
          <div className="rounded-xl border p-6 text-sm text-slate-500">
            No {activeTab} requests yet.
          </div>
        )}

        {!loading && !error && requestsToShow.length > 0 && (
          <section className="grid gap-6 md:grid-cols-2">
            {requestsToShow.map((researcher) => {
              const profilePictureUrl = researcher.profilePictureId
                ? `http://localhost:5000/api/auth/profile-picture/${researcher.profilePictureId}`
                : "";

              const isProcessing = actionLoadingId === researcher._id;

              return (
                <article
                  key={researcher._id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <Link to={`/researchers/${researcher._id}`} className="block">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xl font-semibold text-slate-500">
                        {profilePictureUrl ? (
                          <img
                            src={profilePictureUrl}
                            alt={researcher.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          researcher.username?.charAt(0).toUpperCase() || "U"
                        )}
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {researcher.username}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {researcher.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          About
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {researcher.aboutMe || "No bio added yet."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Research Interests
                        </h3>
                        {researcher.researchInterests?.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {researcher.researchInterests.map((interest) => (
                              <span
                                key={interest}
                                className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-slate-500">
                            No research interests added.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Skills
                        </h3>
                        {researcher.skills?.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {researcher.skills.map((item) => (
                              <span
                                key={item}
                                className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-slate-500">
                            No skills added.
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>

                  {activeTab === "received" && (
                    <div className="mt-5 flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleAccept(researcher._id)}
                        disabled={isProcessing}
                        className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessing ? "Processing..." : "Accept"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(researcher._id)}
                        disabled={isProcessing}
                        className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessing ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  )}

                  {activeTab === "sent" && (
                    <div className="mt-5 flex items-center justify-between gap-3 pt-2">
                      <span className="text-sm font-medium text-sky-600">
                        Requested
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCancelSentRequest(researcher._id)}
                        disabled={isProcessing}
                        className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessing ? "Cancelling..." : "Cancel Request"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}