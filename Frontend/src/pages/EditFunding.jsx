import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const EditFunding = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    grantTitle: "",
    fundingAmount: "",
    deadline: "",
    eligibilityCriteria: "",
  });

  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchFundingById = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/funding/${id}`);
        const data = await response.json();

        if (response.ok) {
          setFormData({
            grantTitle: data.grantTitle || "",
            fundingAmount: data.fundingAmount || "",
            deadline: data.deadline ? data.deadline.split("T")[0] : "",
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

      setShowPopup(true);

      setTimeout(() => {
        navigate("/funding");
      }, 3000);
    } catch (error) {
      console.error("Update funding error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-10 text-center text-gray-500">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className={`${showPopup ? "blur-sm" : ""} p-10`}>
        <h1 className="text-3xl font-bold mb-8">Edit Funding Opportunity</h1>

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
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Update
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
            <h2 className="text-xl font-bold text-blue-600">
              Funding Updated Successfully
            </h2>
            <p>Redirecting to funding list...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default EditFunding;