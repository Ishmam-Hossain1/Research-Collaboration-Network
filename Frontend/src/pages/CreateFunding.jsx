import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  FileText,
  Info,
  Landmark,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

const CreateFunding = ({ isOpen, onClose, onCreated }) => {
  const savedUser = JSON.parse(localStorage.getItem("researchConnectUser"));

  const currentUserId =
    savedUser?._id ||
    savedUser?.id ||
    savedUser?.user?._id ||
    savedUser?.user?.id;

  const [formData, setFormData] = useState({
    grantTitle: "",
    fundingAmount: "",
    deadline: "",
    eligibilityCriteria: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      grantTitle: "",
      fundingAmount: "",
      deadline: "",
      eligibilityCriteria: "",
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose?.();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUserId) {
      alert("User not found. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/funding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({
        //   ...formData,
        //   fundingAmount: Number(formData.fundingAmount),
        //   postedBy: currentUserId,
        // }),
        // body: JSON.stringify({
        //   ...formData,
        //   fundingAmount: Number(formData.fundingAmount),
        //   deadline: new Date(formData.deadline).toISOString(),
        //   postedBy: currentUserId,
        // }),
        body: JSON.stringify({
          ...formData,
          fundingAmount: Number(formData.fundingAmount),
          deadline: formData.deadline,
          postedBy: currentUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create funding");
      }

      setShowSuccess(true);

      setTimeout(() => {
        resetForm();
        setShowSuccess(false);
        onCreated?.(data.funding || data);
        onClose?.();
      }, 1200);
    } catch (error) {
      console.error("Create funding error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-md"
      onClick={handleOverlayClick}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={18} />
        </button>

        <div className="border-b border-slate-100 px-6 pb-4 pt-6 sm:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Create Funding
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add funding details, eligibility, deadline, and amount.
          </p>
        </div>

        {showSuccess ? (
          <div className="flex min-h-[430px] flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/70">
              <CheckCircle2 size={42} />
            </div>

            <h3 className="text-3xl font-black text-slate-950">
              Funding posted successfully
            </h3>

            <p className="mt-3 max-w-md text-slate-500">
              Your new funding opportunity has been published.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4 sm:px-8"
          >
            <div className="mb-6 rounded-[26px] bg-slate-50 px-5 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                <Sparkles size={28} />
              </div>

              <h3 className="mt-4 text-base font-black text-slate-900">
                New Funding Opportunity
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                Keep your post clear so researchers can understand the grant,
                deadline, and requirements quickly.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="grantTitle"
                  className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800"
                >
                  <Landmark size={16} className="text-blue-600" />
                  Grant Title
                </label>

                <input
                  id="grantTitle"
                  type="text"
                  name="grantTitle"
                  value={formData.grantTitle}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  placeholder="Example: Research Innovation Grant 2026"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="fundingAmount"
                  className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800"
                >
                  <BadgeDollarSign size={16} className="text-blue-600" />
                  Amount
                </label>

                <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
                  <span className="border-r border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-500">
                    USD
                  </span>

                  <input
                    id="fundingAmount"
                    type="number"
                    name="fundingAmount"
                    value={formData.fundingAmount}
                    onChange={handleChange}
                    className="w-full bg-transparent px-4 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800"
                >
                  <CalendarClock size={16} className="text-blue-600" />
                  Deadline
                </label>

                <input
                  id="deadline"
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="eligibilityCriteria"
                  className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800"
                >
                  <FileText size={16} className="text-blue-600" />
                  Eligibility Criteria
                </label>

                <textarea
                  id="eligibilityCriteria"
                  name="eligibilityCriteria"
                  value={formData.eligibilityCriteria}
                  onChange={handleChange}
                  rows="5"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  placeholder="Describe who can apply, required qualifications, research areas, documents needed, etc."
                  required
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-3">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-blue-600">
                  <Info size={16} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Posting tip
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    A clear eligibility section helps researchers decide faster
                    and reduces irrelevant applications.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Save Funding
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateFunding;
