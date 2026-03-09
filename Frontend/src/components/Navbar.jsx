import { Bell, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("researchConnectUser"));

  const profilePictureUrl = user?.profilePictureId
    ? `http://localhost:5000/api/auth/profile-picture/${user.profilePictureId}`
    : null;

  return (
    <header className="navbar">
      <div className="logo">RESEARCH CONNECT</div>

      <nav className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/researchers">Collaborate</Link>
        <a href="#">Project</a>
        <a href="#">Funding</a>
        <a href="#">Datasets</a>
        <a href="#">Conference</a>
        <a href="#">Equipment</a>
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