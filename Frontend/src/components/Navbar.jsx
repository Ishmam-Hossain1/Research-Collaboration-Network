import { PlusIcon, BellIcon, UserIcon, PlaneIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [notificationCount, setNotificationCount] = useState(0);

  // Get logged-in user
  const stored = JSON.parse(localStorage.getItem("user"));
  const passengerId = stored?._id;

  useEffect(() => {
    if (!passengerId) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/passenger/${passengerId}/notifications`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotificationCount(Array.isArray(data.notifications) ? data.notifications.length : 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, [passengerId]);

  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          {/* ✅ Clickable Logo */}
          <Link to="/home" className="text-3xl font-bold text-primary font-mono tracking-tight">
            Chrono Fleet Airlines
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/review"
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="size-5" />
              <span>Reviews</span>
            </Link>

            <Link
              to="/notifications"
              className="relative btn btn-accent flex items-center gap-2"
            >
              <BellIcon className="size-5" />
              <span>Notifications</span>
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Link>

            <Link
              to="/cargo-plane"
              className="btn btn-primary flex items-center gap-2"
            >
              <PlaneIcon className="size-5" />
              <span>Cargo Plane</span>
            </Link>

            <Link
              to="/profile"
              className="btn btn-secondary flex items-center gap-2"
            >
              <UserIcon className="size-5" />
              <span>User Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
