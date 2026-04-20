import mongoose from "mongoose";
import Resource from "../models/Resource.js";

export const createResource = async (req, res) => {
  try {
    const { title, category, description, link, createdBy } = req.body;

    if (!title || !category || !description || !link || !createdBy) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({ message: "Invalid creator id" });
    }

    const resource = await Resource.create({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      link: link.trim(),
      createdBy,
    });

    await resource.populate("createdBy", "username email");

    res.status(201).json({
      message: "Resource created successfully",
      resource,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating resource",
      error: error.message,
    });
  }
};

export const getAllResources = async (req, res) => {
  try {
    const { bookmarkedBy } = req.query;

    let query = {};

    if (bookmarkedBy && mongoose.Types.ObjectId.isValid(bookmarkedBy)) {
      query.bookmarks = bookmarkedBy;
    }

    const resources = await Resource.find(query)
      .populate("createdBy", "username email")
      .populate("bookmarks", "username email")
      .populate("ratings.user", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching resources",
      error: error.message,
    });
  }
};

export const getResourceById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid resource id" });
    }

    const resource = await Resource.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("bookmarks", "username email")
      .populate("ratings.user", "username email");

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching resource",
      error: error.message,
    });
  }
};

export const searchResources = async (req, res) => {
  try {
    const { keyword, category, sort } = req.query;

    const query = {};

    if (keyword?.trim()) {
      query.$or = [
        { title: { $regex: keyword.trim(), $options: "i" } },
        { category: { $regex: keyword.trim(), $options: "i" } },
        { description: { $regex: keyword.trim(), $options: "i" } },
      ];
    }

    if (category?.trim()) {
      query.category = category.trim();
    }

    let sortOption = { createdAt: -1 };
    if (sort === "rating") {
      sortOption = { averageRating: -1, createdAt: -1 };
    }

    const resources = await Resource.find(query)
      .populate("createdBy", "username email")
      .populate("bookmarks", "username email")
      .populate("ratings.user", "username email")
      .sort(sortOption);

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({
      message: "Error searching resources",
      error: error.message,
    });
  }
};

export const bookmarkResource = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid resource id" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId is required" });
    }

    const resource = await Resource.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("bookmarks", "username email")
      .populate("ratings.user", "username email");

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const existingIndex = resource.bookmarks.findIndex(
      (bookmarkUser) => bookmarkUser._id.toString() === userId
    );

    if (existingIndex >= 0) {
      resource.bookmarks.splice(existingIndex, 1);
    } else {
      resource.bookmarks.push(userId);
    }

    await resource.save();
    await resource.populate("bookmarks", "username email");

    res.status(200).json({
      message: "Bookmark updated successfully",
      resource,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error bookmarking resource",
      error: error.message,
    });
  }
};

export const rateResource = async (req, res) => {
  try {
    const { userId, value } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid resource id" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId is required" });
    }

    if (!value || Number(value) < 1 || Number(value) > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const resource = await Resource.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("bookmarks", "username email")
      .populate("ratings.user", "username email");

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const existingRating = resource.ratings.find((rating) => {
      if (rating.user?._id) return rating.user._id.toString() === userId;
      return rating.user.toString() === userId;
    });

    if (existingRating) {
      existingRating.value = Number(value);
    } else {
      resource.ratings.push({ user: userId, value: Number(value) });
    }

    const total = resource.ratings.reduce((sum, rating) => sum + rating.value, 0);
    resource.averageRating = total / resource.ratings.length;

    await resource.save();
    await resource.populate("ratings.user", "username email");

    res.status(200).json({
      message: "Resource rated successfully",
      resource,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error rating resource",
      error: error.message,
    });
  }
};

export const seedResources = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId required" });
    }

    const resources = [
      {
        title: "Google Scholar",
        category: "Journal Database",
        description: "Search engine for scholarly literature across disciplines.",
        link: "https://scholar.google.com/",
        createdBy: userId,
      },
      {
        title: "Semantic Scholar",
        category: "Journal Database",
        description: "AI-powered academic search engine.",
        link: "https://www.semanticscholar.org/",
        createdBy: userId,
      },
      {
        title: "Zotero",
        category: "Reference Manager",
        description: "Free tool to collect, organize, cite research.",
        link: "https://www.zotero.org/",
        createdBy: userId,
      },
      {
        title: "Mendeley",
        category: "Reference Manager",
        description: "Manage and share research papers.",
        link: "https://www.mendeley.com/",
        createdBy: userId,
      },
      {
        title: "EndNote",
        category: "Reference Manager",
        description: "Reference manager for academic writing.",
        link: "https://endnote.com/",
        createdBy: userId,
      },
      {
        title: "Turnitin",
        category: "Plagiarism Checker",
        description: "Academic integrity and plagiarism detection.",
        link: "https://www.turnitin.com/",
        createdBy: userId,
      },
      {
        title: "Grammarly Plagiarism Checker",
        category: "Plagiarism Checker",
        description: "Checks plagiarism and improves writing.",
        link: "https://www.grammarly.com/",
        createdBy: userId,
      },
      {
        title: "OpenAthens",
        category: "Institutional Access Service",
        description: "Secure access to institutional research resources.",
        link: "https://www.openathens.net/",
        createdBy: userId,
      },
      {
        title: "Crossref",
        category: "Academic Tool",
        description: "Metadata and DOI lookup tool.",
        link: "https://www.crossref.org/",
        createdBy: userId,
      },
      {
        title: "ResearchGate",
        category: "Academic Tool",
        description: "Network for researchers to share papers.",
        link: "https://www.researchgate.net/",
        createdBy: userId,
      },
    ];

    const inserted = await Resource.insertMany(resources);

    res.status(201).json({
      message: "Resources seeded successfully",
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error seeding resources",
      error: error.message,
    });
  }
};