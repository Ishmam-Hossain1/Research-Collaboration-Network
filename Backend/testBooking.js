import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Equipment from './src/models/Equipment.js';
import EquipmentBooking from './src/models/EquipmentBooking.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const requester = await User.findOne({email: 'test1@gmail.com'});
    const equipment = await Equipment.findOne({ owner: { $ne: requester._id } });
    
    if(!equipment) {
      console.log('No equipment found');
      process.exit(0);
    }
    
    const booking = new EquipmentBooking({
      equipment: equipment._id,
      requester: requester._id,
      owner: equipment.owner,
      startDate: '2026-05-10',
      endDate: '2026-05-12',
      totalDays: 3,
      totalCost: 10,
      purpose: 'test',
      paymentStatus: 'paid'
    });
    
    await booking.save();
    console.log('Booking successful');
    process.exit(0);
  } catch (e) {
    console.error("Booking error:", e);
    process.exit(1);
  }
};

run();
