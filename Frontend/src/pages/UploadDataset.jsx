import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Upload, Tag, Lock, FileText, ArrowLeft, X, Mail } from "lucide-react";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000";

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

    // Restricted emails state
    const [allowedEmails, setAllowedEmails] = useState([]);
    const [emailInput, setEmailInput] = useState("");

    const handleAddEmail = (e) => {
        e.preventDefault();
        const trimmed = emailInput.trim().toLowerCase();
        if (!trimmed) return;

        // Basic email regex map validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (allowedEmails.includes(trimmed)) {
            setError("Email is already in the list.");
            return;
        }

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
        if (!formData.title.trim()) {
            setError("Title is required.");
            return;
        }

        const token = localStorage.getItem("researchConnectToken");
        if (!token) {
            setError("You must be logged in to upload a dataset.");
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

            setSuccess("Dataset uploaded successfully!");
            setFormData({ title: "", description: "", tags: "", accessControl: "public" });
            setAllowedEmails([]);
            setEmailInput("");
            setFile(null);
            document.getElementById("file-input").value = "";

            // Redirect back to datasets after success
            setTimeout(() => {
                navigate("/datasets");
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar />

            <div className="px-4 py-10">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Upload Dataset</h1>
                            <p className="mt-1 text-slate-500">
                                Share your research data with the community
                            </p>
                        </div>
                        <Link
                            to="/datasets"
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
                        >
                            <ArrowLeft size={16} />
                            Browse Datasets
                        </Link>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <FileText size={15} />
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="dataset-title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Climate Change Gene Expression Dataset"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 transition"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>
                                <textarea
                                    id="dataset-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your dataset — methodology, source, time period, etc."
                                    rows={4}
                                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 transition"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Tag size={15} />
                                    Category Tags
                                </label>
                                <input
                                    type="text"
                                    id="dataset-tags"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="biology, machine-learning, climate (comma-separated)"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 transition"
                                />
                                <p className="mt-1 text-xs text-slate-400">Separate tags with commas</p>
                            </div>

                            {/* Access Control */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Lock size={15} />
                                    Download Access
                                </label>
                                <select
                                    id="dataset-access"
                                    name="accessControl"
                                    value={formData.accessControl}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 transition"
                                >
                                    <option value="public">🌍 Public — Anyone can download</option>
                                    <option value="private">🔒 Private — Only you can download</option>
                                    <option value="restricted">👥 Restricted — Specific users only</option>
                                </select>
                            </div>

                            {/* Conditional Restricted Emails Input */}
                            {formData.accessControl === "restricted" && (
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
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddEmail(e);
                                                }
                                            }}
                                            placeholder="colleague@university.edu"
                                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddEmail}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {allowedEmails.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {allowedEmails.map((email) => (
                                                <span
                                                    key={email}
                                                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
                                                >
                                                    {email}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEmail(email)}
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

                            {/* File Upload */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Upload size={15} />
                                    Dataset File <span className="text-red-500">*</span>
                                </label>
                                <div className="relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition hover:border-blue-400 hover:bg-blue-50">
                                    <input
                                        type="file"
                                        id="file-input"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                    />
                                    <div className="text-center">
                                        <Upload size={32} className="mx-auto mb-2 text-slate-400" />
                                        {file ? (
                                            <div>
                                                <p className="font-medium text-blue-700">{file.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-medium text-slate-600">
                                                    Click to select or drag &amp; drop
                                                </p>
                                                <p className="text-xs text-slate-400">Any file format accepted</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status messages */}
                            {error && (
                                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-200">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200">
                                    {success}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                id="upload-submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Uploading…
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Upload Dataset
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadDataset;
