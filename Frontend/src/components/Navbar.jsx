<<<<<<< HEAD
// import { PlusIcon, BellIcon, UserIcon, PlaneIcon } from "lucide-react";
// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";

// const Navbar = () => {
//   const [notificationCount, setNotificationCount] = useState(0);

//   // Get logged-in user
//   const stored = JSON.parse(localStorage.getItem("user"));
//   const passengerId = stored?._id;

//   useEffect(() => {
//     if (!passengerId) return;

//     const fetchNotifications = async () => {
//       try {
//         const res = await fetch(`http://localhost:/api/passenger/${passengerId}/notifications`);
//         if (!res.ok) throw new Error("Failed to fetch notifications");
//         const data = await res.json();
//         setNotificationCount(Array.isArray(data.notifications) ? data.notifications.length : 0);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchNotifications();
//   }, [passengerId]);

//   return (
//     <header className="bg-base-300 border-b border-base-content/10">
//       <div className="mx-auto max-w-6xl p-4">
//         <div className="flex items-center justify-between">
//           {/* ✅ Clickable Logo */}
//           <Link to="/home" className="text-3xl font-bold text-primary font-mono tracking-tight">
//             Chrono Fleet Airlines
//           </Link>

//           <div className="flex items-center gap-4">
//             <Link
//               to="/review"
//               className="btn btn-primary flex items-center gap-2"
//             >
//               <PlusIcon className="size-5" />
//               <span>Reviews</span>
//             </Link>

//             <Link
//               to="/notifications"
//               className="relative btn btn-accent flex items-center gap-2"
//             >
//               <BellIcon className="size-5" />
//               <span>Notifications</span>
//               {notificationCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
//                   {notificationCount}
//                 </span>
//               )}
//             </Link>

//             <Link
//               to="/cargo-plane"
//               className="btn btn-primary flex items-center gap-2"
//             >
//               <PlaneIcon className="size-5" />
//               <span>Cargo Plane</span>
//             </Link>

//             <Link
//               to="/profile"
//               className="btn btn-secondary flex items-center gap-2"
//             >
//               <UserIcon className="size-5" />
//               <span>User Profile</span>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;
=======
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
        {/* <Link to="/home" className={linkClass("/home")}>
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
        </a> */}
        <Link to="/home">Home</Link>
        <Link to="/researchers">Collaborate</Link>
        {/* <a href="#">Project</a> */}
        <Link to="/projects" className={linkClass("/projects")}>
          Project
        </Link>
         {/* <a href="#">Funding</a> */}
        <Link to="/datasets">Datasets</Link>
        {/* <a href="#">Funding</a> */}
        <Link to="/funding">Funding</Link>
         {/* <a href="#">Datasets</a> */}
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
>>>>>>> e724797 (feedback on project)
