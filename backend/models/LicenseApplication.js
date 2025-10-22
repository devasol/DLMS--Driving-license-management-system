import mongoose from "mongoose";

const licenseApplicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },
  nationality: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  documents: {
    drivingSchoolCertificate: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
    },
    nationalId: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
    },
    personalId: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
    },
    medicalCertificate: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
    },
  },
  licenseType: {
    type: String,
    required: true,
    enum: [
      "Category1", // Motorcycle License
      "Category2", // Three-Wheel Motorcycle License
      "Category3", // Automobile License
      "Category4-PublicI", // Public Transport - up to 20 seats
      "Category4-PublicII", // Public Transport - up to 45 seats
      "Category4-PublicIII", // Public Transport - beyond 45 seats
      "Category5-TruckI", // Truck - up to 3,500 kg
      "Category5-TruckII", // Truck without trailers or with crane
      "Category5-TruckIII", // Truck with/without trailers or cranes
      "Category6-FuelI", // Fuel tanker - up to 18,000 liters
      "Category6-FuelII", // Liquid-tank vehicles with/without trailer
      "Category7", // Machinery Operator License
    ],
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "under_review", "approved", "rejected", "expired"],
    default: "pending",
  },
  statusMessage: {
    type: String,
    default: "Application submitted and pending review",
  },
  reviewedBy: {
    type: String,
    required: false,
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const LicenseApplication = mongoose.model(
  "LicenseApplication",
  licenseApplicationSchema,
  "licenseapplications"
);

export default LicenseApplication;
