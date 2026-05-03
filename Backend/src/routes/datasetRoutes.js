// import express from "express";
// import multer from "multer";
// import {
//     uploadDataset,
//     getAllDatasets,
//     downloadDataset,
//     deleteDataset,
//     editDataset,
// } from "../controllers/datasetController.js";
// import { protect, optionalProtect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Multer: disk storage so we can stream to GridFS
// const upload = multer({ dest: "uploads/" });

// // POST /api/datasets — upload a new dataset (must be logged in)
// router.post("/", protect, upload.single("file"), uploadDataset);

// // GET /api/datasets — list datasets (login optional; access control applied)
// router.get("/", optionalProtect, getAllDatasets);

// // GET /api/datasets/:id/download — download a dataset file (access controlled)
// router.get("/:id/download", optionalProtect, downloadDataset);

// // PUT /api/datasets/:id — edit dataset metadata (owner only)
// router.put("/:id", protect, editDataset);

// // DELETE /api/datasets/:id — delete a dataset (owner only)
// router.delete("/:id", protect, deleteDataset);

// export default router;


import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";

import {
  uploadDataset,
  getAllDatasets,
  downloadDataset,
  deleteDataset,
  editDataset,
} from "../controllers/datasetController.js";

import { protect, optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadDir =
  process.env.NODE_ENV === "production"
    ? path.join(os.tmpdir(), "uploads")
    : path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer: disk storage so we can stream to GridFS
const upload = multer({ dest: uploadDir });

// POST /api/datasets — upload a new dataset (must be logged in)
router.post("/", protect, upload.single("file"), uploadDataset);

// GET /api/datasets — list datasets (login optional; access control applied)
router.get("/", optionalProtect, getAllDatasets);

// GET /api/datasets/:id/download — download a dataset file (access controlled)
router.get("/:id/download", optionalProtect, downloadDataset);

// PUT /api/datasets/:id — edit dataset metadata (owner only)
router.put("/:id", protect, editDataset);

// DELETE /api/datasets/:id — delete a dataset (owner only)
router.delete("/:id", protect, deleteDataset);

export default router;
