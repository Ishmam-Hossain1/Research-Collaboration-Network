import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  UserRound,
  Sparkles,
  Pencil,
  Users,
  BookOpen,
  BadgeCheck,
  FolderKanban,
  Star,
  X,
  Camera,
} from "lucide-react";
import Navbar from "../components/Navbar";

const tabs = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "collaborators", label: "Collaborators", icon: Users },
];

export default function UserProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    aboutMe: "",
    relationshipStatus: "",
    skillsText: "",
    researchInterestsText: "",
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  const storedUser =
    JSON.parse(localStorage.getItem("researchConnectUser")) || null;
  const userId = storedUser?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        setError("No logged-in user found");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setProfile(res.data);

        setFormData({
          username: res.data.username || "",
          email: res.data.email || "",
          aboutMe: res.data.aboutMe || "",
          relationshipStatus: res.data.relationshipStatus || "",
          skillsText: Array.isArray(res.data.skills)
            ? res.data.skills.join(", ")
            : "",
          researchInterestsText: Array.isArray(res.data.researchInterests)
            ? res.data.researchInterests.join(", ")
            : "",
        });
      } catch (err) {
        console.error("Failed to load profile", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const displayName = profile?.username || "";
  const email = profile?.email || "";
  const expertise = profile?.skills || [];
  const researchInterests = profile?.researchInterests || [];
  const collaborators = profile?.collaborators || [];
  const projects = profile?.projects || [];
  const reviews = profile?.reviews || [];

  const profilePictureUrl = profile?.profilePictureId
    ? `http://localhost:5000/api/auth/profile-picture/${profile.profilePictureId}`
    : "";

  return (
    <div className="min-h-screen bg-white animated-bg">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <header className="mb-10 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-[0_25px_60px_rgba(15,23,42,0.18)] md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <Sparkles size={16} />
                Your research profile
              </div>

              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Present your <span className="text-sky-300">work</span> with
                confidence
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
                Keep your profile, skills, collaborators, and research interests
                up to date so the right people can find you, trust your work,
                and connect with you faster.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Skills" value={expertise.length} />
              <StatCard label="Interests" value={researchInterests.length} />
              <StatCard label="Collaborators" value={collaborators.length} />
              <StatCard label="Projects" value={projects.length} />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[340px,1fr]">
          <aside className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 text-4xl font-bold text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : displayName ? (
                    displayName.charAt(0).toUpperCase()
                  ) : (
                    "U"
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                {displayName || "Your Name"}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Mail size={15} />
                <span>{email || "No email available"}</span>
              </div>

              <div className="mt-5 grid w-full gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>

                <Link
                  to="/collaboration-requests"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-md"
                >
                  <Users size={16} />
                  Collaboration Requests
                </Link>
              </div>
            </div>
          </aside>

          <section className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-7">
            <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-sky-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {loading && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                Loading profile...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {activeTab === "overview" && (
                  <OverviewTab
                    aboutMe={profile?.aboutMe}
                    relationshipStatus={profile?.relationshipStatus}
                    researchInterests={profile?.researchInterests}
                    skills={profile?.skills}
                  />
                )}

                {activeTab === "projects" && (
                  <ProjectsTab projects={profile?.projects} />
                )}

                {activeTab === "reviews" && (
                  <ReviewsTab reviews={profile?.reviews} />
                )}

                {activeTab === "collaborators" && (
                  <CollaboratorsTab collaborators={profile?.collaborators} />
                )}
              </>
            )}
          </section>
        </section>
      </main>

      {isEditing && (
        <EditProfileModal
          formData={formData}
          setFormData={setFormData}
          profilePictureFile={profilePictureFile}
          setProfilePictureFile={setProfilePictureFile}
          currentProfilePictureUrl={profilePictureUrl}
          onClose={() => {
            setProfilePictureFile(null);
            setIsEditing(false);
          }}
          onSave={async () => {
            if (!userId) return;
            setSaving(true);
            setError(null);

            const toArray = (value) =>
              value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

            try {
              let updated = { ...profile };

              if (profilePictureFile) {
                const pictureForm = new FormData();
                pictureForm.append("profilePicture", profilePictureFile);
                const pictureRes = await axios.put(
                  `http://localhost:5000/api/users/${userId}/profile-picture`,
                  pictureForm,
                  {
                    headers: { "Content-Type": "multipart/form-data" },
                  }
                );
                updated = {
                  ...updated,
                  ...(pictureRes.data.user || pictureRes.data),
                };
              }

              const payload = {
                username: formData.username,
                email: formData.email,
                aboutMe: formData.aboutMe,
                relationshipStatus: formData.relationshipStatus,
                skills: toArray(formData.skillsText),
                researchInterests: toArray(formData.researchInterestsText),
              };

              const res = await axios.put(
                `http://localhost:5000/api/users/${userId}`,
                payload
              );

              const profileUpdate = res.data.user || res.data;
              updated = { ...updated, ...profileUpdate };
              setProfile(updated);

              const stored =
                JSON.parse(localStorage.getItem("researchConnectUser")) || {};
              localStorage.setItem(
                "researchConnectUser",
                JSON.stringify({
                  ...stored,
                  username: updated.username,
                  email: updated.email,
                  aboutMe: updated.aboutMe,
                  skills: updated.skills,
                  relationshipStatus: updated.relationshipStatus,
                  profilePictureId: updated.profilePictureId,
                })
              );

              setProfilePictureFile(null);
              setIsEditing(false);
            } catch (err) {
              console.error("Failed to update profile", err);
              setError(err.response?.data?.message || "Failed to update profile");
            } finally {
              setSaving(false);
            }
          }}
          saving={saving}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center backdrop-blur">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-center text-[11px] uppercase tracking-wide leading-4 text-slate-200">
        {label}
      </div>
    </div>
  );
}

function OverviewTab({
  aboutMe = "",
  relationshipStatus = "",
  researchInterests = [],
  skills = [],
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
      <section className="space-y-6">
        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">About Me</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {aboutMe || "No information added yet."}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Relationship Status
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {relationshipStatus || "Not added yet."}
          </p>
        </article>
      </section>

      <section className="space-y-6">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Research Interests
            </h3>
          </div>

          {researchInterests.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {researchInterests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-200"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No research interests added yet.
            </p>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">Core Skills</h3>
          </div>

          {skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No skills added yet.</p>
          )}
        </article>
      </section>
    </div>
  );
}

function ProjectsTab({ projects = [] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Projects</h2>

      {projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((project, index) => (
            <article
              key={project._id || index}
              className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-slate-900">
                {project.title || project.name || `Project ${index + 1}`}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {project.abstract ||
                  project.description ||
                  "No project description added yet."}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          No projects added yet.
        </div>
      )}
    </div>
  );
}

function ReviewsTab({ reviews = [] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <article
              key={review._id || index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm leading-7 text-slate-700">
                {review.content || review.text || `Review ${index + 1}`}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          No reviews added yet.
        </div>
      )}
    </div>
  );
}

function CollaboratorsTab({ collaborators = [] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Collaborators</h2>

      {collaborators?.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {collaborators.map((collaborator, index) => {
            const profilePictureUrl = collaborator?.profilePictureId
              ? `http://localhost:5000/api/auth/profile-picture/${collaborator.profilePictureId}`
              : "";

            return (
              <Link
                key={collaborator._id || index}
                to={`/researchers/${collaborator._id}`}
                className="block"
              >
                <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-lg font-semibold text-slate-500 shadow-sm">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt={collaborator.username || "Collaborator"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        collaborator?.username?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {collaborator.username || `Collaborator ${index + 1}`}
                      </h3>
                      <p className="truncate text-sm text-slate-500">
                        {collaborator.email || "No email available"}
                      </p>
                    </div>
                  </div>

                  {collaborator?.skills?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {collaborator.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          No collaborators added yet.
        </div>
      )}
    </div>
  );
}

function EditProfileModal({
  formData,
  setFormData,
  profilePictureFile,
  setProfilePictureFile,
  currentProfilePictureUrl,
  onClose,
  onSave,
  saving,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!profilePictureFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profilePictureFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePictureFile]);

  const displayUrl = previewUrl || currentProfilePictureUrl;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Edit Profile
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update your profile details and appearance.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md">
                {displayUrl ? (
                  <img
                    src={displayUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-400">
                    <UserRound size={28} />
                  </div>
                )}
              </div>

              <div className="absolute -bottom-1 -right-1 rounded-full bg-sky-600 p-2 text-white shadow-md">
                <Camera size={14} />
              </div>
            </div>

            <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              Change profile picture
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setProfilePictureFile(file);
                }}
              />
            </label>

            {profilePictureFile && (
              <span className="text-xs text-slate-500">
                {profilePictureFile.name}
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Username">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </Field>
          </div>

          <Field label="About Me">
            <textarea
              name="aboutMe"
              value={formData.aboutMe}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </Field>

          <Field label="Relationship Status / Ideal Collaboration">
            <textarea
              name="relationshipStatus"
              value={formData.relationshipStatus}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </Field>

          <Field label="Skills (comma separated)">
            <input
              type="text"
              name="skillsText"
              value={formData.skillsText}
              onChange={handleChange}
              placeholder="e.g. Machine Learning, HCI, Data Visualization"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </Field>

          <Field label="Research Interests (comma separated)">
            <input
              type="text"
              name="researchInterestsText"
              value={formData.researchInterestsText}
              onChange={handleChange}
              placeholder="e.g. Human-AI Collaboration, Explainable AI"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}