import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const CreateFunding = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    grantTitle: "",
    fundingAmount: "",
    deadline: "",
    eligibilityCriteria: "",
  });

  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       await fetch("http://localhost:5000/api/funding", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       setShowPopup(true);

//       setTimeout(() => {
//         navigate("/funding");
//       }, 3000);

//     } catch (error) {
//       console.error(error);
//     }
//   };

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/funding", {
        method: "POST",
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

      <div className={`p-10 ${showPopup ? "blur-sm" : ""}`}>
        <h1 className="text-3xl font-bold mb-8">Innovation Grants</h1>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">

          <div>
            <label>Grant Title</label>
            <input
              type="text"
              name="grantTitle"
              value={formData.grantTitle}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label>Amount</label>
            <input
              type="number"
              name="fundingAmount"
              value={formData.fundingAmount}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label>Eligibility</label>
            <input
              type="text"
              name="eligibilityCriteria"
              value={formData.eligibilityCriteria}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="flex gap-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded">
              Save
            </button>

            <button
              type="button"
              onClick={() => navigate("/funding")}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-8 rounded shadow-lg text-center">
            <h2 className="text-xl font-bold text-green-600">
              Funding Posted Successfully
            </h2>
            <p>Redirecting to funding list...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateFunding;