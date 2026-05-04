import { Box, MessageCircle, User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useChatSidebar } from "../context/ChatSidebarContext";
import { useState, useRef, useEffect } from "react";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("researchConnectUser"));
  const location = useLocation();
  const navigate = useNavigate();

  const { toggleChatSidebar, unreadMessageCount } = useChatSidebar();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const profilePictureUrl = user?.profilePictureId
    ? `${import.meta.env.VITE_BACKEND_BASEURL}/api/auth/profile-picture/${user.profilePictureId}`
    : null;

  const handleLogout = () => {
    localStorage.removeItem("researchConnectToken");
    localStorage.removeItem("researchConnectUser");
    setShowDropdown(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = (path) =>
    `transition whitespace-nowrap ${
      location.pathname === path
        ? "text-blue-600 font-semibold"
        : "text-slate-600 hover:text-blue-600"
    }`;

  return (
    <header className="navbar">
      <style>
        {`
          .notification-bell-plain button,
          .notification-bell-plain a {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
          }

          .notification-bell-plain button:hover,
          .notification-bell-plain a:hover {
            background: transparent !important;
            box-shadow: none !important;
          }

          .notification-bell-plain button:focus,
          .notification-bell-plain a:focus {
            background: transparent !important;
            box-shadow: none !important;
          }

          .navbar-brand-logo {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: #020617;
          }

          .navbar-brand-icon {
            width: 28px;
            height: 28px;
            background: transparent;
            color: #020617;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: none;
            box-shadow: none;
          }

          .navbar-brand-icon svg {
            width: 24px;
            height: 24px;
            stroke: #020617;
            stroke-width: 2.5;
          }

          .navbar-brand-text {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: #020617;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .navbar-brand-logo:hover .navbar-brand-icon {
            color: #111827;
          }

          .navbar-brand-logo:hover .navbar-brand-icon svg {
            stroke: #111827;
          }

          .navbar-brand-logo:hover .navbar-brand-text {
            color: #111827;
          }
        `}
      </style>

      <Link to="/home" className="navbar-brand-logo">
        <span className="navbar-brand-icon">
          <Box size={24} />
        </span>
        <span className="navbar-brand-text">Research Connect</span>
      </Link>

      <nav className="nav-links">
        <Link to="/home" className={linkClass("/home")}>
          Home
        </Link>

        <Link to="/researchers" className={linkClass("/researchers")}>
          Collaborate
        </Link>

        <Link to="/projects" className={linkClass("/projects")}>
          Project
        </Link>

        <Link to="/datasets" className={linkClass("/datasets")}>
          Datasets
        </Link>

        <Link to="/funding" className={linkClass("/funding")}>
          Funding
        </Link>

        <Link to="/conferences" className={linkClass("/conferences")}>
          Conferences
        </Link>

        <Link to="/equipment" className={linkClass("/equipment")}>
          Equipment
        </Link>

        <Link to="/resources" className={linkClass("/resources")}>
          Resources
        </Link>
      </nav>

      <div className="nav-icons">
        {user && (
          <div className="notification-bell-plain">
            <NotificationBell />
          </div>
        )}

        {user && (
          <button
            type="button"
            onClick={toggleChatSidebar}
            className="relative cursor-pointer transition hover:text-blue-600"
            aria-label="Open messages"
          >
            <MessageCircle size={20} />

            {unreadMessageCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
              </span>
            )}
          </button>
        )}

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center gap-1 focus:outline-none"
              aria-label="Open profile menu"
            >
              <div className="profile-avatar">
                {profilePictureUrl ? (
                  <img src={profilePictureUrl} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5">
                <div className="mb-1 border-b border-slate-50 px-3 py-2">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {user?.username || "User"}
                  </p>

                  <p className="truncate text-[11px] text-slate-500">
                    {user?.email || "No email available"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/profile");
                    setShowDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                >
                  <User size={16} />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-500"
          >
            <User size={18} />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;