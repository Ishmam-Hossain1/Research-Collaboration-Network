// import { useEffect, useState } from "react";
// import axios from "axios";
// import Navbar from "../components/Navbar";

// export default function Researchers() {
//   const storedUser =
//     JSON.parse(localStorage.getItem("researchConnectUser")) || null;

//   const [researchers, setResearchers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [search, setSearch] = useState("");
//   const [researchInterest, setResearchInterest] = useState("");
//   const [skill, setSkill] = useState("");

//   const fetchResearchers = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await axios.get("http://localhost:5000/api/users", {
//         params: {
//           search,
//           researchInterest,
//           skill,
//           excludeUserId: storedUser?.id || "",
//         },
//       });

//       setResearchers(res.data.researchers || []);
//     } catch (err) {
//       console.error("Failed to fetch researchers", err);
//       setError("Failed to load researchers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchResearchers();
//   }, []);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     fetchResearchers();
//   };

//   return (
//     <div className="min-h-screen bg-white animated-bg">
//       <Navbar />

//       <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
//         <header className="mb-8">
//           <div className="hero-badge">Collaborate with researchers</div>
//           <h1 className="hero-title">
//             Find your next <span>research partner</span>
//           </h1>
//           <p className="hero-subtitle">
//             Search researchers across the platform and filter them by interests
//             and skills.
//           </p>
//         </header>

//         <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <form
//             onSubmit={handleSearch}
//             className="grid gap-4 md:grid-cols-4"
//           >
//             <input
//               type="text"
//               placeholder="Search by name or email"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
//             />

//             <input
//               type="text"
//               placeholder="Filter by research interest"
//               value={researchInterest}
//               onChange={(e) => setResearchInterest(e.target.value)}
//               className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
//             />

//             <input
//               type="text"
//               placeholder="Filter by skill"
//               value={skill}
//               onChange={(e) => setSkill(e.target.value)}
//               className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
//             />

//             <button
//               type="submit"
//               className="rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700"
//             >
//               Search
//             </button>
//           </form>
//         </section>

//         {loading && (
//           <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
//             Loading researchers...
//           </div>
//         )}

//         {!loading && error && (
//           <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
//             {error}
//           </div>
//         )}

//         {!loading && !error && researchers.length === 0 && (
//           <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
//             No researchers found.
//           </div>
//         )}

//         {!loading && !error && researchers.length > 0 && (
//           <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
//             {researchers.map((researcher) => {
//               const profilePictureUrl = researcher.profilePictureId
//                 ? `http://localhost:5000/api/auth/profile-picture/${researcher.profilePictureId}`
//                 : "";

//               return (
//                 <article
//                   key={researcher._id}
//                   className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
//                 >
//                   <div className="mb-4 flex items-center gap-4">
//                     <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xl font-semibold text-slate-500">
//                       {profilePictureUrl ? (
//                         <img
//                           src={profilePictureUrl}
//                           alt={researcher.username}
//                           className="h-full w-full object-cover"
//                         />
//                       ) : (
//                         researcher.username?.charAt(0).toUpperCase() || "U"
//                       )}
//                     </div>

//                     <div>
//                       <h2 className="text-lg font-semibold text-slate-900">
//                         {researcher.username}
//                       </h2>
//                       <p className="text-sm text-slate-500">
//                         {researcher.email}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div>
//                       <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                         About
//                       </h3>
//                       <p className="mt-2 text-sm leading-relaxed text-slate-600">
//                         {researcher.aboutMe || "No bio added yet."}
//                       </p>
//                     </div>

//                     <div>
//                       <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                         Research Interests
//                       </h3>
//                       {researcher.researchInterests?.length > 0 ? (
//                         <div className="mt-2 flex flex-wrap gap-2">
//                           {researcher.researchInterests.map((interest) => (
//                             <span
//                               key={interest}
//                               className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
//                             >
//                               {interest}
//                             </span>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="mt-2 text-sm text-slate-500">
//                           No research interests added.
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                         Skills
//                       </h3>
//                       {researcher.skills?.length > 0 ? (
//                         <div className="mt-2 flex flex-wrap gap-2">
//                           {researcher.skills.map((item) => (
//                             <span
//                               key={item}
//                               className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
//                             >
//                               {item}
//                             </span>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="mt-2 text-sm text-slate-500">
//                           No skills added.
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </article>
//               );
//             })}
//           </section>
//         )}
//       </main>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Researchers() {
  const storedUser =
    JSON.parse(localStorage.getItem("researchConnectUser")) || null;

  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [researchInterest, setResearchInterest] = useState("");
  const [skill, setSkill] = useState("");

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
      setError("Failed to load researchers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResearchers();
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
            Search researchers across the platform and filter them by interests
            and skills.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />

            <input
              type="text"
              placeholder="Filter by research interest"
              value={researchInterest}
              onChange={(e) => setResearchInterest(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />

            <input
              type="text"
              placeholder="Filter by skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />

            <button
              type="submit"
              className="rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Search
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
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {researchers.map((researcher) => {
              const profilePictureUrl = researcher.profilePictureId
                ? `http://localhost:5000/api/auth/profile-picture/${researcher.profilePictureId}`
                : "";

              return (
                <Link
                  key={researcher._id}
                  to={`/researchers/${researcher._id}`}
                  className="researcher-card-link"
                >
                  <article className="researcher-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                  </article>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}