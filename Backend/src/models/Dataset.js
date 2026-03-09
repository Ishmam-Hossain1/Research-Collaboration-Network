import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        // Category tags e.g. ["biology", "machine-learning"]
        tags: {
            type: [String],
            default: [],
        },

        // GridFS file reference (in the "datasets" bucket)
        fileId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        fileName: {
            type: String,
            required: true,
        },

        fileSize: {
            type: Number, // bytes
            default: 0,
        },

        mimeType: {
            type: String,
            default: "application/octet-stream",
        },

        // User who uploaded this dataset
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Access control level
        accessControl: {
            type: String,
            enum: ["public", "private", "restricted"],
            default: "public",
        },

        // Only relevant when accessControl === "restricted"
        allowedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

const Dataset = mongoose.model("Dataset", datasetSchema);

export default Dataset;
