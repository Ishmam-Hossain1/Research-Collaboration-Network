// import { useEffect, useMemo, useState } from "react";
// import {
//   Search,
//   LibraryBig,
//   Bookmark,
//   Star,
//   ExternalLink,
//   Plus,
//   ArrowUpDown,
//   ShieldCheck,
//   BookOpen,
//   GraduationCap,
//   Wrench,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import Navbar from "../components/Navbar";
// import api from "../lib/api";
// import CreateResourceModal from "../components/CreateResourceModal";
// import resourcesImage from "../assets/resources-illustration.jpg";

// const CATEGORY_OPTIONS = [
//   "Journal Database",
//   "Institutional Access Service",
//   "Plagiarism Checker",
//   "Reference Manager",
//   "Academic Tool",
// ];

// const sortOptions = [
//   { value: "latest", label: "Latest" },
//   { value: "rating", label: "Top Rated" },
// ];

// const categoryMeta = {
//   "Journal Database": {
//     icon: BookOpen,
//     badge: "bg-blue-100 text-blue-700",
//   },
//   "Institutional Access Service": {
//     icon: ShieldCheck,
//     badge: "bg-emerald-100 text-emerald-700",
//   },
//   "Plagiarism Checker": {
//     icon: GraduationCap,
//     badge: "bg-rose-100 text-rose-700",
//   },
//   "Reference Manager": {
//     icon: LibraryBig,
//     badge: "bg-violet-100 text-violet-700",
//   },
//   "Academic Tool": {
//     icon: Wrench,
//     badge: "bg-amber-100 text-amber-700",
//   },
// };

// const Resources = () => {
// //   const user = JSON.parse(localStorage.getItem("researchConnectUser") || "null");
//   const savedUser = JSON.parse(localStorage.getItem("researchConnectUser") || "null");
//   const currentUserId =
//     savedUser?._id ||
//     savedUser?.id ||
//     savedUser?.user?._id ||
//     savedUser?.user?.id;
//   const [resources, setResources] = useState([]);
//   const [bookmarkedResources, setBookmarkedResources] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("");
//   const [sort, setSort] = useState("latest");
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [actionLoadingId, setActionLoadingId] = useState("");

//   const fetchResources = async () => {
//     try {
//       setLoading(true);

//       const queryParams = new URLSearchParams();
//       if (search.trim()) queryParams.append("keyword", search.trim());
//       if (category) queryParams.append("category", category);
//       if (sort) queryParams.append("sort", sort);

//       const queryString = queryParams.toString();
//       const url = queryString ? `/resources/search?${queryString}` : "/resources";

//       const res = await api.get(url);
//       setResources(Array.isArray(res.data) ? res.data : []);
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || "Failed to load research resources"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBookmarkedResources = async () => {
//   try {
//     if (!currentUserId) {
//       setBookmarkedResources([]);
//       return;
//     }

//     const res = await api.get(`/resources?bookmarkedBy=${currentUserId}`);
//     setBookmarkedResources(Array.isArray(res.data) ? res.data : []);
//   } catch (error) {
//     toast.error(
//       error.response?.data?.message || "Failed to load bookmarked resources"
//     );
//   }
// };

//   useEffect(() => {
//     fetchResources();
//   }, [search, category, sort]);

//   useEffect(() => {
//   fetchBookmarkedResources();
// }, [currentUserId]);

  

//   const clearFilters = () => {
//     setSearch("");
//     setCategory("");
//     setSort("latest");
//   };

// //   const stats = useMemo(() => {
// //     const total = resources.length;
// //     const bookmarked = user
// //       ? resources.filter((item) =>
// //           (item.bookmarks || []).some((bookmarkUser) => bookmarkUser?._id === user.id)
// //         ).length
// //       : 0;

//     const stats = useMemo(() => {
//         const total = resources.length;
//         const bookmarked = currentUserId
//             ? resources.filter((item) =>
//                 (item.bookmarks || []).some((bookmarkUser) => {
//                 if (typeof bookmarkUser === "string") return bookmarkUser === currentUserId;
//                 return bookmarkUser?._id === currentUserId;
//                 })
//             ).length
//             : 0;

//     const average =
//       total > 0
//         ? (
//             resources.reduce(
//               (sum, item) => sum + Number(item.averageRating || 0),
//               0
//             ) / total
//           ).toFixed(1)
//         : "0.0";

//     return { total, bookmarked, average };
// //   }, [resources, user]);
//     }, [resources, currentUserId]);

// //   const handleBookmarkToggle = async (resourceId) => {
// //     if (!user?.id) {
// //       toast.error("Please log in to bookmark resources");
// //       return;
// //     }

// //     try {
// //       setActionLoadingId(resourceId);
// //       const res = await api.post(`/resources/${resourceId}/bookmark`, {
// //         userId: user.id,
// //       });
//     const handleBookmarkToggle = async (resourceId) => {
//     if (!currentUserId) {
//         toast.error("Please log in to bookmark resources");
//         return;
//     }

//     try {
//         setActionLoadingId(resourceId);
//         const res = await api.post(`/resources/${resourceId}/bookmark`, {
//         userId: currentUserId,
//         });

//       const updated = res.data.resource;

//       setResources((prev) =>
//         prev.map((item) => (item._id === resourceId ? updated : item))
//       );

//       fetchBookmarkedResources();

//       toast.success(res.data.message || "Bookmark updated");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to update bookmark");
//     } finally {
//       setActionLoadingId("");
//     }
//   };

// //   const handleRate = async (resourceId, value) => {
// //     if (!user?.id) {
// //       toast.error("Please log in to rate resources");
// //       return;
// //     }

// //     try {
// //       setActionLoadingId(resourceId);
// //       const res = await api.post(`/resources/${resourceId}/rate`, {
// //         userId: user.id,
// //         value,
// //       });
//     const handleRate = async (resourceId, value) => {
//     if (!currentUserId) {
//         toast.error("Please log in to rate resources");
//         return;
//     }

//     try {
//         setActionLoadingId(resourceId);
//         const res = await api.post(`/resources/${resourceId}/rate`, {
//         userId: currentUserId,
//         value,
//         });

//       const updated = res.data.resource;

//       setResources((prev) =>
//         prev.map((item) => (item._id === resourceId ? updated : item))
//       );

//       fetchBookmarkedResources();

//       toast.success("Rating submitted");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to rate resource");
//     } finally {
//       setActionLoadingId("");
//     }
//   };

//   const handleResourceCreated = (newResource) => {
//     setResources((prev) => [newResource, ...prev]);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
//       <Navbar />

//       <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
//         {/* <img src={resourcesImage} alt="test" className="w-40" /> */}
//         <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
//           <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-8 text-white md:px-8">
//             <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
//               <div>
//                 <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
//                   <LibraryBig size={16} />
//                   Research Resource Directory
//                 </div>
//                 <h1 className="text-3xl font-bold md:text-4xl">
//                   Discover academic tools and services
//                 </h1>
//                 <p className="mt-3 max-w-2xl text-sm text-slate-200 md:text-base">
//                   Search journal databases, plagiarism checkers, reference
//                   managers, institutional access services, and other academic
//                   tools in one place.
//                 </p>
//               </div>

//               <div className="flex flex-col gap-3 sm:flex-row">
//                 {/* {user ? ( */}
//                 {currentUserId ? (
//                   <button
//                     onClick={() => setIsCreateModalOpen(true)}
//                     className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
//                   >
//                     <Plus size={18} />
//                     Add Resource
//                   </button>
//                 ) : (
//                   <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-100">
//                     Log in to add, bookmark, and rate resources
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="mb-8 grid gap-4 md:grid-cols-3">
//           <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
//             <p className="text-sm text-slate-500">Resources</p>
//             <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
//           </div>

//           <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
//             <p className="text-sm text-slate-500">Average rating</p>
//             <p className="mt-2 text-3xl font-bold text-slate-900">{stats.average}</p>
//           </div>

//           <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
//             <p className="text-sm text-slate-500">My bookmarks</p>
//             <p className="mt-2 text-3xl font-bold text-slate-900">{stats.bookmarked}</p>
//           </div>
//         </section>

       

//         <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
//         <div className="mb-6 flex items-center justify-between">
//             <div>
//             <h2 className="text-2xl font-bold text-slate-900">My Bookmarks</h2>
//             <p className="mt-1 text-sm text-slate-500">
//                 Resources you have saved.
//             </p>
//             </div>

//             <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
//             <Bookmark size={16} />
//             {bookmarkedResources.length} saved
//             </div>
//         </div>

//         {!currentUserId ? (
//             <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
//             Log in to view your bookmarked resources.
//             </div>
//         ) : bookmarkedResources.length === 0 ? (
//             <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
//             You have not bookmarked any resources yet.
//             </div>
//         ) : (
//             <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
//             {bookmarkedResources.map((resource) => (
//                 <ResourceCard
//                 key={resource._id}
//                 resource={resource}
//                 currentUserId={currentUserId}
//                 loading={actionLoadingId === resource._id}
//                 onBookmarkToggle={handleBookmarkToggle}
//                 onRate={handleRate}
//                 />
//             ))}
//             </div>
//         )}
//         </section>



//         <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
//           <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-slate-900">
//                 Resource Directory
//               </h2>
//               <p className="mt-1 text-sm text-slate-500">
//                 Browse, bookmark, rate, and open helpful research services.
//               </p>
//             </div>

//             <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
//               <LibraryBig size={16} />
//               {resources.length} resource{resources.length !== 1 ? "s" : ""} found
//             </div>
//           </div>

//           <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
//               <div className="relative xl:col-span-2">
//                 <Search
//                   size={18}
//                   className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search resources by title or description..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                 />
//               </div>

//               <select
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//               >
//                 <option value="">All Categories</option>
//                 {CATEGORY_OPTIONS.map((item) => (
//                   <option key={item} value={item}>
//                     {item}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={sort}
//                 onChange={(e) => setSort(e.target.value)}
//                 className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//               >
//                 <option value="latest">Latest</option>
//                 <option value="rating">Top Rated</option>
//               </select>
//             </div>

//             <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
//               <div className="inline-flex items-center gap-2 text-sm text-slate-500">
//                 <ArrowUpDown size={16} />
//                 Search, filter, and sort academic resources
//               </div>

//               <button
//                 onClick={clearFilters}
//                 className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>

//           {loading ? (
//             <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
//               Loading research resources...
//             </div>
//           ) : resources.length === 0 ? (
//             <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
//               No resources found.
//             </div>
//           ) : (
//             <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
//               {resources.map((resource) => (
//                 <ResourceCard
//                   key={resource._id}
//                   resource={resource}
//                 //   currentUser={user}
//                   currentUserId={currentUserId}
//                   loading={actionLoadingId === resource._id}
//                   onBookmarkToggle={handleBookmarkToggle}
//                   onRate={handleRate}
//                 />
//               ))}
//             </div>
//           )}
//         </section>
//       </main>

//       <CreateResourceModal
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         onResourceCreated={handleResourceCreated}
//       />
//     </div>
//   );
// };

//   const ResourceCard = ({
//     resource,
//     currentUserId,
//     onBookmarkToggle,
//     onRate,
//     loading,
//   }) => {

//   const getDomain = (url) => {
//     try {
//         return new URL(url).hostname;
//     } catch {
//         return "";
//     }
// };

//   const meta = categoryMeta[resource.category] || {
//     icon: LibraryBig,
//     badge: "bg-slate-100 text-slate-700",
//   };

//   const CategoryIcon = meta.icon;

// //   const isBookmarked = (resource.bookmarks || []).some(
// //     (bookmarkUser) => bookmarkUser?._id === currentUser?.id
// //   );
//   const isBookmarked = (resource.bookmarks || []).some((bookmarkUser) => {
//     if (typeof bookmarkUser === "string") return bookmarkUser === currentUserId;
//     return bookmarkUser?._id === currentUserId;
//   });

// //   const myRatingEntry = (resource.ratings || []).find(
// //     (entry) => entry.user?._id === currentUser?.id
// //   );
//   const myRatingEntry = (resource.ratings || []).find((entry) => {
//     if (typeof entry.user === "string") return entry.user === currentUserId;
//     return entry.user?._id === currentUserId;
//   });

//   const myRating = myRatingEntry?.value || 0;
//   const averageRating = Number(resource.averageRating || 0).toFixed(1);
//   const bookmarkCount = resource.bookmarks?.length || 0;

//   return (
//     <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
//       <div className="mb-4 flex items-start justify-between gap-3">
//         <div className="flex items-center gap-3">
//           {/* <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
//             <CategoryIcon size={18} />
//           </div> */}
//           <div className="rounded-2xl bg-white p-2 border border-slate-200 flex items-center justify-center">
//             <img
//                 src={`https://www.google.com/s2/favicons?domain=${getDomain(resource.link)}&sz=64`}
//                 alt="logo"
//                 // className="w-6 h-6"
//                 className="w-8 h-8 hover:scale-110 transition"
//             />
//           </div>

//           <div>
//             <span
//               className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}
//             >
//               {resource.category}
//             </span>
//           </div>
//         </div>

//         <button
//           onClick={() => onBookmarkToggle(resource._id)}
//           disabled={loading}
//           className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
//             isBookmarked
//               ? "border-blue-200 bg-blue-50 text-blue-700"
//               : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
//           } disabled:opacity-60`}
//         >
//           <span className="inline-flex items-center gap-2">
//             <Bookmark size={16} className={isBookmarked ? "fill-current" : ""} />
//             {isBookmarked ? "Saved" : "Save"}
//           </span>
//         </button>
//       </div>

//       <h3 className="line-clamp-2 text-xl font-bold text-slate-900">
//         {resource.title}
//       </h3>

//       <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
//         {resource.description}
//       </p>

//       <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
//         <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
//           <Star size={16} className="fill-current" />
//           {averageRating}
//         </div>

//         <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
//           <Bookmark size={16} />
//           {bookmarkCount} bookmark{bookmarkCount !== 1 ? "s" : ""}
//         </div>

//         {resource.createdBy?.username ? (
//           <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
//             By {resource.createdBy.username}
//           </div>
//         ) : null}
//       </div>

//       <div className="mt-5">
//         <p className="mb-2 text-sm font-medium text-slate-700">Your rating</p>
//         <div className="flex items-center gap-1">
//           {[1, 2, 3, 4, 5].map((item) => {
//             const active = item <= myRating;

//             return (
//               <button
//                 key={item}
//                 type="button"
//                 disabled={loading}
//                 onClick={() => onRate(resource._id, item)}
//                 className="rounded-full p-1 transition hover:scale-110 disabled:opacity-60"
//               >
//                 <Star
//                   size={18}
//                   className={
//                     active
//                       ? "fill-amber-400 text-amber-400"
//                       : "text-slate-300"
//                   }
//                 />
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       <div className="mt-6 flex items-center justify-between gap-3">
//         <a
//           href={resource.link}
//           target="_blank"
//           rel="noreferrer"
//           className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
//         >
//           Open Resource
//           <ExternalLink size={16} />
//         </a>

//         <span className="text-xs text-slate-400">
//           {resource.link?.replace(/^https?:\/\//, "").slice(0, 28)}
//           {resource.link?.length > 28 ? "..." : ""}
//         </span>
//       </div>
//     </article>
//   );
// };

// export default Resources;



import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Bookmark,
  Star,
  ExternalLink,
  Plus,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  LibraryBig,
  Wrench,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import CreateResourceModal from "../components/CreateResourceModal";
import resourcesImage from "../assets/resources-illustration.jpg";

const CATEGORY_OPTIONS = [
  "Journal Database",
  "Institutional Access Service",
  "Plagiarism Checker",
  "Reference Manager",
  "Academic Tool",
];

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "rating", label: "Top Rated" },
];

const categoryMeta = {
  "Journal Database": {
    icon: BookOpen,
    badge: "bg-blue-50 text-blue-700 border-blue-100",
  },
  "Institutional Access Service": {
    icon: ShieldCheck,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  "Plagiarism Checker": {
    icon: GraduationCap,
    badge: "bg-rose-50 text-rose-700 border-rose-100",
  },
  "Reference Manager": {
    icon: LibraryBig,
    badge: "bg-violet-50 text-violet-700 border-violet-100",
  },
  "Academic Tool": {
    icon: Wrench,
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
};

const Resources = () => {
  const savedUser = JSON.parse(localStorage.getItem("researchConnectUser") || "null");

  const currentUserId = String(
    savedUser?._id ||
      savedUser?.id ||
      savedUser?.user?._id ||
      savedUser?.user?.id ||
      ""
  ).trim();

  const [resources, setResources] = useState([]);
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const fetchResources = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append("keyword", search.trim());
      if (category) queryParams.append("category", category);
      if (sort) queryParams.append("sort", sort);

      const queryString = queryParams.toString();
      const url = queryString ? `/resources/search?${queryString}` : "/resources";

      const res = await api.get(url);
      setResources(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load research resources"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarkedResources = async () => {
    try {
      if (!currentUserId) {
        setBookmarkedResources([]);
        return;
      }

      const res = await api.get(`/resources?bookmarkedBy=${currentUserId}`);
      setBookmarkedResources(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load bookmarked resources"
      );
    }
  };

  useEffect(() => {
    fetchResources();
  }, [search, category, sort]);

  useEffect(() => {
    fetchBookmarkedResources();
  }, [currentUserId]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSort("latest");
  };

  const stats = useMemo(() => {
    const total = resources.length;
    const bookmarked = currentUserId
      ? resources.filter((item) =>
          (item.bookmarks || []).some((bookmarkUser) => {
            if (typeof bookmarkUser === "string") return bookmarkUser === currentUserId;
            return bookmarkUser?._id === currentUserId;
          })
        ).length
      : 0;

    return { total, bookmarked };
  }, [resources, currentUserId]);

  const handleBookmarkToggle = async (resourceId) => {
    if (!currentUserId) {
      toast.error("Please log in to bookmark resources");
      return;
    }

    if (!/^[a-f\d]{24}$/i.test(currentUserId)) {
      toast.error("Stored user id is invalid. Please log in again.");
      return;
    }

    try {
      setActionLoadingId(resourceId);

      const res = await api.post(`/resources/${resourceId}/bookmark`, {
        userId: currentUserId,
      });

      const updated = res.data.resource;

      setResources((prev) =>
        prev.map((item) => (item._id === resourceId ? updated : item))
      );

      setBookmarkedResources((prev) => {
        const exists = prev.some((item) => item._id === resourceId);
        const isStillBookmarked = (updated.bookmarks || []).some((bookmarkUser) => {
          if (typeof bookmarkUser === "string") return bookmarkUser === currentUserId;
          return bookmarkUser?._id === currentUserId;
        });

        if (exists && !isStillBookmarked) {
          return prev.filter((item) => item._id !== resourceId);
        }

        if (!exists && isStillBookmarked) {
          return [updated, ...prev];
        }

        return prev.map((item) => (item._id === resourceId ? updated : item));
      });

      fetchBookmarkedResources();
      toast.success(res.data.message || "Bookmark updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bookmark");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRate = async (resourceId, value) => {
    if (!currentUserId) {
      toast.error("Please log in to rate resources");
      return;
    }

    if (!/^[a-f\d]{24}$/i.test(currentUserId)) {
      toast.error("Stored user id is invalid. Please log in again.");
      return;
    }

    try {
      setActionLoadingId(resourceId);

      const res = await api.post(`/resources/${resourceId}/rate`, {
        userId: currentUserId,
        value,
      });

      const updated = res.data.resource;

      setResources((prev) =>
        prev.map((item) => (item._id === resourceId ? updated : item))
      );

      setBookmarkedResources((prev) =>
        prev.map((item) => (item._id === resourceId ? updated : item))
      );

      fetchBookmarkedResources();
      toast.success("Rating submitted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to rate resource");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleResourceCreated = (newResource) => {
    setResources((prev) => [newResource, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <section className="mb-10 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="grid items-center gap-8 px-6 py-10 md:px-10 lg:grid-cols-2 lg:py-12">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-600">
                <LibraryBig size={16} />
                Research Resource Hub
              </div>

              <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
                Discover research resources that actually help
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 md:text-base">
                Explore journal databases, plagiarism checkers, reference managers,
                institutional access services, and academic tools in one clean
                workspace.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <div className="rounded-full bg-slate-100 px-4 py-2">
                  {stats.total} resources
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2">
                  {stats.bookmarked} bookmarked
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-xl">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search resources, tools, journals..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                  />
                </div>

                {currentUserId && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus size={16} />
                    Add Resource
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <img
                src={resourcesImage}
                alt="Research resources illustration"
                className="w-72 max-w-full md:w-[380px]"
              />
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Browse Resources
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Filter and sort the collection to quickly find what you need.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <SlidersHorizontal size={16} />
                Filters
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
              >
                {sortOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <button
                onClick={clearFilters}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        <section className="mb-10 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">My Bookmarks</h2>
              <p className="mt-1 text-sm text-slate-500">
                Resources you’ve saved for quick access.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              <Bookmark size={15} />
              {bookmarkedResources.length} saved
            </div>
          </div>

          {!currentUserId ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Log in to view your bookmarked resources.
            </div>
          ) : bookmarkedResources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              You have not bookmarked any resources yet.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {bookmarkedResources.map((resource) => (
                <ResourceCard
                  key={resource._id}
                  resource={resource}
                  currentUserId={currentUserId}
                  loading={actionLoadingId === resource._id}
                  onBookmarkToggle={handleBookmarkToggle}
                  onRate={handleRate}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Resource Directory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Explore the full collection of research tools and services.
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm text-slate-500 shadow-sm border border-slate-200">
              {resources.length} found
            </div>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
              Loading research resources...
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
              No resources found.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource._id}
                  resource={resource}
                  currentUserId={currentUserId}
                  loading={actionLoadingId === resource._id}
                  onBookmarkToggle={handleBookmarkToggle}
                  onRate={handleRate}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateResourceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onResourceCreated={handleResourceCreated}
      />
    </div>
  );
};

const ResourceCard = ({
  resource,
  currentUserId,
  onBookmarkToggle,
  onRate,
  loading,
}) => {
  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  };

  const meta = categoryMeta[resource.category] || {
    icon: LibraryBig,
    badge: "bg-slate-50 text-slate-700 border-slate-100",
  };

  const isBookmarked = (resource.bookmarks || []).some((bookmarkUser) => {
    if (typeof bookmarkUser === "string") return bookmarkUser === currentUserId;
    return bookmarkUser?._id === currentUserId;
  });

  const myRatingEntry = (resource.ratings || []).find((entry) => {
    if (typeof entry.user === "string") return entry.user === currentUserId;
    return entry.user?._id === currentUserId;
  });

  const myRating = myRatingEntry?.value || 0;
  const averageRating = Number(resource.averageRating || 0).toFixed(1);
  const displayRating = myRating || averageRating;
  const bookmarkCount = resource.bookmarks?.length || 0;

  return (
    <article className="group rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <img
              src={`https://www.google.com/s2/favicons?domain=${getDomain(resource.link)}&sz=64`}
              alt="logo"
              className="h-8 w-8 object-contain"
            />
          </div>

          <div>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${meta.badge}`}
            >
              {resource.category}
            </span>
          </div>
        </div>

        <button
          onClick={() => onBookmarkToggle(resource._id)}
          disabled={loading}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
            isBookmarked
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <Bookmark size={16} className={isBookmarked ? "fill-current" : ""} />
        </button>
      </div>

      <h3 className="line-clamp-2 text-xl font-semibold text-slate-900">
        {resource.title}
      </h3>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
        {resource.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          {bookmarkCount} bookmark{bookmarkCount !== 1 ? "s" : ""}
        </div>

        {resource.createdBy?.username ? (
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            By {resource.createdBy.username}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Your rating</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((item) => {
              const active = item <= myRating;

              return (
                <button
                  key={item}
                  type="button"
                  disabled={loading}
                  onClick={() => onRate(resource._id, item)}
                  className="rounded-full p-1 transition hover:scale-110 disabled:opacity-60"
                >
                  <Star
                    size={18}
                    className={
                      active
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
          ★ {displayRating}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="truncate text-xs text-slate-400">
          {resource.link?.replace(/^https?:\/\//, "")}
        </span>

        <a
          href={resource.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Visit
          <ExternalLink size={15} />
        </a>
      </div>
    </article>
  );
};

export default Resources;