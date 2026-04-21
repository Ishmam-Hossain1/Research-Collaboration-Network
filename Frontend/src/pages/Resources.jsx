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
//   const displayRating = myRating || averageRating;
  const totalRatings = resource.ratings?.length || 0;
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

        {/* <div className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
          ★ {displayRating}
        </div> */}
        <div className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
        ★ {averageRating}
        <span className="ml-1 text-xs font-medium text-amber-600">
            ({totalRatings})
        </span>
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