import mongoose from "mongoose";
import dotenv from "dotenv";
import Equipment from "../models/Equipment.js";
import User from "../models/User.js";
import EquipmentReview from "../models/EquipmentReview.js";

dotenv.config();

const reviews = [
  {
    rating: 5,
    comment: "Excellent precision. The microscope was well-maintained and the optics were crystal clear. Highly recommend for cellular imaging.",
  },
  {
    rating: 4,
    comment: "Very good equipment, although the software took some time to get used to. The owner was helpful with the initial setup.",
  },
  {
    rating: 5,
    comment: "Outstanding performance for our chromatography experiments. Clean, calibrated, and ready to use.",
  },
  {
    rating: 4,
    comment: "The spectrometer worked perfectly for our sample analysis. Minor issues with the cooling system but nothing critical.",
  },
  {
    rating: 3,
    comment: "It's a bit dated but still functional. Good for basic experiments but might not be suitable for high-precision research.",
  }
];

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const equipment = await Equipment.find();
    const users = await User.find();

    if (equipment.length === 0 || users.length === 0) {
      console.log("No equipment or users found to seed reviews.");
      process.exit();
    }

    console.log(`Found ${equipment.length} equipment and ${users.length} users.`);

    // Delete existing reviews to start fresh
    await EquipmentReview.deleteMany({});
    console.log("Existing reviews cleared.");

    const reviewDocs = [];

    for (let i = 0; i < equipment.length; i++) {
      const eq = equipment[i];
      // Assign 1-3 reviews per equipment
      const numReviews = Math.floor(Math.random() * 3) + 1;
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < Math.min(numReviews, shuffledUsers.length); j++) {
        const user = shuffledUsers[j];
        
        // Don't let owner review their own equipment
        if (eq.owner.toString() === user._id.toString()) continue;

        const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
        
        reviewDocs.push({
          equipment: eq._id,
          user: user._id,
          rating: randomReview.rating,
          comment: randomReview.comment,
        });
      }
    }

    await EquipmentReview.insertMany(reviewDocs);
    console.log(`Successfully seeded ${reviewDocs.length} equipment reviews!`);

    process.exit();
  } catch (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
};

seedReviews();
