
import { Bell, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useChatSidebar } from "../context/ChatSidebarContext";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("researchConnectUser"));
  const location = useLocation();

  const { toggleChatSidebar } = useChatSidebar();

  const profilePictureUrl = user?.profilePictureId
    ? `http://localhost:5000/api/auth/profile-picture/${user.profilePictureId}`
    : null;

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
        <a href="#">Equipment</a>
        
        <Link to="/resources">Resources</Link>
      </nav>

      <div className="nav-icons">
        <Bell size={20} />

        {/* ✅ Chat toggle */}
        <MessageCircle
          size={20}
          className="cursor-pointer hover:text-blue-600 transition"
          onClick={toggleChatSidebar}
        />

        <Link to="/profile">
          <div className="profile-avatar">
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt="profile" />
            ) : (
              <div className="avatar-placeholder">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;