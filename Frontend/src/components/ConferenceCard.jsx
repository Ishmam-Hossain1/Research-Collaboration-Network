import {
  CalendarPlus,
  MapPin,
  Globe2,
  Star,
  Bell,
  CalendarDays,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import ConferenceTimeline from "./ConferenceTimeline";

const daysUntil = (date) => {
  if (!date) return null;
  const today = new Date();
  const target = new Date(date);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getConferenceType = (conference) => {
  if (conference.mode) return conference.mode;
  const location = conference.location?.toLowerCase() || "";

  if (location.includes("online")) return "Online";
  if (location.includes("hybrid")) return "Hybrid";
  return "On-site";
};

const ConferenceCard = ({
  conference,
  googleConnected,
  onConnectGoogle,
  onAddEvent,
  onAddDeadline,
  isRecommended,
  isAddedToCalendar,
}) => {
  const deadlineDays = daysUntil(conference.submissionDeadline);
  const type = getConferenceType(conference);

  const deadlineSoon =
    deadlineDays !== null && deadlineDays >= 0 && deadlineDays <= 14;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -10, scale: 1.015 }}
      className="group relative overflow-hidden rounded-[34px] border border-blue-100/80 bg-white shadow-[0_18px_45px_rgba(37,99,235,0.12)] transition-all duration-500 hover:shadow-[0_35px_85px_rgba(79,70,229,0.25)]"
    >
      <div className="absolute inset-x-0 top-0 h-2 overflow-hidden bg-gradient-to-r from-blue-600 via-violet-500 to-cyan-400">
        <div className="h-full w-1/3 animate-[conference-shimmer_2.4s_linear_infinite] bg-white/40 blur-md" />
      </div>

      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/60 blur-3xl transition duration-700 group-hover:scale-125" />
      <div className="absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-violet-200/60 blur-3xl transition duration-700 group-hover:scale-125" />
      <div className="absolute left-1/2 top-1/3 h-44 w-44 -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl" />

      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.38) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(99,102,241,0.35) 0 10%, transparent 10% 50%, rgba(14,165,233,0.35) 50% 60%, transparent 60% 100%)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/85 to-blue-50/80" />

      <div className="pointer-events-none absolute right-6 top-8 opacity-0 transition duration-500 group-hover:opacity-100">
        <Sparkles className="text-violet-400" size={26} />
      </div>

      <div className="relative p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-black text-blue-700 shadow-sm">
            {conference.field}
          </span>

          <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-black text-violet-700 shadow-sm">
            {type}
          </span>

          {deadlineSoon && (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-black text-rose-700 shadow-sm">
              Deadline soon
            </span>
          )}

          {isRecommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black text-amber-700 shadow-sm">
              <Star size={11} />
              Top match
            </span>
          )}

          {isAddedToCalendar && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-700 shadow-sm">
              Added
            </span>
          )}
        </div>

        <div className="mb-3">
          <h3 className="line-clamp-2 text-lg font-black leading-snug text-slate-950 transition group-hover:text-blue-700">
            {conference.title}
          </h3>

          {conference.acronym && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-blue-600">
              <Zap size={13} />
              {conference.acronym}
            </p>
          )}
        </div>

        <p className="line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-600">
          {conference.description || "No description available."}
        </p>

        <div className="mt-4 grid gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-blue-500" />
            <span className="line-clamp-1">
              {conference.location || "Location not announced"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-violet-500" />
            {conference.startDate
              ? new Date(conference.startDate).toLocaleDateString()
              : "Start date not announced"}
          </div>

          {conference.website && (
            <div className="flex items-center gap-2">
              <Globe2 size={15} className="text-cyan-500" />
              <a
                href={conference.website}
                target="_blank"
                rel="noreferrer"
                className="line-clamp-1 font-semibold text-blue-600 hover:underline"
              >
                Visit website
              </a>
            </div>
          )}
        </div>

        <ConferenceTimeline conference={conference} />

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() =>
              googleConnected ? onAddEvent(conference._id) : onConnectGoogle()
            }
            className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-black text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg"
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
            <CalendarPlus size={15} />
            Add event date
          </button>

          <button
            type="button"
            onClick={() =>
              googleConnected ? onAddDeadline(conference._id) : onConnectGoogle()
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white/70 px-4 py-3 text-sm font-black text-blue-700 shadow-sm backdrop-blur transition hover:scale-[1.02] hover:bg-blue-50"
          >
            <Bell size={15} />
            Add deadline reminder
          </button>
        </div>
      </div>

      <style>{`
        @keyframes conference-shimmer {
          0% {
            transform: translateX(-140%);
          }
          100% {
            transform: translateX(380%);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ConferenceCard;
