import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  FileText,
  Info,
  Landmark,
  Loader2,
  PencilLine,
  Sparkles,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";

const formatDateTimeLocal = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// const EditFunding = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  const EditFunding = ({ isOpen = true, onClose, onUpdated, fundingId }) => {
    const { id: routeId } = useParams();
    const navigate = useNavigate();

    const id = fundingId || routeId;

    if (!isOpen) return null;

  const [formData, setFormData] = useState({
    grantTitle: "",
    fundingAmount: "",
    deadline: "",
    eligibilityCriteria: "",
  });

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchFundingById = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_BASEURL}/api/funding/${id}`);
        const data = await response.json();

        if (response.ok) {
          setFormData({
            grantTitle: data.grantTitle || "",
            fundingAmount: data.fundingAmount || "",
            // deadline: data.deadline
            //   ? new Date(data.deadline).toISOString().slice(0, 16)
            //   : "",
            deadline: formatDateTimeLocal(data.deadline),
            eligibilityCriteria: data.eligibilityCriteria || "",
          });
        } else {
          alert(data.message || "Failed to fetch funding details");
        }
      } catch (error) {
        console.error("Error fetching funding:", error);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchFundingById();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdateLoading(true);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASEURL}/api/funding/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({
        //   ...formData,
        //   fundingAmount: Number(formData.fundingAmount),
        // }),
        // body: JSON.stringify({
        //   ...formData,
        //   fundingAmount: Number(formData.fundingAmount),
        //   deadline: new Date(formData.deadline).toISOString(),
        // }),
        body: JSON.stringify({
          ...formData,
          fundingAmount: Number(formData.fundingAmount),
          deadline: formData.deadline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update funding");
      }

      setShowSuccess(true);

      // setTimeout(() => {
      //   navigate("/funding");
      // }, 1400);
      setTimeout(() => {
        if (onUpdated) {
          onUpdated();
        } else {
          navigate("/funding");
        }
      }, 1400);
    } catch (error) {
      console.error("Update funding error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-[#eef3f8] px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
            <div className="w-full rounded-[30px] border border-white/70 bg-white p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-blue-600 ring-1 ring-slate-200">
                <Loader2 size={28} className="animate-spin" />
              </div>

              <h2 className="text-2xl font-black text-slate-950">
                Loading funding details
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Please wait while we prepare the editable form.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* <Navbar />

      <div
        className={`min-h-screen bg-[#eef3f8] px-4 py-10 sm:px-6 lg:px-10 ${
          showSuccess ? "blur-sm" : ""
        }`}
      >
        <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-3xl items-center justify-center"> */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-md">
        <div className="mx-auto flex max-h-[92vh] w-full max-w-3xl items-center justify-center">
          <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]">
            <button
              type="button"
              // onClick={() => navigate("/funding")}
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  navigate("/funding");
                }
              }}
              disabled={updateLoading}
              className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={18} />
            </button>

            <div className="border-b border-slate-100 px-6 pb-4 pt-6 sm:px-8">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Edit Funding
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update funding details, eligibility, deadline, and amount.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4 sm:px-8"
            >
              <div className="mb-6 rounded-[26px] bg-slate-50 px-5 py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                  <PencilLine size={28} />
                </div>

                <h3 className="mt-4 text-base font-black text-slate-900">
                  Refine Funding Opportunity
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Make your funding post clearer so researchers can understand
                  the grant, deadline, and requirements quickly.
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
                      Editing tip
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Clearer funding details help applicants understand whether
                      they are eligible before applying.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  // onClick={() => navigate("/funding")}
                  onClick={() => {
                  if (onClose) {
                    onClose();
                  } else {
                    navigate("/funding");
                  }
                }}
                  disabled={updateLoading}
                  className="rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updateLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
                >
                  {updateLoading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Update Funding
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[30px] border border-white/70 bg-white p-9 text-center shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/70">
              <CheckCircle2 size={42} />
            </div>

            <h2 className="text-2xl font-black text-slate-950">
              Funding updated successfully
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Redirecting to funding list...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default EditFunding;
