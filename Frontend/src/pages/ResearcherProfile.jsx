// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import Navbar from "../components/Navbar";

// const tabs = [
//   { id: "overview", label: "Overview" },
//   { id: "projects", label: "Projects" },
//   { id: "reviews", label: "Reviews" },
// ];

// export default function ResearcherProfile() {
//   const { id } = useParams();

//   const [activeTab, setActiveTab] = useState("overview");
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchProfile = async () => {
//       if (!id) {
//         setLoading(false);
//         setError("Researcher id is missing");
//         return;
//       }

//       try {
//         const res = await axios.get(`http://localhost:5000/api/users/${id}`);
//         setProfile(res.data);
//       } catch (err) {
//         console.error("Failed to load researcher profile", err);
//         setError("Failed to load researcher profile");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [id]);

//   const displayName = profile?.username || "";
//   const email = profile?.email || "";
//   const expertise = profile?.skills || [];
//   const profilePictureUrl = profile?.profilePictureId
//     ? `http://localhost:5000/api/auth/profile-picture/${profile.profilePictureId}`
//     : "";

//   return (
//     <div className="min-h-screen bg-white animated-bg">
//       <Navbar />

//       <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
//         <header className="mb-10">
//           <div className="hero-badge">Researcher profile</div>
//           <h1 className="hero-title">
//             Explore this researcher’s <span>work</span>
//           </h1>
//           <p className="hero-subtitle">
//             View their profile, interests, skills, projects, and reviews before
//             sending a collaboration request.
//           </p>
//         </header>

//         <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_22px_55px_rgba(15,23,42,0.10)] md:p-8">
//           <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px,1fr]">
//             <section className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
//               <div className="relative mb-4">
//                 <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-3xl font-semibold text-slate-500">
//                   {profilePictureUrl ? (
//                     <img
//                       src={profilePictureUrl}
//                       alt="Profile"
//                       className="h-full w-full object-cover"
//                     />
//                   ) : displayName ? (
//                     displayName.charAt(0).toUpperCase()
//                   ) : (
//                     ""
//                   )}
//                 </div>
//               </div>

//               {displayName && (
//                 <h1 className="text-center text-xl font-semibold text-slate-900">
//                   {displayName}
//                 </h1>
//               )}

//               {email && (
//                 <p className="mt-1 text-center text-sm text-slate-500">
//                   {email}
//                 </p>
//               )}

//               <button
//                 type="button"
//                 className="profile-action-btn"
//               >
//                 Request Collaboration
//               </button>

//               {expertise.length > 0 && (
//                 <div className="mt-6 w-full">
//                   <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
//                     Skills
//                   </h2>
//                   <div className="flex flex-wrap gap-2">
//                     {expertise.map((item) => (
//                       <span
//                         key={item}
//                         className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
//                       >
//                         {item}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </section>

//             <section className="flex flex-col gap-4">
//               <div className="flex items-center justify-between">
//                 <nav className="flex gap-6 text-sm">
//                   {tabs.map((tab) => (
//                     <button
//                       key={tab.id}
//                       onClick={() => setActiveTab(tab.id)}
//                       className={`pb-2 text-sm font-medium transition-colors ${
//                         activeTab === tab.id
//                           ? "border-b-2 border-sky-500 text-slate-900"
//                           : "border-b-2 border-transparent text-slate-500 hover:text-slate-800"
//                       }`}
//                     >
//                       {tab.label}
//                     </button>
//                   ))}
//                 </nav>
//               </div>

//               <div className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm md:p-7">
//                 {loading && (
//                   <p className="text-sm text-slate-500">
//                     Loading researcher profile...
//                   </p>
//                 )}

//                 {!loading && error && (
//                   <p className="text-sm text-red-500">{error}</p>
//                 )}

//                 {!loading && !error && (
//                   <>
//                     {activeTab === "overview" && (
//                       <OverviewTab
//                         aboutMe={profile?.aboutMe}
//                         relationshipStatus={profile?.relationshipStatus}
//                         researchInterests={profile?.researchInterests}
//                         skills={profile?.skills}
//                       />
//                     )}

//                     {activeTab === "projects" && (
//                       <ProjectsTab projects={profile?.projects} />
//                     )}

//                     {activeTab === "reviews" && (
//                       <ReviewsTab reviews={profile?.reviews} />
//                     )}
//                   </>
//                 )}
//               </div>
//             </section>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }

// function OverviewTab({
//   aboutMe = "",
//   relationshipStatus = "",
//   researchInterests = [],
//   skills = [],
// }) {
//   return (
//     <div className="grid gap-8 lg:grid-cols-[2fr,1.2fr]">
//       <div className="space-y-6">
//         <section>
//           <h2 className="text-sm font-semibold text-slate-900">About Me</h2>
//           <p className="mt-2 text-sm leading-relaxed text-slate-600">
//             {aboutMe || "No information added yet."}
//           </p>
//         </section>

//         <section>
//           <h2 className="text-sm font-semibold text-slate-900">
//             Relationship Status
//           </h2>
//           <p className="mt-2 text-sm leading-relaxed text-slate-600">
//             {relationshipStatus || "Not added yet."}
//           </p>
//         </section>
//       </div>

//       <div className="space-y-4">
//         <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//           <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
//             Research Interests
//           </h3>
//           {researchInterests.length > 0 ? (
//             <div className="mt-3 flex flex-wrap gap-2">
//               {researchInterests.map((interest) => (
//                 <span
//                   key={interest}
//                   className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
//                 >
//                   {interest}
//                 </span>
//               ))}
//             </div>
//           ) : (
//             <p className="mt-3 text-sm text-slate-500">
//               No research interests added yet.
//             </p>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }

// function ProjectsTab({ projects = [] }) {
//   return (
//     <div className="space-y-6">
//       <section>
//         <h2 className="text-sm font-semibold text-slate-900">Projects</h2>
//         {projects?.length > 0 ? (
//           <div className="mt-3 space-y-3">
//             {projects.map((project, index) => (
//               <div
//                 key={project._id || index}
//                 className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
//               >
//                 {project.title || project.name || `Project ${index + 1}`}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="mt-2 text-sm text-slate-600">No projects added yet.</p>
//         )}
//       </section>
//     </div>
//   );
// }

// function ReviewsTab({ reviews = [] }) {
//   return (
//     <div className="space-y-6">
//       <section>
//         <h2 className="text-sm font-semibold text-slate-900">Reviews</h2>
//         {reviews?.length > 0 ? (
//           <div className="mt-3 space-y-4">
//             {reviews.map((review, index) => (
//               <article
//                 key={review._id || index}
//                 className="rounded-xl border border-slate-200 bg-white p-4"
//               >
//                 <p className="text-sm leading-relaxed text-slate-700">
//                   {review.content || review.text || `Review ${index + 1}`}
//                 </p>
//               </article>
//             ))}
//           </div>
//         ) : (
//           <p className="mt-2 text-sm text-slate-600">No reviews added yet.</p>
//         )}
//       </section>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import Navbar from "../components/Navbar";

// const tabs = [
//   { id: "overview", label: "Overview" },
//   { id: "projects", label: "Projects" },
//   { id: "reviews", label: "Reviews" },
// ];

// export default function ResearcherProfile() {
//   const { id } = useParams();
//   const storedUser =
//     JSON.parse(localStorage.getItem("researchConnectUser")) || null;

//   const [activeTab, setActiveTab] = useState("overview");
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [sendingRequest, setSendingRequest] = useState(false);
//   const [requestMessage, setRequestMessage] = useState("");
//   const [requestSent, setRequestSent] = useState(false);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       if (!id) {
//         setLoading(false);
//         setError("Researcher id is missing");
//         return;
//       }

//       try {
//         const res = await axios.get(`http://localhost:5000/api/users/${id}`);
//         setProfile(res.data);

//         const requestedCollaborations = res.data.requestedCollaborations || [];
//         if (storedUser?.id && requestedCollaborations.includes(storedUser.id)) {
//           setRequestSent(true);
//           setRequestMessage("Collaboration request already sent");
//         }
//       } catch (err) {
//         console.error("Failed to load researcher profile", err);
//         setError("Failed to load researcher profile");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [id, storedUser?.id]);

//   const handleRequestCollaboration = async () => {
//     if (!storedUser?.id) {
//       setRequestMessage("Please log in first");
//       return;
//     }

//     try {
//       setSendingRequest(true);
//       setRequestMessage("");

//       const res = await axios.post(
//         "http://localhost:5000/api/users/collaboration-request",
//         {
//           fromUserId: storedUser.id,
//           toUserId: id,
//         }
//       );

//       setRequestSent(true);
//       setRequestMessage(
//         res.data.message || "Collaboration request sent successfully"
//       );
//       setProfile((prev) =>
//         prev
//           ? {
//               ...prev,
//               requestedCollaborations: [
//                 ...(prev.requestedCollaborations || []),
//                 storedUser.id,
//               ],
//             }
//           : prev
//       );
//     } catch (err) {
//       console.error("Failed to send collaboration request", err);
//       setRequestMessage(
//         err.response?.data?.message || "Failed to send collaboration request"
//       );
//     } finally {
//       setSendingRequest(false);
//     }
//   };

//   const displayName = profile?.username || "";
//   const email = profile?.email || "";
//   const expertise = profile?.skills || [];
//   const profilePictureUrl = profile?.profilePictureId
//     ? `http://localhost:5000/api/auth/profile-picture/${profile.profilePictureId}`
//     : "";

//   return (
//     <div className="min-h-screen bg-white animated-bg">
//       <Navbar />

//       <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
//         <header className="mb-10">
//           <div className="hero-badge">Researcher profile</div>
//           <h1 className="hero-title">
//             Explore this researcher’s <span>work</span>
//           </h1>
//           <p className="hero-subtitle">
//             View their profile, interests, skills, projects, and reviews before
//             sending a collaboration request.
//           </p>
//         </header>

//         <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_22px_55px_rgba(15,23,42,0.10)] md:p-8">
//           <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px,1fr]">
//             <section className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
//               <div className="relative mb-4">
//                 <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-3xl font-semibold text-slate-500">
//                   {profilePictureUrl ? (
//                     <img
//                       src={profilePictureUrl}
//                       alt="Profile"
//                       className="h-full w-full object-cover"
//                     />
//                   ) : displayName ? (
//                     displayName.charAt(0).toUpperCase()
//                   ) : (
//                     ""
//                   )}
//                 </div>
//               </div>

//               {displayName && (
//                 <h1 className="text-center text-xl font-semibold text-slate-900">
//                   {displayName}
//                 </h1>
//               )}

//               {email && (
//                 <p className="mt-1 text-center text-sm text-slate-500">
//                   {email}
//                 </p>
//               )}

//               <button
//                 type="button"
//                 onClick={handleRequestCollaboration}
//                 disabled={sendingRequest || requestSent || storedUser?.id === id}
//                 className={`mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white transition
//                   ${
//                     requestSent
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-sky-600 hover:bg-sky-700"
//                   }`}
//               >
//                 {storedUser?.id === id
//                   ? "This is you"
//                   : sendingRequest
//                   ? "Sending..."
//                   : requestSent
//                   ? "Requested"
//                   : "Request Collaboration"}
//               </button>
//               {requestMessage && (
//                 <p
//                   className={`mt-3 text-center text-sm ${
//                     requestSent ? "text-green-600" : "text-red-500"
//                   }`}
//                 >
//                   {requestMessage}
//                 </p>
//               )}

//               {expertise.length > 0 && (
//                 <div className="mt-6 w-full">
//                   <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
//                     Skills
//                   </h2>
//                   <div className="flex flex-wrap gap-2">
//                     {expertise.map((item) => (
//                       <span
//                         key={item}
//                         className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
//                       >
//                         {item}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </section>

//             <section className="flex flex-col gap-4">
//               <div className="flex items-center justify-between">
//                 <nav className="flex gap-6 text-sm">
//                   {tabs.map((tab) => (
//                     <button
//                       key={tab.id}
//                       onClick={() => setActiveTab(tab.id)}
//                       className={`pb-2 text-sm font-medium transition-colors ${
//                         activeTab === tab.id
//                           ? "border-b-2 border-sky-500 text-slate-900"
//                           : "border-b-2 border-transparent text-slate-500 hover:text-slate-800"
//                       }`}
//                     >
//                       {tab.label}
//                     </button>
//                   ))}
//                 </nav>
//               </div>

//               <div className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm md:p-7">
//                 {loading && (
//                   <p className="text-sm text-slate-500">
//                     Loading researcher profile...
//                   </p>
//                 )}

//                 {!loading && error && (
//                   <p className="text-sm text-red-500">{error}</p>
//                 )}

//                 {!loading && !error && (
//                   <>
//                     {activeTab === "overview" && (
//                       <OverviewTab
//                         aboutMe={profile?.aboutMe}
//                         relationshipStatus={profile?.relationshipStatus}
//                         researchInterests={profile?.researchInterests}
//                         skills={profile?.skills}
//                       />
//                     )}

//                     {activeTab === "projects" && (
//                       <ProjectsTab projects={profile?.projects} />
//                     )}

//                     {activeTab === "reviews" && (
//                       <ReviewsTab reviews={profile?.reviews} />
//                     )}
//                   </>
//                 )}
//               </div>
//             </section>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }

// function OverviewTab({
//   aboutMe = "",
//   relationshipStatus = "",
//   researchInterests = [],
//   skills = [],
// }) {
//   return (
//     <div className="grid gap-8 lg:grid-cols-[2fr,1.2fr]">
//       <div className="space-y-6">
//         <section>
//           <h2 className="text-sm font-semibold text-slate-900">About Me</h2>
//           <p className="mt-2 text-sm leading-relaxed text-slate-600">
//             {aboutMe || "No information added yet."}
//           </p>
//         </section>

//         <section>
//           <h2 className="text-sm font-semibold text-slate-900">
//             Relationship Status
//           </h2>
//           <p className="mt-2 text-sm leading-relaxed text-slate-600">
//             {relationshipStatus || "Not added yet."}
//           </p>
//         </section>
//       </div>

//       <div className="space-y-4">
//         <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//           <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
//             Research Interests
//           </h3>
//           {researchInterests.length > 0 ? (
//             <div className="mt-3 flex flex-wrap gap-2">
//               {researchInterests.map((interest) => (
//                 <span
//                   key={interest}
//                   className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
//                 >
//                   {interest}
//                 </span>
//               ))}
//             </div>
//           ) : (
//             <p className="mt-3 text-sm text-slate-500">
//               No research interests added yet.
//             </p>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }

// function ProjectsTab({ projects = [] }) {
//   return (
//     <div className="space-y-6">
//       <section>
//         <h2 className="text-sm font-semibold text-slate-900">Projects</h2>
//         {projects?.length > 0 ? (
//           <div className="mt-3 space-y-3">
//             {projects.map((project, index) => (
//               <div
//                 key={project._id || index}
//                 className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
//               >
//                 {project.title || project.name || `Project ${index + 1}`}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="mt-2 text-sm text-slate-600">No projects added yet.</p>
//         )}
//       </section>
//     </div>
//   );
// }

// function ReviewsTab({ reviews = [] }) {
//   return (
//     <div className="space-y-6">
//       <section>
//         <h2 className="text-sm font-semibold text-slate-900">Reviews</h2>
//         {reviews?.length > 0 ? (
//           <div className="mt-3 space-y-4">
//             {reviews.map((review, index) => (
//               <article
//                 key={review._id || index}
//                 className="rounded-xl border border-slate-200 bg-white p-4"
//               >
//                 <p className="text-sm leading-relaxed text-slate-700">
//                   {review.content || review.text || `Review ${index + 1}`}
//                 </p>
//               </article>
//             ))}
//           </div>
//         ) : (
//           <p className="mt-2 text-sm text-slate-600">No reviews added yet.</p>
//         )}
//       </section>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "projects", label: "Projects" },
  { id: "reviews", label: "Reviews" },
];

export default function ResearcherProfile() {
  const { id } = useParams();
  const storedUser =
    JSON.parse(localStorage.getItem("researchConnectUser")) || null;

  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [alreadyCollaborators, setAlreadyCollaborators] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setLoading(false);
        setError("Researcher id is missing");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/users/${id}`);
        setProfile(res.data);

        const requestedCollaborations = res.data.requestedCollaborations || [];
        if (storedUser?.id && requestedCollaborations.includes(storedUser.id)) {
          setRequestSent(true);
          setRequestMessage("Collaboration request already sent");
        }

        const collaborators = res.data.collaborators || [];
        const isAlreadyCollaborator = collaborators.some(
          (collaborator) => collaborator._id === storedUser?.id
        );

        if (isAlreadyCollaborator) {
          setAlreadyCollaborators(true);
          setRequestMessage("You are already collaborators");
        }
      } catch (err) {
        console.error("Failed to load researcher profile", err);
        setError("Failed to load researcher profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, storedUser?.id]);

  const handleRequestCollaboration = async () => {
    if (!storedUser?.id) {
      setRequestMessage("Please log in first");
      return;
    }

    try {
      setSendingRequest(true);
      setRequestMessage("");

      const res = await axios.post(
        "http://localhost:5000/api/users/collaboration-request",
        {
          fromUserId: storedUser.id,
          toUserId: id,
        }
      );

      setRequestSent(true);
      setRequestMessage(
        res.data.message || "Collaboration request sent successfully"
      );
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              requestedCollaborations: [
                ...(prev.requestedCollaborations || []),
                storedUser.id,
              ],
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to send collaboration request", err);
      setRequestMessage(
        err.response?.data?.message || "Failed to send collaboration request"
      );
    } finally {
      setSendingRequest(false);
    }
  };

  const displayName = profile?.username || "";
  const email = profile?.email || "";
  const expertise = profile?.skills || [];
  const profilePictureUrl = profile?.profilePictureId
    ? `http://localhost:5000/api/auth/profile-picture/${profile.profilePictureId}`
    : "";

  return (
    <div className="min-h-screen bg-white animated-bg">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        <header className="mb-10">
          <div className="hero-badge">Researcher profile</div>
          <h1 className="hero-title">
            Explore this researcher’s <span>work</span>
          </h1>
          <p className="hero-subtitle">
            View their profile, interests, skills, projects, and reviews before
            sending a collaboration request.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_22px_55px_rgba(15,23,42,0.10)] md:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px,1fr]">
            <section className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
              <div className="relative mb-4">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-3xl font-semibold text-slate-500">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : displayName ? (
                    displayName.charAt(0).toUpperCase()
                  ) : (
                    ""
                  )}
                </div>
              </div>

              {displayName && (
                <h1 className="text-center text-xl font-semibold text-slate-900">
                  {displayName}
                </h1>
              )}

              {email && (
                <p className="mt-1 text-center text-sm text-slate-500">
                  {email}
                </p>
              )}

              <button
                type="button"
                onClick={handleRequestCollaboration}
                disabled={
                  sendingRequest ||
                  requestSent ||
                  alreadyCollaborators ||
                  storedUser?.id === id
                }
                className={`mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                  requestSent || alreadyCollaborators
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-sky-600 hover:bg-sky-700"
                }`}
              >
                {storedUser?.id === id
                  ? "This is you"
                  : alreadyCollaborators
                  ? "Already Collaborators"
                  : sendingRequest
                  ? "Sending..."
                  : requestSent
                  ? "Requested"
                  : "Request Collaboration"}
              </button>

              {requestMessage && (
                <p
                  className={`mt-3 text-center text-sm ${
                    requestSent || alreadyCollaborators
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {requestMessage}
                </p>
              )}

              {expertise.length > 0 && (
                <div className="mt-6 w-full">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {expertise.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <nav className="flex gap-6 text-sm">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-2 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "border-b-2 border-sky-500 text-slate-900"
                          : "border-b-2 border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm md:p-7">
                {loading && (
                  <p className="text-sm text-slate-500">
                    Loading researcher profile...
                  </p>
                )}

                {!loading && error && (
                  <p className="text-sm text-red-500">{error}</p>
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
                  </>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
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
    <div className="grid gap-8 lg:grid-cols-[2fr,1.2fr]">
      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-slate-900">About Me</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {aboutMe || "No information added yet."}
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-900">
            Relationship Status
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {relationshipStatus || "Not added yet."}
          </p>
        </section>
      </div>

      <div className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Research Interests
          </h3>
          {researchInterests.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {researchInterests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
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
        </section>
      </div>
    </div>
  );
}

function ProjectsTab({ projects = [] }) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-slate-900">Projects</h2>
        {projects?.length > 0 ? (
          <div className="mt-3 space-y-3">
            {projects.map((project, index) => (
              <div
                key={project._id || index}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
              >
                {project.title || project.name || `Project ${index + 1}`}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No projects added yet.</p>
        )}
      </section>
    </div>
  );
}

function ReviewsTab({ reviews = [] }) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-slate-900">Reviews</h2>
        {reviews?.length > 0 ? (
          <div className="mt-3 space-y-4">
            {reviews.map((review, index) => (
              <article
                key={review._id || index}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-sm leading-relaxed text-slate-700">
                  {review.content || review.text || `Review ${index + 1}`}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No reviews added yet.</p>
        )}
      </section>
    </div>
  );
}