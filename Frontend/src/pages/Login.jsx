import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

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
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem(
        "researchConnectUser",
        JSON.stringify(res.data.user)
      );

      console.log("LOGIN SUCCESS:", res.data);
      alert(res.data.message);

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