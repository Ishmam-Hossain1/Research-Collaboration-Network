import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "../services/notificationService";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    const [countRes, notificationRes] = await Promise.all([
      getUnreadNotificationCount(),
      getMyNotifications(),
    ]);

    setCount(countRes.data.count);
    setNotifications(notificationRes.data);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    await markNotificationAsRead(notification._id);
    setOpen(false);
    await loadNotifications();

    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-full p-2 hover:bg-slate-100"
      >
        <Bell size={22} />

        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-2xl border bg-white shadow-xl">
          <div className="border-b p-4">
            <h3 className="font-bold text-slate-900">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full border-b p-4 text-left hover:bg-slate-50 ${
                    !n.isRead ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;