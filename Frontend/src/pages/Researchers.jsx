import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Researchers() {
  const storedUser =
    JSON.parse(localStorage.getItem("researchConnectUser")) || null;

  const [researchers, setResearchers] = useState([]);
  const [suggestedResearchers, setSuggestedResearchers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [error, setError] = useState("");
  const [suggestionsError, setSuggestionsError] = useState("");

  const [search, setSearch] = useState("");
  const [researchInterest, setResearchInterest] = useState("");
  const [skill, setSkill] = useState("");

  const truncateText = (text, maxLength = 135) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
  };

  const buildVisibleChips = (primaryList = [], secondaryList = [], maxVisible = 3) => {
    const primary = primaryList.slice(0, 2);
    const remainingSlots = Math.max(maxVisible - primary.length, 0);
    const secondary = secondaryList.slice(0, remainingSlots);

    const totalCount = primaryList.length + secondaryList.length;
    const visibleCount = primary.length + secondary.length;
    const hiddenCount = Math.max(totalCount - visibleCount, 0);

    return {
      primary,
      secondary,
      hiddenCount,
    };
  };

  const fetchResearchers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("http://localhost:5000/api/users", {
        params: {
          search,
          researchInterest,
          skill,
          excludeUserId: storedUser?.id || "",
        },
      });

      setResearchers(res.data.researchers || []);
    } catch (err) {
      console.error("Failed to fetch researchers", err);
      setError(err.response?.data?.message || "Failed to load researchers");
      setResearchers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedResearchers = async () => {
    if (!storedUser?.id) {
      setSuggestedResearchers([]);
      return;
    }

    try {
      setSuggestionsLoading(true);
      setSuggestionsError("");

      const res = await axios.get(
        `http://localhost:5000/api/users/${storedUser.id}/suggested-collaborators`
      );

      setSuggestedResearchers(res.data.matches || []);
    } catch (err) {
      console.error("Failed to fetch suggested researchers", err);
      setSuggestionsError(
        err.response?.data?.message || "Failed to load suggested researchers"
      );
      setSuggestedResearchers([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchers();
    fetchSuggestedResearchers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResearchers();
  };

  const renderNormalCard = (researcher) => {
    const profilePictureUrl = researcher.profilePictureId
      ? `http://localhost:5000/api/auth/profile-picture/${researcher.profilePictureId}`
      : "";

    const isCollaborator =
      researcher.collaborators?.some(
        (collaboratorId) => collaboratorId?.toString?.() === storedUser?.id
      ) || false;

    const requestAlreadySent =
      researcher.requestedCollaborations?.some(
        (requesterId) => requesterId?.toString?.() === storedUser?.id
      ) || false;

    const interests = researcher.researchInterests || [];
    const skills = researcher.skills || [];
    const aboutMe = truncateText(researcher.aboutMe || "No bio added yet.", 135);

    const {
      primary: visibleInterests,
      secondary: visibleSkills,
      hiddenCount,
    } = buildVisibleChips(interests, skills, 3);

    return (
      <Link
        key={researcher._id}
        to={`/researchers/${researcher._id}`}
        className="researcher-card-link"
      >
        <div className="solution_cards_box">
          <div className="solution_card">
            <div className="hover_color_bubble"></div>

            <div className="solu_badges">
              <span className="solu_badge solu_badge_primary">Researcher</span>

              {isCollaborator && (
                <span className="solu_badge solu_badge_success">
                  Collaborator
                </span>
              )}

              {!isCollaborator && requestAlreadySent && (
                <span className="solu_badge solu_badge_primary">
                  Request Sent
                </span>
              )}
            </div>

            <div className="solu_top_row">
              <div className="so_top_icon">
                {profilePictureUrl ? (
                  <img src={profilePictureUrl} alt={researcher.username} />
                ) : (
                  <span>{researcher.username?.charAt(0).toUpperCase() || "U"}</span>
                )}
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="solu_meta">Research Connect Directory</div>
                <div className="solu_title">
                  <div>{researcher.username}</div>
                </div>
                <div className="solu_email">{researcher.email}</div>
              </div>
            </div>

            <div className="solu_metrics">
              <div className="solu_metric_box">
                <span className="solu_metric_label">Interests</span>
                <span className="solu_metric_value">{interests.length}</span>
              </div>

              <div className="solu_metric_box">
                <span className="solu_metric_label">Skills</span>
                <span className="solu_metric_value">{skills.length}</span>
              </div>

              <div className="solu_metric_box">
                <span className="solu_metric_label">Status</span>
                <span className="solu_metric_value">
                  {isCollaborator
                    ? "Connected"
                    : requestAlreadySent
                    ? "Pending"
                    : "Available"}
                </span>
              </div>

              <div className="solu_metric_box">
                <span className="solu_metric_label">Top Focus</span>
                <span className="solu_metric_value">
                  {interests[0] || "General"}
                </span>
              </div>
            </div>

            <div className="solu_description">
              <p>{aboutMe}</p>
            </div>

            <div>
              <span className="solu_section_label">Interests & Skills</span>
              <div className="solu_chip_group">
                {visibleInterests.map((interest) => (
                  <span key={interest} className="solu_chip">
                    {interest}
                  </span>
                ))}

                {visibleSkills.map((item) => (
                  <span key={item} className="solu_chip">
                    {item}
                  </span>
                ))}

                {hiddenCount > 0 && (
                  <span className="solu_chip">+{hiddenCount} more</span>
                )}
              </div>
            </div>

            <div className="solu_description solu_footer_button">
              <button className="read_more_btn" type="button">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const renderSuggestedCard = (match) => {
    const researcher = match.user;
    if (!researcher) return null;

    const profilePictureUrl = researcher.profilePictureId
      ? `http://localhost:5000/api/auth/profile-picture/${researcher.profilePictureId}`
      : "";

    const sharedInterests = match.sharedInterests || [];
    const sharedSkills = match.sharedSkills || [];
    const reason = truncateText(
      match.reason || "Strong potential research collaboration.",
      135
    );

    const {
      primary: visibleInterests,
      secondary: visibleSkills,
      hiddenCount,
    } = buildVisibleChips(sharedInterests, sharedSkills, 3);

    return (
      <Link
        key={researcher.id}
        to={`/researchers/${researcher.id}`}
        className="researcher-card-link"
      >
        <div className="solution_cards_box">
          <div className="solution_card">
            <div className="hover_color_bubble"></div>

            <div className="solu_badges">
              <span className="solu_badge solu_badge_match">AI Suggested</span>
              <span className="solu_badge solu_badge_primary">
                {match.matchScore || 0}% Match
              </span>
            </div>

            <div className="solu_top_row">
              <div className="so_top_icon">
                {profilePictureUrl ? (
                  <img src={profilePictureUrl} alt={researcher.username} />
                ) : (
                  <span>{researcher.username?.charAt(0).toUpperCase() || "U"}</span>
                )}
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="solu_meta">Research Connect AI Match</div>
                <div className="solu_title">
                  <div>{researcher.username}</div>
                </div>
                <div className="solu_email">{researcher.email}</div>
              </div>
            </div>

            <div className="solu_metrics">
              <div className="solu_metric_box">
                <span className="solu_metric_label">Score</span>
                <span className="solu_metric_value">
                  {match.matchScore || 0}%
                </span>
              </div>

              <div className="solu_metric_box">
                <span className="solu_metric_label">Shared Interests</span>
                <span className="solu_metric_value">
                  {sharedInterests.length}
                </span>
              </div>

              <div className="solu_metric_box">
                <span className="solu_metric_label">Shared Skills</span>
                <span className="solu_metric_value">
                  {sharedSkills.length}
                </span>
              </div>

              <div className="solu_metric_box">
                <span className="solu_metric_label">Top Focus</span>
                <span className="solu_metric_value">
                  {researcher.researchInterests?.[0] || "General"}
                </span>
              </div>
            </div>

            <div className="solu_description">
              <p>{reason}</p>
            </div>

            <div>
              <span className="solu_section_label">Shared Signals</span>
              <div className="solu_chip_group">
                {visibleInterests.map((item) => (
                  <span key={item} className="solu_chip">
                    {item}
                  </span>
                ))}

                {visibleSkills.map((item) => (
                  <span key={item} className="solu_chip">
                    {item}
                  </span>
                ))}

                {hiddenCount > 0 && (
                  <span className="solu_chip">+{hiddenCount} more</span>
                )}
              </div>
            </div>

            <div className="solu_description solu_footer_button">
              <button className="read_more_btn" type="button">
                Explore Match
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white animated-bg">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <header className="mb-8">
          <div className="hero-badge">Collaborate with researchers</div>
          <h1 className="hero-title">
            Find your next <span>research partner</span>
          </h1>
          <p className="hero-subtitle">
            Search researchers across the platform and get AI-powered
            collaborator suggestions based on research interests and skills.
          </p>
        </header>

        {storedUser && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900">
              Suggested Collaborators
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Personalized matches based on your research interests and skills.
            </p>

            {suggestionsLoading && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                Loading suggested collaborators...
              </div>
            )}

            {!suggestionsLoading && suggestionsError && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
                {suggestionsError}
              </div>
            )}

            {!suggestionsLoading &&
              !suggestionsError &&
              suggestedResearchers.length > 0 && (
                <section className="section_our_solution mt-4">
                  <div className="our_solution_category">
                    {suggestedResearchers.map(renderSuggestedCard)}
                  </div>
                </section>
              )}
          </section>
        )}

        <section className="mb-10 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm backdrop-blur">
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
            />

            <input
              type="text"
              placeholder="Research interest"
              value={researchInterest}
              onChange={(e) => setResearchInterest(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
            />

            <input
              type="text"
              placeholder="Skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
            />

            <button
              type="submit"
              className="rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-700 hover:shadow-lg"
            >
              Search Researchers
            </button>
          </form>
        </section>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Loading researchers...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && researchers.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            No researchers found.
          </div>
        )}

        {!loading && !error && researchers.length > 0 && (
          <section className="section_our_solution">
            <div className="our_solution_category">
              {researchers.map(renderNormalCard)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}