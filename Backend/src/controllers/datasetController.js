import fs from "fs";
import mongoose from "mongoose";
import Dataset from "../models/Dataset.js";
import User from "../models/User.js";
import { getDatasetsBucket } from "../config/gridfs.js";

// Helper: check if a user has access to a dataset
const hasAccess = (dataset, user) => {
    if (dataset.accessControl === "public") return true;
    if (!user) return false;
    const ownerId = dataset.uploadedBy._id?.toString() || dataset.uploadedBy.toString();
    if (ownerId === user._id.toString()) return true;
    if (dataset.accessControl === "restricted") {
        return dataset.allowedUsers.some(
            (uid) => uid.toString() === user._id.toString()
        );
    }
    // private — only owner
    return false;
};

// POST /api/datasets
export const uploadDataset = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { title, description, tags, accessControl, allowedUsers } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        // Parse tags: support comma-separated string or JSON array
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = JSON.parse(tags);
            } catch {
                parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
            }
        }

        // Parse allowedEmails: array of email strings
        let parsedAllowedEmails = [];
        if (allowedUsers) {
            try {
                parsedAllowedEmails = JSON.parse(allowedUsers);
            } catch {
                parsedAllowedEmails = [];
            }
        }

        let finalAllowedUsers = [];
        if (accessControl === "restricted" && parsedAllowedEmails.length > 0) {
            // Find all users matching these emails
            const foundUsers = await User.find({ email: { $in: parsedAllowedEmails } });

            // Validation: Ensure all requested emails are registered
            if (foundUsers.length !== parsedAllowedEmails.length) {
                const foundEmails = foundUsers.map(u => u.email);
                const missingEmails = parsedAllowedEmails.filter(e => !foundEmails.includes(e));
                return res.status(400).json({
                    message: `The following email(s) are not registered users: ${missingEmails.join(", ")}`
                });
            }
            finalAllowedUsers = foundUsers.map(u => u._id);
        }

        const gfsBucket = getDatasetsBucket();

        // Stream temp file → GridFS
        const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
            contentType: req.file.mimetype,
        });

        const readStream = fs.createReadStream(req.file.path);

        await new Promise((resolve, reject) => {
            readStream.pipe(uploadStream).on("error", reject).on("finish", resolve);
        });

        // Clean up temp file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const dataset = await Dataset.create({
            title,
            description: description || "",
            tags: parsedTags,
            fileId: uploadStream.id,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadedBy: req.user._id,
            accessControl: accessControl || "public",
            allowedUsers: finalAllowedUsers,
        });

        await dataset.populate("uploadedBy", "username email");

        res.status(201).json({
            message: "Dataset uploaded successfully",
            dataset,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/datasets
export const getAllDatasets = async (req, res) => {
    try {
        const datasets = await Dataset.find()
            .populate("uploadedBy", "username email")
            .populate("allowedUsers", "username email")
            .sort({ createdAt: -1 });

        // Filter based on access control
        const accessible = datasets.filter((ds) => hasAccess(ds, req.user));

        res.status(200).json({ datasets: accessible });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/datasets/:id/download
export const downloadDataset = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid dataset ID" });
        }

        const dataset = await Dataset.findById(id).populate("uploadedBy", "username email");

        if (!dataset) {
            return res.status(404).json({ message: "Dataset not found" });
        }

        if (!hasAccess(dataset, req.user)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const gfsBucket = getDatasetsBucket();

        const fileId = new mongoose.Types.ObjectId(dataset.fileId);

        // Verify file exists in GridFS
        const files = await mongoose.connection.db
            .collection("datasets.files")
            .find({ _id: fileId })
            .toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ message: "File not found in storage" });
        }

        res.set("Content-Type", dataset.mimeType || "application/octet-stream");
        res.set(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(dataset.fileName)}"`
        );

        const downloadStream = gfsBucket.openDownloadStream(fileId);
        downloadStream.on("error", () => {
            res.status(500).json({ message: "Error reading file" });
        });
        downloadStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/datasets/:id
export const editDataset = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tags, accessControl, allowedUsers } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid dataset ID" });
        }

        const dataset = await Dataset.findById(id);

        if (!dataset) {
            return res.status(404).json({ message: "Dataset not found" });
        }

        // Only the owner can edit
        if (dataset.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this dataset" });
        }

        // Parse tags
        let parsedTags = dataset.tags;
        if (tags !== undefined) {
            if (typeof tags === 'string') {
                try {
                    parsedTags = JSON.parse(tags);
                } catch {
                    parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
                }
            } else if (Array.isArray(tags)) {
                parsedTags = tags;
            }
        }

        // Parse allowedEmails from the request
        let parsedAllowedEmails = [];
        if (allowedUsers !== undefined) {
            if (typeof allowedUsers === 'string') {
                try {
                    parsedAllowedEmails = JSON.parse(allowedUsers);
                } catch {
                    parsedAllowedEmails = [];
                }
            } else if (Array.isArray(allowedUsers)) {
                parsedAllowedEmails = allowedUsers;
            }
        }

        let finalAllowedUsers = dataset.allowedUsers;
        if (accessControl === "restricted" || (dataset.accessControl === "restricted" && allowedUsers !== undefined)) {
            if (parsedAllowedEmails.length > 0) {
                const foundUsers = await User.find({ email: { $in: parsedAllowedEmails } });

                if (foundUsers.length !== parsedAllowedEmails.length) {
                    const foundEmails = foundUsers.map(u => u.email);
                    const missingEmails = parsedAllowedEmails.filter(e => !foundEmails.includes(e));
                    return res.status(400).json({
                        message: `The following email(s) are not registered users: ${missingEmails.join(", ")}`
                    });
                }
                finalAllowedUsers = foundUsers.map(u => u._id);
            } else {
                finalAllowedUsers = [];
            }
        }

        dataset.title = title || dataset.title;
        dataset.description = description !== undefined ? description : dataset.description;
        dataset.tags = parsedTags;
        dataset.accessControl = accessControl || dataset.accessControl;
        dataset.allowedUsers = finalAllowedUsers;

        await dataset.save();
        await dataset.populate("uploadedBy", "username email");
        await dataset.populate("allowedUsers", "username email");

        res.status(200).json({
            message: "Dataset updated successfully",
            dataset,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/datasets/:id
export const deleteDataset = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid dataset ID" });
        }

        const dataset = await Dataset.findById(id);

        if (!dataset) {
            return res.status(404).json({ message: "Dataset not found" });
        }

        // Only the owner can delete
        if (dataset.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this dataset" });
        }

        const gfsBucket = getDatasetsBucket();

        // Delete GridFS file
        try {
            await gfsBucket.delete(new mongoose.Types.ObjectId(dataset.fileId));
        } catch {
            // File may already be gone; continue with DB deletion
        }

        await Dataset.findByIdAndDelete(id);

        res.status(200).json({ message: "Dataset deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
