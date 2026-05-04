import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar";

const PaymentFail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center px-4 pt-32 pb-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-10 w-10" />
          </div>
          
          <div className="mt-6 space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Payment Failed</h2>
            <p className="text-sm text-slate-500">
              We encountered an error while processing your payment. This could be due to insufficient funds, an invalid card, or a temporary gateway issue.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-rose-50 p-4 border border-rose-100 flex gap-3 text-left">
            <RefreshCw className="text-rose-600 shrink-0" size={20} />
            <p className="text-xs text-rose-800 leading-relaxed">
              Please check your payment details or try a different method. If the problem persists, contact your bank or support.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate("/equipment/bookings")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white transition hover:bg-slate-900 shadow-md"
            >
              <ArrowLeft size={16} /> Try Again from Dashboard
            </button>
            <Link
              to="/"
              className="block w-full text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
