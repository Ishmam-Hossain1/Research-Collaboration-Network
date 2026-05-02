import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { XCircle, ArrowLeft, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center px-4 pt-32 pb-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <XCircle className="h-10 w-10" />
          </div>
          
          <div className="mt-6 space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Payment Cancelled</h2>
            <p className="text-sm text-slate-500">
              The payment process was interrupted or cancelled. Don't worry, no funds were deducted.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-amber-50 p-4 border border-amber-100 flex gap-3 text-left">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed">
              Your booking request is still active and approved. You can try paying again from your booking dashboard at any time.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate("/equipment/bookings")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white transition hover:bg-slate-900 shadow-md"
            >
              <ArrowLeft size={16} /> Return to My Bookings
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

export default PaymentCancel;
