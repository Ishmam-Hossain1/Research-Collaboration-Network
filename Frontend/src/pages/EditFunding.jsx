// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import Navbar from "../components/Navbar";

// const EditFunding = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     grantTitle: "",
//     fundingAmount: "",
//     deadline: "",
//     eligibilityCriteria: "",
//   });

//   const [loading, setLoading] = useState(true);
//   const [showPopup, setShowPopup] = useState(false);

//   useEffect(() => {
//     const fetchFundingById = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/api/funding/${id}`);
//         const data = await response.json();

//         if (response.ok) {
//           setFormData({
//             grantTitle: data.grantTitle || "",
//             fundingAmount: data.fundingAmount || "",
//             // deadline: data.deadline ? data.deadline.split("T")[0] : "",
//             deadline: data.deadline ? new Date(data.deadline).toISOString().slice(0, 16) : "",
//             eligibilityCriteria: data.eligibilityCriteria || "",
//           });
//         } else {
//           alert(data.message || "Failed to fetch funding details");
//         }
//       } catch (error) {
//         console.error("Error fetching funding:", error);
//         alert("Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFundingById();
//   }, [id]);

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(`http://localhost:5000/api/funding/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ...formData,
//           fundingAmount: Number(formData.fundingAmount),
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to update funding");
//       }

//       setShowPopup(true);

//       setTimeout(() => {
//         navigate("/funding");
//       }, 3000);
//     } catch (error) {
//       console.error("Update funding error:", error);
//       alert(error.message || "Something went wrong");
//     }
//   };

//   if (loading) {
//     return (
//       <>
//         <Navbar />
//         <div className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-10">
//           <div className="mx-auto max-w-5xl">
//             <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center text-slate-500 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
//               Loading funding details...
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <Navbar />

//       <div
//         className={`min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-10 ${
//           showPopup ? "blur-sm" : ""
//         }`}
//       >
//         <div className="mx-auto max-w-5xl">
//           <div className="mb-8 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#0f172a] via-[#102a4c] to-[#0b5c8e] p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] sm:p-10">
//             <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
//               <div className="max-w-2xl">
//                 <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100 backdrop-blur">
//                   Funding update
//                 </span>

//                 <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
//                   Refine your <span className="text-blue-400">funding</span>{" "}
//                   details
//                 </h1>

//                 <p className="mt-4 max-w-xl text-sm leading-7 text-blue-50/85 sm:text-base">
//                   Update your funding opportunity with clearer information so
//                   researchers can better understand the amount, deadline, and
//                   eligibility.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
//             <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
//               <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
//                 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
//                   Editing guide
//                 </p>

//                 <div className="mt-4 space-y-4">
//                   <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
//                     <p className="text-sm font-semibold text-slate-800">
//                       Improve clarity
//                     </p>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Make the title and criteria easier to understand at a
//                       glance.
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
//                     <p className="text-sm font-semibold text-slate-800">
//                       Check deadline
//                     </p>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Keep the closing date accurate and visible for applicants.
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
//                     <p className="text-sm font-semibold text-slate-800">
//                       Review amount
//                     </p>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Confirm the funding amount is correct before updating.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-5 rounded-2xl bg-blue-50 px-5 py-4">
//                 <p className="text-sm font-semibold text-slate-800">
//                   Quick tip
//                 </p>
//                 <p className="mt-1 text-sm leading-6 text-slate-600">
//                   Small improvements in wording and structure can make funding
//                   listings feel much more professional and trustworthy.
//                 </p>
//               </div>
//             </div>

//             <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
//               <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 sm:px-8">
//                 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                   <div>
//                     <h2 className="text-xl font-semibold text-slate-900">
//                       Edit Funding Details
//                     </h2>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Update the information below and save your changes.
//                     </p>
//                   </div>

//                   <span className="inline-flex w-fit rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700">
//                     Edit Listing
//                   </span>
//                 </div>
//               </div>

//               <form onSubmit={handleSubmit} className="p-6 sm:p-8">
//                 <div className="space-y-6">
//                   <div>
//                     <label
//                       htmlFor="grantTitle"
//                       className="mb-2.5 block text-sm font-semibold text-slate-700"
//                     >
//                       Grant Title
//                     </label>
//                     <input
//                       id="grantTitle"
//                       type="text"
//                       name="grantTitle"
//                       value={formData.grantTitle}
//                       onChange={handleChange}
//                       className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                       placeholder="Enter grant title"
//                       required
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                     <div>
//                       <label
//                         htmlFor="fundingAmount"
//                         className="mb-2.5 block text-sm font-semibold text-slate-700"
//                       >
//                         Amount
//                       </label>

//                       <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition duration-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
//                         <span className="border-r border-slate-200 bg-slate-100 px-4 py-3.5 text-sm font-semibold text-slate-600">
//                           BDT
//                         </span>
//                         <input
//                           id="fundingAmount"
//                           type="number"
//                           name="fundingAmount"
//                           value={formData.fundingAmount}
//                           onChange={handleChange}
//                           className="w-full bg-transparent px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none"
//                           placeholder="Enter amount"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="deadline"
//                         className="mb-2.5 block text-sm font-semibold text-slate-700"
//                       >
//                         Deadline
//                       </label>

//                       <div className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition duration-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
//                         <input
//                           id="deadline"
//                           type="datetime-local"
//                           name="deadline"
//                           value={formData.deadline}
//                           onChange={handleChange}
//                           style={{ colorScheme: "light" }}
//                           className="w-full rounded-2xl bg-transparent px-4 py-3.5 text-slate-900 outline-none"
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="eligibilityCriteria"
//                       className="mb-2.5 block text-sm font-semibold text-slate-700"
//                     >
//                       Eligibility Criteria
//                     </label>
//                     <textarea
//                       id="eligibilityCriteria"
//                       name="eligibilityCriteria"
//                       value={formData.eligibilityCriteria}
//                       onChange={handleChange}
//                       rows="6"
//                       className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                       placeholder="Describe who can apply for this funding opportunity"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
//                   <p className="text-sm text-slate-500">
//                     Review the changes carefully before updating the listing.
//                   </p>

//                   <div className="flex flex-col gap-3 sm:flex-row">
//                     <button
//                       type="button"
//                       onClick={() => navigate("/funding")}
//                       className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
//                     >
//                       Cancel
//                     </button>

//                     <button
//                       type="submit"
//                       className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:bg-blue-700"
//                     >
//                       Update Funding
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>

//       {showPopup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 px-4 backdrop-blur-[2px]">
//           <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
//             <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-600">
//               ✓
//             </div>

//             <h2 className="text-2xl font-bold text-slate-900">
//               Funding Updated Successfully
//             </h2>

//             <p className="mt-2 text-slate-500">
//               Redirecting to funding list...
//             </p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default EditFunding;


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
        const response = await fetch(`http://localhost:5000/api/funding/${id}`);
        const data = await response.json();

        if (response.ok) {
          setFormData({
            grantTitle: data.grantTitle || "",
            fundingAmount: data.fundingAmount || "",
            deadline: data.deadline
              ? new Date(data.deadline).toISOString().slice(0, 16)
              : "",
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

      const response = await fetch(`http://localhost:5000/api/funding/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          fundingAmount: Number(formData.fundingAmount),
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