import express from "express";
import {
  createResource,
  getAllResources,
  getResourceById,
  searchResources,
  bookmarkResource,
  rateResource,
  seedResources,
} from "../controllers/resourceController.js";

const router = express.Router();

router.post("/", createResource);
router.get("/", getAllResources);
router.get("/search", searchResources);
router.get("/:id", getResourceById);
router.post("/:id/bookmark", bookmarkResource);
router.post("/:id/rate", rateResource);
router.post("/seed", seedResources);

export default router;