import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import fundingImg from "../assets/research_funding.jpg";
import CreateFunding from "./CreateFunding";
import EditFunding from "./EditFunding";
import EditGrantApplication from "./EditGrantApplication";

const Funding = () => {
  const navigate = useNavigate();
  const [fundingList, setFundingList] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFundingId, setSelectedFundingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [showCreateFunding, setShowCreateFunding] = useState(false);
  const [showEditFunding, setShowEditFunding] = useState(false);
  const [selectedEditFundingId, setSelectedEditFundingId] = useState(null);
  const [showEditGrantApplication, setShowEditGrantApplication] = useState(false);
  const [selectedGrantApplicationId, setSelectedGrantApplicationId] = useState(null);

  const savedUser = JSON.parse(localStorage.getItem("researchConnectUser"));

  const currentUserId =
    savedUser?._id ||
    savedUser?.id ||
    savedUser?.user?._id ||
    savedUser?.user?.id;

  const getProfilePictureUrl = (profilePictureId) => {
    if (!profilePictureId) return null;
    return `${import.meta.env.VITE_BACKEND_BASEURL}/api/auth/profile-picture/${profilePictureId}`;
  };

  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return `$${amount}`;
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline";

    return new Date(deadline).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const fetchFundingOpportunities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASEURL}/api/funding`);
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
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/grant-applications/mine`,
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
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/funding/${selectedFundingId}`,
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

    return ownerId && currentUserId && String(ownerId) === String(currentUserId);
  }).length;

  const upcomingDeadlines = fundingList.filter((item) => {
    const deadline = new Date(item.deadline);
    const today = new Date();
    return deadline >= today;
  }).length;

  const fundingSteps = [
    {
      step: "1",
      title: "Browse Opportunities",
      desc: "Explore our curated database of research funding opportunities",
    },
    {
      step: "2",
      title: "Check Eligibility",
      desc: "Review requirements and ensure your project meets the criteria",
    },
    {
      step: "3",
      title: "Submit Application",
      desc: "Complete and submit your application through our streamlined process",
    },
    {
      step: "4",
      title: "Track Progress",
      desc: "Monitor your application status and receive timely updates",
    },
  ];

  return (
    <>
      <Navbar />

      <div
        className={`relative min-h-screen overflow-hidden bg-[#f3f6fb] px-4 py-8 sm:px-6 lg:px-10 ${
          showDeleteModal || showDeleteSuccessPopup || showCreateFunding || showEditFunding || showEditGrantApplication
            ? "blur-sm"
            : ""
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_40%)]" />
        <div className="pointer-events-none absolute left-[-180px] top-20 h-[380px] w-[380px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-180px] top-[420px] h-[440px] w-[440px] rounded-full bg-slate-300/30 blur-3xl" />
        <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-150px] right-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[20%] top-[300px] h-[280px] w-[280px] rounded-full bg-sky-200/30 blur-2xl" />

        <div className="relative mx-auto max-w-6xl">
          <section className="fade-up mb-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700">
                  💼 Research Funding Hub
                </span>

                <h1 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
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
                    onClick={() => setShowCreateFunding(true)}
                    className="rounded-full bg-gradient-to-r from-slate-800 to-slate-600 px-7 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:from-slate-700 hover:to-slate-500"
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
            <div className="space-y-8">
              <aside className="fade-up h-fit rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
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
                    <p className="text-sm font-semibold text-slate-900">
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
                    onClick={() => setShowCreateFunding(true)}
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

              <section className="fade-up px-1">
                {/* <h2 className="text-center text-2xl font-bold text-slate-900">
                  How to Apply for Funding
                </h2> */}

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
                    How to apply
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    Funding process
                  </h2>
                </div>
              

                <div className="mt-8 space-y-8">
                  {fundingSteps.map((item, index) => (
                    <div
                      key={item.step}
                      className="group relative flex items-start gap-4 transition duration-300 hover:-translate-y-1"
                    >
                      {index !== fundingSteps.length - 1 && (
                        // <div className="absolute left-8 top-16 h-[calc(100%+16px)] w-px bg-slate-300" />
                        <div className="absolute left-6 top-12 h-[calc(100%+12px)] w-px bg-slate-300" />
                      )}

                      {/* <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.30)] transition duration-300 group-hover:scale-110 group-hover:bg-blue-700 group-hover:shadow-[0_18px_36px_rgba(37,99,235,0.38)]">
                        {item.step}
                      </div> */}
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-[0_10px_22px_rgba(37,99,235,0.25)] transition duration-300 group-hover:scale-110 group-hover:bg-blue-700 group-hover:shadow-[0_16px_32px_rgba(37,99,235,0.32)]">
                        {item.step}
                      </div>

                      <div className="pt-1">
                        <h3 className="text-base font-bold text-slate-900">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <main className="fade-up overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
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

                      const postedByEmail =
                        typeof item.postedBy === "object"
                          ? item.postedBy?.email
                          : "";

                      const postedByProfilePictureId =
                        typeof item.postedBy === "object"
                          ? item.postedBy?.profilePictureId
                          : null;

                      const profilePictureUrl = getProfilePictureUrl(
                        postedByProfilePictureId
                      );

                      const postedByInitial =
                        postedByName?.charAt(0)?.toUpperCase() || "?";

                      const myApplication = myApplications.find(
                        (application) =>
                          application.fundingOpportunity?._id === item._id ||
                          application.fundingOpportunity === item._id
                      );

                      // const hasActiveApplication =
                      //   myApplication &&
                      //   ["submitted", "under_review"].includes(
                      //     myApplication.status
                      //   );

                      // const canApplyAgain =
                      //   !myApplication ||
                      //   ["approved", "rejected"].includes(myApplication.status);
                      const hasActiveApplication =
                        myApplication &&
                        ["submitted", "under_review"].includes(myApplication.status);

                      const hasApprovedApplication =
                        myApplication && myApplication.status === "approved";

                      const canApplyAgain =
                        !myApplication || myApplication.status === "rejected";

                      return (
                        <article
                          key={item._id}
                          className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-300 hover:bg-[#309df0] hover:text-white hover:shadow-[0_22px_55px_rgba(48,157,240,0.28)] sm:p-6"
                        >
                          <div className="pointer-events-none absolute -right-16 -top-16 z-0 h-[260px] w-[130px] rotate-[42deg] rounded-[36px] bg-blue-100/60 transition-all duration-500 group-hover:bg-white/10" />

                          <div className="pointer-events-none absolute -bottom-[420px] -left-[220px] z-0 h-[720px] w-[720px] rounded-full bg-blue-500/10 transition-all duration-700 group-hover:-bottom-[260px] group-hover:bg-white/10" />

                          <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_235px]">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700 transition duration-500 group-hover:border-white/25 group-hover:bg-white/20 group-hover:text-white">
                                  Research Grant
                                </span>

                                {isOwner && (
                                  <span className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-violet-700 transition duration-500 group-hover:border-white/25 group-hover:bg-white/20 group-hover:text-white">
                                    Posted by You
                                  </span>
                                )}

                                {!isOwner && hasActiveApplication && (
                                  <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700 transition duration-500 group-hover:border-white/25 group-hover:bg-white/20 group-hover:text-white">
                                    Application Active
                                  </span>
                                )}

                                {/* {!isOwner && canApplyAgain && (
                                  <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700 transition duration-500 group-hover:border-white/25 group-hover:bg-white/20 group-hover:text-white">
                                    Open to Apply
                                  </span>
                                )} */}
                                {!isOwner && hasApprovedApplication && (
                                  <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700 transition duration-500 group-hover:border-white/25 group-hover:bg-white/20 group-hover:text-white">
                                    Application Approved
                                  </span>
                                )}

                                {!isOwner && canApplyAgain && (
                                  <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700 transition duration-500 group-hover:border-white/25 group-hover:bg-white/20 group-hover:text-white">
                                    {myApplication?.status === "rejected" ? "Apply Again" : "Open to Apply"}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-slate-950 transition duration-500 group-hover:text-white">
                                {item.grantTitle}
                              </h3>

                              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 transition duration-500 group-hover:text-white/90">
                                {item.eligibilityCriteria}
                              </p>

                              <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition duration-500 group-hover:border-white/20 group-hover:bg-white/15">
                                  <div className="relative h-12 w-12 shrink-0">
                                    {profilePictureUrl ? (
                                      <img
                                        src={profilePictureUrl}
                                        alt={postedByName}
                                        className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-md"
                                        onError={(e) => {
                                          e.currentTarget.style.display =
                                            "none";
                                          const fallback =
                                            e.currentTarget.nextElementSibling;
                                          if (fallback) {
                                            fallback.style.display = "flex";
                                          }
                                        }}
                                      />
                                    ) : null}

                                    <div
                                      className="h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-indigo-700 text-base font-bold text-white ring-2 ring-white shadow-md"
                                      style={{
                                        display: profilePictureUrl
                                          ? "none"
                                          : "flex",
                                      }}
                                    >
                                      {postedByInitial}
                                    </div>
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 transition duration-500 group-hover:text-white/70">
                                      Posted by
                                    </p>
                                    <p className="truncate text-sm font-bold text-slate-900 transition duration-500 group-hover:text-white">
                                      {postedByName}
                                    </p>
                                    {postedByEmail && (
                                      <p className="truncate text-xs text-slate-400 transition duration-500 group-hover:text-white/70">
                                        {postedByEmail}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition duration-500 group-hover:border-white/20 group-hover:bg-white/15">
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-md transition duration-500 group-hover:bg-white/95">
                                    📅
                                  </div>

                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 transition duration-500 group-hover:text-white/70">
                                      Deadline
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 transition duration-500 group-hover:text-white">
                                      {formatDeadline(item.deadline)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col justify-between rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition duration-500 group-hover:border-white/20 group-hover:bg-white group-hover:bg-none group-hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500 transition duration-500 group-hover:text-[#309df0]">
                                  Funding Amount
                                </p>

                                <p className="mt-2 text-3xl font-black tracking-tight text-emerald-700 transition duration-500 group-hover:text-slate-950">
                                  {formatCurrency(item.fundingAmount)}
                                </p>

                                <div className="mt-4 h-px w-full bg-emerald-100 transition duration-500 group-hover:bg-slate-200" />
                              </div>

                              <div className="mt-5 space-y-2">
                                {!isOwner && hasActiveApplication && (
                  
                                  <button
                                    onClick={() => {
                                      setSelectedGrantApplicationId(myApplication._id);
                                      setShowEditGrantApplication(true);
                                    }}
                                    className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_26px_rgba(245,158,11,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-amber-600 group-hover:bg-white group-hover:text-[#309df0]"
                                  >
                                    Edit Application
                                  </button>
                                )}

                                {!isOwner && hasApprovedApplication && (
                                  <button
                                    disabled
                                    className="w-full cursor-not-allowed rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-700 opacity-90"
                                  >
                                    Approved
                                  </button>
                                )}

                                {!isOwner && canApplyAgain && (
                                  <button
                                    onClick={() => navigate(`/funding/${item._id}/apply`)}
                                    className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_26px_rgba(37,99,235,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 group-hover:bg-white group-hover:text-[#309df0]"
                                  >
                                    {myApplication?.status === "rejected" ? "Apply Again" : "Apply Now"}
                                  </button>
                                )}

                                {isOwner && (
                                  <div className="grid grid-cols-2 gap-2">
    
                                    <button
                                      onClick={() => {
                                        setSelectedEditFundingId(item._id);
                                        setShowEditFunding(true);
                                      }}
                                      className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-100 group-hover:border-slate-200 group-hover:bg-white group-hover:text-[#309df0]"
                                    >
                                      Edit
                                    </button>

                                    <button
                                      onClick={() => openDeleteModal(item._id)}
                                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition duration-300 hover:-translate-y-0.5 hover:bg-red-100 group-hover:border-slate-200 group-hover:bg-white group-hover:text-red-500"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
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

      <CreateFunding
        isOpen={showCreateFunding}
        onClose={() => setShowCreateFunding(false)}
        onCreated={() => {
          fetchFundingOpportunities();
          setShowCreateFunding(false);
        }}
      />
      {showEditGrantApplication && selectedGrantApplicationId && (
        <EditGrantApplication
          isOpen={showEditGrantApplication}
          applicationId={selectedGrantApplicationId}
          onClose={() => {
            setShowEditGrantApplication(false);
            setSelectedGrantApplicationId(null);
          }}
          onUpdated={() => {
            fetchMyApplications();
            setShowEditGrantApplication(false);
            setSelectedGrantApplicationId(null);
          }}
        />
      )}
      {showEditFunding && selectedEditFundingId && (
        <EditFunding
          isOpen={showEditFunding}
          fundingId={selectedEditFundingId}
          onClose={() => {
            setShowEditFunding(false);
            setSelectedEditFundingId(null);
          }}
          onUpdated={() => {
            fetchFundingOpportunities();
            setShowEditFunding(false);
            setSelectedEditFundingId(null);
          }}
        />
        
      )}
    </>
  );
};

export default Funding;
