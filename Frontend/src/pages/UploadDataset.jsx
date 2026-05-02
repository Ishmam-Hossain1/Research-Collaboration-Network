import { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { 
    Upload, 
    Tag, 
    Lock, 
    FileText, 
    ArrowLeft, 
    X, 
    Mail, 
    Sparkles, 
    FileUp,
    ChevronLeft,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import SplashCursor from "../components/SplashCursor";

const API = "http://localhost:5000";

const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
};

const UploadDataset = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: "",
        accessControl: "public",
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [allowedEmails, setAllowedEmails] = useState([]);
    const [emailInput, setEmailInput] = useState("");

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("researchConnectUser") || "null");
        } catch {
            return null;
        }
    }, []);

    const handleAddEmail = (e) => {
        e.preventDefault();
        const trimmed = emailInput.trim().toLowerCase();
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
        if (allowedEmails.includes(trimmed)) return;
        setAllowedEmails([...allowedEmails, trimmed]);
        setEmailInput("");
        setError("");
    };

    const handleRemoveEmail = (emailToRemove) => {
        setAllowedEmails(allowedEmails.filter((email) => email !== emailToRemove));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const token = localStorage.getItem("researchConnectToken");
        if (!token) {
            setError("Session expired. Please login again.");
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("tags", JSON.stringify(
            formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        ));
        data.append("accessControl", formData.accessControl);

        if (formData.accessControl === "restricted") {
            data.append("allowedUsers", JSON.stringify(allowedEmails));
        }

        data.append("file", file);

        try {
            await axios.post(`${API}/api/datasets`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setSuccess("Dataset published successfully!");
            setTimeout(() => navigate("/datasets"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Internal server error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#f8fbff] text-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 z-[1]">
                <SplashCursor />
            </div>
            <div className="absolute inset-0 z-[2] bg-white/35 backdrop-blur-[0.5px]" />

            <div className="relative z-10">
                <Navbar />

                <main className="mx-auto max-w-4xl px-4 pt-32 pb-24">
                    {/* Breadcrumbs */}
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link 
                            to="/datasets" 
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-blue-600"
                        >
                            <ChevronLeft size={16} />
                            Back to Library
                        </Link>
                    </motion.div>

                    <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
                        {/* Header Section */}
                        <motion.div 
                            variants={fadeUpVariant}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/20">
                                <FileUp size={32} />
                            </div>
                            <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                                Share your <span className="text-blue-600">Research.</span>
                            </h1>
                            <p className="mt-6 text-lg leading-relaxed text-slate-500 font-serif">
                                Upload your datasets to the global Research Connect network. 
                                Control access, track usage, and contribute to the community's 
                                shared knowledge base.
                            </p>

                            <div className="mt-12 space-y-8">
                                <div className="flex gap-4">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-slate-800">Secure Storage</h4>
                                        <p className="text-sm text-slate-500">Your data is encrypted and stored with redundancy.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-slate-800">Granular Access</h4>
                                        <p className="text-sm text-slate-500">Choose between Public, Private, or Whitelisted access.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-slate-800">Automatic Tagging</h4>
                                        <p className="text-sm text-slate-500">Our system helps categorize your data for better discoverability.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Form Card */}
                        <motion.div 
                            variants={fadeUpVariant}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.1 }}
                            className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-2xl"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Dataset Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter a descriptive title"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="What does this dataset contain?"
                                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Visibility</label>
                                        <select
                                            name="accessControl"
                                            value={formData.accessControl}
                                            onChange={handleChange}
                                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        >
                                            <option value="public">🌍 Public</option>
                                            <option value="private">🔒 Private</option>
                                            <option value="restricted">👥 Restricted</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Tags</label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            placeholder="biology, ai..."
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>
                                </div>

                                {formData.accessControl === "restricted" && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }} 
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5"
                                    >
                                        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-blue-900">Whitelist Emails</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                value={emailInput}
                                                onChange={(e) => setEmailInput(e.target.value)}
                                                placeholder="Enter email..."
                                                className="flex-1 rounded-xl border border-blue-200 px-3 py-2 text-xs focus:outline-none"
                                            />
                                            <button type="button" onClick={handleAddEmail} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">Add</button>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {allowedEmails.map(e => (
                                                <span key={e} className="rounded-full bg-white px-2 py-1 text-[10px] font-bold border border-slate-200 flex items-center gap-1">
                                                    {e} <button type="button" onClick={() => handleRemoveEmail(e)}><X size={10}/></button>
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Upload File</label>
                                    <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-blue-400 hover:bg-blue-50/30">
                                        <input
                                            type="file"
                                            id="file-input"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 cursor-pointer opacity-0 z-10"
                                        />
                                        <div className="py-8 px-4 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110">
                                                <Upload size={24} className="text-blue-500" />
                                            </div>
                                            {file ? (
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 truncate px-4">{file.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Drop or Select File</p>
                                                    <p className="mt-1 text-[10px] text-slate-400 font-medium">All research formats supported</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100">
                                            {error}
                                        </motion.div>
                                    )}
                                    {success && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-600 border border-emerald-100 flex items-center gap-2">
                                            <CheckCircle2 size={14}/> {success}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Sparkles size={18} />
                                        )}
                                        {loading ? "Publishing Data..." : "Publish Dataset"}
                                    </div>
                                    {loading && (
                                        <motion.div 
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "0%" }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute inset-0 bg-white/20"
                                        />
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UploadDataset;

