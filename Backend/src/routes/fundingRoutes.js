import express from "express";
import {
  createFundingOpportunity,
  getAllFundingOpportunities,
  getFundingOpportunityById,
  updateFundingOpportunity,
  deleteFundingOpportunity,
} from "../controllers/fundingController.js";

const router = express.Router();

router.post("/", createFundingOpportunity);
router.get("/", getAllFundingOpportunities);
router.get("/:id", getFundingOpportunityById);
router.put("/:id", updateFundingOpportunity);
router.delete("/:id", deleteFundingOpportunity);

export default router;