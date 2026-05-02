// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar";

// const Funding = () => {
//   const navigate = useNavigate();
//   const [fundingList, setFundingList] = useState([]);
//   const [myApplications, setMyApplications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedFundingId, setSelectedFundingId] = useState(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);

//   const savedUser = JSON.parse(localStorage.getItem("researchConnectUser"));

//   const currentUserId =
//     savedUser?._id ||
//     savedUser?.id ||
//     savedUser?.user?._id ||
//     savedUser?.user?.id;

//   const fetchFundingOpportunities = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/api/funding");
//       const data = await response.json();

//       if (response.ok) {
//         setFundingList(data);
//       } else {
//         console.error(data.message || "Failed to fetch funding opportunities");
//       }
//     } catch (error) {
//       console.error("Error fetching funding opportunities:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMyApplications = async () => {
//   try {
//     const token = localStorage.getItem("researchConnectToken");

//     if (!token) return;

//     const response = await fetch(
//       "http://localhost:5000/api/grant-applications/mine",
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const data = await response.json();

//     if (response.ok) {
//       setMyApplications(data.applications || []);
//     }
//   } catch (error) {
//     console.error("Error fetching my applications:", error);
//   }
// };

//   useEffect(() => {
//     fetchFundingOpportunities();
//     fetchMyApplications();
//   }, []);

//   const openDeleteModal = (id) => {
//     setSelectedFundingId(id);
//     setShowDeleteModal(true);
//   };

//   const closeDeleteModal = () => {
//     setShowDeleteModal(false);
//     setSelectedFundingId(null);
//   };

//   const confirmDelete = async () => {
//     if (!selectedFundingId) return;

//     try {
//       setDeleteLoading(true);

//       const response = await fetch(
//         `http://localhost:5000/api/funding/${selectedFundingId}`,
//         {
//           method: "DELETE",
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         setFundingList((prev) =>
//           prev.filter((item) => item._id !== selectedFundingId)
//         );

//         setShowDeleteModal(false);
//         setSelectedFundingId(null);
//         setShowDeleteSuccessPopup(true);

//         setTimeout(() => {
//           setShowDeleteSuccessPopup(false);
//         }, 2000);
//       } else {
//         alert(data.message || "Failed to delete funding opportunity");
//       }
//     } catch (error) {
//       console.error("Error deleting funding opportunity:", error);
//       alert("Something went wrong while deleting");
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   const totalFunding = fundingList.length;
//   const ownedFunding = fundingList.filter((item) => {
//     const ownerId =
//       typeof item.postedBy === "object" ? item.postedBy?._id : item.postedBy;

//     return (
//       ownerId && currentUserId && String(ownerId) === String(currentUserId)
//     );
//   }).length;

//   const upcomingDeadlines = fundingList.filter((item) => {
//     const deadline = new Date(item.deadline);
//     const today = new Date();
//     return deadline >= today;
//   }).length;

//   return (
//     <>
//       <Navbar />

//       <div
//         className={`min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-10 ${
//           showDeleteModal || showDeleteSuccessPopup ? "blur-sm" : ""
//         }`}
//       >
//         <div className="mx-auto max-w-6xl">
//           <div className="mb-8 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#0f172a] via-[#102a4c] to-[#0b5c8e] p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] sm:p-10">
//             <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
//               <div className="max-w-2xl">
//                 <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100 backdrop-blur">
//                   Research funding
//                 </span>

//                 <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
//                   Discover <span className="text-blue-400">funding</span> with
//                   confidence
//                 </h1>

//                 <p className="mt-4 max-w-xl text-sm leading-7 text-blue-50/85 sm:text-base">
//                   Browse, manage, and publish research funding opportunities in
//                   one clean workspace.
//                 </p>
//               </div>

//               <div className="grid grid-cols-3 gap-4">
//                 <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
//                   <p className="text-2xl font-bold">{totalFunding}</p>
//                   <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-blue-100/80">
//                     Total
//                   </p>
//                 </div>

//                 <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
//                   <p className="text-2xl font-bold">{ownedFunding}</p>
//                   <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-blue-100/80">
//                     Mine
//                   </p>
//                 </div>

//                 <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
//                   <p className="text-2xl font-bold">{upcomingDeadlines}</p>
//                   <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-blue-100/80">
//                     Active
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
//             <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
//               <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
//                 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
//                   Funding hub
//                 </p>

//                 <div className="mt-4 space-y-4">
//                   <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
//                     <p className="text-sm font-semibold text-slate-800">
//                       Browse grants
//                     </p>
//                     <p className="mt-1 text-sm text-slate-500">
//                       View available research funding opportunities.
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
//                     <p className="text-sm font-semibold text-slate-800">
//                       Track deadlines
//                     </p>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Keep an eye on open calls and closing dates.
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
//                     <p className="text-sm font-semibold text-slate-800">
//                       Manage your posts
//                     </p>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Edit or remove only the grants you created.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-5 space-y-3">
//                 <button
//                   onClick={() => navigate("/funding/new")}
//                   className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:bg-blue-700"
//                 >
//                   + New Funding
//                 </button>

//                 <button
//                   onClick={() => navigate("/grant-applications/mine")}
//                   className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-6 py-3.5 font-semibold text-blue-700 transition hover:bg-blue-100"
//                 >
//                   My Applications
//                 </button>

//                 <button
//                   onClick={() => navigate("/grant-applications/received")}
//                   className="w-full rounded-2xl border border-slate-200 bg-slate-900 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
//                 >
//                   Received Applications
//                 </button>
//               </div>
//             </div>

//             <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
//               <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 sm:px-8">
//                 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                   <div>
//                     <h2 className="text-xl font-semibold text-slate-900">
//                       Available Opportunities
//                     </h2>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Explore funding opportunities and manage your own listings.
//                     </p>
//                   </div>

//                   <span className="inline-flex w-fit rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700">
//                     Funding List
//                   </span>
//                 </div>
//               </div>

//               <div className="p-6 sm:p-8">
//                 {loading ? (
//                   <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center text-slate-500">
//                     Loading funding opportunities...
//                   </div>
//                 ) : fundingList.length === 0 ? (
//                   <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center text-slate-500">
//                     No funding opportunities yet.
//                   </div>
//                 ) : (
//                   <div className="space-y-5">
//                     {fundingList.map((item) => {
//                       const ownerId =
//                         typeof item.postedBy === "object"
//                           ? item.postedBy?._id
//                           : item.postedBy;

//                       const isOwner =
//                         ownerId &&
//                         currentUserId &&
//                         String(ownerId) === String(currentUserId);

//                       const postedByName =
//                         typeof item.postedBy === "object"
//                           ? item.postedBy?.username ||
//                             item.postedBy?.email ||
//                             "Unknown"
//                           : "Unknown";

//                       const myApplication = myApplications.find(
//                         (application) =>
//                           application.fundingOpportunity?._id === item._id ||
//                           application.fundingOpportunity === item._id
//                       );

//                       const hasActiveApplication =
//                         myApplication &&
//                         ["submitted", "under_review"].includes(myApplication.status);

//                       const canApplyAgain =
//                         !myApplication ||
//                         ["approved", "rejected"].includes(myApplication.status);

//                       return (
//                         <div
//                           key={item._id}
//                           className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]"
//                         >
//                           <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
//                             <div className="min-w-0 flex-1">
//                               <div className="flex flex-wrap items-center gap-3">
//                                 <h3 className="text-xl font-semibold text-slate-900">
//                                   {item.grantTitle}
//                                 </h3>

//                                 <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
//                                   Research Grant
//                                 </span>
//                               </div>

//                               <p className="mt-3 text-sm leading-7 text-slate-600">
//                                 {item.eligibilityCriteria}
//                               </p>

//                               <div className="mt-5 flex flex-wrap gap-3">
//                                 <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
//                                     <p className="text-[11px] font-semibold uppercase tracking-wide text-red-400">
//                                         Deadline
//                                     </p>
//                                     <p className="mt-1 text-sm font-semibold text-red-600">
//                                         {new Date(item.deadline).toLocaleDateString()}
//                                     </p>
//                                 </div>

//                                 <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
//                                   <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
//                                     Posted by
//                                   </p>
//                                   <p className="mt-1 text-sm font-semibold text-slate-800">
//                                     {postedByName}
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>

//                             <div className="w-full lg:w-auto lg:min-w-[200px]">
//                               <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-left lg:text-right">
//                                 <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">
//                                   Funding Amount
//                                 </p>
//                                 <p className="mt-1 text-2xl font-bold text-emerald-600">
//                                   ${item.fundingAmount}
//                                 </p>
//                               </div>

//                               <div className="mt-4 space-y-2">
                              
//                               <div className="mt-4 space-y-2">
//                                 {!isOwner && hasActiveApplication && (
//                                   <button
//                                     onClick={() => navigate(`/grant-applications/${myApplication._id}/edit`)}
//                                     className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(245,158,11,0.22)] transition hover:bg-amber-600"
//                                   >
//                                     Edit Application
//                                   </button>
//                                 )}

//                                 {!isOwner && canApplyAgain && (
//                                   <button
//                                     onClick={() => navigate(`/funding/${item._id}/apply`)}
//                                     className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
//                                   >
//                                     Apply Now
//                                   </button>
//                                 )}

//                                 {isOwner && (
//                                   <div className="flex gap-2 lg:justify-end">
//                                     <button
//                                       onClick={() => navigate(`/funding/edit/${item._id}`)}
//                                       className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
//                                     >
//                                       Edit
//                                     </button>

//                                     <button
//                                       onClick={() => openDeleteModal(item._id)}
//                                       className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
//                                     >
//                                       Delete
//                                     </button>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-4">
//           <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
//             <h2 className="text-2xl font-bold text-red-600">
//               Delete Funding Opportunity?
//             </h2>

//             <p className="mt-3 text-slate-500">
//               This action cannot be undone. Are you sure you want to delete this
//               funding opportunity?
//             </p>

//             <div className="mt-7 flex justify-center gap-4">
//               <button
//                 onClick={closeDeleteModal}
//                 disabled={deleteLoading}
//                 className="rounded-xl bg-slate-100 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={confirmDelete}
//                 disabled={deleteLoading}
//                 className="rounded-xl bg-red-500 px-5 py-2.5 font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
//               >
//                 {deleteLoading ? "Deleting..." : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showDeleteSuccessPopup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 px-4">
//           <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
//             <h2 className="text-xl font-bold text-red-600">
//               Funding Deleted Successfully
//             </h2>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Funding;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import fundingImg from "../assets/research_funding.jpg";

const Funding = () => {
  const navigate = useNavigate();
  const [fundingList, setFundingList] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFundingId, setSelectedFundingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);

  const savedUser = JSON.parse(localStorage.getItem("researchConnectUser"));

  const currentUserId =
    savedUser?._id ||
    savedUser?.id ||
    savedUser?.user?._id ||
    savedUser?.user?.id;

  const fetchFundingOpportunities = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/funding");
      const data = await response.json();

      if (response.ok) {
        setFundingList(data);
      } else {
        console.error(data.message || "Failed to fetch funding opportunities");
      }
    } catch (error) {
      console.error("Error fetching funding opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem("researchConnectToken");

      if (!token) return;

      const response = await fetch(
        "http://localhost:5000/api/grant-applications/mine",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMyApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching my applications:", error);
    }
  };

  useEffect(() => {
    fetchFundingOpportunities();
    fetchMyApplications();
  }, []);

  const openDeleteModal = (id) => {
    setSelectedFundingId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedFundingId(null);
  };

  const confirmDelete = async () => {
    if (!selectedFundingId) return;

    try {
      setDeleteLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/funding/${selectedFundingId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFundingList((prev) =>
          prev.filter((item) => item._id !== selectedFundingId)
        );

        setShowDeleteModal(false);
        setSelectedFundingId(null);
        setShowDeleteSuccessPopup(true);

        setTimeout(() => {
          setShowDeleteSuccessPopup(false);
        }, 2000);
      } else {
        alert(data.message || "Failed to delete funding opportunity");
      }
    } catch (error) {
      console.error("Error deleting funding opportunity:", error);
      alert("Something went wrong while deleting");
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalFunding = fundingList.length;
  const ownedFunding = fundingList.filter((item) => {
    const ownerId =
      typeof item.postedBy === "object" ? item.postedBy?._id : item.postedBy;

    return (
      ownerId && currentUserId && String(ownerId) === String(currentUserId)
    );
  }).length;

  const upcomingDeadlines = fundingList.filter((item) => {
    const deadline = new Date(item.deadline);
    const today = new Date();
    return deadline >= today;
  }).length;

  return (
    <>
      <Navbar />

      <div
        className={`relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#f6faff] to-[#eef5ff] px-4 py-8 sm:px-6 lg:px-10 ${
          showDeleteModal || showDeleteSuccessPopup ? "blur-sm" : ""
        }`}
      >
        <div className="pointer-events-none absolute left-[-180px] top-20 h-[380px] w-[380px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-180px] top-[420px] h-[440px] w-[440px] rounded-full bg-slate-300/30 blur-3xl" />
        {/* Background blobs */}
        <div className="pointer-events-none absolute top-[-120px] left-[-120px] h-[420px] w-[420px] rounded-full bg-blue-200/40 blur-3xl" />

        <div className="pointer-events-none absolute bottom-[-150px] right-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="pointer-events-none absolute top-[300px] right-[20%] h-[280px] w-[280px] rounded-full bg-sky-200/30 blur-2xl" />

        <div className="relative mx-auto max-w-6xl">
          <section className="mb-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700">
                  💼 Research Funding Hub
                </span>

                <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                  Discover funding opportunities that support research
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  Browse, manage, publish, apply for, and monitor research
                  funding opportunities in one clean academic workspace.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
                    {totalFunding} grants
                  </span>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
                    {ownedFunding} posted by you
                  </span>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
                    {upcomingDeadlines} active calls
                  </span>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/funding/new")}
                    className="rounded-full bg-slate-950 px-7 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    + New Funding
                  </button>

                  <button
                    onClick={() => navigate("/grant-applications/mine")}
                    className="rounded-full border border-blue-200 bg-blue-50 px-7 py-3.5 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100"
                  >
                    My Applications
                  </button>

                  <button
                    onClick={() => navigate("/grant-applications/received")}
                    className="rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    Received Applications
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <img
                  src={fundingImg}
                  alt="Research funding illustration"
                  className="max-h-[300px] w-full max-w-[430px] object-contain"
                />
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <aside className="h-fit rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Funding desk
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Browse grants
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    View available research funding opportunities.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Track applications
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Review your submitted applications and edit active ones.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Manage your posts
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Edit or remove only the grants you created.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  onClick={() => navigate("/funding/new")}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-[0_12px_26px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  + New Funding
                </button>

                <button
                  onClick={() => navigate("/grant-applications/mine")}
                  className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-6 py-3.5 font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100"
                >
                  My Applications
                </button>

                <button
                  onClick={() => navigate("/grant-applications/received")}
                  className="w-full rounded-2xl bg-slate-950 px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Received Applications
                </button>
              </div>
            </aside>

            <main className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">
                      Available Opportunities
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Explore funding opportunities and manage your own listings.
                    </p>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                    Funding List
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {loading ? (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                    <p className="font-bold text-slate-800">
                      Loading funding opportunities...
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Please wait while we prepare the latest grants.
                    </p>
                  </div>
                ) : fundingList.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                    <p className="font-bold text-slate-800">
                      No funding opportunities yet.
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Create the first funding opportunity for researchers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {fundingList.map((item) => {
                      const ownerId =
                        typeof item.postedBy === "object"
                          ? item.postedBy?._id
                          : item.postedBy;

                      const isOwner =
                        ownerId &&
                        currentUserId &&
                        String(ownerId) === String(currentUserId);

                      const postedByName =
                        typeof item.postedBy === "object"
                          ? item.postedBy?.username ||
                            item.postedBy?.email ||
                            "Unknown"
                          : "Unknown";

                      const myApplication = myApplications.find(
                        (application) =>
                          application.fundingOpportunity?._id === item._id ||
                          application.fundingOpportunity === item._id
                      );

                      const hasActiveApplication =
                        myApplication &&
                        ["submitted", "under_review"].includes(
                          myApplication.status
                        );

                      const canApplyAgain =
                        !myApplication ||
                        ["approved", "rejected"].includes(myApplication.status);

                      return (
                        <div
                          key={item._id}
                          className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.1)]"
                        >
                          <div className="absolute right-[-70px] top-[-70px] h-40 w-40 rounded-full bg-blue-100/70 transition group-hover:bg-blue-200/80" />

                          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                  Research Grant
                                </span>

                                {isOwner && (
                                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                                    Posted by You
                                  </span>
                                )}

                                {!isOwner && hasActiveApplication && (
                                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                    Application Active
                                  </span>
                                )}

                                {!isOwner && canApplyAgain && (
                                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                    Open to Apply
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-4 text-xl font-extrabold leading-snug text-slate-950">
                                {item.grantTitle}
                              </h3>

                              <p className="mt-3 text-sm leading-7 text-slate-600">
                                {item.eligibilityCriteria}
                              </p>

                              <div className="mt-5 flex flex-wrap gap-3">
                                <div className="rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3">
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-red-400">
                                    Deadline
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-red-600">
                                    {new Date(
                                      item.deadline
                                    ).toLocaleDateString()}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    Posted by
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {postedByName}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="w-full lg:w-auto lg:min-w-[210px]">
                              <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-left lg:text-right">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-500">
                                  Funding Amount
                                </p>
                                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                                  ${item.fundingAmount}
                                </p>
                              </div>

                              <div className="mt-4 space-y-2">
                                {!isOwner && hasActiveApplication && (
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/grant-applications/${myApplication._id}/edit`
                                      )
                                    }
                                    className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(245,158,11,0.22)] transition hover:-translate-y-0.5 hover:bg-amber-600"
                                  >
                                    Edit Application
                                  </button>
                                )}

                                {!isOwner && canApplyAgain && (
                                  <button
                                    onClick={() =>
                                      navigate(`/funding/${item._id}/apply`)
                                    }
                                    className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-700"
                                  >
                                    Apply Now
                                  </button>
                                )}

                                {isOwner && (
                                  <div className="flex gap-2 lg:justify-end">
                                    <button
                                      onClick={() =>
                                        navigate(`/funding/edit/${item._id}`)
                                      }
                                      className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
                                    >
                                      Edit
                                    </button>

                                    <button
                                      onClick={() => openDeleteModal(item._id)}
                                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              🗑️
            </div>

            <h2 className="text-2xl font-extrabold text-slate-950">
              Delete Funding Opportunity?
            </h2>

            <p className="mt-3 text-slate-500">
              This action cannot be undone. Are you sure you want to delete this
              funding opportunity?
            </p>

            <div className="mt-7 flex justify-center gap-4">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="rounded-xl bg-red-500 px-5 py-2.5 font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 px-4 backdrop-blur-sm">
          <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl">
              ✅
            </div>

            <h2 className="text-xl font-extrabold text-slate-950">
              Funding Deleted Successfully
            </h2>
          </div>
        </div>
      )}
    </>
  );
};

export default Funding;