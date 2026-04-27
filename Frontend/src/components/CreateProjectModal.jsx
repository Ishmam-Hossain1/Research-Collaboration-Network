// import { useMemo, useState } from "react";
// import {
//   X,
//   FileText,
//   Layers3,
//   Loader2,
//   Sparkles,
//   Target,
//   Users,
//   Tags,
//   CalendarDays,
//   Landmark,
// } from "lucide-react";
// import api from "../lib/api";

// const RESEARCH_FIELDS = [
//   "Artificial Intelligence",
//   "Data Science",
//   "Cybersecurity",
//   "Bioinformatics",
//   "Networking",
//   "Machine Learning",
//   "Robotics",
//   "Software Engineering",
//   "Other",
// ];

// const STATUS_OPTIONS = [
//   {
//     value: "ongoing",
//     title: "Ongoing",
//     description: "Work is currently in progress",
//   },
//   {
//     value: "completed",
//     title: "Completed",
//     description: "Project work has been finished",
//   },
// ];

// const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
//   const [formData, setFormData] = useState({
//     title: "",
//     abstract: "",
//     researchField: "",
//     status: "ongoing",
//     progress: 25,
//     objective: "",
//     methodology: "",
//     expectedOutcome: "",
//     fundingSource: "",
//     startDate: "",
//     endDate: "",
//   });

//   const [customField, setCustomField] = useState("");
//   const [collaboratorInput, setCollaboratorInput] = useState("");
//   const [keywordInput, setKeywordInput] = useState("");
//   const [collaborators, setCollaborators] = useState([]);
//   const [keywords, setKeywords] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const abstractCount = useMemo(
//     () => formData.abstract.trim().length,
//     [formData.abstract]
//   );

//   if (!isOpen) return null;

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === "progress" ? Number(value) : value,
//     }));
//   };

//   const handleFieldSelect = (field) => {
//     if (field === "Other") {
//       setFormData((prev) => ({
//         ...prev,
//         researchField: customField.trim() || "Other",
//       }));
//       return;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       researchField: field,
//     }));
//   };

//   const handleCustomFieldApply = () => {
//     if (!customField.trim()) return;

//     setFormData((prev) => ({
//       ...prev,
//       researchField: customField.trim(),
//     }));
//   };

//   const addCollaborator = () => {
//     const value = collaboratorInput.trim();
//     if (!value || collaborators.includes(value)) return;
//     setCollaborators((prev) => [...prev, value]);
//     setCollaboratorInput("");
//   };

//   const removeCollaborator = (value) => {
//     setCollaborators((prev) => prev.filter((item) => item !== value));
//   };

//   const addKeyword = () => {
//     const value = keywordInput.trim();
//     if (!value || keywords.includes(value)) return;
//     setKeywords((prev) => [...prev, value]);
//     setKeywordInput("");
//   };

//   const removeKeyword = (value) => {
//     setKeywords((prev) => prev.filter((item) => item !== value));
//   };

//   const resetForm = () => {
//     setFormData({
//       title: "",
//       abstract: "",
//       researchField: "",
//       status: "ongoing",
//       progress: 25,
//       objective: "",
//       methodology: "",
//       expectedOutcome: "",
//       fundingSource: "",
//       startDate: "",
//       endDate: "",
//     });
//     setCustomField("");
//     setCollaboratorInput("");
//     setKeywordInput("");
//     setCollaborators([]);
//     setKeywords([]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const token = localStorage.getItem("researchConnectToken");
//     if (!token) {
//       alert("You must be logged in to create a project");
//       return;
//     }

//     if (!formData.title.trim()) {
//       alert("Project title is required");
//       return;
//     }

//     if (!formData.abstract.trim()) {
//       alert("Abstract is required");
//       return;
//     }

//     if (!formData.researchField.trim()) {
//       alert("Please select or enter a research field");
//       return;
//     }

//     if (formData.progress < 0 || formData.progress > 100) {
//       alert("Progress must be between 0 and 100");
//       return;
//     }

//     if (
//       formData.startDate &&
//       formData.endDate &&
//       new Date(formData.startDate) > new Date(formData.endDate)
//     ) {
//       alert("End date must be after start date");
//       return;
//     }

//     try {
//       setLoading(true);

//       const payload = {
//         title: formData.title.trim(),
//         abstract: formData.abstract.trim(),
//         researchField: formData.researchField.trim(),
//         status: formData.status,
//         progress: Number(formData.progress),
//         objective: formData.objective.trim(),
//         methodology: formData.methodology.trim(),
//         expectedOutcome: formData.expectedOutcome.trim(),
//         fundingSource: formData.fundingSource.trim(),
//         collaborators,
//         keywords,
//         startDate: formData.startDate || null,
//         endDate: formData.endDate || null,
//       };

//       const res = await api.post("/projects", payload);

//       resetForm();
//       onProjectCreated?.(res.data.project);
//       onClose();
//     } catch (error) {
//       console.error(
//         "Create project error:",
//         error.response?.data || error.message
//       );

//       if (error.response?.status === 401) {
//         alert("Your session has expired or you are not logged in. Please log in again.");
//         return;
//       }

//       alert(error.response?.data?.message || "Failed to create project");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOverlayClick = (e) => {
//     if (e.target === e.currentTarget) onClose();
//   };

//   const TagList = ({ items, onRemove, emptyText }) => (
//     <div className="mt-3 flex min-h-[44px] flex-wrap gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-3">
//       {items.length === 0 ? (
//         <span className="text-sm text-slate-400">{emptyText}</span>
//       ) : (
//         items.map((item) => (
//           <span
//             key={item}
//             className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
//           >
//             {item}
//             <button
//               type="button"
//               onClick={() => onRemove(item)}
//               className="text-blue-700 hover:text-red-500"
//             >
//               ×
//             </button>
//           </span>
//         ))
//       )}
//     </div>
//   );

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
//       onClick={handleOverlayClick}
//     >
//       <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
//         <div className="shrink-0 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 px-6 py-5 md:px-8">
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-blue-700 shadow-sm">
//                 <Sparkles size={16} />
//                 Research Project Workspace
//               </div>
//               <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
//                 Create New Project
//               </h2>
//               <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
//                 Build a complete project entry with academic context,
//                 collaborators, timeline, methods, and expected impact.
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={onClose}
//               className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
//           <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-8">
//             <div className="grid gap-8 md:grid-cols-12">
//               <div className="space-y-6 md:col-span-7">
//                 <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
//                   <div className="mb-4 flex items-center gap-2">
//                     <FileText size={18} className="text-blue-600" />
//                     <h3 className="text-lg font-semibold text-slate-900">
//                       Core Information
//                     </h3>
//                   </div>

//                   <div className="space-y-5">
//                     <div>
//                       <label className="mb-2 block text-sm font-semibold text-slate-700">
//                         Project Title <span className="text-rose-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="title"
//                         value={formData.title}
//                         onChange={handleChange}
//                         placeholder="e.g. Deep Learning for Medical Imaging"
//                         className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                       />
//                     </div>

//                     <div>
//                       <div className="mb-2 flex items-center justify-between">
//                         <label className="block text-sm font-semibold text-slate-700">
//                           Abstract <span className="text-rose-500">*</span>
//                         </label>
//                         <span className="text-xs text-slate-500">
//                           {abstractCount} characters
//                         </span>
//                       </div>
//                       <textarea
//                         name="abstract"
//                         value={formData.abstract}
//                         onChange={handleChange}
//                         rows="5"
//                         placeholder="Summarize the problem, approach, and significance of the project..."
//                         className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                       />
//                     </div>

//                     <div>
//                       <label className="mb-2 block text-sm font-semibold text-slate-700">
//                         Objective
//                       </label>
//                       <textarea
//                         name="objective"
//                         value={formData.objective}
//                         onChange={handleChange}
//                         rows="3"
//                         placeholder="What is the main goal of this research?"
//                         className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                       />
//                     </div>

//                     <div>
//                       <label className="mb-2 block text-sm font-semibold text-slate-700">
//                         Methodology
//                       </label>
//                       <textarea
//                         name="methodology"
//                         value={formData.methodology}
//                         onChange={handleChange}
//                         rows="3"
//                         placeholder="Describe methods, tools, datasets, or experimental approach..."
//                         className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                       />
//                     </div>

//                     <div>
//                       <label className="mb-2 block text-sm font-semibold text-slate-700">
//                         Expected Outcome
//                       </label>
//                       <textarea
//                         name="expectedOutcome"
//                         value={formData.expectedOutcome}
//                         onChange={handleChange}
//                         rows="3"
//                         placeholder="What do you expect the project to achieve or produce?"
//                         className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                       />
//                     </div>
//                   </div>
//                 </section>

//                 <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
//                   <div className="mb-4 flex items-center gap-2">
//                     <Layers3 size={18} className="text-blue-600" />
//                     <h3 className="text-lg font-semibold text-slate-900">
//                       Research Field
//                     </h3>
//                   </div>

//                   <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
//                     {RESEARCH_FIELDS.map((field) => {
//                       const active =
//                         formData.researchField === field ||
//                         (field === "Other" &&
//                           formData.researchField &&
//                           !RESEARCH_FIELDS.includes(formData.researchField));

//                       return (
//                         <button
//                           key={field}
//                           type="button"
//                           onClick={() => handleFieldSelect(field)}
//                           className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
//                             active
//                               ? "border-blue-600 bg-blue-600 text-white shadow-md"
//                               : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
//                           }`}
//                         >
//                           {field}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <div className="mt-4 flex flex-col gap-3 md:flex-row">
//                     <input
//                       type="text"
//                       value={customField}
//                       onChange={(e) => setCustomField(e.target.value)}
//                       placeholder="Custom research field"
//                       className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                     />
//                     <button
//                       type="button"
//                       onClick={handleCustomFieldApply}
//                       className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
//                     >
//                       Apply
//                     </button>
//                   </div>
//                 </section>
//               </div>

//               <div className="space-y-6 md:col-span-5">
//                 <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
//                   <div className="mb-4 flex items-center gap-2">
//                     <Target size={18} className="text-blue-600" />
//                     <h3 className="text-lg font-semibold text-slate-900">
//                       Status & Timeline
//                     </h3>
//                   </div>

//                   <div className="space-y-5">
//                     <div className="space-y-3">
//                       {STATUS_OPTIONS.map((option) => {
//                         const active = formData.status === option.value;

//                         return (
//                           <button
//                             key={option.value}
//                             type="button"
//                             onClick={() =>
//                               setFormData((prev) => ({
//                                 ...prev,
//                                 status: option.value,
//                                 progress:
//                                   option.value === "completed"
//                                     ? Math.max(prev.progress, 100)
//                                     : prev.progress === 100
//                                     ? 75
//                                     : prev.progress,
//                               }))
//                             }
//                             className={`w-full rounded-2xl border p-4 text-left transition ${
//                               active
//                                 ? "border-blue-600 bg-blue-50 ring-4 ring-blue-100"
//                                 : "border-slate-300 bg-white hover:border-blue-300"
//                             }`}
//                           >
//                             <div className="font-semibold text-slate-900">
//                               {option.title}
//                             </div>
//                             <div className="mt-1 text-sm text-slate-500">
//                               {option.description}
//                             </div>
//                           </button>
//                         );
//                       })}
//                     </div>

//                     <div>
//                       <div className="mb-2 flex items-center justify-between">
//                         <label className="block text-sm font-semibold text-slate-700">
//                           Progress
//                         </label>
//                         <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
//                           {formData.progress}%
//                         </span>
//                       </div>

//                       <input
//                         type="range"
//                         name="progress"
//                         min="0"
//                         max="100"
//                         value={formData.progress}
//                         onChange={handleChange}
//                         className="h-2 w-full cursor-pointer rounded-lg bg-slate-200"
//                       />

//                       <input
//                         type="number"
//                         name="progress"
//                         min="0"
//                         max="100"
//                         value={formData.progress}
//                         onChange={handleChange}
//                         className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                       />
//                     </div>

//                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                       <div>
//                         <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
//                           <CalendarDays size={16} />
//                           Start Date
//                         </label>
//                         <input
//                           type="date"
//                           name="startDate"
//                           value={formData.startDate}
//                           onChange={handleChange}
//                           className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                         />
//                       </div>

//                       <div>
//                         <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
//                           <CalendarDays size={16} />
//                           End Date
//                         </label>
//                         <input
//                           type="date"
//                           name="endDate"
//                           value={formData.endDate}
//                           onChange={handleChange}
//                           className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
//                         <Landmark size={16} />
//                         Funding Source
//                       </label>
//                       <input
//                         type="text"
//                         name="fundingSource"
//                         value={formData.fundingSource}
//                         onChange={handleChange}
//                         placeholder="e.g. University Grant, Self-funded, External Sponsor"
//                         className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                       />
//                     </div>
//                   </div>
//                 </section>

//                 <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
//                   <div className="mb-4 flex items-center gap-2">
//                     <Users size={18} className="text-blue-600" />
//                     <h3 className="text-lg font-semibold text-slate-900">
//                       Collaborators
//                     </h3>
//                   </div>

//                   <div className="flex gap-3">
//                     <input
//                       type="text"
//                       value={collaboratorInput}
//                       onChange={(e) => setCollaboratorInput(e.target.value)}
//                       placeholder="Add collaborator name"
//                       className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                     />
//                     <button
//                       type="button"
//                       onClick={addCollaborator}
//                       className="rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
//                     >
//                       Add
//                     </button>
//                   </div>

//                   <TagList
//                     items={collaborators}
//                     onRemove={removeCollaborator}
//                     emptyText="No collaborators added yet"
//                   />
//                 </section>

//                 <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
//                   <div className="mb-4 flex items-center gap-2">
//                     <Tags size={18} className="text-blue-600" />
//                     <h3 className="text-lg font-semibold text-slate-900">
//                       Keywords
//                     </h3>
//                   </div>

//                   <div className="flex gap-3">
//                     <input
//                       type="text"
//                       value={keywordInput}
//                       onChange={(e) => setKeywordInput(e.target.value)}
//                       placeholder="Add keyword"
//                       className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//                     />
//                     <button
//                       type="button"
//                       onClick={addKeyword}
//                       className="rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
//                     >
//                       Add
//                     </button>
//                   </div>

//                   <TagList
//                     items={keywords}
//                     onRemove={removeKeyword}
//                     emptyText="No keywords added yet"
//                   />
//                 </section>

//                 <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50 p-5">
//                   <h3 className="text-lg font-semibold text-slate-900">
//                     Preview
//                   </h3>
//                   <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//                     <div className="mb-3 flex items-center justify-between">
//                       <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
//                         {formData.researchField || "Research Field"}
//                       </span>
//                       <span className="text-sm capitalize text-slate-500">
//                         {formData.status}
//                       </span>
//                     </div>

//                     <h4 className="text-base font-semibold text-slate-900">
//                       {formData.title || "Your project title will appear here"}
//                     </h4>

//                     <p className="mt-2 text-sm leading-6 text-slate-600">
//                       {formData.abstract ||
//                         "A short project summary will appear here."}
//                     </p>

//                     {keywords.length > 0 ? (
//                       <div className="mt-3 flex flex-wrap gap-2">
//                         {keywords.map((item) => (
//                           <span
//                             key={item}
//                             className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
//                           >
//                             {item}
//                           </span>
//                         ))}
//                       </div>
//                     ) : null}

//                     <div className="mt-4">
//                       <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
//                         <span>Progress</span>
//                         <span>{formData.progress}%</span>
//                       </div>
//                       <div className="h-2 rounded-full bg-slate-200">
//                         <div
//                           className="h-2 rounded-full bg-blue-600 transition-all"
//                           style={{ width: `${formData.progress}%` }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </section>
//               </div>
//             </div>
//           </div>

//           <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-8px_20px_rgba(15,23,42,0.04)] md:px-8">
//             <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-end">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="rounded-2xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {loading ? <Loader2 size={18} className="animate-spin" /> : null}
//                 {loading ? "Creating Project..." : "Create Project"}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateProjectModal;

import { useMemo, useState } from "react";
import {
  X,
  FileText,
  Layers3,
  Loader2,
  Sparkles,
  Target,
  Users,
  Tags,
  CalendarDays,
  Landmark,
} from "lucide-react";
import api from "../lib/api";

const RESEARCH_FIELDS = [
  "Artificial Intelligence",
  "Data Science",
  "Cybersecurity",
  "Bioinformatics",
  "Networking",
  "Machine Learning",
  "Robotics",
  "Software Engineering",
  "Other",
];

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    researchField: "",
    status: "ongoing",
    objective: "",
    methodology: "",
    expectedOutcome: "",
    fundingSource: "",
    startDate: "",
    endDate: "",
  });

  const [customField, setCustomField] = useState("");
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);

  const abstractCount = useMemo(
    () => formData.abstract.trim().length,
    [formData.abstract]
  );

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFieldSelect = (field) => {
    if (field === "Other") {
      setFormData((prev) => ({
        ...prev,
        researchField: customField.trim() || "Other",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      researchField: field,
    }));
  };

  const handleCustomFieldApply = () => {
    if (!customField.trim()) return;

    setFormData((prev) => ({
      ...prev,
      researchField: customField.trim(),
    }));
  };

  const addCollaborator = () => {
    const value = collaboratorInput.trim();
    if (!value || collaborators.includes(value)) return;
    setCollaborators((prev) => [...prev, value]);
    setCollaboratorInput("");
  };

  const removeCollaborator = (value) => {
    setCollaborators((prev) => prev.filter((item) => item !== value));
  };

  const addKeyword = () => {
    const value = keywordInput.trim();
    if (!value || keywords.includes(value)) return;
    setKeywords((prev) => [...prev, value]);
    setKeywordInput("");
  };

  const removeKeyword = (value) => {
    setKeywords((prev) => prev.filter((item) => item !== value));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      abstract: "",
      researchField: "",
      status: "ongoing",
      objective: "",
      methodology: "",
      expectedOutcome: "",
      fundingSource: "",
      startDate: "",
      endDate: "",
    });
    setCustomField("");
    setCollaboratorInput("");
    setKeywordInput("");
    setCollaborators([]);
    setKeywords([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("researchConnectToken");
    if (!token) {
      alert("You must be logged in to create a project");
      return;
    }

    if (!formData.title.trim()) {
      alert("Project title is required");
      return;
    }

    if (!formData.abstract.trim()) {
      alert("Abstract is required");
      return;
    }

    if (!formData.researchField.trim()) {
      alert("Please select or enter a research field");
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      alert("End date must be after start date");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        researchField: formData.researchField.trim(),
        status: "ongoing",
        objective: formData.objective.trim(),
        methodology: formData.methodology.trim(),
        expectedOutcome: formData.expectedOutcome.trim(),
        fundingSource: formData.fundingSource.trim(),
        collaborators,
        keywords,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      const res = await api.post("/projects", payload);

      resetForm();
      onProjectCreated?.(res.data.project);
      onClose();
    } catch (error) {
      console.error("Create project error:", error.response?.data || error.message);

      if (error.response?.status === 401) {
        alert("Your session has expired or you are not logged in. Please log in again.");
        return;
      }

      alert(error.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const TagList = ({ items, onRemove, emptyText }) => (
    <div className="mt-3 flex min-h-[44px] flex-wrap gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-3">
      {items.length === 0 ? (
        <span className="text-sm text-slate-400">{emptyText}</span>
      ) : (
        items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="text-blue-700 hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="shrink-0 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 px-6 py-5 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-blue-700 shadow-sm">
                <Sparkles size={16} />
                Research Project Workspace
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Create New Project
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
                Build a complete project entry with academic context,
                collaborators, timeline, methods, and expected impact.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-8">
            <div className="grid gap-8 md:grid-cols-12">
              <div className="space-y-6 md:col-span-7">
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Core Information
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Project Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Deep Learning for Medical Imaging"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-700">
                          Abstract <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-xs text-slate-500">
                          {abstractCount} characters
                        </span>
                      </div>
                      <textarea
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleChange}
                        rows="5"
                        placeholder="Summarize the problem, approach, and significance of the project..."
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Objective
                      </label>
                      <textarea
                        name="objective"
                        value={formData.objective}
                        onChange={handleChange}
                        rows="3"
                        placeholder="What is the main goal of this research?"
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Methodology
                      </label>
                      <textarea
                        name="methodology"
                        value={formData.methodology}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describe methods, tools, datasets, or experimental approach..."
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Expected Outcome
                      </label>
                      <textarea
                        name="expectedOutcome"
                        value={formData.expectedOutcome}
                        onChange={handleChange}
                        rows="3"
                        placeholder="What do you expect the project to achieve or produce?"
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Layers3 size={18} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Research Field
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {RESEARCH_FIELDS.map((field) => {
                      const active =
                        formData.researchField === field ||
                        (field === "Other" &&
                          formData.researchField &&
                          !RESEARCH_FIELDS.includes(formData.researchField));

                      return (
                        <button
                          key={field}
                          type="button"
                          onClick={() => handleFieldSelect(field)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                            active
                              ? "border-blue-600 bg-blue-600 text-white shadow-md"
                              : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          {field}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row">
                    <input
                      type="text"
                      value={customField}
                      onChange={(e) => setCustomField(e.target.value)}
                      placeholder="Custom research field"
                      className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={handleCustomFieldApply}
                      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Apply
                    </button>
                  </div>
                </section>
              </div>

              <div className="space-y-6 md:col-span-5">
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Target size={18} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Timeline & Funding
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <div className="font-semibold text-slate-900">
                        Project progress is automatic
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Progress will start at 0% and update automatically as milestones are completed.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <CalendarDays size={16} />
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <CalendarDays size={16} />
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Landmark size={16} />
                        Funding Source
                      </label>
                      <input
                        type="text"
                        name="fundingSource"
                        value={formData.fundingSource}
                        onChange={handleChange}
                        placeholder="e.g. University Grant, Self-funded, External Sponsor"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Users size={18} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Collaborators
                    </h3>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={collaboratorInput}
                      onChange={(e) => setCollaboratorInput(e.target.value)}
                      placeholder="Add collaborator name"
                      className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={addCollaborator}
                      className="rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>

                  <TagList
                    items={collaborators}
                    onRemove={removeCollaborator}
                    emptyText="No collaborators added yet"
                  />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Tags size={18} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Keywords
                    </h3>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keyword"
                      className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
                    >
                      Add
                    </button>
                  </div>

                  <TagList
                    items={keywords}
                    onRemove={removeKeyword}
                    emptyText="No keywords added yet"
                  />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Preview
                  </h3>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {formData.researchField || "Research Field"}
                      </span>
                      <span className="text-sm capitalize text-slate-500">
                        ongoing
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-slate-900">
                      {formData.title || "Your project title will appear here"}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {formData.abstract ||
                        "A short project summary will appear here."}
                    </p>

                    {keywords.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {keywords.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                      Progress will be calculated automatically from completed milestones.
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-8px_20px_rgba(15,23,42,0.04)] md:px-8">
            <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? "Creating Project..." : "Create Project"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;