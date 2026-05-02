import fs from "fs";
import mongoose from "mongoose";
import Dataset from "../models/Dataset.js";
import User from "../models/User.js";
import { getDatasetsBucket } from "../config/gridfs.js";

// Helper: check if a user has access to a dataset
const hasAccess = (dataset, user) => {
    // If it's public, everyone can see it
    if (dataset.accessControl === "public") return true;
    
    // Safety check for uploader
    if (!dataset.uploadedBy) return false;

    if (!user) return false;

    const ownerId = dataset.uploadedBy._id ? dataset.uploadedBy._id.toString() : dataset.uploadedBy.toString();
    const userId = user._id ? user._id.toString() : user.toString();

    if (ownerId === userId) return true;

    if (dataset.accessControl === "restricted") {
        return (dataset.allowedUsers || []).some(
            (uid) => uid && uid.toString() === userId
        );
    }
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

// POST /api/datasets/seed — insert sample dataset records (no real files)
export const seedDatasets = async (req, res) => {
    try {
        const userId = req.user._id;

        const samples = [
            {
                title: "COVID-19 Bangladesh Patient Clinical Data 2020–2023",
                description: "Anonymized clinical records of 12,500 COVID-19 patients from 14 hospitals across Bangladesh including symptoms, comorbidities, treatment protocols, and outcomes.",
                tags: ["covid-19", "clinical", "bangladesh", "epidemiology", "public-health"],
                fileName: "covid19_bd_clinical_2020_2023.csv",
                fileSize: 18500000,
                mimeType: "text/csv",
                accessControl: "public",
            },
            {
                title: "Rice Crop Yield Prediction Dataset — BRRI Trials",
                description: "10-year field trial data from Bangladesh Rice Research Institute covering 45 rice varieties, soil parameters, weather data, fertilizer inputs, and yield outcomes.",
                tags: ["agriculture", "rice", "yield", "machine-learning", "brri"],
                fileName: "rice_yield_brri_trials.csv",
                fileSize: 7200000,
                mimeType: "text/csv",
                accessControl: "public",
            },
            {
                title: "Urban Air Quality Monitoring — Dhaka 2022",
                description: "Hourly PM2.5, PM10, CO2, NO2, and SO2 measurements from 28 monitoring stations across Dhaka city throughout 2022.",
                tags: ["air-quality", "environment", "dhaka", "pollution", "sensor-data"],
                fileName: "dhaka_air_quality_2022.json",
                fileSize: 31000000,
                mimeType: "application/json",
                accessControl: "public",
            },
            {
                title: "Bengali Natural Language Processing Corpus",
                description: "A curated NLP corpus with 2.3 million Bengali sentences from news, literature, and social media. Includes POS tagging, NER labels, and sentiment annotations.",
                tags: ["nlp", "bengali", "corpus", "sentiment", "ner", "text"],
                fileName: "bengali_nlp_corpus_v2.zip",
                fileSize: 245000000,
                mimeType: "application/zip",
                accessControl: "public",
            },
            {
                title: "Garment Worker Health Survey — RMG Sector 2023",
                description: "Survey responses from 5,200 garment workers across 80 factories covering occupational health, mental wellbeing, ergonomics, and workplace safety.",
                tags: ["health", "rmg", "garments", "survey", "occupational-health"],
                fileName: "rmg_worker_health_survey_2023.xlsx",
                fileSize: 4100000,
                mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                accessControl: "public",
            },
            {
                title: "Solar Irradiance Time Series — Cox's Bazar 2021–2024",
                description: "15-minute interval global horizontal irradiance (GHI), direct normal irradiance (DNI), and diffuse horizontal irradiance (DHI) measurements for solar energy research.",
                tags: ["solar", "energy", "irradiance", "renewable", "time-series"],
                fileName: "solar_irradiance_coxs_bazar.csv",
                fileSize: 9800000,
                mimeType: "text/csv",
                accessControl: "public",
            },
            {
                title: "Antibiotic Resistance Gene Database — Hospital Isolates BD",
                description: "Whole-genome sequencing data of 890 bacterial isolates from 6 tertiary hospitals, annotated with antibiotic resistance genes and minimum inhibitory concentrations.",
                tags: ["genomics", "antibiotic-resistance", "wgs", "microbiology", "amr"],
                fileName: "amr_hospital_isolates_bd.fasta",
                fileSize: 890000000,
                mimeType: "application/octet-stream",
                accessControl: "restricted",
            },
            {
                title: "Mangrove Deforestation Satellite Imagery — Sundarbans 2000–2023",
                description: "Processed Landsat and Sentinel-2 imagery stacks showing annual mangrove coverage changes in the Sundarbans delta region over 23 years.",
                tags: ["remote-sensing", "mangrove", "sundarbans", "deforestation", "satellite"],
                fileName: "sundarbans_mangrove_imagery.zip",
                fileSize: 4200000000,
                mimeType: "application/zip",
                accessControl: "public",
            },
            {
                title: "EEG Brain Signal Dataset — Motor Imagery Tasks",
                description: "64-channel EEG recordings from 35 participants performing left/right hand, feet, and rest motor imagery tasks. Sampled at 512 Hz with preprocessing pipeline included.",
                tags: ["eeg", "bci", "motor-imagery", "neuroscience", "signal-processing"],
                fileName: "eeg_motor_imagery_35subjects.mat",
                fileSize: 156000000,
                mimeType: "application/octet-stream",
                accessControl: "public",
            },
            {
                title: "Flood Inundation Map Dataset — Sylhet Division 2022",
                description: "GIS shapefiles and raster layers of flood inundation extent from the 2022 Sylhet floods derived from SAR imagery with socioeconomic vulnerability indices.",
                tags: ["flood", "gis", "sylhet", "disaster", "remote-sensing", "sar"],
                fileName: "sylhet_flood_2022_gis.zip",
                fileSize: 780000000,
                mimeType: "application/zip",
                accessControl: "public",
            },
            {
                title: "Protein Structure Prediction Benchmarks — Local Proteins",
                description: "Benchmark dataset of 1,240 protein sequences from local organisms with experimentally determined structures for evaluating AlphaFold and RoseTTAFold performance.",
                tags: ["proteomics", "structural-biology", "alphafold", "benchmark", "bioinformatics"],
                fileName: "protein_structure_benchmark.tar.gz",
                fileSize: 560000000,
                mimeType: "application/gzip",
                accessControl: "public",
            },
            {
                title: "Traffic Flow and Congestion Sensor Data — Dhaka Intersections",
                description: "Vehicle count, speed, and occupancy data from 42 radar and loop sensors at major Dhaka intersections collected every 5 minutes during 2023.",
                tags: ["traffic", "urban", "dhaka", "transportation", "smart-city"],
                fileName: "dhaka_traffic_sensors_2023.parquet",
                fileSize: 2300000000,
                mimeType: "application/octet-stream",
                accessControl: "public",
            },
        ];

        const toInsert = samples.map((s) => ({
            ...s,
            fileId: new mongoose.Types.ObjectId(), // placeholder
            uploadedBy: userId,
            allowedUsers: [],
        }));

        const inserted = await Dataset.insertMany(toInsert);

        res.status(201).json({
            message: "Datasets seeded successfully",
            count: inserted.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
