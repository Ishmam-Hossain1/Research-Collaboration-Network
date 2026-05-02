import { CalendarCheck, CalendarPlus } from "lucide-react";

const CalendarStatusBadge = ({ connected, onConnect }) => {
  if (connected) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
        <CalendarCheck size={16} />
        Google Calendar connected
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onConnect}
      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
    >
      <CalendarPlus size={16} />
      Connect Google Calendar
    </button>
  );
};

export default CalendarStatusBadge;