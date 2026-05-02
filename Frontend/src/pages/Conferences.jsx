import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  Sparkles,
  Globe2,
  BellRing,
  FileText,
  CheckCircle2,
  Camera,
  Radio,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import ConferenceCard from "../components/ConferenceCard";
import CalendarStatusBadge from "../components/CalendarStatusBadge";
import {
  getConferences,
  getGoogleCalendarStatus,
  connectGoogleCalendar,
  addConferenceEventToCalendar,
  addSubmissionDeadlineToCalendar,
  getSavedConferences,
} from "../services/conferenceService";

const getUserResearchKeywords = () => {
  try {
    const user = JSON.parse(localStorage.getItem("researchConnectUser"));
    return {
      field: user?.researchField || "",
      keywords: user?.keywords || [],
    };
  } catch {
    return {
      field: "",
      keywords: [],
    };
  }
};

const HeroConferenceVisual = () => {
  const steps = [
    {
      title: "Submission",
      subtitle: "Deadline",
      icon: FileText,
      color: "from-blue-400 to-cyan-300",
    },
    {
      title: "Acceptance",
      subtitle: "Decision",
      icon: CheckCircle2,
      color: "from-emerald-400 to-teal-300",
    },
    {
      title: "Camera Ready",
      subtitle: "Final Paper",
      icon: Camera,
      color: "from-violet-400 to-fuchsia-300",
    },
    {
      title: "Event Day",
      subtitle: "Starts",
      icon: CalendarDays,
      color: "from-amber-400 to-orange-300",
    },
  ];

  return (
    <div className="relative hidden lg:block">
      <div className="absolute -left-8 top-6 h-24 w-24 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="absolute -right-8 bottom-6 h-28 w-28 rounded-full bg-violet-500/30 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur"
      >
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />

        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-violet-500/30 blur-3xl" />

        <div className="relative rounded-[22px] border border-white/10 bg-slate-950/75 p-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-black text-cyan-200">
                <Radio size={12} className="animate-pulse" />
                Live Tracker
              </div>

              <h3 className="mt-2 text-xl font-black text-white">
                Conference Sync Board
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-300">
                Track deadlines, reviews, and conference dates in one place.
              </p>
            </div>

            <div className="rounded-xl bg-blue-500/20 p-2.5 text-blue-100 shadow-lg">
              <CalendarDays size={22} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-6 right-6 top-[23px] h-1 rounded-full bg-white/10" />
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "82%" }}
              transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
              className="absolute left-6 top-[23px] h-1 rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-300 shadow-[0_0_20px_rgba(96,165,250,0.8)]"
            />

            <div className="grid grid-cols-4 gap-2.5">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.15 }}
                    className="relative"
                  >
                    <div
                      className={`mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} p-[2px] shadow-lg transition hover:scale-110`}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-950/85">
                        <Icon size={18} className="text-white" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/10 p-2 text-center backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
                      <p className="text-[11px] font-black text-white">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {step.subtitle}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Conferences = () => {
  const [conferences, setConferences] = useState([]);
  const [addedCalendarIds, setAddedCalendarIds] = useState([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [field, setField] = useState("");

  const userInterest = getUserResearchKeywords();

  const fetchData = async () => {
    try {
      setLoading(true);

      const [conferenceRes, googleRes] = await Promise.all([
        getConferences({ upcoming: true }),
        getGoogleCalendarStatus().catch(() => ({ data: { connected: false } })),
      ]);

      setConferences(conferenceRes.data || []);
      setGoogleConnected(googleRes.data.connected);

      try {
        await getSavedConferences();
      } catch {
        // saved conferences are optional
      }
    } catch (error) {
      console.error("Failed to load conferences", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnectGoogle = async () => {
    const { data } = await connectGoogleCalendar();
    window.location.href = data.url;
  };

  const handleAddEvent = async (conferenceId) => {
    try {
      const { data } = await addConferenceEventToCalendar(conferenceId);
      setAddedCalendarIds((prev) => [...new Set([...prev, conferenceId])]);

      if (data.eventLink) {
        window.open(data.eventLink, "_blank");
      }
    } catch (error) {
      if (error.response?.data?.needsGoogleAuth) {
        handleConnectGoogle();
        return;
      }

      alert(error.response?.data?.message || "Failed to add event");
    }
  };

  const handleAddDeadline = async (conferenceId) => {
    try {
      const { data } = await addSubmissionDeadlineToCalendar(conferenceId);
      setAddedCalendarIds((prev) => [...new Set([...prev, conferenceId])]);

      if (data.eventLink) {
        window.open(data.eventLink, "_blank");
      }
    } catch (error) {
      if (error.response?.data?.needsGoogleAuth) {
        handleConnectGoogle();
        return;
      }

      alert(error.response?.data?.message || "Failed to add deadline reminder");
    }
  };

  const isRecommended = (conference) => {
    const fieldMatch =
      userInterest.field &&
      conference.field?.toLowerCase() === userInterest.field.toLowerCase();

    const keywordMatch = userInterest.keywords?.some((keyword) => {
      const text =
        `${conference.title} ${conference.description} ${conference.field}`.toLowerCase();
      return text.includes(keyword.toLowerCase());
    });

    return !!fieldMatch || !!keywordMatch;
  };

  const filteredConferences = useMemo(() => {
    return conferences.filter((conference) => {
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        conference.title?.toLowerCase().includes(query) ||
        conference.acronym?.toLowerCase().includes(query) ||
        conference.field?.toLowerCase().includes(query) ||
        conference.location?.toLowerCase().includes(query);

      const matchesField = !field || conference.field === field;

      return matchesSearch && matchesField;
    });
  }, [conferences, search, field]);

  const recommendedConferences = filteredConferences.filter(isRecommended);
  const otherConferences = filteredConferences.filter(
    (conference) => !isRecommended(conference)
  );

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f8ff]">
      <Navbar />

      <main className="relative">
        <section className="relative overflow-hidden bg-slate-950 px-4 py-8 text-white md:px-10 md:py-9">
          <div
            className="absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute right-0 top-6 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 backdrop-blur">
                <Sparkles size={14} />
                Academic Conference Hub
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-tight md:text-4xl">
                Discover, track, and sync research conferences.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                Explore academic events, monitor submission deadlines, and add
                important dates directly to Google Calendar.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <div className="rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 backdrop-blur">
                  <div className="flex items-center gap-2 text-blue-200">
                    <CalendarDays size={15} />
                    <span className="text-xs font-bold">Timeline Tracking</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 backdrop-blur">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <BellRing size={15} />
                    <span className="text-xs font-bold">Deadline Reminders</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 backdrop-blur">
                  <div className="flex items-center gap-2 text-violet-200">
                    <Globe2 size={15} />
                    <span className="text-xs font-bold">Global Events</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <HeroConferenceVisual />
          </div>
        </section>

        <section className="relative mx-auto -mt-5 max-w-7xl px-4 md:px-8">
          <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.16)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400" />

            <div className="relative grid gap-3 md:grid-cols-2">
              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conferences by title, field, location..."
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-11 py-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All Fields</option>
                <option value="Artificial Intelligence">
                  Artificial Intelligence
                </option>
                <option value="Data Science">Data Science</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Software Engineering">
                  Software Engineering
                </option>
                <option value="Bioinformatics">Bioinformatics</option>
                <option value="Machine Learning">Machine Learning</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-950">
                All upcoming conferences
              </h2>
              <p className="mt-2 text-slate-500">
                Browse academic events across fields and sync them instantly.
              </p>
            </div>

            <CalendarStatusBadge
              connected={googleConnected}
              onConnect={handleConnectGoogle}
            />
          </div>

          {loading ? (
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-16 text-center text-slate-500">
              Loading conferences...
            </div>
          ) : (
            <div className="space-y-12">
              {recommendedConferences.length > 0 && (
                <section>
                  <div className="mb-5">
                    <h3 className="text-2xl font-black text-slate-900">
                      Recommended for your research area
                    </h3>
                    <p className="text-sm text-slate-500">
                      Based on your field and project keywords.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {recommendedConferences.map((conference) => (
                      <ConferenceCard
                        key={conference._id}
                        conference={conference}
                        googleConnected={googleConnected}
                        onConnectGoogle={handleConnectGoogle}
                        onAddEvent={handleAddEvent}
                        onAddDeadline={handleAddDeadline}
                        isRecommended
                        isAddedToCalendar={addedCalendarIds.includes(
                          conference._id
                        )}
                      />
                    ))}
                  </div>
                </section>
              )}

              <section>
                {otherConferences.length === 0 &&
                recommendedConferences.length === 0 ? (
                  <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-16 text-center text-slate-500">
                    No conferences found.
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {otherConferences.map((conference) => (
                      <ConferenceCard
                        key={conference._id}
                        conference={conference}
                        googleConnected={googleConnected}
                        onConnectGoogle={handleConnectGoogle}
                        onAddEvent={handleAddEvent}
                        onAddDeadline={handleAddDeadline}
                        isRecommended={false}
                        isAddedToCalendar={addedCalendarIds.includes(
                          conference._id
                        )}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Conferences;