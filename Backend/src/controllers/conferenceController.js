import Conference from "../models/Conference.js";

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) => String(tag).trim())
    .filter(Boolean);
};

const parseDateOrNull = (value) => {
  if (!value) return null;
  return value;
};

export const createConference = async (req, res) => {
  try {
    const {
      title,
      acronym,
      field,
      location,
      website,
      startDate,
      endDate,
      submissionDeadline,
      acceptanceDate,
      cameraReadyDeadline,
      description,
      organizer,
      tags,
      mode,
    } = req.body;

    if (!title || !field || !startDate || !endDate) {
      return res.status(400).json({
        message: "title, field, startDate, and endDate are required",
      });
    }

    const conference = await Conference.create({
      title: title.trim(),
      acronym: acronym?.trim() || "",
      field: field.trim(),
      location: location?.trim() || "Online",
      website: website?.trim() || "",

      startDate,
      endDate,
      submissionDeadline: parseDateOrNull(submissionDeadline),
      acceptanceDate: parseDateOrNull(acceptanceDate),
      cameraReadyDeadline: parseDateOrNull(cameraReadyDeadline),

      description: description?.trim() || "",
      organizer: organizer?.trim() || "",
      tags: normalizeTags(tags),
      mode: mode || "Online",

      addedBy: req.user?._id,
    });

    res.status(201).json({
      message: "Conference created successfully",
      conference,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to create conference",
    });
  }
};

export const getConferences = async (req, res) => {
  try {
    const {
      search,
      field,
      upcoming,
      mode,
      deadlineSoon,
      tag,
      sort = "startDate",
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { acronym: { $regex: search, $options: "i" } },
        { field: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { organizer: { $regex: search, $options: "i" } },
        { tags: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    if (field) {
      query.field = field;
    }

    if (mode) {
      query.mode = mode;
    }

    if (tag) {
      query.tags = { $elemMatch: { $regex: tag, $options: "i" } };
    }

    if (upcoming === "true") {
      query.startDate = { $gte: new Date() };
    }

    if (deadlineSoon === "true") {
      const today = new Date();
      const nextTwoWeeks = new Date();
      nextTwoWeeks.setDate(today.getDate() + 14);

      query.submissionDeadline = {
        $gte: today,
        $lte: nextTwoWeeks,
      };
    }

    let sortOption = { startDate: 1 };

    if (sort === "deadline") {
      sortOption = { submissionDeadline: 1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const conferences = await Conference.find(query)
      .populate("addedBy", "username email")
      .sort(sortOption);

    res.status(200).json(conferences);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch conferences",
    });
  }
};

export const getConferenceById = async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.id).populate(
      "addedBy",
      "username email"
    );

    if (!conference) {
      return res.status(404).json({ message: "Conference not found" });
    }

    res.status(200).json(conference);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch conference",
    });
  }
};

export const updateConference = async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.id);

    if (!conference) {
      return res.status(404).json({ message: "Conference not found" });
    }

    const {
      title,
      acronym,
      field,
      location,
      website,
      startDate,
      endDate,
      submissionDeadline,
      acceptanceDate,
      cameraReadyDeadline,
      description,
      organizer,
      tags,
      mode,
    } = req.body;

    if (title !== undefined) conference.title = title.trim();
    if (acronym !== undefined) conference.acronym = acronym.trim();
    if (field !== undefined) conference.field = field.trim();
    if (location !== undefined) conference.location = location.trim();
    if (website !== undefined) conference.website = website.trim();

    if (startDate !== undefined) conference.startDate = startDate;
    if (endDate !== undefined) conference.endDate = endDate;
    if (submissionDeadline !== undefined) {
      conference.submissionDeadline = parseDateOrNull(submissionDeadline);
    }
    if (acceptanceDate !== undefined) {
      conference.acceptanceDate = parseDateOrNull(acceptanceDate);
    }
    if (cameraReadyDeadline !== undefined) {
      conference.cameraReadyDeadline = parseDateOrNull(cameraReadyDeadline);
    }

    if (description !== undefined) conference.description = description.trim();
    if (organizer !== undefined) conference.organizer = organizer.trim();
    if (tags !== undefined) conference.tags = normalizeTags(tags);
    if (mode !== undefined) conference.mode = mode;

    const updatedConference = await conference.save();

    res.status(200).json({
      message: "Conference updated successfully",
      conference: updatedConference,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to update conference",
    });
  }
};

export const deleteConference = async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.id);

    if (!conference) {
      return res.status(404).json({ message: "Conference not found" });
    }

    await conference.deleteOne();

    res.status(200).json({
      message: "Conference deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to delete conference",
    });
  }
};