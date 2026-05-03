import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import LightRays from "../components/LightRays";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/auth/login`,
        formData
      );

      localStorage.setItem("researchConnectUser", JSON.stringify(res.data.user));
      localStorage.setItem("researchConnectToken", res.data.token);

      console.log("LOGIN SUCCESS:", res.data);

      navigate("/home");
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout
      subtitle="Start your journey"
      title="Sign In to Research Connect"
      footer={
        <>
          New here?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-700 hover:text-blue-800"
          >
            Create an account
          </Link>
        </>
      }
      rightSlot={
        <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-sky-200 via-indigo-200 to-pink-200">
          {/* background glows */}
          <div className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

          {/* rays from bottom-center */}
          <div className="absolute inset-x-0 bottom-20 top-0 z-10">
            <LightRays
              raysOrigin="bottom-center"
              raysColor="#ffffff"
              raysSpeed={1.2}
              lightSpread={0.95}
              rayLength={2.6}
              pulsating={true}
              fadeDistance={1}
              saturation={1}
              followMouse={true}
              mouseInfluence={0.06}
              noiseAmount={0.015}
              distortion={0.02}
            />
          </div>

          {/* soft veil */}
          <div className="absolute inset-0 z-[11] bg-white/8 backdrop-blur-[1px]" />

          {/* floating glass card */}
          <div className="absolute inset-0 z-20 flex items-center justify-center px-10 pb-20 pt-10">
            <div className="w-full max-w-md animate-[floatCard_5s_ease-in-out_infinite] rounded-3xl border border-white/35 bg-white/22 p-8 text-slate-800 shadow-2xl backdrop-blur-md">
              <div className="mb-4 inline-flex rounded-full bg-white/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Research Connect
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Collaborate beyond boundaries
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-700">
                Discover researchers, showcase projects, and connect ideas
                through a platform designed for modern academic collaboration.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/35 bg-white/35 p-4">
                  <div className="text-2xl font-bold text-slate-900">2.4K+</div>
                  <div className="mt-1 text-sm text-slate-700">Researchers</div>
                </div>
                <div className="rounded-2xl border border-white/35 bg-white/35 p-4">
                  <div className="text-2xl font-bold text-slate-900">850+</div>
                  <div className="mt-1 text-sm text-slate-700">Projects</div>
                </div>
              </div>
            </div>
          </div>

          {/* book glow base */}
          <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 h-24 w-72 -translate-x-1/2 rounded-full bg-white/35 blur-2xl" />

          {/* tailwind book */}
          <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2">
            <div className="relative h-40 w-[340px]">
              {/* shadow */}
              <div className="absolute bottom-0 left-1/2 h-7 w-[270px] -translate-x-1/2 rounded-full bg-slate-900/20 blur-xl" />

              {/* magical glow from spine */}
              <div className="absolute bottom-14 left-1/2 h-16 w-20 -translate-x-1/2 rounded-full bg-white/80 blur-2xl" />
              <div className="absolute bottom-16 left-1/2 h-24 w-36 -translate-x-1/2 rounded-full bg-cyan-200/60 blur-3xl" />

              {/* left page */}
              <div className="absolute bottom-6 left-[26px] h-24 w-[138px] origin-bottom-right skew-y-[-10deg] rounded-bl-[22px] rounded-tl-[14px] rounded-tr-[8px] border border-slate-300/70 bg-gradient-to-b from-white via-slate-50 to-slate-200 shadow-[0_10px_25px_rgba(15,23,42,0.18)]" />

              {/* right page */}
              <div className="absolute bottom-6 right-[26px] h-24 w-[138px] origin-bottom-left skew-y-[10deg] rounded-br-[22px] rounded-tr-[14px] rounded-tl-[8px] border border-slate-300/70 bg-gradient-to-b from-white via-slate-50 to-slate-200 shadow-[0_10px_25px_rgba(15,23,42,0.18)]" />

              {/* left page lines */}
              <div className="pointer-events-none absolute bottom-[52px] left-[48px] h-[2px] w-[86px] rounded-full bg-slate-300/70" />
              <div className="pointer-events-none absolute bottom-[66px] left-[44px] h-[2px] w-[94px] rounded-full bg-slate-300/60" />
              <div className="pointer-events-none absolute bottom-[80px] left-[40px] h-[2px] w-[98px] rounded-full bg-slate-300/50" />

              {/* right page lines */}
              <div className="pointer-events-none absolute bottom-[52px] right-[48px] h-[2px] w-[86px] rounded-full bg-slate-300/70" />
              <div className="pointer-events-none absolute bottom-[66px] right-[44px] h-[2px] w-[94px] rounded-full bg-slate-300/60" />
              <div className="pointer-events-none absolute bottom-[80px] right-[40px] h-[2px] w-[98px] rounded-full bg-slate-300/50" />

              {/* center spine */}
              <div className="absolute bottom-5 left-1/2 h-[92px] w-7 -translate-x-1/2 rounded-b-xl rounded-t-md bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-lg" />

              {/* cover edges */}
              <div className="absolute bottom-4 left-[18px] h-5 w-[144px] skew-x-[-16deg] rounded-l-xl bg-slate-700/85" />
              <div className="absolute bottom-4 right-[18px] h-5 w-[144px] skew-x-[16deg] rounded-r-xl bg-slate-700/85" />

              {/* central book shine */}
              <div className="pointer-events-none absolute bottom-[88px] left-1/2 h-10 w-10 -translate-x-1/2 rounded-full bg-white/90 blur-md" />

              {/* small particles above book */}
              <div className="absolute bottom-[118px] left-[110px] h-2.5 w-2.5 animate-pulse rounded-full bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
              <div className="absolute bottom-[128px] left-1/2 h-2 w-2 -translate-x-1/2 animate-pulse rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
              <div className="absolute bottom-[116px] right-[112px] h-2.5 w-2.5 animate-pulse rounded-full bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
            </div>
          </div>

          {/* local animation */}
          <style>{`
            @keyframes floatCard {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-10px);
              }
            }
          `}</style>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            type="text"
            name="identifier"
            placeholder="Email or username"
            value={formData.identifier}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;