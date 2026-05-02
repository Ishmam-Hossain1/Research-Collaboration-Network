import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Equipment from './src/models/Equipment.js';

dotenv.config();

const ADDITIONAL_EQUIPMENT = [
  {
    name: 'Scanning Electron Microscope (SEM)',
    category: 'Microscopy',
    description: 'Provides high-resolution images of a sample surface by scanning it with a focused beam of electrons.',
    rentalPricePerDay: 5,
    condition: 'excellent',
    location: 'Nanotechnology Center, Wing B',
    tags: ['electron', 'imaging', 'nano'],
    isFree: false
  },
  {
    name: 'Mass Spectrometer (LC-MS)',
    category: 'Spectroscopy',
    description: 'Analytical technique that ionizes chemical species and sorts the ions based on their mass-to-charge ratio.',
    rentalPricePerDay: 4,
    condition: 'good',
    location: 'Analytical Chemistry Lab, 4th Floor',
    tags: ['mass spec', 'chemistry', 'analytical'],
    isFree: false
  },
  {
    name: 'Flow Cytometer',
    category: 'Biology',
    description: 'Laser-based technique used to detect and measure physical and chemical characteristics of a population of cells or particles.',
    rentalPricePerDay: 3,
    condition: 'excellent',
    location: 'Biomedical Research Bldg, Room 202',
    tags: ['cells', 'biology', 'laser'],
    isFree: false
  },
  {
    name: 'DNA Sequencer (Next-Gen)',
    category: 'Biology',
    description: 'Used to determine the order of the four bases: adenine, guanine, cytosine, and thymine in a strand of DNA.',
    rentalPricePerDay: 5,
    condition: 'excellent',
    location: 'Genomics Hub',
    tags: ['dna', 'genetics', 'sequencing'],
    isFree: false
  },
  {
    name: 'Oscilloscope 500MHz',
    category: 'Electronics',
    description: 'Type of electronic test instrument that graphically displays varying signal voltages.',
    rentalPricePerDay: 2,
    condition: 'good',
    location: 'EE Lab 10',
    tags: ['electronics', 'signal', 'testing'],
    isFree: false
  },
  {
    name: '3D Bioprinter',
    category: 'Other',
    description: 'Utilizes 3D printing techniques to combine cells, growth factors, and biomaterials to fabricate biomedical parts.',
    rentalPricePerDay: 4,
    condition: 'excellent',
    location: 'Additive Manufacturing Lab',
    tags: ['3d printing', 'biomedical', 'fabrication'],
    isFree: false
  },
  {
    name: 'Supercomputing Node (V100 GPU)',
    category: 'Computing',
    description: 'Access to a high-performance compute node with NVIDIA V100 GPU for AI and deep learning research.',
    rentalPricePerDay: 1,
    condition: 'excellent',
    location: 'Virtual / Server Room 1',
    tags: ['gpu', 'ai', 'hpc'],
    isFree: false
  },
  {
    name: 'Ultrafast Laser System',
    category: 'Physics',
    description: 'Generates ultrashort pulses of light, typically in the femtosecond range.',
    rentalPricePerDay: 5,
    condition: 'fair',
    location: 'Optics Lab, Basement',
    tags: ['laser', 'physics', 'optics'],
    isFree: false
  },
  {
    name: 'Cleanroom Access (Class 1000)',
    category: 'Other',
    description: 'Controlled environment that has a low level of pollutants such as dust, airborne microbes, aerosol particles, and chemical vapors.',
    rentalPricePerDay: 5,
    condition: 'excellent',
    location: 'Cleanroom Complex',
    tags: ['cleanroom', 'fabrication', 'semiconductor'],
    isFree: false
  },
  {
    name: 'Centrifuge (Ultra-speed)',
    category: 'Biology',
    description: 'Specialized centrifuge optimized for spinning samples at exceptionally high speeds.',
    rentalPricePerDay: 1,
    condition: 'good',
    location: 'Biology Shared Lab',
    tags: ['centrifuge', 'lab', 'biology'],
    isFree: false
  }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    if (users.length < 2) {
      console.log('Need at least 2 users in the database to assign equipment to different users.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users. Distributing ${ADDITIONAL_EQUIPMENT.length} equipment items...`);

    let addedCount = 0;
    for (let i = 0; i < ADDITIONAL_EQUIPMENT.length; i++) {
      const eqData = ADDITIONAL_EQUIPMENT[i];
      // Cycle through users to ensure different owners
      const owner = users[i % users.length];

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
        maxBookingDays: Math.floor(Math.random() * 14) + 3,
        requiresTraining: Math.random() > 0.5,
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
