import Equipment from "../models/Equipment.js";
import EquipmentBooking from "../models/EquipmentBooking.js";
import EquipmentReview from "../models/EquipmentReview.js";
import mongoose from "mongoose";

// ─── EQUIPMENT CRUD ──────────────────────────────────────────────────────────

export const createEquipment = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      location,
      specifications,
      usageInstructions,
      rentalPricePerDay,
      pricePerDay,
      isFree,
      availabilitySchedule,
      blockedDates,
      status,
      tags,
      maxBookingDays,
      requiresTraining,
      condition,
    } = req.body;

    const finalPrice = isFree ? 0 : (rentalPricePerDay || pricePerDay || 0);

    const equipment = await Equipment.create({
      name,
      description,
      category,
      location,
      specifications,
      usageInstructions,
      rentalPricePerDay: finalPrice,
      pricePerDay: finalPrice, // Keep in sync
      isFree: isFree ?? (finalPrice === 0),
      availabilitySchedule: availabilitySchedule || [],
      blockedDates: blockedDates || [],
      status: status || "available",
      tags: tags || [],
      maxBookingDays: maxBookingDays || 7,
      requiresTraining: requiresTraining ?? false,
      condition: condition || "good",
      owner: req.user._id,
    });

    await equipment.populate("owner", "username email profilePictureId");
    res.status(201).json(equipment);
  } catch (err) {
    console.error("createEquipment:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getAllEquipment = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      isFree,
      requiresTraining,
      condition,
      page = 1,
      limit = 100,
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "All") filter.category = category;
    if (status) filter.status = status;
    if (isFree !== undefined) filter.isFree = isFree === "true";
    if (requiresTraining !== undefined)
      filter.requiresTraining = requiresTraining === "true";
    if (condition) filter.condition = condition;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [equipment, total] = await Promise.all([
      Equipment.find(filter)
        .populate("owner", "username email profilePictureId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Equipment.countDocuments(filter),
    ]);

    res.json({
      equipment,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("getAllEquipment:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate(
      "owner",
      "username email profilePictureId aboutMe"
    );
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    res.json(equipment);
  } catch (err) {
    console.error("getEquipmentById:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getMyEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    res.json(equipment);
  } catch (err) {
    console.error("getMyEquipment:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    if (equipment.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const allowed = [
      "name", "description", "category", "location", "specifications",
      "usageInstructions", "rentalPricePerDay", "pricePerDay", "isFree", "availabilitySchedule",
      "blockedDates", "status", "tags", "maxBookingDays", "requiresTraining", "condition", "isActive"
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) equipment[field] = req.body[field];
    });

    // Ensure sync between rentalPricePerDay and pricePerDay
    if (req.body.pricePerDay !== undefined) equipment.rentalPricePerDay = req.body.pricePerDay;
    if (req.body.rentalPricePerDay !== undefined) equipment.pricePerDay = req.body.rentalPricePerDay;

    if (equipment.isFree) {
      equipment.rentalPricePerDay = 0;
      equipment.pricePerDay = 0;
    }

    await equipment.save();
    await equipment.populate("owner", "username email profilePictureId");
    res.json(equipment);
  } catch (err) {
    console.error("updateEquipment:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    if (equipment.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // Cancel pending/approved bookings
    await EquipmentBooking.updateMany(
      { equipment: equipment._id, status: { $in: ["pending", "approved"] } },
      { status: "cancelled", cancelledBy: "owner", cancellationReason: "Equipment removed by owner" }
    );

    await equipment.deleteOne();
    res.json({ message: "Equipment deleted" });
  } catch (err) {
    console.error("deleteEquipment:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ─── BOOKING ─────────────────────────────────────────────────────────────────

/**
 * Check whether a date range conflicts with existing approved bookings or blocked dates.
 */
async function hasConflict(equipmentId, startDate, endDate, excludeBookingId = null) {
  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) return { conflict: true, reason: "Equipment not found" };

  // 1. Check blocked dates
  for (const block of equipment.blockedDates || []) {
    if (startDate <= new Date(block.end) && endDate >= new Date(block.start)) {
      return { conflict: true, reason: `Blocked for maintenance: ${block.reason}` };
    }
  }

  // 2. Check availability schedule (0=Sun, 6=Sat)
  if (equipment.availabilitySchedule && equipment.availabilitySchedule.length > 0) {
    const availableDays = equipment.availabilitySchedule.map(s => s.dayOfWeek);
    let curr = new Date(startDate);
    const stop = new Date(endDate);
    const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    while (curr <= stop) {
      const dayIndex = curr.getDay();
      if (!availableDays.includes(dayIndex)) {
        return { conflict: true, reason: `Equipment is not available on ${DAY_NAMES[dayIndex]}s` };
      }
      curr.setDate(curr.getDate() + 1);
    }
  }

  // 3. Check existing approved/pending bookings
  const query = {
    equipment: equipmentId,
    status: { $in: ["approved", "pending"] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
    ],
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const conflict = await EquipmentBooking.findOne(query);
  if (conflict) return { conflict: true, reason: "Date range conflicts with an existing booking" };

  return { conflict: false };
}

export const createBooking = async (req, res) => {
  try {
    const equipmentId = req.params.equipmentId || req.body.equipmentId;
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    if (equipment.status !== "available" && equipment.isActive === false)
      return res.status(400).json({ message: `Equipment is currently unavailable` });
    if (equipment.owner.toString() === req.user._id.toString())
      return res.status(400).json({ message: "You cannot book your own equipment" });

    const { startDate, endDate, purpose, projectName, requesterNotes } = req.body;
    if (!startDate || !endDate || !purpose)
      return res.status(400).json({ message: "startDate, endDate, and purpose are required" });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) return res.status(400).json({ message: "Invalid dates" });
    if (start < new Date(new Date().setHours(0,0,0,0))) return res.status(400).json({ message: "Start date cannot be in the past" });
    if (end < start) return res.status(400).json({ message: "End date must be at or after start date" });

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (days > (equipment.maxBookingDays || 30))
      return res.status(400).json({ message: `Maximum booking duration is ${equipment.maxBookingDays} days` });

    const { conflict, reason } = await hasConflict(equipment._id, start, end);
    if (conflict) return res.status(409).json({ message: reason });

    const booking = await EquipmentBooking.create({
      equipment: equipment._id,
      requester: req.user._id,
      startDate: start,
      endDate: end,
      totalDays: days,
      totalCost: days * (equipment.rentalPricePerDay || equipment.pricePerDay || 0),
      purpose,
      projectName: projectName || "",
      requesterNotes: requesterNotes || "",
    });

    await booking.populate([
      { path: "equipment", select: "name category location owner" },
      { path: "requester", select: "username email profilePictureId" },
    ]);
    
    equipment.totalBookings = (equipment.totalBookings || 0) + 1;
    await equipment.save();

    res.status(201).json({ booking });
  } catch (err) {
    console.error("createBooking:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getEquipmentBookings = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.equipmentId);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    if (equipment.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const { status } = req.query;
    const filter = { equipment: equipment._id };
    if (status) filter.status = status;

    const bookings = await EquipmentBooking.find(filter)
      .populate("requester", "username email profilePictureId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("getEquipmentBookings:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { requester: req.user._id };
    if (status) filter.status = status;

    const bookings = await EquipmentBooking.find(filter)
      .populate({
        path: "equipment",
        select: "name category location status condition rentalPricePerDay pricePerDay isFree owner",
        populate: { path: "owner", select: "username email profilePictureId" },
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("getMyBookings:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getReceivedBookings = async (req, res) => {
  try {
    const myEquipment = await Equipment.find({ owner: req.user._id }).select("_id");
    const ids = myEquipment.map((e) => e._id);

    const { status } = req.query;
    const filter = { equipment: { $in: ids } };
    if (status) filter.status = status;

    const bookings = await EquipmentBooking.find(filter)
      .populate("requester", "username email profilePictureId")
      .populate("equipment", "name category location")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("getReceivedBookings:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, ownerNotes, ownerNote } = req.body;
    const bookingId = req.params.bookingId || req.params.id;
    const booking = await EquipmentBooking.findById(bookingId).populate("equipment");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.equipment.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (status === "approved") {
       const { conflict, reason } = await hasConflict(booking.equipment._id, booking.startDate, booking.endDate, booking._id);
       if (conflict) return res.status(409).json({ message: reason });
    }
    
    booking.status = status;
    booking.ownerNotes = ownerNotes || ownerNote || "";
    booking.ownerNote = booking.ownerNotes; // Keep in sync
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveBooking = async (req, res) => {
  req.body.status = "approved";
  return updateBookingStatus(req, res);
};

export const rejectBooking = async (req, res) => {
  req.body.status = "rejected";
  return updateBookingStatus(req, res);
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await EquipmentBooking.findById(req.params.bookingId || req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.requester.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (!["pending", "approved"].includes(booking.status))
      return res.status(400).json({ message: `Cannot cancel a ${booking.status} booking` });

    booking.status = "cancelled";
    booking.cancelledBy = "requester";
    booking.cancellationReason = req.body.cancellationReason || "";
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error("cancelBooking:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const booking = await EquipmentBooking.findById(req.params.bookingId).populate("equipment");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.equipment.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (booking.status !== "approved")
      return res.status(400).json({ message: "Only approved bookings can be completed" });

    booking.status = "completed";
    booking.actualStartDate = req.body.actualStartDate || booking.startDate;
    booking.actualEndDate = req.body.actualEndDate || booking.endDate;
    booking.usageReport = req.body.usageReport || "";
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error("completeBooking:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const rateBooking = async (req, res) => {
  try {
    const booking = await EquipmentBooking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.requester.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (booking.status !== "completed")
      return res.status(400).json({ message: "Can only rate completed bookings" });
    if (booking.rating)
      return res.status(400).json({ message: "Already rated" });

    const { rating, reviewComment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1–5" });

    booking.rating = rating;
    booking.reviewComment = reviewComment || "";
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error("rateBooking:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getOwnerBookingsDashboard = async (req, res) => {
  return getReceivedBookings(req, res);
};

export const getEquipmentUsageHistory = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.equipmentId);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    if (equipment.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const history = await EquipmentBooking.find({
      equipment: equipment._id,
      status: { $in: ["completed", "approved", "rejected", "cancelled"] },
    })
      .populate("requester", "username email profilePictureId")
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    console.error("getEquipmentUsageHistory:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getEquipmentApprovedDates = async (req, res) => {
  try {
    const bookings = await EquipmentBooking.find({
      equipment: req.params.equipmentId,
      status: "approved",
      endDate: { $gte: new Date() },
    }).select("startDate endDate");
    res.json(bookings);
  } catch (err) {
    console.error("getEquipmentApprovedDates:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log("--- Payment Initiation Start ---");
    console.log("Booking ID:", bookingId);

    if (!process.env.RUPANTORPAY_API_KEY || !process.env.RUPANTORPAY_URL) {
      console.error("Payment Error: RupantorPay configuration missing in .env");
      console.log("Available Env Vars:", Object.keys(process.env).filter(k => k.includes("RUPANTORPAY")));
      return res.status(500).json({ message: "Payment gateway not configured" });
    }

    const booking = await EquipmentBooking.findById(bookingId).populate("equipment requester");
    if (!booking) {
      console.error("Booking not found:", bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("Booking Status:", booking.status);
    console.log("Requester ID:", booking.requester?._id);
    console.log("User ID:", req.user?._id);

    if (booking.requester._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to pay for this booking" });

    if (booking.status !== "approved" && booking.status !== "pending_payment")
      return res.status(400).json({ message: "Booking must be approved before payment" });

    if (booking.paymentStatus === "paid")
      return res.status(400).json({ message: "Booking is already paid" });

    const amount = booking.totalCost;
    if (!amount || amount <= 0) {
      booking.paymentStatus = "paid";
      await booking.save();
      return res.json({ message: "No payment required for this booking", status: "paid" });
    }

    const payload = {
      amount: amount.toString(),
      success_url: `${process.env.FRONTEND_URL}/equipment/booking/payment-success?bookingId=${booking._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/equipment/booking/payment-cancel?bookingId=${booking._id}`,
      webhook_url: `${process.env.BACKEND_URL}/api/equipment/bookings/verify`,
      fullname: booking.requester.username,
      email: booking.requester.email,
      sandbox: 1, // Enable Sandbox / Test Mode
      metadata: {
        bookingId: booking._id.toString(),
        equipmentId: booking.equipment._id.toString(),
      },
    };

    console.log("Initiating payment for booking:", bookingId, "Amount:", amount);

    let hostname = "localhost";
    try {
      if (process.env.FRONTEND_URL) {
        hostname = new URL(process.env.FRONTEND_URL).hostname;
      }
    } catch (e) {
      console.warn("Invalid FRONTEND_URL for hostname extraction, using localhost");
    }

    const response = await fetch(process.env.RUPANTORPAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.RUPANTORPAY_API_KEY,
        "X-CLIENT": hostname,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("RupantorPay Response Data:", JSON.stringify(data, null, 2));

    if (data.status === 1 || data.status === true || data.payment_url) {
      booking.paymentUrl = data.payment_url;
      booking.status = "pending_payment";
      await booking.save();
      console.log("Payment URL generated successfully:", data.payment_url);
      res.json({ payment_url: data.payment_url });
    } else {
      console.error("RupantorPay API rejected request:", data);
      res.status(400).json({ message: data.message || "Failed to initiate payment" });
    }
  } catch (err) {
    console.error("CRITICAL ERROR in initiatePayment:", err.stack);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const transaction_id = req.query.transaction_id || req.body.transaction_id || req.body.tran_id;
    const bookingId = req.query.bookingId || (req.body.metadata && req.body.metadata.bookingId) || req.body.value_a;
    
    if (!transaction_id) {
      console.log("Verify Payment: No transaction ID found", req.query, req.body);
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    const response = await fetch(`${process.env.RUPANTORPAY_VERIFY_URL}?transaction_id=${transaction_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.RUPANTORPAY_API_KEY,
      },
    });

    const data = await response.json();
    console.log("RupantorPay Verification Data:", data);

    // Common status fields for RupantorPay: status: 1 or status: "success" or payment_status: "Completed"
    const isSuccess = data.status === 1 || data.status === "success" || data.payment_status === "Completed" || data.status === "Completed";

    if (isSuccess) {
      const bId = bookingId || (data.metadata && data.metadata.bookingId);
      if (!bId) {
        console.error("Booking ID not found in data:", data);
        return res.status(400).json({ message: "Booking ID not found in transaction" });
      }

      const booking = await EquipmentBooking.findById(bId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      booking.paymentStatus = "paid";
      booking.status = "approved"; // Ensure it stays/becomes approved
      booking.transactionId = transaction_id;
      booking.paymentDetails = data;
      await booking.save();
      
      res.json({ message: "Payment verified successfully", booking });
    } else {
      res.status(400).json({ message: "Payment verification failed", details: data });
    }
  } catch (err) {
    console.error("verifyPayment Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Reviews ──────────────────────────────────────────────────────────────────

export const addReview = async (req, res) => {
    try {
        const id = req.params.id || req.params.equipmentId;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        console.log("AddReview Params:", req.params);
        console.log("AddReview Body:", req.body);

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid equipment ID" });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const equipment = await Equipment.findById(id);
        if (!equipment) {
            return res.status(404).json({ message: "Equipment not found" });
        }

        // Use findOneAndUpdate with upsert to handle both create and update
        const review = await EquipmentReview.findOneAndUpdate(
            { equipment: id, user: userId },
            { rating, comment: comment || "" },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        ).populate("user", "username email");

        res.status(201).json({
            message: "Review submitted successfully",
            review: review,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET EQUIPMENT REVIEWS
export const getEquipmentReviews = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid equipment ID" });
        }

        const reviews = await EquipmentReview.find({ equipment: id })
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE REVIEW BY ID
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        const review = await EquipmentReview.findById(id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Authorization check
        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this review" });
        }

        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Rating must be between 1 and 5" });
            }
            review.rating = rating;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        await review.save();

        const populatedReview = await EquipmentReview.findById(review._id).populate("user", "username email");

        res.status(200).json({
            message: "Review updated successfully",
            review: populatedReview,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE REVIEW BY ID
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        const review = await EquipmentReview.findById(id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Authorization check
        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        await EquipmentReview.findByIdAndDelete(id);

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};