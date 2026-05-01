import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Equipment from './src/models/Equipment.js';

dotenv.config();

const EQUIPMENT_DATA = [
  {
    name: 'Confocal Laser Scanning Microscope',
    category: 'Microscopy',
    description: 'High-resolution imaging for biological samples.',
    pricePerDay: 5,
    condition: 'Excellent',
    location: 'Main Science Building, Room 101'
  },
  {
    name: 'Nuclear Magnetic Resonance (NMR) Spectrometer',
    category: 'Spectroscopy',
    description: 'Used for determining the structure of organic compounds.',
    pricePerDay: 4,
    condition: 'Good',
    location: 'Chemistry Dept, Room 302'
  },
  {
    name: 'High-Performance Liquid Chromatography (HPLC)',
    category: 'Chromatography',
    description: 'Separates, identifies, and quantifies components in a mixture.',
    pricePerDay: 3,
    condition: 'Fair',
    location: 'Analytical Lab 2'
  },
  {
    name: 'Differential Scanning Calorimeter',
    category: 'Thermal Analysis',
    description: 'Measures temperatures and heat flows associated with thermal transitions.',
    pricePerDay: 2,
    condition: 'Good',
    location: 'Physics Wing, Room 405'
  },
  {
    name: 'High-Performance Computing Cluster node',
    category: 'Computing & Data',
    description: 'Access to 128-core node with 512GB RAM for heavy simulations.',
    pricePerDay: 5,
    condition: 'Excellent',
    location: 'Data Center'
  },
  {
    name: 'PCR Thermal Cycler',
    category: 'Molecular Biology',
    description: 'Used to amplify segments of DNA via the polymerase chain reaction.',
    pricePerDay: 1,
    condition: 'Good',
    location: 'Genetics Lab, Room 220'
  },
  {
    name: 'Rotary Evaporator',
    category: 'Chemistry',
    description: 'Efficient and gentle removal of solvents from samples by evaporation.',
    pricePerDay: 2,
    condition: 'Fair',
    location: 'Organic Chem Lab'
  },
  {
    name: 'X-Ray Diffractometer',
    category: 'Physics',
    description: 'Non-destructive analytical technique for analyzing material structure.',
    pricePerDay: 4,
    condition: 'Excellent',
    location: 'Materials Science Bldg'
  }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found in database');
      process.exit(0);
    }

    let equipmentAdded = 0;
    
    // Assign 1-2 random equipment pieces to each user
    for (const user of users) {
      const numToAdd = Math.floor(Math.random() * 2) + 1; // 1 or 2
      
      for (let i=0; i<numToAdd; i++) {
        const randomEq = EQUIPMENT_DATA[Math.floor(Math.random() * EQUIPMENT_DATA.length)];
        
        await Equipment.create({
          name: randomEq.name,
          category: randomEq.category,
          description: randomEq.description,
          pricePerDay: randomEq.pricePerDay,
          condition: randomEq.condition,
          location: randomEq.location,
          owner: user._id,
          availabilitySchedule: [
            {dayOfWeek:"Monday",startTime:"09:00",endTime:"17:00",isAvailable:true},
            {dayOfWeek:"Tuesday",startTime:"09:00",endTime:"17:00",isAvailable:true},
            {dayOfWeek:"Wednesday",startTime:"09:00",endTime:"17:00",isAvailable:true},
            {dayOfWeek:"Thursday",startTime:"09:00",endTime:"17:00",isAvailable:true},
            {dayOfWeek:"Friday",startTime:"09:00",endTime:"17:00",isAvailable:true}
          ],
          isActive: true
        });
        equipmentAdded++;
      }
    }
    
    console.log(`Successfully seeded ${equipmentAdded} new equipment items!`);
    process.exit(0);
  } catch (e) {
    console.error("Error seeding equipment:", e);
    process.exit(1);
  }
};

run();
