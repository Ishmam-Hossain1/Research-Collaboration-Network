import { Bell, MessageCircle } from "lucide-react";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="logo">RESEARCH CONNECT</div>

      <nav className="nav-links">
        <a href="#">Home</a>
        <a href="#">Collaborate</a>
        <a href="#">Project</a>
        <a href="#">Funding</a>
        <a href="#">Datasets</a>
        <a href="#">Conference</a>
        <a href="#">Equipment</a>
      </nav>

      <div className="nav-icons">
        <Bell size={20} />
        <MessageCircle size={20} />
      </div>
    </header>
  );
};

export default Navbar;