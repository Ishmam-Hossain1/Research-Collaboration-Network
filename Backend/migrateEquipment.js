import mongoose from "mongoose";
import dotenv from "dotenv";
import Equipment from "./src/models/Equipment.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();

const migrate = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for migration...");

    // Find all equipment that has pricePerHour or is missing pricePerDay
    const equipmentList = await Equipment.find({
      $or: [
        { pricePerHour: { $exists: true } },
        { pricePerDay: { $exists: false } }
      ]
    });

    console.log(`Found ${equipmentList.length} items to migrate.`);

    for (const eq of equipmentList) {
      // Accessing pricePerHour directly even if not in schema (Mongoose allows via .get)
      const oldPrice = eq.get("pricePerHour") || 2; 
      
      // Update the document
      await Equipment.updateOne(
        { _id: eq._id },
        { 
          $set: { pricePerDay: oldPrice },
          $unset: { pricePerHour: "" }
        }
      );
      console.log(`Migrated: ${eq.name}`);
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
