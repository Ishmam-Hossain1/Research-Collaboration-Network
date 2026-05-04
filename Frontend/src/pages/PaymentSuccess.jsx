import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle, ArrowRight, Loader2, Calendar, Cpu } from "lucide-react";
import Navbar from "../components/Navbar";

const API = `${import.meta.env.VITE_BACKEND_BASEURL}`;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const bookingId = searchParams.get("bookingId");
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem("researchConnectToken");
        const res = await axios.get(`${API}/api/equipment/bookings/verify`, {
          params: { bookingId, transaction_id: transactionId },
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooking(res.data.booking);
      } catch (err) {
        console.error("Verification failed:", err);
        setError(err.response?.data?.message || "Payment verification failed.");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId && transactionId) {
      verifyPayment();
    } else {
      setLoading(false);
      setError("Missing payment details.");
    }
  }, [bookingId, transactionId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center px-4 pt-32 pb-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 text-center">
          {loading ? (
            <div className="space-y-4">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">Verifying Payment...</h2>
              <p className="text-sm text-slate-500">Please wait while we confirm your transaction with the gateway.</p>
            </div>
          ) : error ? (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
                <CheckCircle className="h-10 w-10 rotate-180" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Verification Failed</h2>
              <p className="text-slate-500">{error}</p>
              <button
                onClick={() => navigate("/equipment/bookings")}
                className="w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white transition hover:bg-slate-900"
              >
                Go to My Bookings
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Payment Successful!</h2>
                <p className="text-sm text-slate-500 mt-1">Your booking has been confirmed and paid.</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-left border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Cpu className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{booking?.equipment?.name || "Equipment"}</h4>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">Booking Confirmed</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Calendar size={14} className="text-blue-500" />
                  {new Date(booking?.startDate).toLocaleDateString()} - {new Date(booking?.endDate).toLocaleDateString()}
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Transaction ID: <span className="font-mono text-slate-600">{transactionId}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  to="/equipment/bookings"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 shadow-md shadow-blue-200"
                >
                  View My Bookings <ArrowRight size={16} />
                </Link>
                <button
                  onClick={() => navigate("/")}
                  className="w-full text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
