import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SplashCursor from "../components/SplashCursor";

import resourcesImage from "../assets/janko-ferlic-sfL_QOnmy00-unsplash.jpg";
import bgImageTwo from "../assets/hitoshi-suzuki-1COcTd3pRCg-unsplash.jpg";
import bgImageThree from "../assets/tim-wildsmith-o2fc-C-Uotw-unsplash.jpg";
import globalNetworkImg from "../assets/international-day-education-futuristic-style.jpg";
import collabRoom from "../assets/2205_w037_n003_379b_p1_379.jpg";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowRight,
  FlaskConical,
  Users,
  FolderKanban,
  Database,
  Sparkles,
  Globe,
  ShieldCheck,
  BarChart3,
  BookOpen,
  Handshake,
  Bot,
} from "lucide-react";

/** Hero background slideshow — cycles through project assets */
const heroSlideshowImages = [
  resourcesImage,
  bgImageTwo,
  bgImageThree,
];

const features = [
  {
    title: "Find Research Collaborators",
    description:
      "Discover researchers with matching interests, skills, and academic goals, then send collaboration requests directly.",
    icon: Users,
  },
  {
    title: "Manage Research Projects",
    description:
      "Create projects, define objectives, add keywords, track progress, and organize your research work in one place.",
    icon: FolderKanban,
  },
  {
    title: "Share Research Datasets",
    description:
      "Upload datasets with public, private, or restricted access so research data can be shared safely.",
    icon: Database,
  },
];

const heroStats = [
  { label: "Research tools", value: 1971 },
  { label: "Platform features", value: 5656 },
];

const dashboardStats = [
  { label: "Projects", value: 850 },
  { label: "Researchers", value: 2400 },
  { label: "Datasets", value: 310 },
  { label: "Resources", value: 120 },
];

const visualShowcase = [
  {
    title: "Collaborative Research Rooms",
    description:
      "Bring supervisors, students, and collaborators into one focused workspace.",
    image: collabRoom,
  },
  {
    title: "Data-Driven Discovery",
    description:
      "Explore datasets and insights with clarity across every stage of your project.",
    image: resourcesImage,
  },
  {
    title: "Global Academic Network",
    description:
      "Connect with institutions and experts through a polished collaboration layer.",
    image: globalNetworkImg,
  },
];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 60, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

function formatCompactPlus(value) {
  if (value >= 1000) {
    const compact = value / 1000;
    return `${Number.isInteger(compact) ? compact : compact.toFixed(1)}K+`;
  }
  return `${value}+`;
}

function CountUp({ end, duration = 1800, formatter, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;

      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = end * easedProgress;

      setCount(currentValue);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrame = window.requestAnimationFrame(step);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [isInView, end, duration]);

  const displayValue = formatter
    ? formatter(count)
    : Math.round(count).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}

export default function Homepage() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const [showNavbar, setShowNavbar] = useState(true);
  const showNavbarRef = useRef(true);
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateDeviceMode = () => {
      setIsLowPowerDevice(mediaQuery.matches);
    };

    updateDeviceMode();
    mediaQuery.addEventListener("change", updateDeviceMode);
    return () => mediaQuery.removeEventListener("change", updateDeviceMode);
  }, []);

  const smoothMode = prefersReducedMotion || isLowPowerDevice;

  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion || heroSlideshowImages.length <= 1) return;

    const intervalMs = smoothMode ? 9000 : 6500;
    const id = window.setInterval(() => {
      setHeroSlideIndex((i) => (i + 1) % heroSlideshowImages.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, smoothMode]);

  const heroScale = useTransform(scrollY, [0, 280], [1, smoothMode ? 0.99 : 0.96]);
  const heroY = useTransform(scrollY, [0, 280], [0, smoothMode ? -10 : -28]);
  const heroOpacity = useTransform(scrollY, [0, 320], [1, smoothMode ? 0.98 : 0.94]);
  const heroImageY = useTransform(scrollY, [0, 600], [0, smoothMode ? -36 : -100]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const diff = latest - previous;

    if (latest <= 24) {
      if (!showNavbarRef.current) {
        showNavbarRef.current = true;
        setShowNavbar(true);
      }
      return;
    }

    if (Math.abs(diff) < 10) return;

    const nextNavbarState = diff <= 0;
    if (nextNavbarState !== showNavbarRef.current) {
      showNavbarRef.current = nextNavbarState;
      setShowNavbar(nextNavbarState);
    }
  });

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8fbff] text-slate-900">
      {/* Splash cursor background */}
      <div className="absolute inset-0 z-[1]">
        <SplashCursor
          SIM_RESOLUTION={smoothMode ? 64 : 128}
          DYE_RESOLUTION={smoothMode ? 768 : 1440}
          DENSITY_DISSIPATION={smoothMode ? 4.2 : 3.5}
          VELOCITY_DISSIPATION={smoothMode ? 2.8 : 2}
          PRESSURE={0.1}
          CURL={smoothMode ? 2 : 3}
          SPLAT_RADIUS={smoothMode ? 0.16 : 0.2}
          SPLAT_FORCE={smoothMode ? 4200 : 6000}
          COLOR_UPDATE_SPEED={smoothMode ? 7 : 10}
        />
      </div>

      {/* Soft glass overlay */}
      <div className="absolute inset-0 z-[2] bg-white/35 backdrop-blur-[0.5px]" />

      {/* Main content */}
      <div className="relative z-10">
        <motion.div
          className="fixed left-0 right-0 top-0 z-50 will-change-transform"
          initial={false}
          animate={{
            y: showNavbar ? 0 : -110,
            opacity: showNavbar ? 1 : 0.92,
          }}
          transition={
            smoothMode
              ? { type: "tween", ease: "easeOut", duration: 0.22 }
              : {
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  mass: 0.8,
                }
          }
        >
          <Navbar />
        </motion.div>

        <main className="relative overflow-hidden pt-[78px]">
          {/* —— Hero + dashboard (two columns) —— */}
          <div className="relative w-full">
            <section className="relative w-full overflow-hidden">
              <motion.div
                className="pointer-events-none absolute inset-0 h-[115%] w-full will-change-transform"
                style={{ y: heroImageY }}
                aria-hidden
              >
                <div className="relative h-full w-full">
                  {heroSlideshowImages.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      loading={index === 0 ? "eager" : "lazy"}
                      className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1400ms] ease-in-out ${
                        index === heroSlideIndex ? "z-[1] opacity-100" : "z-0 opacity-0"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/35" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />

              <div className="relative z-10 mx-auto flex max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-16">
                <motion.div
                  style={{ scale: heroScale, y: heroY, opacity: heroOpacity }}
                  className="grid w-full origin-top items-center gap-10 lg:grid-cols-2 lg:gap-12"
                  variants={fadeUpVariant}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={fadeUpVariant} className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                      Research Collaboration Platform
                    </p>
                    <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
                      Discover. Collaborate. Publish.
                    </h1>
                    <p className="mt-2 font-serif text-lg text-blue-100/90 sm:text-xl">
                      Powered by Research Connect
                    </p>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                      Build meaningful academic partnerships, manage projects and
                      milestones, share datasets, find funding, and get AI-guided
                      support in one modern workspace.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500"
                      >
                        Get started
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={scrollToFeatures}
                        className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                      >
                        Explore features
                      </button>
                    </div>
                    <div className="mt-10 flex flex-wrap items-center gap-6 text-white/95">
                      <div className="flex -space-x-3">
                        {["AI", "DS", "ML", "RC"].map((item) => (
                          <div
                            key={item}
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-200 text-xs font-bold text-slate-800"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                      <p className="max-w-xs text-sm text-slate-200">
                        For researchers, students, supervisors, and institutions.
                      </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-8 border-t border-white/15 pt-8">
                      {heroStats.map((item) => (
                        <div key={item.label}>
                          <div className="text-2xl font-bold text-white sm:text-3xl">
                            <CountUp
                              end={item.value}
                              duration={1800}
                              formatter={(value) =>
                                Math.round(value).toLocaleString()
                              }
                            />
                          </div>
                          <div className="text-sm text-slate-300">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div className="relative" variants={fadeUpVariant}>
                    <div className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-2xl shadow-slate-300/40 backdrop-blur-xl sm:rounded-[32px] sm:p-6">
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                            Live Workspace
                          </p>
                          <h3 className="mt-1 text-2xl font-bold text-slate-900">
                            Research Connect Dashboard
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            One place for people, projects, data, and progress.
                          </p>
                        </div>
                        <Sparkles className="shrink-0 text-blue-600" size={22} />
                      </div>

                      <motion.div
                        className="grid gap-4 sm:grid-cols-2"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.25 }}
                      >
                        <motion.div
                          variants={fadeUpVariant}
                          className="rounded-2xl border border-slate-200/80 bg-slate-50/85 p-4"
                        >
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <FlaskConical className="h-4 w-4 text-blue-600" />
                            Active Projects
                          </div>
                          <p className="text-sm leading-6 text-slate-600">
                            Create, organize, and monitor research projects with
                            clear objectives and progress tracking.
                          </p>
                        </motion.div>

                        <motion.div
                          variants={fadeUpVariant}
                          className="rounded-2xl border border-slate-200/80 bg-slate-50/85 p-4"
                        >
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Handshake className="h-4 w-4 text-blue-600" />
                            Collaboration
                          </div>
                          <p className="text-sm leading-6 text-slate-600">
                            Find researchers with shared interests and manage
                            collaboration requests smoothly.
                          </p>
                        </motion.div>

                        <motion.div
                          variants={fadeUpVariant}
                          className="rounded-2xl border border-slate-200/80 bg-slate-50/85 p-4"
                        >
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <ShieldCheck className="h-4 w-4 text-blue-600" />
                            Dataset Access
                          </div>
                          <p className="text-sm leading-6 text-slate-600">
                            Upload research datasets and control visibility with
                            public, private, or restricted access.
                          </p>
                        </motion.div>

                        <motion.div
                          variants={fadeUpVariant}
                          className="rounded-2xl border border-slate-200/80 bg-slate-50/85 p-4"
                        >
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Bot className="h-4 w-4 text-blue-600" />
                            AI Assistant
                          </div>
                          <p className="text-sm leading-6 text-slate-600">
                            Get contextual guidance about projects, milestones,
                            datasets, funding, and platform usage.
                          </p>
                        </motion.div>
                      </motion.div>

                      <div className="my-5 h-px w-full bg-slate-200" />

                      <motion.div
                        className="grid grid-cols-2 gap-4"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.25 }}
                      >
                        {dashboardStats.map((item) => (
                          <motion.div
                            key={item.label}
                            variants={fadeUpVariant}
                            className="rounded-2xl border border-slate-200 bg-white/90 p-4"
                          >
                            <div className="text-2xl font-bold text-slate-900">
                              <CountUp
                                end={item.value}
                                duration={1800}
                                formatter={(value) =>
                                  formatCompactPlus(Math.round(value))
                                }
                              />
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              {item.label}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    <div className="absolute -right-6 -top-6 hidden rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-md md:block">
                      Real-time Messaging
                    </div>

                    <div className="absolute -bottom-5 -left-6 hidden rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-md md:block">
                      Milestone Tracking
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </section>
          </div>

          {/* —— About (split layout) —— */}
          <motion.section
            className="border-t border-slate-200/80 bg-white py-14 sm:py-20"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                <motion.div
                  variants={fadeUpVariant}
                  className="relative overflow-hidden rounded-2xl shadow-lg shadow-slate-200/50"
                >
                  <img
                    src={bgImageTwo}
                    alt="Research collaboration"
                    className="aspect-[4/3] w-full object-cover sm:aspect-[5/4]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent" />
                </motion.div>
                <motion.div variants={fadeUpVariant} className="text-left">
                  <p className="text-sm font-medium italic text-blue-600">
                    Why Research Connect
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    About the platform
                  </h2>
                  <div className="mt-4 flex max-w-sm items-center gap-2">
                    <div className="h-px flex-1 bg-blue-200" />
                    <div className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                    <div className="h-px flex-1 bg-blue-200" />
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                    Research Connect brings people, projects, and data together
                    in a single workspace. Whether you are forming a new team,
                    sharing a dataset, or tracking milestones, the experience
                    stays clear and calm—like a well-run lab notebook, but
                    online.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    We built it for the full academic workflow: discovery,
                    collaboration, secure sharing, and insight—without losing the
                    human side of research.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="mt-6 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Get in touch
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="mx-auto max-w-7xl bg-[#f8fbff] px-4 py-10 sm:px-6 md:px-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.p
              className="mb-5 text-center text-sm font-medium text-slate-500"
              variants={fadeUpVariant}
            >
              Built around the complete research workflow
            </motion.p>

            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
              variants={staggerContainer}
            >
              {[
                "Projects",
                "Researchers",
                "Datasets",
                "Funding",
                "Resources",
              ].map((item) => (
                <motion.div
                  key={item}
                  variants={fadeUpVariant}
                  className="flex min-h-[72px] items-center justify-center rounded-md border border-slate-200 bg-white font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          <motion.section
            className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 md:px-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <motion.div
              className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
              variants={fadeUpVariant}
            >
              <div className="max-w-2xl">
                <p className="text-sm font-medium italic text-blue-600">Visual research story</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Academic, modern, and alive
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Curated imagery keeps the experience human while matching your
                existing clean, research-focused design language.
              </p>
            </motion.div>

            <motion.div
              className="grid gap-5 md:grid-cols-3"
              variants={staggerContainer}
            >
              {visualShowcase.map((card) => (
                <motion.article
                  key={card.title}
                  variants={fadeUpVariant}
                  className="overflow-hidden rounded-[26px] border border-white/80 bg-white/75 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-52 sm:h-56">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/25 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {card.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </motion.section>

          <motion.section
            ref={featuresRef}
            className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 md:px-10 md:pt-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <motion.div
              className="mx-auto mb-10 max-w-3xl text-center"
              variants={fadeUpVariant}
            >
              <div className="mb-3 text-sm font-semibold text-blue-600">
                Comprehensive Workspace
              </div>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Everything you need to collaborate
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Manage projects, people, datasets, funding opportunities,
                academic resources, milestones, and AI guidance through a clean,
                responsive platform.
              </p>
            </motion.div>

            <motion.div
              className="grid gap-6 md:grid-cols-3"
              variants={staggerContainer}
            >
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeUpVariant}
                    className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white/95 hover:shadow-xl"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-slate-900">
                      {feature.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              variants={fadeUpVariant}
              className="mt-8 grid gap-6 md:grid-cols-3"
            >
              {[
                {
                  title: "Track Milestones",
                  description:
                    "Break research projects into milestones and subtasks with automatic progress updates.",
                  icon: BarChart3,
                },
                {
                  title: "Discover Funding",
                  description:
                    "Browse funding opportunities and keep track of deadlines and eligibility details.",
                  icon: Globe,
                },
                {
                  title: "Academic Resources",
                  description:
                    "Explore research tools, journal databases, reference managers, and useful academic links.",
                  icon: BookOpen,
                },
              ].map((feature) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeUpVariant}
                    className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white/95 hover:shadow-xl"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-slate-900">
                      {feature.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
