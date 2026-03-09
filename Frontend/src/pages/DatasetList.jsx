import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
    Download,
    Trash2,
    Upload,
    Search,
    Tag,
    Globe,
    Lock,
    Users,
    Database,
    Edit,
    X,
    Filter,
    Mail,
} from "lucide-react";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000";

const accessBadge = {
    public: {
        label: "Public",
        icon: <Globe size={12} />,
        className: "bg-green-100 text-green-700",
    },
    private: {
        label: "Private",
        icon: <Lock size={12} />,
        className: "bg-red-100 text-red-700",
    },
    restricted: {
        label: "Restricted",
        icon: <Users size={12} />,
        className: "bg-yellow-100 text-yellow-700",
    },
};

const formatBytes = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DatasetList = () => {
    const [datasets, setDatasets] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [filter, setFilter] = useState("all"); // "all" | "my"
    const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "az" | "za"

    // Edit Modal State
    const [editingDataset, setEditingDataset] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        tags: "",
        accessControl: "public",
    });
    const [editAllowedEmails, setEditAllowedEmails] = useState([]);
    const [editEmailInput, setEditEmailInput] = useState("");
    const [editError, setEditError] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const token = localStorage.getItem("researchConnectToken");
    const currentUser = JSON.parse(localStorage.getItem("researchConnectUser") || "null");

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchDatasets = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(`${API}/api/datasets`, {
                headers: authHeaders,
            });
            setDatasets(res.data.datasets);
            setFiltered(res.data.datasets);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load datasets.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatasets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let result = datasets;

        // Apply filter
        if (filter === "my" && currentUser) {
            result = result.filter(
                (ds) => ds.uploadedBy?._id === currentUser.id || ds.uploadedBy === currentUser.id
            );
        }

        // Apply search
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(
                (ds) =>
                    ds.title.toLowerCase().includes(lowerSearch) ||
                    ds.description?.toLowerCase().includes(lowerSearch) ||
                    ds.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
            );
        }

        // Apply sort
        result = [...result].sort((a, b) => {
            if (sortBy === "newest") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === "oldest") {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortBy === "az") {
                return a.title.localeCompare(b.title);
            } else if (sortBy === "za") {
                return b.title.localeCompare(a.title);
            }
            return 0;
        });

        setFiltered(result);
    }, [search, datasets, filter, sortBy, currentUser?.id]);

    const handleDownload = async (ds) => {
        try {
            const res = await axios.get(`${API}/api/datasets/${ds._id}/download`, {
                headers: authHeaders,
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", ds.fileName || "dataset");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            const msg = err.response?.status === 403
                ? "Access denied. You don't have permission to download this dataset."
                : "Download failed. Please try again.";
            alert(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this dataset?")) return;
        setDeletingId(id);
        try {
            await axios.delete(`${API}/api/datasets/${id}`, {
                headers: authHeaders,
            });
            setDatasets((prev) => prev.filter((ds) => ds._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed.");
        } finally {
            setDeletingId(null);
        }
    };

    const isOwner = (ds) =>
        currentUser && (ds.uploadedBy?._id === currentUser.id || ds.uploadedBy === currentUser.id);

    // Edit Methods
    const openEditModal = (ds) => {
        setEditingDataset(ds);
        setEditFormData({
            title: ds.title,
            description: ds.description || "",
            tags: ds.tags?.join(", ") || "",
            accessControl: ds.accessControl || "public",
        });

        // Populate existing allowed users' emails
        if (ds.allowedUsers && ds.allowedUsers.length > 0) {
            const emails = ds.allowedUsers.map(user => user.email).filter(Boolean);
            setEditAllowedEmails(emails);
        } else {
            setEditAllowedEmails([]);
        }
        setEditEmailInput("");
        setEditError("");
    };

    const handleEditAddEmail = (e) => {
        e.preventDefault();
        const trimmed = editEmailInput.trim().toLowerCase();
        if (!trimmed) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            setEditError("Please enter a valid email address.");
            return;
        }

        if (editAllowedEmails.includes(trimmed)) {
            setEditError("Email is already in the list.");
            return;
        }

        setEditAllowedEmails([...editAllowedEmails, trimmed]);
        setEditEmailInput("");
        setEditError("");
    };

    const handleEditRemoveEmail = (emailToRemove) => {
        setEditAllowedEmails(editAllowedEmails.filter((email) => email !== emailToRemove));
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editFormData.title.trim()) {
            setEditError("Title is required.");
            return;
        }

        setEditError("");
        setIsEditing(true);

        const data = {
            title: editFormData.title,
            description: editFormData.description,
            tags: editFormData.tags.split(",").map((t) => t.trim()).filter(Boolean),
            accessControl: editFormData.accessControl,
        };

        if (editFormData.accessControl === "restricted") {
            data.allowedUsers = JSON.stringify(editAllowedEmails);
        }

        try {
            await axios.put(`${API}/api/datasets/${editingDataset._id}`, data, {
                headers: authHeaders,
            });
            setEditingDataset(null);
            fetchDatasets();
        } catch (err) {
            setEditError(
                err.response?.data?.message || "Failed to update dataset. Try again."
            );
        } finally {
            setIsEditing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar />
            <div className="px-4 py-10">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Research Datasets</h1>
                            <p className="mt-1 text-slate-500">
                                Browse and download datasets shared by the community
                            </p>
                        </div>
                        <Link
                            to="/upload-dataset"
                            id="upload-dataset-btn"
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition"
                        >
                            <Upload size={16} />
                            Upload Dataset
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                            <Search size={18} className="shrink-0 text-slate-400" />
                            <input
                                type="text"
                                id="dataset-search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title, description, or tag…"
                                className="w-full bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                            >
                                <option value="all">🌍 All Datasets</option>
                                {currentUser && <option value="my">👤 My Datasets</option>}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="az">A-Z</option>
                                <option value="za">Z-A</option>
                            </select>
                        </div>
                    </div>

                    {/* States */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-xl bg-red-50 p-6 text-center text-red-600 ring-1 ring-red-200">
                            {error}
                        </div>
                    )}

                    {!loading && !error && filtered.length === 0 && (
                        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
                            <Database size={40} className="mx-auto mb-3 text-slate-300" />
                            <p className="font-medium text-slate-500">No datasets found</p>
                            <p className="mt-1 text-sm text-slate-400">
                                {search ? "Try a different search term" : "Be the first to upload a dataset!"}
                            </p>
                        </div>
                    )}

                    {/* Dataset Cards */}
                    {!loading && !error && filtered.length > 0 && (
                        <div className="grid gap-5">
                            {filtered.map((ds) => {
                                const badge = accessBadge[ds.accessControl] || accessBadge.public;
                                return (
                                    <div
                                        key={ds._id}
                                        className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md hover:ring-blue-200"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            {/* Left: info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <h2 className="text-lg font-bold text-slate-800 truncate">
                                                        {ds.title}
                                                    </h2>
                                                    <span
                                                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                                                    >
                                                        {badge.icon}
                                                        {badge.label}
                                                    </span>
                                                </div>

                                                {ds.description && (
                                                    <p className="mb-3 text-sm text-slate-500 line-clamp-2">
                                                        {ds.description}
                                                    </p>
                                                )}

                                                {/* Tags */}
                                                {ds.tags?.length > 0 && (
                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <Tag size={13} className="text-slate-400" />
                                                        {ds.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Meta */}
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                                                    <span>
                                                        By <strong className="text-slate-600">{ds.uploadedBy?.username || "Unknown"}</strong>
                                                    </span>
                                                    <span>{formatBytes(ds.fileSize)}</span>
                                                    <span>{ds.fileName}</span>
                                                    <span>{new Date(ds.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Right: actions */}
                                            <div className="flex shrink-0 gap-2 sm:flex-col">
                                                <button
                                                    id={`download-${ds._id}`}
                                                    onClick={() => handleDownload(ds)}
                                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                                                >
                                                    <Download size={15} />
                                                    Download
                                                </button>

                                                {isOwner(ds) && (
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => openEditModal(ds)}
                                                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                                                        >
                                                            <Edit size={15} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            id={`delete-${ds._id}`}
                                                            onClick={() => handleDelete(ds._id)}
                                                            disabled={deletingId === ds._id}
                                                            className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                                                        >
                                                            <Trash2 size={15} />
                                                            {deletingId === ds._id ? "Deleting…" : "Delete"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingDataset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/40 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-100">
                        <button
                            onClick={() => setEditingDataset(null)}
                            className="absolute right-6 top-6 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Edit Dataset</h2>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-5">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editFormData.title}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={editFormData.description}
                                    onChange={handleEditChange}
                                    rows={3}
                                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Category Tags
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={editFormData.tags}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                                />
                                <p className="mt-1 text-xs text-slate-400">Comma-separated</p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Download Access
                                </label>
                                <select
                                    name="accessControl"
                                    value={editFormData.accessControl}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                                >
                                    <option value="public">🌍 Public</option>
                                    <option value="private">🔒 Private</option>
                                    <option value="restricted">👥 Restricted</option>
                                </select>
                            </div>

                            {/* Conditional Restricted Emails Input */}
                            {editFormData.accessControl === "restricted" && (
                                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
                                        <Mail size={15} />
                                        Allowed Users
                                    </label>
                                    <p className="mb-3 text-xs text-blue-700">
                                        Enter the email addresses of registered users who can download this dataset.
                                    </p>

                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={editEmailInput}
                                            onChange={(e) => setEditEmailInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleEditAddEmail(e);
                                                }
                                            }}
                                            placeholder="colleague@university.edu"
                                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleEditAddEmail}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {editAllowedEmails.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {editAllowedEmails.map((email) => (
                                                <span
                                                    key={email}
                                                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
                                                >
                                                    {email}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditRemoveEmail(email)}
                                                        className="ml-1 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {editError && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                    {editError}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingDataset(null)}
                                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isEditing}
                                    className="flex w-32 items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                                >
                                    {isEditing ? "Saving…" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatasetList;
