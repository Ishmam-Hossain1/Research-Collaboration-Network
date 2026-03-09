import { Bell, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("researchConnectUser"));
  const location = useLocation();

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
<<<<<<< HEAD
        <Link to="/home" className={linkClass("/home")}>
          Home
        </Link>
        <a href="#" className="text-slate-600 hover:text-blue-600">
          Collaborate
        </a>
        <Link to="/projects" className={linkClass("/projects")}>
          Project
        </Link>
        <a href="#" className="text-slate-600 hover:text-blue-600">
          Funding
        </a>
        <a href="#" className="text-slate-600 hover:text-blue-600">
          Datasets
        </a>
        <a href="#" className="text-slate-600 hover:text-blue-600">
          Conference
        </a>
        <a href="#" className="text-slate-600 hover:text-blue-600">
          Equipment
        </a>
=======
        <Link to="/home">Home</Link>
        <Link to="/researchers">Collaborate</Link>
        <a href="#">Project</a>
//         <a href="#">Funding</a>
        <Link to="/datasets">Datasets</Link>
        {/* <a href="#">Funding</a> */}
        <Link to="/funding">Funding</Link>
//         <a href="#">Datasets</a>
        <a href="#">Conference</a>
        <a href="#">Equipment</a>
>>>>>>> eb2bcfcb4cf147836adcf87231a2521b7e9e38af
      </nav>

      <div className="nav-icons">
        <Bell size={20} />
        <MessageCircle size={20} />

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