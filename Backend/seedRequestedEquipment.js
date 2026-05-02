import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Equipment from './src/models/Equipment.js';

dotenv.config();

const REQUESTED_EQUIPMENT = [
  // 6 items with 1-2 tk price
  {
    name: 'Standard Laboratory Centrifuge',
    category: 'Biology',
    description: 'Benchtop centrifuge for routine separation of samples.',
    rentalPricePerDay: 1,
    condition: 'good',
    location: 'Lab 101, Science Bldg',
    tags: ['centrifuge', 'lab', 'biology'],
    isFree: false
  },
  {
    name: 'Digital pH Meter',
    category: 'Chemistry',
    description: 'High-precision digital pH meter with temperature compensation.',
    rentalPricePerDay: 1,
    condition: 'excellent',
    location: 'General Chemistry Lab',
    tags: ['chemistry', 'ph meter', 'analysis'],
    isFree: false
  },
  {
    name: 'Vortex Mixer',
    category: 'Biology',
    description: 'Used for mixing small vials of liquid in biological and chemical laboratories.',
    rentalPricePerDay: 1,
    condition: 'good',
    location: 'Biotech Lab A',
    tags: ['mixer', 'lab', 'vortex'],
    isFree: false
  },
  {
    name: 'Laboratory Hot Plate',
    category: 'Chemistry',
    description: 'Heating plate with magnetic stirrer for chemical reactions.',
    rentalPricePerDay: 2,
    condition: 'good',
    location: 'Organic Synthesis Lab',
    tags: ['heating', 'stirrer', 'chemistry'],
    isFree: false
  },
  {
    name: 'Analytical Balance (0.1mg)',
    category: 'Chemistry',
    description: 'Highly sensitive laboratory balance for measuring mass with sub-milligram precision.',
    rentalPricePerDay: 2,
    condition: 'excellent',
    location: 'Analytical Lab',
    tags: ['balance', 'weight', 'precision'],
    isFree: false
  },
  {
    name: 'Fume Hood Station',
    category: 'Chemistry',
    description: 'Ventilated enclosure that limits exposure to hazardous or toxic fumes, vapors, or dusts.',
    rentalPricePerDay: 2,
    condition: 'good',
    location: 'Safety Lab 04',
    tags: ['safety', 'ventilation', 'chemistry'],
    isFree: false
  },
  
  // 4 free items
  {
    name: 'Basic Pipette Set',
    category: 'Biology',
    description: 'A set of adjustable-volume micropipettes for precise liquid handling.',
    rentalPricePerDay: 0,
    condition: 'good',
    location: 'Student Lab, 2nd Floor',
    tags: ['pipette', 'liquid handling', 'biology'],
    isFree: true
  },
  {
    name: 'Laboratory Glassware Kit',
    category: 'Chemistry',
    description: 'Includes beakers, flasks, and graduated cylinders for general lab work.',
    rentalPricePerDay: 0,
    condition: 'fair',
    location: 'Storage Room 102',
    tags: ['glassware', 'chemistry', 'basics'],
    isFree: true
  },
  {
    name: 'Benchtop Power Supply',
    category: 'Electronics',
    description: 'DC power supply for electronics testing and prototyping.',
    rentalPricePerDay: 0,
    condition: 'good',
    location: 'Electronics Workshop',
    tags: ['electronics', 'power', 'dc'],
    isFree: true
  },
  {
    name: 'UV Sterilization Cabinet',
    category: 'Biology',
    description: 'Used for sterilizing small tools and surfaces using ultraviolet light.',
    rentalPricePerDay: 0,
    condition: 'good',
    location: 'Microbiology Lab',
    tags: ['safety', 'sterilization', 'uv'],
    isFree: true
  }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    if (users.length < 2) {
      console.log('Need at least 2 users in the database.');
      process.exit(1);
    }

    console.log(`Adding ${REQUESTED_EQUIPMENT.length} new equipment items...`);

    let addedCount = 0;
    for (let i = 0; i < REQUESTED_EQUIPMENT.length; i++) {
      const eqData = REQUESTED_EQUIPMENT[i];
      const owner = users[Math.floor(Math.random() * users.length)];

      await Equipment.create({
        ...eqData,
        owner: owner._id,
        availabilitySchedule: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" }
        ],
        maxBookingDays: 7,
        requiresTraining: false,
        isActive: true
      });
      addedCount++;
    }

    console.log(`Successfully added ${addedCount} equipment items!`);
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding equipment:', err);
    process.exit(1);
  }
};

run();
