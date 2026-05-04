import { CalendarDays, FileText, CheckCircle2, Camera } from "lucide-react";

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

const ConferenceTimeline = ({ conference }) => {
  const steps = [
    {
      label: "Submit",
      date: conference.submissionDeadline,
      icon: FileText,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Accept",
      date: conference.acceptanceDate,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Camera",
      date: conference.cameraReadyDeadline,
      icon: Camera,
      color: "text-violet-600 bg-violet-50 border-violet-100",
    },
    {
      label: "Start",
      date: conference.startDate,
      icon: CalendarDays,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/70 bg-white/55 p-3 shadow-inner backdrop-blur">
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(79,70,229,0.35) 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative">
        <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
          Timeline
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.label}
                className="rounded-xl border border-white bg-white/80 p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`mb-1 inline-flex h-7 w-7 items-center justify-center rounded-full border ${step.color}`}
                >
                  <Icon size={13} />
                </div>
                <p className="text-[11px] font-black text-slate-800">
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatDate(step.date)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConferenceTimeline;
