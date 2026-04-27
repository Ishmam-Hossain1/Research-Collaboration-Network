// import { useEffect, useRef, useState } from "react";
// import Navbar from "../components/Navbar";
// import SplashCursor from "../components/SplashCursor";
// import resourcesImage from "../assets/janko-ferlic-sfL_QOnmy00-unsplash.jpg";
// import {
//   motion,
//   useInView,
//   useScroll,
//   useTransform,
//   useMotionValueEvent,
// } from "framer-motion";
// import {
//   ArrowRight,
//   FlaskConical,
//   Users,
//   FolderKanban,
//   Database,
//   Sparkles,
//   Globe,
//   ShieldCheck,
//   BarChart3,
// } from "lucide-react";

// const features = [
//   {
//     title: "Find Research Collaborators",
//     description:
//       "Discover researchers with matching interests, skills, and academic goals, then send collaboration requests directly.",
//     icon: Users,
//   },
//   {
//     title: "Manage Research Projects",
//     description:
//       "Create projects, describe objectives, add keywords, track progress, and organize your research work in one place.",
//     icon: FolderKanban,
//   },
//   {
//     title: "Share Research Datasets",
//     description:
//       "Upload datasets with public, private, or restricted access so research data can be shared safely.",
//     icon: Database,
//   },
// ];

// const heroStats = [
//   { label: "Research tools", value: 8 },
//   { label: "Workflow modules", value: 6 },
// ];

// const dashboardStats = [
//   { label: "Projects", value: 850 },
//   { label: "Researchers", value: 2400 },
//   { label: "Datasets", value: 310 },
//   { label: "Resources", value: 120 },
// ];

// const fadeUpVariant = {
//   hidden: { opacity: 0, y: 60, scale: 0.98 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: {
//       duration: 0.8,
//       ease: [0.22, 1, 0.36, 1],
//     },
//   },
// };

// const staggerContainer = {
//   hidden: {},
//   visible: {
//     transition: {
//       staggerChildren: 0.18,
//     },
//   },
// };

// function formatCompactPlus(value) {
//   if (value >= 1000) {
//     const compact = value / 1000;
//     return `${Number.isInteger(compact) ? compact : compact.toFixed(1)}K+`;
//   }
//   return `${value}+`;
// }

// function CountUp({ end, duration = 1800, formatter, className = "" }) {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, amount: 0.4 });
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     if (!isInView) return;

//     let startTimestamp = null;
//     let animationFrame;

//     const step = (timestamp) => {
//       if (!startTimestamp) startTimestamp = timestamp;

//       const progress = Math.min((timestamp - startTimestamp) / duration, 1);
//       const easedProgress = 1 - Math.pow(1 - progress, 3);
//       const currentValue = end * easedProgress;

//       setCount(currentValue);

//       if (progress < 1) {
//         animationFrame = window.requestAnimationFrame(step);
//       } else {
//         setCount(end);
//       }
//     };

//     animationFrame = window.requestAnimationFrame(step);

//     return () => {
//       if (animationFrame) window.cancelAnimationFrame(animationFrame);
//     };
//   }, [isInView, end, duration]);

//   const displayValue = formatter
//     ? formatter(count)
//     : Math.round(count).toLocaleString();

//   return (
//     <span ref={ref} className={className}>
//       {displayValue}
//     </span>
//   );
// }

// export default function Homepage() {
//   const { scrollY } = useScroll();
//   const [showNavbar, setShowNavbar] = useState(true);

//   const heroScale = useTransform(scrollY, [0, 280], [1, 0.94]);
//   const heroY = useTransform(scrollY, [0, 280], [0, -40]);
//   const heroOpacity = useTransform(scrollY, [0, 320], [1, 0.92]);

//   useMotionValueEvent(scrollY, "change", (latest) => {
//     const previous = scrollY.getPrevious() ?? 0;
//     const diff = latest - previous;

//     // keep navbar visible near the top
//     if (latest <= 24) {
//       setShowNavbar(true);
//       return;
//     }

//     // ignore tiny scroll jitters for smoother behavior
//     if (Math.abs(diff) < 6) return;

//     if (diff > 0) {
//       setShowNavbar(false);
//     } else {
//       setShowNavbar(true);
//     }
//   });

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#f8fbff] text-slate-900">
//       {/* Splash cursor background */}
//       <div className="absolute inset-0 z-0">
//         <SplashCursor
//           SIM_RESOLUTION={128}
//           DYE_RESOLUTION={1440}
//           DENSITY_DISSIPATION={3.5}
//           VELOCITY_DISSIPATION={2}
//           PRESSURE={0.1}
//           CURL={3}
//           SPLAT_RADIUS={0.2}
//           SPLAT_FORCE={6000}
//           COLOR_UPDATE_SPEED={10}
//         />
//       </div>

//       {/* Soft overlay for readability */}
//       <div className="absolute inset-0 z-[2] bg-white/60 backdrop-blur-[1px]" />

//       {/* Main content */}
//       <div className="relative z-10">
//         <motion.div
//           className="fixed left-0 right-0 top-0 z-50 will-change-transform"
//           initial={false}
//           animate={{
//             y: showNavbar ? 0 : -110,
//             opacity: showNavbar ? 1 : 0.92,
//           }}
//           transition={{
//             type: "spring",
//             stiffness: 260,
//             damping: 28,
//             mass: 0.8,
//           }}
//         >
//           <Navbar />
//         </motion.div>

//         <main className="relative overflow-hidden pt-[78px]">
//           <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl" />
//           <div className="pointer-events-none absolute -left-16 top-[28rem] h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />

//           <motion.section
//             style={{ scale: heroScale, y: heroY, opacity: heroOpacity }}
//             className="origin-top mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24"
//             variants={fadeUpVariant}
//             initial="hidden"
//             animate="visible"
//           >
//             <div className="grid items-center gap-12 lg:grid-cols-2">
//               <motion.div variants={fadeUpVariant}>
//                 <div className="mb-5 inline-flex rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
//                   Research Collaboration Platform
//                 </div>

//                 <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
//                   Discover. Collaborate. Publish.
//                   <span className="text-blue-600">
//                     {" "}
//                     Powered by Research Connect.
//                   </span>
//                 </h1>

//                 <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
//                   Build meaningful academic partnerships, showcase your
//                   projects, and share datasets in a modern platform designed
//                   for researchers, students, and institutions.
//                 </p>

//                 <div className="mt-8 flex flex-wrap gap-4">
//                   <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/40 transition hover:-translate-y-0.5 hover:bg-slate-800">
//                     Get Started
//                     <ArrowRight size={18} />
//                   </button>

//                   <button className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
//                     Learn More
//                   </button>
//                 </div>

//                 <div className="mt-10 flex items-center gap-6">
//                   <div className="flex -space-x-3">
//                     {["AR", "MK", "SN", "JL"].map((item) => (
//                       <div
//                         key={item}
//                         className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm font-semibold text-slate-700 shadow-sm"
//                       >
//                         {item}
//                       </div>
//                     ))}
//                   </div>

//                   <p className="max-w-sm text-sm text-slate-600">
//                     Trusted by researchers, students, and academic teams
//                   </p>
//                 </div>

//                 <div className="mt-10 flex flex-wrap gap-8">
//                   {heroStats.map((item) => (
//                     <div key={item.label}>
//                       <div className="text-3xl font-extrabold text-slate-900">
//                         <CountUp
//                           end={item.value}
//                           duration={1800}
//                           formatter={(value) =>
//                             Math.round(value).toLocaleString()
//                           }
//                         />
//                       </div>
//                       <div className="text-sm text-slate-500">{item.label}</div>
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>

//               <motion.div className="relative" variants={fadeUpVariant}>
//                 <div className="rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-md">
//                   <div className="mb-5 flex items-center justify-between">
//                     <div>
//                       <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
//                         Live Workspace
//                       </p>
//                       <h3 className="mt-1 text-2xl font-bold text-slate-900">
//                         Research Connect Dashboard
//                       </h3>
//                       <p className="mt-1 text-sm text-slate-500">
//                         A unified place for people, projects, and research data.
//                       </p>
//                     </div>
//                     <Sparkles className="text-blue-600" size={20} />
//                   </div>

//                   <motion.div
//                     className="grid gap-4 sm:grid-cols-2"
//                     variants={staggerContainer}
//                     initial="hidden"
//                     whileInView="visible"
//                     viewport={{ once: true, amount: 0.25 }}
//                   >
//                     <motion.div
//                       variants={fadeUpVariant}
//                       className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
//                     >
//                       <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
//                         <FlaskConical className="h-4 w-4 text-blue-600" />
//                         Active Project
//                       </div>
//                       <p className="text-sm leading-6 text-slate-600">
//                         AI-driven disease prediction using multimodal clinical
//                         data and collaborative review workflows.
//                       </p>
//                     </motion.div>

//                     <motion.div
//                       variants={fadeUpVariant}
//                       className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
//                     >
//                       <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
//                         <Globe className="h-4 w-4 text-blue-600" />
//                         New Collaboration
//                       </div>
//                       <p className="text-sm leading-6 text-slate-600">
//                         3 new researcher matches from health informatics and
//                         data science.
//                       </p>
//                     </motion.div>

//                     <motion.div
//                       variants={fadeUpVariant}
//                       className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
//                     >
//                       <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
//                         <ShieldCheck className="h-4 w-4 text-blue-600" />
//                         Verified Dataset
//                       </div>
//                       <p className="text-sm leading-6 text-slate-600">
//                         Securely manage datasets and publish reusable research
//                         assets.
//                       </p>
//                     </motion.div>

//                     <motion.div
//                       variants={fadeUpVariant}
//                       className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
//                     >
//                       <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
//                         <BarChart3 className="h-4 w-4 text-blue-600" />
//                         Analytics
//                       </div>
//                       <p className="text-sm leading-6 text-slate-600">
//                         Track engagement, project growth, and collaboration
//                         activity.
//                       </p>
//                     </motion.div>
//                   </motion.div>

//                   <div className="my-5 h-px w-full bg-slate-200" />

//                   <motion.div
//                     className="grid grid-cols-2 gap-4"
//                     variants={staggerContainer}
//                     initial="hidden"
//                     whileInView="visible"
//                     viewport={{ once: true, amount: 0.25 }}
//                   >
//                     {dashboardStats.map((item) => (
//                       <motion.div
//                         key={item.label}
//                         variants={fadeUpVariant}
//                         className="rounded-2xl border border-slate-200 bg-white p-4"
//                       >
//                         <div className="text-2xl font-bold text-slate-900">
//                           <CountUp
//                             end={item.value}
//                             duration={1800}
//                             formatter={(value) =>
//                               formatCompactPlus(Math.round(value))
//                             }
//                           />
//                         </div>
//                         <div className="mt-1 text-sm text-slate-500">
//                           {item.label}
//                         </div>
//                       </motion.div>
//                     ))}
//                   </motion.div>
//                 </div>

//                 <div className="absolute -right-6 -top-6 hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg md:block">
//                   Real-time Insights
//                 </div>

//                 <div className="absolute -bottom-5 -left-6 hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg md:block">
//                   Seamless Collaboration
//                 </div>
//               </motion.div>
//             </div>
//           </motion.section>

//           <motion.section
//             className="mx-auto max-w-7xl px-6 pb-8 md:px-10"
//             variants={staggerContainer}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.2 }}
//           >
//             <motion.p
//               className="mb-5 text-center text-sm text-slate-500"
//               variants={fadeUpVariant}
//             >
//               Adopted by renowned institutions
//             </motion.p>

//             <motion.div
//               className="grid gap-4 md:grid-cols-5"
//               variants={staggerContainer}
//             >
//               {["MIT", "Stanford", "Oxford", "Cambridge", "ETH Zurich"].map(
//                 (item) => (
//                   <motion.div
//                     key={item}
//                     variants={fadeUpVariant}
//                     className="flex min-h-[72px] items-center justify-center rounded-2xl border border-slate-200 bg-white/80 font-semibold text-slate-600 backdrop-blur-sm"
//                   >
//                     {item}
//                   </motion.div>
//                 )
//               )}
//             </motion.div>
//           </motion.section>

//           <motion.section
//             className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10"
//             variants={staggerContainer}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.15 }}
//           >
//             <motion.div
//               className="mx-auto mb-10 max-w-3xl text-center"
//               variants={fadeUpVariant}
//             >
//               <div className="mb-3 text-sm font-semibold text-blue-600">
//                 Comprehensive Insights
//               </div>
//               <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
//                 Everything needed for modern research workflows
//               </h2>
//               <p className="mt-4 text-base leading-8 text-slate-600">
//                 Manage projects, people, and datasets through a clean platform
//                 inspired by modern SaaS product design.
//               </p>
//             </motion.div>

//             <motion.div
//               className="grid gap-6 md:grid-cols-3"
//               variants={staggerContainer}
//             >
//               {features.map((feature) => {
//                 const Icon = feature.icon;

//                 return (
//                   <motion.div
//                     key={feature.title}
//                     variants={fadeUpVariant}
//                     className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-lg shadow-slate-100/80 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl"
//                   >
//                     <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
//                       <Icon className="h-5 w-5" />
//                     </div>

//                     <h3 className="text-xl font-bold text-slate-900">
//                       {feature.title}
//                     </h3>

//                     <p className="mt-3 leading-7 text-slate-600">
//                       {feature.description}
//                     </p>
//                   </motion.div>
//                 );
//               })}
//             </motion.div>
//           </motion.section>
//         </main>
//       </div>
//     </div>
//   );
// }



import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SplashCursor from "../components/SplashCursor";

import resourcesImage from "../assets/janko-ferlic-sfL_QOnmy00-unsplash.jpg";
import bgImageTwo from "../assets/hitoshi-suzuki-1COcTd3pRCg-unsplash.jpg";
import bgImageThree from "../assets/tim-wildsmith-o2fc-C-Uotw-unsplash.jpg";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValueEvent,
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
  { label: "Research tools", value: 8 },
  { label: "Platform features", value: 6 },
];

const dashboardStats = [
  { label: "Projects", value: 850 },
  { label: "Researchers", value: 2400 },
  { label: "Datasets", value: 310 },
  { label: "Resources", value: 120 },
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

  const { scrollY } = useScroll();
  const [showNavbar, setShowNavbar] = useState(true);

  const heroScale = useTransform(scrollY, [0, 280], [1, 0.94]);
  const heroY = useTransform(scrollY, [0, 280], [0, -40]);
  const heroOpacity = useTransform(scrollY, [0, 320], [1, 0.92]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const diff = latest - previous;

    if (latest <= 24) {
      setShowNavbar(true);
      return;
    }

    if (Math.abs(diff) < 6) return;

    setShowNavbar(diff <= 0);
  });

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fbff] text-slate-900">
      {/* Background image collage */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.16] blur-[1px]"
          style={{
            backgroundImage: `url(${resourcesImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div
          className="absolute -left-20 top-32 h-[360px] w-[360px] rounded-full opacity-[0.18] blur-[1px] sm:h-[460px] sm:w-[460px] lg:h-[560px] lg:w-[560px]"
          style={{
            backgroundImage: `url(${bgImageTwo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div
          className="absolute -right-28 bottom-20 h-[380px] w-[380px] rounded-full opacity-[0.2] blur-[1px] sm:h-[480px] sm:w-[480px] lg:h-[620px] lg:w-[620px]"
          style={{
            backgroundImage: `url(${bgImageThree})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/55 to-slate-100/75" />
      </div>

      {/* Splash cursor background */}
      <div className="absolute inset-0 z-[1]">
        <SplashCursor
          SIM_RESOLUTION={128}
          DYE_RESOLUTION={1440}
          DENSITY_DISSIPATION={3.5}
          VELOCITY_DISSIPATION={2}
          PRESSURE={0.1}
          CURL={3}
          SPLAT_RADIUS={0.2}
          SPLAT_FORCE={6000}
          COLOR_UPDATE_SPEED={10}
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
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 28,
            mass: 0.8,
          }}
        >
          <Navbar />
        </motion.div>

        <main className="relative overflow-hidden pt-[78px]">
          <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 top-[28rem] h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />

          <motion.section
            style={{ scale: heroScale, y: heroY, opacity: heroOpacity }}
            className="origin-top mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24"
            variants={fadeUpVariant}
            initial="hidden"
            animate="visible"
          >
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div variants={fadeUpVariant}>
                <div className="mb-5 inline-flex rounded-full border border-blue-100 bg-white/75 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm backdrop-blur-md">
                  Research Collaboration Platform
                </div>

                <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                  Discover. Collaborate. Publish.
                  <span className="text-blue-600">
                    {" "}
                    Powered by Research Connect.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                  Build meaningful academic partnerships, manage research
                  projects, track milestones, share datasets, discover funding,
                  and get AI-guided support from one modern research workspace.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate("/signup")}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/40 transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Get Started
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={scrollToFeatures}
                    className="rounded-full border border-slate-200 bg-white/85 px-6 py-3 text-sm font-semibold text-slate-700 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    Explore Features
                  </button>
                </div>

                <div className="mt-10 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {["AI", "DS", "ML", "RC"].map((item) => (
                      <div
                        key={item}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm font-semibold text-slate-700 shadow-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <p className="max-w-sm text-sm text-slate-600">
                    Designed for researchers, students, supervisors, and
                    academic teams.
                  </p>
                </div>

                <div className="mt-10 flex flex-wrap gap-8">
                  {heroStats.map((item) => (
                    <div key={item.label}>
                      <div className="text-3xl font-extrabold text-slate-900">
                        <CountUp
                          end={item.value}
                          duration={1800}
                          formatter={(value) =>
                            Math.round(value).toLocaleString()
                          }
                        />
                      </div>
                      <div className="text-sm text-slate-500">{item.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div className="relative" variants={fadeUpVariant}>
                <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur-xl">
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
            </div>
          </motion.section>

          <motion.section
            className="mx-auto max-w-7xl px-6 pb-8 md:px-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.p
              className="mb-5 text-center text-sm text-slate-500"
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
                  className="flex min-h-[72px] items-center justify-center rounded-2xl border border-white/70 bg-white/75 font-semibold text-slate-600 shadow-sm backdrop-blur-md transition hover:-translate-y-1 hover:bg-white"
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          <motion.section
            ref={featuresRef}
            className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10"
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
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Everything needed for modern research collaboration
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

                    <h3 className="text-xl font-bold text-slate-900">
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

                    <h3 className="text-xl font-bold text-slate-900">
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