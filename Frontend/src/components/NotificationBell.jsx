import { useEffect, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);

  const storedUser = JSON.parse(localStorage.getItem("researchConnectUser"));
  const token =
    localStorage.getItem("researchConnectToken") || storedUser?.token;

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchNotifications = async () => {
    if (!storedUser || !token) return;

    try {
      const res = await axios.get(
        "http://localhost:5000/api/notifications",
        authConfig
      );

      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(
        "Failed to fetch notifications:",
        err.response?.data || err.message
      );
    }
  };

  const fetchUnreadCount = async () => {
    if (!storedUser || !token) return;

    try {
      const res = await axios.get(
        "http://localhost:5000/api/notifications/unread-count",
        authConfig
      );

      setCount(res.data.count || 0);
    } catch (err) {
      console.error(
        "Failed to fetch unread count:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 15000);

    return () => clearInterval(interval);
  }, [token]);

  const handleNotificationClick = async (notification) => {
    if (!token) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${notification._id}/read`,
        {},
        authConfig
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id ? { ...item, isRead: true } : item
        )
      );

      if (!notification.isRead) {
        setCount((prev) => Math.max(prev - 1, 0));
      }

      setOpen(false);

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.error(
        "Failed to open notification:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          fetchNotifications();
          fetchUnreadCount();
        }}
        className="relative rounded-full bg-white/90 p-2 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
      >
        <Bell size={20} />

        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[9999] mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-black text-slate-900">
              Notifications
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    !notification.isRead ? "bg-sky-50/70" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notification.isRead && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-sky-500" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-sky-600">
                        Click to view
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}