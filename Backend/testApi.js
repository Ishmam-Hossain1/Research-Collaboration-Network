import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Equipment from './src/models/Equipment.js';

dotenv.config();

const test = async () => {
  try {
    const loginRes = await fetch('${http://localhost:5000}/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dog@gmail.com',
        password: 'password'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful');

    await mongoose.connect(process.env.MONGO_URI);
    
    // Find equipment not owned by dog
    const dogUser = await User.findOne({email: 'dog@gmail.com'});
    const equipment = await Equipment.findOne({ owner: { $ne: dogUser._id } });
    
    if(!equipment) {
        console.log('No equipment found');
        process.exit(0);
    }

    const bookingRes = await fetch('http://localhost:5000/api/equipment/bookings/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token 
      },
      body: JSON.stringify({
        equipmentId: equipment._id,
        startDate: '2026-05-15',
        endDate: '2026-05-16',
        totalDays: 2,
        purpose: 'Testing API'
      })
    });
    
    const bookingData = await bookingRes.json();
    console.log('Booking API status:', bookingRes.status);
    console.log('Booking API response:', bookingData);
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
};
test();
