import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  getMyEquipment,
  updateEquipment,
  deleteEquipment,
  createBooking,
  getMyBookings,
  getReceivedBookings,
  updateBookingStatus,
  cancelBooking,
  getUsageHistory,
} from "../controllers/equipmentController.js";

const router = express.Router();

// Equipment — static named routes FIRST, then wildcards
router.get("/", getAllEquipment);
router.post("/", protect, createEquipment);
router.get("/mine", protect, getMyEquipment);

// Bookings — must come before /:id to avoid wildcard capture
router.post("/bookings/create", protect, createBooking);
router.get("/bookings/mine", protect, getMyBookings);
router.get("/bookings/received", protect, getReceivedBookings);
router.put("/bookings/:id/status", protect, updateBookingStatus);
router.put("/bookings/:id/cancel", protect, cancelBooking);

// Equipment wildcard routes
router.get("/:id", getEquipmentById);
router.put("/:id", protect, updateEquipment);
router.delete("/:id", protect, deleteEquipment);
router.get("/:equipmentId/usage-history", protect, getUsageHistory);

export default router;
