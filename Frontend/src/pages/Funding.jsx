// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar";

// const Funding = () => {
//   const navigate = useNavigate();
//   const [fundingList, setFundingList] = useState([]);
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

//   const currentUser = JSON.parse(localStorage.getItem("researchConnectUser"));
// //   const currentUserId = currentUser?._id || currentUser?.id;

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

//   useEffect(() => {
//     fetchFundingOpportunities();
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

//   return (
//     <>
//       <Navbar />

//       <div
//         className={`p-10 ${
//           showDeleteModal || showDeleteSuccessPopup ? "blur-sm" : ""
//         }`}
//       >
//         <div className="flex justify-between items-center mb-10">
//           <div>
//             <h1 className="text-3xl font-bold">Research Funding Opportunities</h1>
//             <p className="text-gray-500">
//               Manage and monitor research funding opportunities efficiently
//             </p>
//           </div>

//           <button
//             onClick={() => navigate("/funding/new")}
//             className="bg-blue-500 text-white px-5 py-2 rounded shadow"
//           >
//             + New Funding
//           </button>
//         </div>

//         {loading ? (
//           <div className="text-center text-gray-500 mt-20">Loading...</div>
//         ) : fundingList.length === 0 ? (
//           <div className="text-center text-gray-500 mt-20">
//             No funding opportunities yet.
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {fundingList.map((item) => (
//               <div
//                 key={item._id}
//                 className="bg-white rounded-xl shadow p-6 border border-gray-200"
//               >
//                 <div className="flex justify-between items-start gap-4">
//                   <div>
//                     <h2 className="text-2xl font-semibold text-gray-800">
//                       {item.grantTitle}
//                     </h2>
//                     <p className="text-gray-600 mt-2">
//                       {item.eligibilityCriteria}
//                     </p>
//                   </div>

//                   <div className="text-right">
//                     <p className="text-sm text-gray-500">Funding Amount</p>
//                     <p className="text-lg font-bold text-green-600">
//                       ${item.fundingAmount}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <p className="text-sm text-gray-500">Deadline</p>
//                   <p className="font-medium text-gray-800">
//                     {new Date(item.deadline).toLocaleDateString()}
//                   </p>
//                 </div>

//                 <div className="mt-5 flex gap-3">
//                   <button
//                     onClick={() => navigate(`/funding/edit/${item._id}`)}
//                     className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
//                   >
//                     Edit
//                   </button>

//                   <button
//                     onClick={() => openDeleteModal(item._id)}
//                     className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {showDeleteModal && (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//           <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl p-8 text-center">
//             <h2 className="text-2xl font-bold text-red-600 mb-3">
//               Delete Funding Opportunity?
//             </h2>
//             <p className="text-gray-600 mb-6">
//               This action cannot be undone. Are you sure you want to delete this
//               funding opportunity?
//             </p>

//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={closeDeleteModal}
//                 disabled={deleteLoading}
//                 className="bg-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={confirmDelete}
//                 disabled={deleteLoading}
//                 className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 disabled:opacity-50"
//               >
//                 {deleteLoading ? "Deleting..." : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showDeleteSuccessPopup && (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded shadow-lg text-center">
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

const Funding = () => {
  const navigate = useNavigate();
  const [fundingList, setFundingList] = useState([]);
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

  useEffect(() => {
    fetchFundingOpportunities();
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

  return (
    <>
      <Navbar />

      <div
        className={`p-10 ${
          showDeleteModal || showDeleteSuccessPopup ? "blur-sm" : ""
        }`}
      >
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Research Funding Opportunities</h1>
            <p className="text-gray-500">
              Manage and monitor research funding opportunities efficiently
            </p>
          </div>

          <button
            onClick={() => navigate("/funding/new")}
            className="bg-blue-500 text-white px-5 py-2 rounded shadow"
          >
            + New Funding
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 mt-20">Loading...</div>
        ) : fundingList.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            No funding opportunities yet.
          </div>
        ) : (
          <div className="space-y-6">
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
                  ? item.postedBy?.username || item.postedBy?.email || "Unknown"
                  : "Unknown";

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {item.grantTitle}
                      </h2>
                      <p className="text-gray-600 mt-2">
                        {item.eligibilityCriteria}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Funding Amount</p>
                      <p className="text-lg font-bold text-green-600">
                        ${item.fundingAmount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-medium text-gray-800">
                      {new Date(item.deadline).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Posted by</p>
                    <p className="font-medium text-gray-800">{postedByName}</p>
                  </div>

                  {isOwner && (
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => navigate(`/funding/edit/${item._id}`)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => openDeleteModal(item._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              Delete Funding Opportunity?
            </h2>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. Are you sure you want to delete this
              funding opportunity?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="bg-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow-lg text-center">
            <h2 className="text-xl font-bold text-red-600">
              Funding Deleted Successfully
            </h2>
          </div>
        </div>
      )}
    </>
  );
};

export default Funding;