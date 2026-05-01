import mongoose from "mongoose";
import Equipment from "../models/Equipment.js";
import EquipmentBooking from "../models/EquipmentBooking.js";

// ─── Equipment CRUD ───────────────────────────────────────────────────────────

export const createEquipment = async (req, res) => {
  try {
    const {
      name, description, category, pricePerDay,
      condition, location, availabilitySchedule,
    } = req.body;

    if (!name || !description || !category || !pricePerDay) {
      return res.status(400).json({ message: "name, description, category and pricePerDay are required" });
    }

    const price = Number(pricePerDay);
    if (isNaN(price) || price < 1 || price > 5) {
      return res.status(400).json({ message: "pricePerDay must be between 1 and 5 tk" });
    }

    const equipment = await Equipment.create({
      name: name.trim(),
      description: description.trim(),
      category,
      owner: req.user._id,
      pricePerDay: price,
      condition: condition || "Good",
      location: location?.trim() || "",
      availabilitySchedule: availabilitySchedule || [],
    });

    await equipment.populate("owner", "username email profilePictureId");
    res.status(201).json({ message: "Equipment listed successfully", equipment });
  } catch (error) {
    res.status(500).json({ message: "Error creating equipment", error: error.message });
  }
};

export const getAllEquipment = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search?.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { location: { $regex: search.trim(), $options: "i" } },
      ];
    }
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    const equipment = await Equipment.find(query)
      .populate("owner", "username email profilePictureId institution")
      .sort({ createdAt: -1 });

    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching equipment", error: error.message });
  }
};

export const getEquipmentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid equipment id" });
    }
    const equipment = await Equipment.findById(req.params.id)
      .populate("owner", "username email profilePictureId institution");
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching equipment", error: error.message });
  }
};

export const getMyEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ owner: req.user._id })
      .populate("owner", "username email profilePictureId")
      .sort({ createdAt: -1 });
    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your equipment", error: error.message });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid equipment id" });
    }
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    if (equipment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this equipment" });
    }

    const { name, description, category, pricePerDay, condition, location, availabilitySchedule, isActive } = req.body;

    if (pricePerDay !== undefined) {
      const price = Number(pricePerDay);
      if (isNaN(price) || price < 1 || price > 5) {
        return res.status(400).json({ message: "pricePerDay must be between 1 and 5 tk" });
      }
      equipment.pricePerDay = price;
    }

    if (name) equipment.name = name.trim();
    if (description) equipment.description = description.trim();
    if (category) equipment.category = category;
    if (condition) equipment.condition = condition;
    if (location !== undefined) equipment.location = location.trim();
    if (availabilitySchedule) equipment.availabilitySchedule = availabilitySchedule;
    if (isActive !== undefined) equipment.isActive = isActive;

    await equipment.save();
    await equipment.populate("owner", "username email profilePictureId");
    res.status(200).json({ message: "Equipment updated", equipment });
  } catch (error) {
    res.status(500).json({ message: "Error updating equipment", error: error.message });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid equipment id" });
    }
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    if (equipment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this equipment" });
    }
    await Equipment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting equipment", error: error.message });
  }
};

// ─── Booking ──────────────────────────────────────────────────────────────────

export const createBooking = async (req, res) => {
  try {
    const { 
      equipmentId, 
      startDate, endDate, totalDays, 
      bookingDate, startTime, endTime, totalHours,
      purpose 
    } = req.body;

    // Support both old and new field names for robustness
    const sDate = startDate || bookingDate;
    const eDate = endDate || bookingDate;
    const tDays = totalDays || (totalHours ? Math.ceil(totalHours / 24) : 1);

    if (!equipmentId || !sDate || !eDate || !tDays) {
      return res.status(400).json({ 
        message: "Missing required booking details. Please provide startDate, endDate, and totalDays." 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment id" });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || !equipment.isActive) {
      return res.status(404).json({ message: "Equipment not found or not available" });
    }

    if (equipment.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot book your own equipment" });
    }

    const tCost = parseFloat((tDays * equipment.pricePerDay).toFixed(2));

    // Check availability schedule
    const availableDays = equipment.availabilitySchedule
      .filter(s => s.isAvailable)
      .map(s => s.dayOfWeek);

    if (availableDays.length > 0) {
      let curr = new Date(sDate);
      const stop = new Date(eDate);
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      while (curr <= stop) {
        const dayName = dayNames[curr.getDay()];
        if (!availableDays.includes(dayName)) {
          return res.status(400).json({ message: `Equipment is not available on ${dayName}s` });
        }
        curr.setDate(curr.getDate() + 1);
      }
    }

    // Check for conflicting bookings
    const conflict = await EquipmentBooking.findOne({
      equipment: equipmentId,
      status: { $in: ["pending", "approved"] },
      startDate: { $lte: eDate },
      endDate: { $gte: sDate },
    });
    if (conflict) {
      return res.status(409).json({ message: "This date range is already booked or pending" });
    }

    const booking = await EquipmentBooking.create({
      equipment: equipmentId,
      requester: req.user._id,
      owner: equipment.owner,
      startDate: sDate,
      endDate: eDate,
      totalDays: tDays,
      totalCost: tCost,
      purpose: purpose?.trim() || "",
      paymentStatus: "paid", // payment happens at booking time
    });

    // Increment booking counter
    equipment.totalBookings += 1;
    await equipment.save();

    await booking.populate([
      { path: "equipment", select: "name category pricePerDay" },
      { path: "requester", select: "username email" },
      { path: "owner", select: "username email" },
    ]);

    res.status(201).json({ message: "Booking request submitted and payment processed", booking });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await EquipmentBooking.find({ requester: req.user._id })
      .populate("equipment", "name category pricePerDay condition location")
      .populate("owner", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your bookings", error: error.message });
  }
};

export const getReceivedBookings = async (req, res) => {
  try {
    const bookings = await EquipmentBooking.find({ owner: req.user._id })
      .populate("equipment", "name category pricePerDay condition location")
      .populate("requester", "username email profilePictureId institution")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching received bookings", error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, ownerNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await EquipmentBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be approved or rejected" });
    }

    booking.status = status;
    if (ownerNote) booking.ownerNote = ownerNote.trim();
    await booking.save();

    await booking.populate([
      { path: "equipment", select: "name category pricePerDay" },
      { path: "requester", select: "username email" },
      { path: "owner", select: "username email" },
    ]);

    res.status(200).json({ message: `Booking ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status", error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const booking = await EquipmentBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }
    if (!["pending", "approved"].includes(booking.status)) {
      return res.status(400).json({ message: "This booking cannot be cancelled" });
    }
    booking.status = "cancelled";
    await booking.save();
    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};

export const getUsageHistory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment id" });
    }
    const equipment = await Equipment.findById(req.params.equipmentId);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    if (equipment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this history" });
    }

    const history = await EquipmentBooking.find({
      equipment: req.params.equipmentId,
      status: { $in: ["approved", "rejected", "cancelled"] },
    })
      .populate("requester", "username email institution")
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching usage history", error: error.message });
  }
};

