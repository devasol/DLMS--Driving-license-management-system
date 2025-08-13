import mongoose from "mongoose";
import dotenv from "dotenv";
import ExamSchedule from "../models/examSchedule.js";
import User from "../models/User.js"; // Correct casing for User model

// Make sure dotenv is configured before using process.env
dotenv.config();

// Connect to MongoDB with error handling
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dlms")
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

const seedExams = async () => {
  try {
    // First, find a user to associate with the exams
    console.log("Looking for a user...");
    const user = await User.findOne({ role: "user" });

    if (!user) {
      console.error("No user found to associate with exams");
      return;
    }

    console.log(`Found user: ${user._id}`);

    // Delete existing exams
    await ExamSchedule.deleteMany({});
    console.log("Deleted existing exams");

    // Create sample exams
    const exams = [
      {
        userId: user._id,
        fullName: user.fullName || "Test User",
        examType: "theory",
        title: "Written Test - Class B",
        date: new Date(),
        time: "10:00",
        location: "Test Center A",
        status: "scheduled",
      },
      {
        userId: user._id,
        fullName: user.fullName || "Test User",
        examType: "practical",
        title: "Practical Test - Class A",
        date: new Date(Date.now() + 86400000), // Tomorrow
        time: "14:00",
        location: "Test Center B",
        status: "scheduled",
      },
      {
        userId: user._id,
        fullName: user.fullName || "Test User",
        examType: "theory",
        title: "Written Test - Class C",
        date: new Date(Date.now() - 86400000), // Yesterday
        time: "09:00",
        location: "Test Center A",
        status: "completed",
        result: "pass",
      },
    ];

    await ExamSchedule.insertMany(exams);
    console.log(`Seeded ${exams.length} exams`);

    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Error seeding exams:", error);
    mongoose.disconnect();
  }
};

seedExams();
