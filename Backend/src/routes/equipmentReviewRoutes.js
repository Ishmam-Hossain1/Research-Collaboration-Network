import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    addReview,
    getEquipmentReviews,
    updateReview,
    deleteReview
} from "../controllers/equipmentReviewController.js";

const router = express.Router();

router.get("/:id", getEquipmentReviews);
router.post("/:id", protect, addReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
