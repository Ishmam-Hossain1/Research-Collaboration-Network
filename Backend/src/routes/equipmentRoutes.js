import express from "express";
import { protect, optionalProtect } from "../middleware/authMiddleware.js";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  getMyEquipment,
  updateEquipment,
  deleteEquipment,
  createBooking,
  getEquipmentBookings,
  getMyBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  rateBooking,
  getOwnerBookingsDashboard,
  getEquipmentUsageHistory,
  getEquipmentApprovedDates,
  initiatePayment,
  verifyPayment,
  addReview,
  getEquipmentReviews,
  updateReview,
  deleteReview,
} from "../controllers/equipmentController.js";

const router = express.Router();

// ── Reviews ──────────────────────────────────────────────────────────────────
router.get("/:id/reviews", getEquipmentReviews);
router.post("/:id/reviews", protect, addReview);
router.put("/reviews/:id", protect, updateReview);
router.delete("/reviews/:id", protect, deleteReview);

// ── Equipment CRUD ────────────────────────────────────────────────────────────
router.get("/", optionalProtect, getAllEquipment);
router.post("/", protect, createEquipment);
router.get("/mine", protect, getMyEquipment);
// Owner bookings dashboard (all incoming requests across all owned equipment)
router.get("/bookings/dashboard", protect, getOwnerBookingsDashboard);
// Requester: my own requests
router.get("/bookings/mine", protect, getMyBookings);

// Compatibility aliases for legacy frontend
router.get("/bookings/received", protect, getOwnerBookingsDashboard);

router.get("/:id", optionalProtect, getEquipmentById);
router.put("/:id", protect, updateEquipment);
router.delete("/:id", protect, deleteEquipment);

// ── Booking lifecycle ─────────────────────────────────────────────────────────
router.post("/:equipmentId/bookings", protect, createBooking);
router.get("/:equipmentId/bookings", protect, getEquipmentBookings);
router.get("/:equipmentId/approved-dates", optionalProtect, getEquipmentApprovedDates);
router.get("/:equipmentId/usage-history", protect, getEquipmentUsageHistory);

router.put("/bookings/:bookingId/approve", protect, approveBooking);
router.put("/bookings/:bookingId/reject", protect, rejectBooking);
router.put("/bookings/:bookingId/cancel", protect, cancelBooking);
router.put("/bookings/:bookingId/complete", protect, completeBooking);
router.put("/bookings/:bookingId/rate", protect, rateBooking);

// ── Payment ──────────────────────────────────────────────────────────────────
router.post("/bookings/:bookingId/pay", protect, initiatePayment);
router.get("/bookings/verify", optionalProtect, verifyPayment); // Verification callback
router.post("/bookings/verify", optionalProtect, verifyPayment); // Webhook

// Compatibility aliases for booking actions
router.post("/bookings/:bookingId/approve", protect, approveBooking);
router.post("/bookings/:bookingId/reject", protect, rejectBooking);
router.post("/bookings/:bookingId/cancel", protect, cancelBooking);
router.post("/bookings/:bookingId/complete", protect, completeBooking);
router.post("/bookings/:bookingId/rate", protect, rateBooking);
router.put("/bookings/:id/status", protect, approveBooking); // Fallback

export default router;
