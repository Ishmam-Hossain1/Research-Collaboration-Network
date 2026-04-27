import User from "../models/User.js";
import Project from "../models/Project.js";
import Dataset from "../models/Dataset.js";
import Milestone from "../models/Milestone.js";
import FundingOpportunity from "../models/FundingOpportunity.js";
import Resource from "../models/Resource.js";

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "openai/gpt-oss-20b";

const formatList = (items, formatter, emptyText = "None") => {
  if (!items || items.length === 0) return emptyText;
  return items.map(formatter).join("\n");
};

export const askAIChatbot = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ message: "HF_TOKEN is missing" });
    }

    const userId = req.user._id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("collaborators", "username email researchInterests skills")
      .populate("requestedCollaborations", "username email researchInterests skills")
      .populate("sentCollaborations", "username email researchInterests skills");

    const projects = await Project.find({ owner: userId })
      .sort({ updatedAt: -1 })
      .limit(8);

    const projectIds = projects.map((project) => project._id);

    const milestones = await Milestone.find({
      projectId: { $in: projectIds },
    })
      .sort({ deadline: 1, createdAt: -1 })
      .limit(20);

    const datasets = await Dataset.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .limit(8);

    const fundingOpportunities = await FundingOpportunity.find()
      .populate("postedBy", "username email")
      .sort({ createdAt: -1 })
      .limit(8);

    const resources = await Resource.find()
      .populate("createdBy", "username email")
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(8);

    const websiteContext = `
You are ResearchConnect AI, a context-aware assistant inside a research collaboration platform.

Website overview:
ResearchConnect helps researchers:
- create and manage research projects
- track milestones and progress
- upload and manage datasets
- find researchers and collaborators
- send and accept collaboration requests
- view funding opportunities
- browse academic resources
- use real-time messaging
- get AI suggested collaborators

Your rules:
- Be helpful, clear, and practical.
- Guide the user based on the website features.
- Use the user's actual available data when relevant.
- If data is missing, tell the user what they need to add.
- Do not claim you performed actions like creating, deleting, or updating unless the system actually supports it.
- You are currently read-only. You can guide, suggest, explain, summarize, and recommend next steps.
- Keep answers concise unless the user asks for details.
- If the user asks how to use the website, give step-by-step guidance.
- If the user asks about their projects, milestones, datasets, profile, funding, resources, or collaborators, use the context below.

Current logged-in user:
- Username: ${user?.username || "Unknown"}
- Email: ${user?.email || "Unknown"}
- About me: ${user?.aboutMe || "Not provided"}
- Research interests: ${
      user?.researchInterests?.length ? user.researchInterests.join(", ") : "None"
    }
- Skills: ${user?.skills?.length ? user.skills.join(", ") : "None"}
- Relationship status: ${user?.relationshipStatus || "Not provided"}

Collaborators:
${formatList(
  user?.collaborators,
  (c) =>
    `- ${c.username} (${c.email}) | Interests: ${
      c.researchInterests?.join(", ") || "None"
    } | Skills: ${c.skills?.join(", ") || "None"}`
)}

Incoming collaboration requests:
${formatList(
  user?.requestedCollaborations,
  (c) =>
    `- ${c.username} (${c.email}) | Interests: ${
      c.researchInterests?.join(", ") || "None"
    } | Skills: ${c.skills?.join(", ") || "None"}`
)}

Sent collaboration requests:
${formatList(
  user?.sentCollaborations,
  (c) =>
    `- ${c.username} (${c.email}) | Interests: ${
      c.researchInterests?.join(", ") || "None"
    } | Skills: ${c.skills?.join(", ") || "None"}`
)}

User projects:
${formatList(
  projects,
  (p) =>
    `- ${p.title} | Field: ${p.researchField} | Status: ${p.status} | Progress: ${p.progress}% | Keywords: ${
      p.keywords?.join(", ") || "None"
    } | Start: ${p.startDate ? new Date(p.startDate).toDateString() : "Not set"} | End: ${
      p.endDate ? new Date(p.endDate).toDateString() : "Not set"
    }`
)}

User project milestones:
${formatList(
  milestones,
  (m) =>
    `- ${m.title} | Status: ${m.status} | Project ID: ${m.projectId} | Deadline: ${
      m.deadline ? new Date(m.deadline).toDateString() : "Not set"
    } | Subtasks: ${
      m.subtasks?.length
        ? m.subtasks
            .map((s) => `${s.title} (${s.completed ? "done" : "not done"})`)
            .join(", ")
        : "None"
    }`
)}

User datasets:
${formatList(
  datasets,
  (d) =>
    `- ${d.title} | Access: ${d.accessControl} | File: ${d.fileName} | Tags: ${
      d.tags?.join(", ") || "None"
    }`
)}

Recent funding opportunities:
${formatList(
  fundingOpportunities,
  (f) =>
    `- ${f.grantTitle} | Amount: ${f.fundingAmount} | Deadline: ${
      f.deadline ? new Date(f.deadline).toDateString() : "Not set"
    } | Eligibility: ${f.eligibilityCriteria}`
)}

Top academic resources:
${formatList(
  resources,
  (r) =>
    `- ${r.title} | Category: ${r.category} | Rating: ${r.averageRating || 0} | Description: ${r.description}`
)}
`;

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string"
          )
          .slice(-10)
      : [];

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        stream: false,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: websiteContext,
          },
          ...safeHistory,
          {
            role: "user",
            content: message.trim(),
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "AI request failed");
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("AI Chatbot Error:", error);
    res.status(500).json({ message: error.message });
  }
};