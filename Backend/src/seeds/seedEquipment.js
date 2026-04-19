/**
 * Equipment Seed Script
 * ---------------------
 * Adds sample lab equipment listings to the database.
 * 
 * Usage (from the Backend/ directory):
 *   node src/seeds/seedEquipment.js
 *
 * Options:
 *   --clear    Delete all existing equipment before seeding
 *   --bookings Also seed sample booking requests
 *
 * Examples:
 *   node src/seeds/seedEquipment.js
 *   node src/seeds/seedEquipment.js --clear
 *   node src/seeds/seedEquipment.js --clear --bookings
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env") });

import User from "../models/User.js";
import Equipment from "../models/Equipment.js";
import EquipmentBooking from "../models/EquipmentBooking.js";

const args = process.argv.slice(2);
const CLEAR    = args.includes("--clear");
const BOOKINGS = args.includes("--bookings");

// ─── Sample equipment data ────────────────────────────────────────────────────

const equipmentSamples = [
  {
    name: "Olympus BX53 Fluorescence Microscope",
    description:
      "High-performance upright fluorescence microscope with LED illumination system. Ideal for biological sample imaging, immunofluorescence studies, and live-cell imaging. Features multiple objective lenses (10x, 20x, 40x, 100x oil immersion).",
    category: "Microscopy",
    location: "Lab 204, Biology Building",
    specifications:
      "LED illumination: 365nm, 470nm, 530nm, 625nm\nObjectives: 10x/0.25, 20x/0.50, 40x/0.75, 100x/1.25 oil\nCamera: DP74 color CMOS 20.9 MP\nSoftware: cellSens v2.3",
    usageInstructions:
      "Users must complete a 30-minute orientation before first use. Do not touch optical surfaces. Clean immersion oil from 100x objective after each session.",
    isFree: true,
    rentalPricePerDay: 0,
    status: "available",
    condition: "excellent",
    requiresTraining: true,
    maxBookingDays: 3,
    tags: ["fluorescence", "microscopy", "imaging", "live-cell", "confocal"],
    availabilitySchedule: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "13:00" },
    ],
    blockedDates: [
      {
        start: new Date("2026-05-05"),
        end: new Date("2026-05-09"),
        reason: "Annual lab maintenance",
      },
    ],
  },
  {
    name: "Thermo Fisher Nicolet iS50 FT-IR Spectrometer",
    description:
      "Fourier-transform infrared spectrometer for chemical identification, material analysis, and quality control. Supports ATR (attenuated total reflectance) and transmission modes. Perfect for polymer, pharmaceutical, and organic compound analysis.",
    category: "Spectroscopy",
    location: "Chemistry Lab 108, Science Block",
    specifications:
      "Spectral range: 10,000–350 cm⁻¹\nResolution: up to 0.09 cm⁻¹\nDetector: DTGS/MCT\nSoftware: OMNIC Paradigm v2.1\nAccessories: Diamond ATR crystal, KBr beam splitter",
    usageInstructions:
      "Handle ATR crystal with care — do not apply excessive force. Purge with dry nitrogen when measuring below 2000 cm⁻¹. Record background spectrum before each session.",
    isFree: false,
    rentalPricePerDay: 25,
    status: "available",
    condition: "good",
    requiresTraining: true,
    maxBookingDays: 5,
    tags: ["FTIR", "spectroscopy", "chemistry", "ATR", "polymer", "pharmaceutical"],
    availabilitySchedule: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 5, startTime: "08:00", endTime: "16:00" },
    ],
    blockedDates: [],
  },
  {
    name: "Agilent 1260 Infinity II HPLC System",
    description:
      "High-performance liquid chromatography system for separation and quantification of molecules in complex mixtures. Suitable for pharmaceutical analysis, food quality testing, environmental monitoring, and proteomics research.",
    category: "Chromatography",
    location: "Analytical Chemistry Lab, Room 112",
    specifications:
      "Flow rate: 0.001–10 mL/min\nPressure: up to 600 bar\nColumns: C18, C8, HILIC, ion exchange\nDetectors: DAD (190–950 nm), RID, FLD\nAutosampler: 100-vial capacity",
    usageInstructions:
      "Prime system with appropriate solvent before use. Use HPLC-grade solvents only. Clean all sample vials thoroughly. Log column usage in the shared ledger.",
    isFree: false,
    rentalPricePerDay: 40,
    status: "available",
    condition: "excellent",
    requiresTraining: true,
    maxBookingDays: 7,
    tags: ["HPLC", "chromatography", "separation", "pharmaceutical", "environmental"],
    availabilitySchedule: [
      { dayOfWeek: 1, startTime: "07:00", endTime: "19:00" },
      { dayOfWeek: 2, startTime: "07:00", endTime: "19:00" },
      { dayOfWeek: 3, startTime: "07:00", endTime: "19:00" },
      { dayOfWeek: 4, startTime: "07:00", endTime: "19:00" },
      { dayOfWeek: 5, startTime: "07:00", endTime: "15:00" },
    ],
    blockedDates: [],
  },
  {
    name: "NVIDIA DGX A100 GPU Workstation",
    description:
      "High-performance AI and deep learning workstation powered by 8× NVIDIA A100 80 GB GPUs. Available for computationally intensive machine learning training, large-scale simulations, molecular dynamics, and data analysis workloads.",
    category: "Computing",
    location: "HPC Lab, Computer Science Building",
    specifications:
      "GPUs: 8× NVIDIA A100 80 GB (640 GB total GPU memory)\nCPU: 2× AMD EPYC 7742 (128 cores total)\nRAM: 1 TB DDR4\nStorage: 30 TB NVMe SSD\nNetwork: 8× HDR InfiniBand 200 Gb/s",
    usageInstructions:
      "Submit jobs via SLURM scheduler — no direct interactive GPU access without permission. Max wall time per job: 72 hours. Monitor GPU memory usage; terminate runaway processes promptly.",
    isFree: true,
    rentalPricePerDay: 0,
    status: "available",
    condition: "excellent",
    requiresTraining: false,
    maxBookingDays: 7,
    tags: ["GPU", "deep learning", "AI", "HPC", "CUDA", "machine learning"],
    availabilitySchedule: [
      { dayOfWeek: 0, startTime: "00:00", endTime: "23:59" },
      { dayOfWeek: 1, startTime: "00:00", endTime: "23:59" },
      { dayOfWeek: 2, startTime: "00:00", endTime: "23:59" },
      { dayOfWeek: 3, startTime: "00:00", endTime: "23:59" },
      { dayOfWeek: 4, startTime: "00:00", endTime: "23:59" },
      { dayOfWeek: 5, startTime: "00:00", endTime: "23:59" },
      { dayOfWeek: 6, startTime: "00:00", endTime: "23:59" },
    ],
    blockedDates: [
      {
        start: new Date("2026-05-01"),
        end: new Date("2026-05-03"),
        reason: "System upgrade & driver update",
      },
    ],
  },
  {
    name: "Bruker AXS D8 Advance X-ray Diffractometer (XRD)",
    description:
      "Powder X-ray diffractometer for crystal structure determination, phase identification, and lattice parameter refinement. Widely used in materials science, mineralogy, ceramics, and thin-film characterisation.",
    category: "Physics",
    location: "Materials Characterization Lab, Engineering Block",
    specifications:
      "X-ray source: Cu Kα (λ = 1.5418 Å)\n2θ range: 5°–90°\nDetector: LYNXEYE position-sensitive detector\nSample holders: reflection, transmission, capillary\nSoftware: DIFFRAC.EVA, TOPAS for Rietveld refinement",
    usageInstructions:
      "Do not open the safety enclosure while tube is running. Wear dosimeter badge at all times in the XRD room. Compact samples to flat, smooth surfaces for best results.",
    isFree: false,
    rentalPricePerDay: 30,
    status: "available",
    condition: "good",
    requiresTraining: true,
    maxBookingDays: 3,
    tags: ["XRD", "diffraction", "crystallography", "materials", "thin film", "powder"],
    availabilitySchedule: [
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
    ],
    blockedDates: [],
  },
  {
    name: "Zeiss LSM 900 Confocal Laser Scanning Microscope",
    description:
      "State-of-the-art confocal system for 3D optical sectioning of biological and material specimens. Features Airyscan 2 super-resolution detector providing 120 nm lateral and 350 nm axial resolution. Equipped with incubator for long-term live imaging.",
    category: "Microscopy",
    location: "Bioimaging Core Facility, Life Sciences Tower",
    specifications:
      "Lasers: 405, 445, 488, 514, 561, 639 nm\nObjectives: 10x/0.30 Dry, 20x/0.80 Dry, 40x/1.30 Oil, 63x/1.40 Oil\nAiryscan mode: up to 120 nm lateral resolution\nEnvironment: CO₂, humidity, temperature controlled",
    usageInstructions:
      "Book minimum 2-hour slots. Warm up incubator 1 hour in advance for live imaging. Do not leave samples unattended for > 15 min. Log session data in the shared Google Sheet.",
    isFree: false,
    rentalPricePerDay: 60,
    status: "available",
    condition: "excellent",
    requiresTraining: true,
    maxBookingDays: 2,
    tags: ["confocal", "microscopy", "live imaging", "3D", "super-resolution", "Zeiss"],
    availabilitySchedule: [
      { dayOfWeek: 1, startTime: "08:30", endTime: "18:30" },
      { dayOfWeek: 2, startTime: "08:30", endTime: "18:30" },
      { dayOfWeek: 3, startTime: "08:30", endTime: "18:30" },
      { dayOfWeek: 4, startTime: "08:30", endTime: "18:30" },
      { dayOfWeek: 5, startTime: "08:30", endTime: "14:00" },
    ],
    blockedDates: [],
  },
  {
    name: "Bio-Rad CFX Opus 96 Real-Time PCR System",
    description:
      "96-well real-time PCR thermocycler for gene expression analysis, SNP genotyping, pathogen detection, and quantification of nucleic acids. Supports SYBR Green and TaqMan probe-based assays.",
    category: "Biology",
    location: "Molecular Biology Lab, Room 306",
    specifications:
      "Well format: 96-well (0.2 mL tubes/plates)\nOptical channels: 6 (FAM, SYBR, HEX, ROX, Cy5, Quasar 705)\nTemp range: 4–100°C\nRamp rate: 3.5°C/s (max)\nSoftware: CFX Maestro v2.3",
    usageInstructions:
      "Use optical-grade PCR plates only. Centrifuge plates briefly before loading. Keep the optical surface clean — wipe with lint-free cloth. Sign usage log after each run.",
    isFree: true,
    rentalPricePerDay: 0,
    status: "available",
    condition: "good",
    requiresTraining: false,
    maxBookingDays: 2,
    tags: ["PCR", "qPCR", "molecular biology", "gene expression", "TaqMan", "genomics"],
    availabilitySchedule: [
      { dayOfWeek: 1, startTime: "07:00", endTime: "20:00" },
      { dayOfWeek: 2, startTime: "07:00", endTime: "20:00" },
      { dayOfWeek: 3, startTime: "07:00", endTime: "20:00" },
      { dayOfWeek: 4, startTime: "07:00", endTime: "20:00" },
      { dayOfWeek: 5, startTime: "07:00", endTime: "18:00" },
      { dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
    ],
    blockedDates: [],
  },
  {
    name: "Instron 5966 Universal Testing Machine",
    description:
      "Dual-column tabletop universal testing system for tensile, compression, flexure, and peel testing of materials. Suitable for metals, polymers, composites, textiles, and biological tissues. Load cell capacity up to 10 kN.",
    category: "Physics",
    location: "Mechanical Testing Lab, Engineering Block B",
    specifications:
      "Load capacity: up to 10 kN\nCrosshead speed: 0.001–1000 mm/min\nLoad cells: 10 N, 1 kN, 10 kN\nGrips: pneumatic, wedge, compression platens, 3-point bend\nSoftware: Bluehill Universal v4.0",
    usageInstructions:
      "Ensure load cell is properly calibrated before use. Do not exceed rated load. Wear safety glasses. Grip specimens symmetrically to avoid bending moments.",
    isFree: false,
    rentalPricePerDay: 20,
    status: "available",
    condition: "good",
    requiresTraining: true,
    maxBookingDays: 5,
    tags: ["tensile", "mechanical testing", "materials", "polymer", "composite", "UTM"],
    availabilitySchedule: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
    ],
    blockedDates: [],
  },
  {
    name: "Rotary Evaporator (Büchi R-300)",
    description:
      "Bench-top rotary evaporator for gentle solvent removal under reduced pressure. Ideal for concentration or purification of organic compounds, extraction of plant metabolites, and solvent recycling. Includes glass assembly and vacuum pump.",
    category: "Chemistry",
    location: "Organic Chemistry Lab 210",
    specifications:
      "Flask size: 50 mL–5 L\nRotation speed: 20–280 rpm\nHeating bath: up to 180°C\nVacuum: oil-free diaphragm pump (down to 2 mbar)\nCooling: recirculating chiller (−10°C to +30°C)",
    usageInstructions:
      "Use correct flask clamp to secure evaporation flask. Start vacuum before increasing temperature. Keep bath temperature ≤ 60°C for most organic solvents. Dispose of recovered solvents according to lab waste policy.",
    isFree: true,
    rentalPricePerDay: 0,
    status: "available",
    condition: "fair",
    requiresTraining: false,
    maxBookingDays: 1,
    tags: ["rotary evaporator", "chemistry", "solvent", "extraction", "purification"],
    availabilitySchedule: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 2, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 4, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 5, startTime: "08:00", endTime: "16:00" },
    ],
    blockedDates: [],
  },
  {
    name: "Thermal Cycler — Applied Biosystems ProFlex 3×32",
    description:
      "Versatile PCR system with three independently controlled 32-well blocks, allowing three different programmes to run simultaneously. Supports gradient PCR for primer optimisation, and fast protocols as short as 38 minutes.",
    category: "Biology",
    location: "Genomics Lab, Room 408",
    specifications:
      "Wells: 3 × 32 = 96 total (independent blocks)\nTemp range: 4–100°C\nTemp accuracy: ±0.25°C\nGradient range: up to 24°C across 8 columns\nLid temperature: ambient to 110°C adjustable",
    usageInstructions:
      "Do not run more than 2 consecutive 3-hour cycles without a cooling break. Use the correct plate type for your block. Log cycle programmes with reference ID after each use.",
    isFree: true,
    rentalPricePerDay: 0,
    status: "available",
    condition: "good",
    requiresTraining: false,
    maxBookingDays: 3,
    tags: ["PCR", "thermocycler", "genomics", "molecular biology", "gradient PCR"],
    availabilitySchedule: [
      { dayOfWeek: 0, startTime: "07:00", endTime: "22:00" },
      { dayOfWeek: 1, startTime: "07:00", endTime: "22:00" },
      { dayOfWeek: 2, startTime: "07:00", endTime: "22:00" },
      { dayOfWeek: 3, startTime: "07:00", endTime: "22:00" },
      { dayOfWeek: 4, startTime: "07:00", endTime: "22:00" },
      { dayOfWeek: 5, startTime: "07:00", endTime: "22:00" },
      { dayOfWeek: 6, startTime: "09:00", endTime: "17:00" },
    ],
    blockedDates: [],
  },
  {
    name: "FEI Quanta 650 Environmental Scanning Electron Microscope (ESEM)",
    description:
      "Field-emission scanning electron microscope with environmental mode enabling imaging of uncoated, wet, or biological samples at low vacuum. Equipped with EDS detector for elemental analysis. Produces high-resolution secondary electron and backscattered electron images.",
    category: "Imaging",
    location: "Electron Microscopy Suite, Research Centre",
    specifications:
      "Resolution: 1.2 nm @ 30 kV (high vacuum) / 2.0 nm @ 30 kV (ESEM)\nAcceleration voltage: 200 V – 30 kV\nDetectors: ETD, CBS, BSED, EDS (Oxford Instruments)\nEDS: 80 mm² silicon drift detector\nSoftware: xT microscope control + AZtec EDS",
    usageInstructions:
      "Sputter-coat non-conductive samples with Au/Pd for high-vacuum imaging. Do not bring magnetic materials near the column. Pump down chamber slowly for fragile samples. Wear gloves when handling samples.",
    isFree: false,
    rentalPricePerDay: 75,
    status: "available",
    condition: "excellent",
    requiresTraining: true,
    maxBookingDays: 2,
    tags: ["SEM", "ESEM", "electron microscopy", "EDS", "materials", "imaging", "surface"],
    availabilitySchedule: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
    ],
    blockedDates: [
      {
        start: new Date("2026-04-28"),
        end: new Date("2026-04-30"),
        reason: "Detector calibration service",
      },
    ],
  },
  {
    name: "Oscilloscope — Tektronix MSO64 6-Series",
    description:
      "Mixed signal oscilloscope with 6 analog channels and 16 digital channels. Suited for electronics debugging, signal integrity analysis, sensor characterisation, and embedded systems development. Bandwidths up to 1 GHz upgradeable to 10 GHz.",
    category: "Electronics",
    location: "Electronics Prototyping Lab, Room 115",
    specifications:
      "Analog channels: 6 (1 GHz bandwidth)\nDigital channels: 16 via MSO probe\nSample rate: 25 GS/s\nRecord length: 31.25 M points\nTrigger types: edge, pulse width, setup-hold, serial protocols\nProtocol decode: I²C, SPI, UART, USB, CAN, LIN",
    usageInstructions:
      "Use matched probes only (1:1 or 10:1 as appropriate). Do not exceed 300 V CAT II input. Calibrate probes before fine timing measurements. Save waveforms to the shared NAS drive.",
    isFree: true,
    rentalPricePerDay: 0,
    status: "available",
    condition: "excellent",
    requiresTraining: false,
    maxBookingDays: 5,
    tags: ["oscilloscope", "electronics", "signal", "debugging", "embedded", "MSO"],
    availabilitySchedule: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "20:00" },
      { dayOfWeek: 2, startTime: "08:00", endTime: "20:00" },
      { dayOfWeek: 3, startTime: "08:00", endTime: "20:00" },
      { dayOfWeek: 4, startTime: "08:00", endTime: "20:00" },
      { dayOfWeek: 5, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 6, startTime: "10:00", endTime: "16:00" },
    ],
    blockedDates: [],
  },
];

// ─── Sample booking data (only created if --bookings flag is set) ─────────────

const sampleBookings = [
  {
    equipmentIndex: 0, // Fluorescence Microscope
    requesterIndex: 1, // second user in DB
    startDate: new Date("2026-05-12"),
    endDate: new Date("2026-05-13"),
    purpose: "Imaging GFP-labelled HeLa cells for apoptosis study",
    projectName: "Mitochondrial Dynamics in Cancer Cells",
    requesterNotes: "Will need 40x oil objective primarily",
    status: "approved",
  },
  {
    equipmentIndex: 1, // FT-IR Spectrometer
    requesterIndex: 1,
    startDate: new Date("2026-05-14"),
    endDate: new Date("2026-05-14"),
    purpose: "Characterising functional groups in synthesised polymer samples",
    projectName: "Biodegradable Hydrogel Synthesis",
    requesterNotes: "Will bring ~10 samples in KBr pellet form",
    status: "pending",
  },
  {
    equipmentIndex: 3, // GPU Workstation
    requesterIndex: 1,
    startDate: new Date("2026-05-20"),
    endDate: new Date("2026-05-26"),
    purpose: "Training a transformer language model on biomedical text corpus (~50 GB)",
    projectName: "BioMed-BERT: Domain-Adaptive Language Model",
    requesterNotes: "Will use 4 GPUs, job estimated at 60 hours",
    status: "pending",
  },
  {
    equipmentIndex: 6, // qPCR
    requesterIndex: 1,
    startDate: new Date("2026-05-08"),
    endDate: new Date("2026-05-09"),
    purpose: "Gene expression profiling — 12 targets across 24 patient samples",
    projectName: "Inflammatory Biomarkers in Sepsis",
    requesterNotes: "",
    status: "completed",
    rating: 5,
    reviewComment:
      "Excellent machine, very consistent results across all runs. Easy to operate. Highly recommend!",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  MongoDB connected");

  if (CLEAR) {
    await Equipment.deleteMany({});
    await EquipmentBooking.deleteMany({});
    console.log("🗑   Cleared existing equipment and bookings");
  }

  // Find users to act as owners/requesters
  const users = await User.find().limit(5).lean();
  if (users.length === 0) {
    console.error("❌  No users found in the database. Please register at least one user first, then run this script again.");
    process.exit(1);
  }

  console.log(`👥  Found ${users.length} user(s) — will distribute equipment ownership among them`);

  // Spread equipment ownership across available users
  const created = [];
  for (let i = 0; i < equipmentSamples.length; i++) {
    const ownerIndex = i % users.length;
    const eq = await Equipment.create({
      ...equipmentSamples[i],
      owner: users[ownerIndex]._id,
    });
    created.push(eq);
    console.log(`  ✓  [${i + 1}/${equipmentSamples.length}] "${eq.name}" → owner: ${users[ownerIndex].username}`);
  }

  // Seed sample bookings
  if (BOOKINGS && users.length >= 2) {
    console.log("\n📅  Seeding sample bookings…");
    for (const b of sampleBookings) {
      const equipment = created[b.equipmentIndex];
      const requester = users[b.requesterIndex];

      // Don't book own equipment
      if (equipment.owner.toString() === requester._id.toString()) {
        console.log(`  ⚠   Skipping booking for "${equipment.name}" — requester is the owner`);
        continue;
      }

      const bookingData = {
        equipment: equipment._id,
        requester: requester._id,
        startDate: b.startDate,
        endDate: b.endDate,
        purpose: b.purpose,
        projectName: b.projectName,
        requesterNotes: b.requesterNotes,
        status: b.status,
      };

      if (b.status === "completed") {
        bookingData.actualStartDate = b.startDate;
        bookingData.actualEndDate = b.endDate;
        if (b.rating) {
          bookingData.rating = b.rating;
          bookingData.reviewComment = b.reviewComment;
        }
      }

      await EquipmentBooking.create(bookingData);
      console.log(`  ✓  Booking "${equipment.name}" by ${requester.username} [${b.status}]`);
    }
  } else if (BOOKINGS) {
    console.log("⚠   Skipping bookings — need at least 2 users in the database");
  }

  console.log(`\n🎉  Done! ${created.length} equipment listings seeded successfully.`);
  if (BOOKINGS) console.log(`    Sample bookings also seeded.`);
  console.log("\n    Visit http://localhost:5173/equipment to see them in the app.\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
