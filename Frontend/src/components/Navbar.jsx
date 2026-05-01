
// import { Bell, MessageCircle } from "lucide-react";
// import { Link, useLocation } from "react-router-dom";
// import { useChatSidebar } from "../context/ChatSidebarContext";

// const Navbar = () => {
//   const user = JSON.parse(localStorage.getItem("researchConnectUser"));
//   const location = useLocation();

//   const { toggleChatSidebar } = useChatSidebar();

//   const profilePictureUrl = user?.profilePictureId
//     ? `http://localhost:5000/api/auth/profile-picture/${user.profilePictureId}`
//     : null;

//   const linkClass = (path) =>
//     `transition ${
//       location.pathname === path
//         ? "text-blue-600 font-semibold"
//         : "text-slate-600 hover:text-blue-600"
//     }`;

//   return (
//     <header className="navbar">
//       <div className="logo">RESEARCH CONNECT</div>

//       <nav className="nav-links">
//         <Link to="/home">Home</Link>
//         <Link to="/researchers">Collaborate</Link>

//         <Link to="/projects" className={linkClass("/projects")}>
//           Project
//         </Link>

//         <Link to="/datasets">Datasets</Link>
//         <Link to="/funding">Funding</Link>

//         <a href="#">Conference</a>
//         <a href="#">Equipment</a>
        
//         <Link to="/resources">Resources</Link>
//       </nav>

//       <div className="nav-icons">
//         <Bell size={20} />

//         {/* ✅ Chat toggle */}
//         <MessageCircle
//           size={20}
//           className="cursor-pointer hover:text-blue-600 transition"
//           onClick={toggleChatSidebar}
//         />

//         <Link to="/profile">
//           <div className="profile-avatar">
//             {profilePictureUrl ? (
//               <img src={profilePictureUrl} alt="profile" />
//             ) : (
//               <div className="avatar-placeholder">
//                 {user?.username?.charAt(0).toUpperCase() || "U"}
//               </div>
//             )}
//           </div>
//         </Link>
//       </div>
//     </header>
//   );
// };

// export default Navbar;


import { Bell, MessageCircle, User, LogOut, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useChatSidebar } from "../context/ChatSidebarContext";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("researchConnectUser"));
  const location = useLocation();
  const navigate = useNavigate();

  const { toggleChatSidebar, unreadMessageCount } = useChatSidebar();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const profilePictureUrl = user?.profilePictureId
    ? `http://localhost:5000/api/auth/profile-picture/${user.profilePictureId}`
    : null;

  const handleLogout = () => {
    localStorage.removeItem("researchConnectToken");
    localStorage.removeItem("researchConnectUser");
    navigate("/login");
  };

  // Close dropdown when clicking outside
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
    `transition ${
      location.pathname === path
        ? "text-blue-600 font-semibold"
        : "text-slate-600 hover:text-blue-600"
    }`;

  return (
    <header className="navbar">
      <div className="logo">RESEARCH CONNECT</div>

      <nav className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/researchers">Collaborate</Link>

        <Link to="/projects" className={linkClass("/projects")}>
          Project
        </Link>

        <Link to="/datasets">Datasets</Link>
        <Link to="/funding">Funding</Link>

        <a href="#">Conference</a>
        <Link to="/equipment" className={linkClass("/equipment")}>Equipment</Link>

        <Link to="/resources">Resources</Link>
      </nav>

      <div className="nav-icons">
        <Bell size={20} />

        <button
          type="button"
          onClick={toggleChatSidebar}
          className="relative cursor-pointer transition hover:text-blue-600"
        >
          <MessageCircle size={20} />

          {unreadMessageCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
              {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 focus:outline-none"
          >
            <div className="profile-avatar">
              {profilePictureUrl ? (
                <img src={profilePictureUrl} alt="profile" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-200 z-50">
              <div className="px-3 py-2 mb-1 border-b border-slate-50">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.username}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => { navigate("/profile"); setShowDropdown(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              >
                <User size={16} />
                My Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;