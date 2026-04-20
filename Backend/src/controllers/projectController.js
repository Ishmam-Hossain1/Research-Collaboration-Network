import mongoose from "mongoose";
import Project from "../models/Project.js";
import Milestone from "../models/Milestone.js";

const buildSortOption = (sort) => {
  let sortOption = { createdAt: -1 };

  if (sort === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sort === "title_asc") {
    sortOption = { title: 1 };
  } else if (sort === "title_desc") {
    sortOption = { title: -1 };
  } else if (sort === "progress_high") {
    sortOption = { progress: -1 };
  } else if (sort === "progress_low") {
    sortOption = { progress: 1 };
  }

  return sortOption;
};

const normalizeArrayField = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const buildDefaultResearchMilestones = (projectStartDate) => {
  const baseDate = projectStartDate ? new Date(projectStartDate) : new Date();

  const roadmap = [
    {
      title: "Title",
      description: "Finalize the research paper title",
      order: 0,
      offsetStart: 0,
      offsetDeadline: 2,
    },
    {
      title: "Abstract",
      description: "Write the research abstract",
      order: 1,
      offsetStart: 2,
      offsetDeadline: 5,
    },
    {
      title: "Introduction",
      description: "Write the introduction and problem statement",
      order: 2,
      offsetStart: 5,
      offsetDeadline: 9,
    },
    {
      title: "Literature Review",
      description: "Review related work and identify research gaps",
      order: 3,
      offsetStart: 9,
      offsetDeadline: 16,
    },
    {
      title: "Methodology",
      description: "Define methods, tools, and research design",
      order: 4,
      offsetStart: 16,
      offsetDeadline: 22,
    },
    {
      title: "Data Collection",
      description: "Collect data or conduct experiments",
      order: 5,
      offsetStart: 22,
      offsetDeadline: 30,
    },
    {
      title: "Data Analysis",
      description: "Analyze findings and interpret data",
      order: 6,
      offsetStart: 30,
      offsetDeadline: 37,
    },
    {
      title: "Results",
      description: "Write the results section",
      order: 7,
      offsetStart: 37,
      offsetDeadline: 43,
    },
    {
      title: "Discussion",
      description: "Discuss findings and compare with literature",
      order: 8,
      offsetStart: 43,
      offsetDeadline: 49,
    },
    {
      title: "Conclusion",
      description: "Summarize the work and final contribution",
      order: 9,
      offsetStart: 49,
      offsetDeadline: 53,
    },
    {
      title: "References",
      description: "Complete citations and references",
      order: 10,
      offsetStart: 53,
      offsetDeadline: 56,
    },
  ];

  return roadmap.map((m) => ({
    title: m.title,
    description: m.description,
    status: "Pending",
    order: m.order,
    isDefault: true,
    weight: 1,
    startDate: addDays(baseDate, m.offsetStart),
    deadline: addDays(baseDate, m.offsetDeadline),
    subtasks: [],
  }));
};

// CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const {
      title,
      abstract,
      researchField,
      status,
      progress,
      objective,
      methodology,
      expectedOutcome,
      fundingSource,
      collaborators,
      keywords,
      startDate,
      endDate,
    } = req.body;

    if (!title || !abstract || !researchField) {
      return res.status(400).json({
        message: "title, abstract, and researchField are required",
      });
    }

    if (status && !["ongoing", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either ongoing or completed",
      });
    }

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({
        message: "Progress must be between 0 and 100",
      });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const newProject = await Project.create({
      title: title.trim(),
      abstract: abstract.trim(),
      researchField: researchField.trim(),
      status: status || "ongoing",
      progress: 0,
      progress: progress ?? 0,
      objective: objective?.trim() || "",
      methodology: methodology?.trim() || "",
      expectedOutcome: expectedOutcome?.trim() || "",
      fundingSource: fundingSource?.trim() || "",
      collaborators: normalizeArrayField(collaborators),
      keywords: normalizeArrayField(keywords),
      startDate: startDate || null,
      endDate: endDate || null,
      owner: req.user._id,
    });

    const defaultMilestones = buildDefaultResearchMilestones(startDate);

    const milestonesToInsert = defaultMilestones.map((m) => ({
      projectId: newProject._id,
      ...m,
    }));

    await Milestone.insertMany(milestonesToInsert);

    const populatedProject = await Project.findById(newProject._id).populate(
      "owner",
      "username email"
    );

    res.status(201).json({

      message: "Project created successfully with default research milestones",
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PROJECTS
export const getAllProjects = async (req, res) => {
  try {
    const { search, field, status, sort } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { abstract: { $regex: search, $options: "i" } },
        { researchField: { $regex: search, $options: "i" } },
        { keywords: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    if (field) query.researchField = field;
    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate("owner", "username email")
      .sort(buildSortOption(sort));

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY PROJECTS
export const getMyProjects = async (req, res) => {
  try {
    const { search, field, status, sort } = req.query;

    const query = { owner: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { abstract: { $regex: search, $options: "i" } },
        { researchField: { $regex: search, $options: "i" } },
        { keywords: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    if (field) query.researchField = field;
    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate("owner", "username email")
      .sort(buildSortOption(sort));

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE PROJECT
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const project = await Project.findById(id).populate(
      "owner",
      "username email"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROJECTS OF A SPECIFIC USER
export const getProjectsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { search, field, status, sort } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const query = { owner: userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { abstract: { $regex: search, $options: "i" } },
        { researchField: { $regex: search, $options: "i" } },
        { keywords: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    if (field) query.researchField = field;
    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate("owner", "username email")
      .sort(buildSortOption(sort));

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROJECT
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      abstract,
      researchField,
      status,
      progress,
      objective,
      methodology,
      expectedOutcome,
      fundingSource,
      collaborators,
      keywords,
      startDate,
      endDate,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    if (status && !["ongoing", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either ongoing or completed",
      });
    }

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({
        message: "Progress must be between 0 and 100",
      });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this project",
      });
    }

    if (title !== undefined) project.title = title.trim();
    if (abstract !== undefined) project.abstract = abstract.trim();
    if (researchField !== undefined) project.researchField = researchField.trim();
    if (status !== undefined) project.status = status;


    if (progress !== undefined) project.progress = progress;

    if (objective !== undefined) project.objective = objective.trim();
    if (methodology !== undefined) project.methodology = methodology.trim();
    if (expectedOutcome !== undefined) project.expectedOutcome = expectedOutcome.trim();
    if (fundingSource !== undefined) project.fundingSource = fundingSource.trim();

    if (collaborators !== undefined) {
      project.collaborators = normalizeArrayField(collaborators);
    }

    if (keywords !== undefined) {
      project.keywords = normalizeArrayField(keywords);
    }

    if (startDate !== undefined) project.startDate = startDate || null;
    if (endDate !== undefined) project.endDate = endDate || null;

    const updatedProject = await project.save();
    const populatedProject = await Project.findById(updatedProject._id).populate(
      "owner",
      "username email"
    );

    res.status(200).json({
      message: "Project updated successfully",
      project: populatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PROJECT
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this project",
      });
    }


    await Milestone.deleteMany({ projectId: id });
    await Project.findByIdAndDelete(id);

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET DASHBOARD STATS FOR ONE USER
export const getProjectStatsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const projects = await Project.find({ owner: userId });

    const totalProjects = projects.length;
    const ongoingProjects = projects.filter(
      (project) => project.status === "ongoing"
    ).length;
    const completedProjects = projects.filter(
      (project) => project.status === "completed"
    ).length;
    const researchFields = new Set(
      projects.map((project) => project.researchField)
    ).size;

    res.status(200).json({
      totalProjects,
      ongoingProjects,
      completedProjects,
      researchFields,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY DASHBOARD STATS
export const getMyProjectStats = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id });

    const totalProjects = projects.length;
    const ongoingProjects = projects.filter(
      (project) => project.status === "ongoing"
    ).length;
    const completedProjects = projects.filter(
      (project) => project.status === "completed"
    ).length;
    const researchFields = new Set(
      projects.map((project) => project.researchField)
    ).size;

    res.status(200).json({
      totalProjects,
      ongoingProjects,
      completedProjects,
      researchFields,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};