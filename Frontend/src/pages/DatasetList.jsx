import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
    Calendar,
    FileText,
    ChevronDown,
    ArrowRight,
    Sparkles,
    RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import SplashCursor from "../components/SplashCursor";
import datasetBg from "../assets/dataset.webp";
import pageBg from "../assets/datasetbackgroud..jpeg";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const accessBadge = {
    public: {
        label: "Public",
        icon: <Globe size={12} />,
        className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    private: {
        label: "Private",
        icon: <Lock size={12} />,
        className: "bg-rose-100 text-rose-700 border-rose-200",
    },
    restricted: {
        label: "Restricted",
        icon: <Users size={12} />,
        className: "bg-amber-100 text-amber-700 border-amber-200",
    },
};

const formatBytes = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const DatasetList = () => {
    const [datasets, setDatasets] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [filter, setFilter] = useState("all"); 
    const [sortBy, setSortBy] = useState("newest");

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
    const [editFile, setEditFile] = useState(null);

    const token = localStorage.getItem("researchConnectToken");
    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("researchConnectUser") || "null");
        } catch {
            return null;
        }
    }, []);
    
    const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

    const fetchDatasets = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(`${API}/api/datasets`, {
                headers: authHeaders,
            });
            const ds = res.data.datasets || [];
            setDatasets(ds);
            setFiltered(ds);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load datasets.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    useEffect(() => {
        if (!datasets) return;
        let result = datasets;

        if (filter === "my" && currentUser) {
            const userId = currentUser.id || currentUser._id;
            result = result.filter(
                (ds) => ds.uploadedBy?._id === userId || ds.uploadedBy === userId
            );
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(
                (ds) =>
                    ds.title.toLowerCase().includes(lowerSearch) ||
                    ds.description?.toLowerCase().includes(lowerSearch) ||
                    ds.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
            );
        }

        result = [...result].sort((a, b) => {
            if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === "az") return a.title.localeCompare(b.title);
            if (sortBy === "za") return b.title.localeCompare(a.title);
            return 0;
        });

        setFiltered(result);
    }, [search, datasets, filter, sortBy, currentUser]);

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
            alert(err.response?.status === 403 ? "Access denied." : "Download failed.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this dataset?")) return;
        setDeletingId(id);
        try {
            await axios.delete(`${API}/api/datasets/${id}`, { headers: authHeaders });
            setDatasets((prev) => prev.filter((ds) => ds._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed.");
        } finally {
            setDeletingId(null);
        }
    };

    const isOwner = (ds) => {
        const userId = currentUser?.id || currentUser?._id;
        return currentUser && (ds.uploadedBy?._id === userId || ds.uploadedBy === userId);
    };

    const openEditModal = (ds) => {
        setEditingDataset(ds);
        setEditFormData({
            title: ds.title,
            description: ds.description || "",
            tags: ds.tags?.join(", ") || "",
            accessControl: ds.accessControl || "public",
        });
        setEditAllowedEmails(ds.allowedUsers?.map(u => u.email) || []);
        setEditEmailInput("");
        setEditError("");
        setEditFile(null);
    };

    const handleEditAddEmail = (e) => {
        e.preventDefault();
        const trimmed = editEmailInput.trim().toLowerCase();
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
        if (editAllowedEmails.includes(trimmed)) return;
        setEditAllowedEmails([...editAllowedEmails, trimmed]);
        setEditEmailInput("");
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsEditing(true);
        try {
            const formData = new FormData();
            formData.append("title", editFormData.title);
            formData.append("description", editFormData.description);
            formData.append("tags", JSON.stringify(editFormData.tags.split(",").map(t => t.trim()).filter(Boolean)));
            formData.append("accessControl", editFormData.accessControl);
            
            if (editFormData.accessControl === "restricted") {
                formData.append("allowedUsers", JSON.stringify(editAllowedEmails));
            }
            
            if (editFile) {
                formData.append("file", editFile);
            }

            await axios.put(`${API}/api/datasets/${editingDataset._id}`, formData, { 
                headers: authHeaders 
            });
            
            setEditingDataset(null);
            setEditFile(null);
            fetchDatasets();
        } catch (err) {
            setEditError(err.response?.data?.message || "Failed to update.");
        } finally {
            setIsEditing(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#0a0f1a] text-slate-900">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0">
                <img 
                    src={pageBg} 
                    alt="Background" 
                    className="h-full w-full object-cover opacity-40 blur-[5px] scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/70 to-[#f8fbff]" />
            </div>

            {/* Splash Cursor */}
            <div className="fixed inset-0 z-[1] pointer-events-none">
                <SplashCursor />
            </div>
            <div className="fixed inset-0 z-[2] bg-white/10 backdrop-blur-[2px] pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <div className="flex-grow">


                {/* Hero Section */}
                <div className="relative overflow-hidden pt-32 pb-20 text-white shadow-2xl">
                    {/* Hero Image Background */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={datasetBg} 
                            alt="Datasets" 
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-blue-900/40" />
                        <div className="absolute inset-0 bg-slate-950/20" />
                    </div>

                    <div className="mx-auto max-w-6xl px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-4">
                                Data-Driven Discovery
                            </p>
                            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                                Research <span className="text-blue-400">Datasets</span>
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg text-blue-100/80 leading-relaxed font-serif">
                                Securely share, discover, and download high-quality research data. 
                                Collaborative intelligence for the modern academic workflow.
                            </p>
                            <div className="mt-10 flex flex-wrap gap-4">
                                <Link
                                    to="/upload-dataset"
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500 hover:-translate-y-0.5"
                                >
                                    <Upload size={18} />
                                    Upload New Dataset
                                </Link>
                                <div className="flex items-center gap-4 text-blue-200/60 text-sm font-medium">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold">DS</div>
                                        ))}
                                    </div>
                                    <span>Used by {datasets.length}+ researchers</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Filters & Search - Floating Bar */}
                <div className="mx-auto -mt-10 max-w-6xl px-4 mb-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-2xl shadow-slate-200/50 backdrop-blur-2xl"
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 flex items-center gap-3 rounded-full bg-slate-50/50 px-6 py-3.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-400 focus-within:bg-white transition-all">
                                <Search size={20} className="text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search datasets, tags, authors..."
                                    className="w-full bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <div className="relative group">
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="appearance-none rounded-full border border-slate-200 bg-white/80 pl-6 pr-12 py-3.5 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition cursor-pointer hover:bg-slate-50"
                                    >
                                        <option value="all">🌍 All Datasets</option>
                                        {currentUser && <option value="my">👤 My Uploads</option>}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                                </div>
                                <div className="relative group">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none rounded-full border border-slate-200 bg-white/80 pl-6 pr-12 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition cursor-pointer hover:bg-slate-50"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="az">Name A-Z</option>
                                        <option value="za">Name Z-A</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="mx-auto max-w-6xl px-4 pb-24">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div 
                                key="loader"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex items-center justify-center py-32"
                            >
                                <RefreshCw size={48} className="animate-spin text-blue-600 opacity-20" />
                            </motion.div>
                        ) : filtered.length === 0 ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="rounded-[32px] border border-white/70 bg-white/60 p-20 text-center backdrop-blur-xl shadow-xl"
                            >
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-400">
                                    <Database size={40} />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-slate-800">No Datasets Found</h3>
                                <p className="mt-2 text-slate-500 max-w-sm mx-auto">
                                    {search ? "We couldn't find anything matching your search. Try different keywords." : "The dataset library is waiting for its first contribution."}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="list"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                            >
                                {filtered.map((ds) => {
                                    const badge = accessBadge[ds.accessControl] || accessBadge.public;
                                    return (
                                        <motion.div
                                            key={ds._id}
                                            variants={fadeUpVariant}
                                            layout
                                            whileHover={{ 
                                                scale: 1.02, 
                                                y: -10,
                                                transition: { duration: 0.3, ease: "easeOut" }
                                            }}
                                            className="group relative overflow-hidden rounded-[40px] border border-white/60 bg-gradient-to-br from-slate-100/90 to-blue-50/80 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-3xl transition-all duration-500 hover:from-white hover:to-blue-100/50 hover:shadow-blue-900/10 hover:border-blue-400/50"
                                        >
                                            <div className="flex flex-col h-full">
                                                <div className="mb-4 flex items-start justify-between gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                                                        {badge.icon} {badge.label}
                                                    </div>
                                                </div>

                                                <h3 className="font-serif text-2xl font-black text-slate-950 mb-3 line-clamp-1 group-hover:text-blue-700 transition-colors">
                                                    {ds.title}
                                                </h3>
                                                <p className="text-sm leading-relaxed text-slate-700 font-medium line-clamp-2 mb-6">
                                                    {ds.description || "No description provided for this research dataset."}
                                                </p>

                                                <div className="flex flex-wrap gap-2 mb-6 min-h-[24px]">
                                                    {(ds.tags || []).slice(0, 3).map(tag => (
                                                        <span key={tag} className="rounded-lg bg-slate-100/50 px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-tight transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {ds.tags?.length > 3 && <span className="text-[10px] font-bold text-slate-400">+{ds.tags.length - 3}</span>}
                                                </div>

                                                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                                                            {ds.uploadedBy?.username?.substring(0, 2).toUpperCase() || "U"}
                                                        </div>
                                                        <div className="text-[11px]">
                                                            <p className="font-black text-slate-900">{ds.uploadedBy?.username || "Researcher"}</p>
                                                            <p className="text-slate-500 font-bold">{new Date(ds.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatBytes(ds.fileSize)}</p>
                                                    </div>
                                                </div>

                                                {/* Action Overlay */}
                                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-white/95 backdrop-blur-md border-t border-slate-100 flex gap-2">
                                                    <button
                                                        onClick={() => handleDownload(ds)}
                                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition"
                                                    >
                                                        <Download size={14} /> Download Dataset
                                                    </button>
                                                    {isOwner(ds) && (
                                                        <>
                                                            <button 
                                                                onClick={() => openEditModal(ds)}
                                                                className="flex items-center justify-center p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(ds._id)}
                                                                className="flex items-center justify-center p-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                </div>
            </div>

            {/* Edit Modal - Homepage Style */}
            <AnimatePresence>
                {editingDataset && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-2xl backdrop-blur-2xl"
                        >
                            <button
                                onClick={() => setEditingDataset(null)}
                                className="absolute right-6 top-6 rounded-full bg-slate-100 p-2 text-slate-400 transition hover:bg-rose-100 hover:text-rose-600"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-8 flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Sparkles size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-slate-900">Refine Dataset</h2>
                                    <p className="text-sm text-slate-500 font-medium">Update metadata and access controls</p>
                                </div>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Dataset Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={editFormData.title}
                                            onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                                        <textarea
                                            value={editFormData.description}
                                            onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                            rows={3}
                                            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Access Control</label>
                                        <div className="relative group">
                                            <select
                                                value={editFormData.accessControl}
                                                onChange={(e) => setEditFormData({...editFormData, accessControl: e.target.value})}
                                                className="appearance-none w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                            >
                                                <option value="public">🌍 Public</option>
                                                <option value="private">🔒 Private</option>
                                                <option value="restricted">👥 Restricted</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Tags (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={editFormData.tags}
                                            onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Replace Dataset File (Optional)</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                onChange={(e) => setEditFile(e.target.files[0])}
                                                className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm font-medium text-slate-600 focus:border-blue-500 focus:bg-white focus:outline-none transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            {editFile && (
                                                <p className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
                                                    Selected: {editFile.name} ({(editFile.size / 1024 / 1024).toFixed(2)} MB)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {editFormData.accessControl === "restricted" && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                                        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-blue-900">Whitelisted Emails</label>
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="email"
                                                value={editEmailInput}
                                                onChange={(e) => setEditEmailInput(e.target.value)}
                                                placeholder="Enter researcher email..."
                                                className="flex-1 rounded-xl border border-blue-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                            <button type="button" onClick={handleEditAddEmail} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 transition">Add</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {editAllowedEmails.map(email => (
                                                <span key={email} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200">
                                                    {email}
                                                    <button type="button" onClick={() => setEditAllowedEmails(editAllowedEmails.filter(e => e !== email))} className="text-slate-400 hover:text-rose-500"><X size={12}/></button>
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm("Delete this dataset entirely?")) {
                                                handleDelete(editingDataset._id);
                                                setEditingDataset(null);
                                            }
                                        }}
                                        className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-xs font-bold text-rose-600 hover:bg-rose-100 transition flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingDataset(null)}
                                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-4 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isEditing}
                                        className="flex-[2] rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-600 transition disabled:opacity-50"
                                    >
                                        {isEditing ? "Optimizing..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatasetList;

