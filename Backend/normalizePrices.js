import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Equipment from './src/models/Equipment.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Equipment.updateMany(
      { rentalPricePerDay: { $gt: 5 } },
      [
        { $set: { rentalPricePerDay: 5, pricePerDay: 5 } }
      ]
    );

    const resultMin = await Equipment.updateMany(
      { rentalPricePerDay: { $lt: 1 }, isFree: false },
      [
        { $set: { rentalPricePerDay: 1, pricePerDay: 1 } }
      ]
    );

    console.log(`Updated ${result.modifiedCount} items with price > 5.`);
    console.log(`Updated ${resultMin.modifiedCount} items with price < 1.`);

    mongoose.connection.close();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

run();
