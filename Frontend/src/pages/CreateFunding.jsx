import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const CreateFunding = () => {
  const navigate = useNavigate();

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

  const [showPopup, setShowPopup] = useState(false); //success popup

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
      const response = await fetch("http://localhost:5000/api/funding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          fundingAmount: Number(formData.fundingAmount),
          postedBy: currentUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create funding");
      }

      setShowPopup(true);

      setTimeout(() => {
        navigate("/funding");
      }, 3000);
    } catch (error) {
      console.error("Create funding error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  return (
    <>
      <Navbar />

      <div
        className={`min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-10 ${
          showPopup ? "blur-sm" : ""
        }`}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#0f172a] via-[#102a4c] to-[#0b5c8e] p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] sm:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100 backdrop-blur">
                  Funding creation
                </span>

                <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  Present your <span className="text-blue-400">funding</span>{" "}
                  with confidence
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-blue-50/85 sm:text-base">
                  Publish a polished funding opportunity so researchers can
                  quickly understand the amount, deadline, and who can apply.
                </p>
              </div>

            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Funding guide
                </p>

                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm font-semibold text-slate-800">
                      Clear title
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Keep the grant name concise and recognizable.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm font-semibold text-slate-800">
                      Strong deadline
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Let applicants know the closing date immediately.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm font-semibold text-slate-800">
                      Eligibility
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Make requirements short, clear, and easy to scan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-blue-50 px-5 py-4">
                <p className="text-sm font-semibold text-slate-800">
                  Quick tip
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Better structured funding posts feel more trustworthy and are
                  easier for researchers to respond to.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Funding Details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Fill in the details below to publish your opportunity.
                    </p>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700">
                    New Listing
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="grantTitle"
                      className="mb-2.5 block text-sm font-semibold text-slate-700"
                    >
                      Grant Title
                    </label>
                    <input
                      id="grantTitle"
                      type="text"
                      name="grantTitle"
                      value={formData.grantTitle}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      placeholder="Enter grant title"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="fundingAmount"
                        className="mb-2.5 block text-sm font-semibold text-slate-700"
                      >
                        Amount
                      </label>

                      <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition duration-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                        <span className="border-r border-slate-200 bg-slate-100 px-4 py-3.5 text-sm font-semibold text-slate-600">
                          BDT
                        </span>
                        <input
                          id="fundingAmount"
                          type="number"
                          name="fundingAmount"
                          value={formData.fundingAmount}
                          onChange={handleChange}
                          className="w-full bg-transparent px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none"
                          placeholder="Enter amount"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="deadline"
                        className="mb-2.5 block text-sm font-semibold text-slate-700"
                      >
                        Deadline
                      </label>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition duration-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                        <input
                          id="deadline"
                          type="datetime-local"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          style={{ colorScheme: "light" }}
                          className="w-full rounded-2xl bg-transparent px-4 py-3.5 text-slate-900 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="eligibilityCriteria"
                      className="mb-2.5 block text-sm font-semibold text-slate-700"
                    >
                      Eligibility Criteria
                    </label>
                    <textarea
                      id="eligibilityCriteria"
                      name="eligibilityCriteria"
                      value={formData.eligibilityCriteria}
                      onChange={handleChange}
                      rows="6"
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      placeholder="Describe who can apply for this funding opportunity"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Review everything before publishing your opportunity.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => navigate("/funding")}
                      className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:bg-blue-700"
                    >
                      Save Funding
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-600">
              ✓
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Funding Posted Successfully
            </h2>

            <p className="mt-2 text-slate-500">
              Redirecting to funding list...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateFunding;