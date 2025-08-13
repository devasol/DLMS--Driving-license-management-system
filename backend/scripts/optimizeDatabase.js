import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./backend/.env" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function optimizeDatabase() {
  try {
    console.log("🚀 Starting database optimization...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // Create indexes for better query performance
    console.log("📊 Creating database indexes...");

    // Clean up duplicate null emails first
    console.log("🧹 Cleaning up duplicate null emails...");
    await db.collection("users").deleteMany({ email: null });

    // Users collection indexes
    try {
      await db
        .collection("users")
        .createIndex({ email: 1 }, { unique: true, sparse: true });
    } catch (error) {
      if (error.code !== 11000) throw error;
      console.log(
        "⚠️ Email index already exists or has duplicates, skipping..."
      );
    }

    await db.collection("users").createIndex({ nic: 1 }, { sparse: true });
    await db.collection("users").createIndex({ isEmailVerified: 1 });
    await db.collection("users").createIndex({ createdAt: -1 });
    console.log("✅ Users indexes created");

    // Applications collection indexes
    await db.collection("applications").createIndex({ userId: 1 });
    await db.collection("applications").createIndex({ status: 1 });
    await db.collection("applications").createIndex({ licenseType: 1 });
    await db.collection("applications").createIndex({ applicationDate: -1 });
    await db.collection("applications").createIndex({ userId: 1, status: 1 });
    console.log("✅ Applications indexes created");

    // License applications collection indexes
    await db.collection("licenseapplications").createIndex({ userId: 1 });
    await db.collection("licenseapplications").createIndex({ status: 1 });
    await db.collection("licenseapplications").createIndex({ licenseType: 1 });
    await db.collection("licenseapplications").createIndex({ createdAt: -1 });
    await db
      .collection("licenseapplications")
      .createIndex({ userId: 1, status: 1 });
    console.log("✅ License applications indexes created");

    // Payments collection indexes
    await db.collection("payments").createIndex({ userId: 1 });
    await db.collection("payments").createIndex({ status: 1 });
    await db.collection("payments").createIndex({ paymentType: 1 });
    await db.collection("payments").createIndex({ createdAt: -1 });
    await db.collection("payments").createIndex({ userId: 1, status: 1 });
    console.log("✅ Payments indexes created");

    // Exams collection indexes
    await db.collection("exams").createIndex({ userId: 1 });
    await db.collection("exams").createIndex({ examType: 1 });
    await db.collection("exams").createIndex({ status: 1 });
    await db.collection("exams").createIndex({ examDate: -1 });
    await db.collection("exams").createIndex({ userId: 1, examType: 1 });
    console.log("✅ Exams indexes created");

    // Exam results collection indexes
    await db.collection("examresults").createIndex({ userId: 1 });
    await db.collection("examresults").createIndex({ examType: 1 });
    await db.collection("examresults").createIndex({ passed: 1 });
    await db.collection("examresults").createIndex({ createdAt: -1 });
    await db.collection("examresults").createIndex({ userId: 1, examType: 1 });
    console.log("✅ Exam results indexes created");

    // Exam schedules collection indexes
    await db.collection("examschedules").createIndex({ userId: 1 });
    await db.collection("examschedules").createIndex({ examType: 1 });
    await db.collection("examschedules").createIndex({ status: 1 });
    await db.collection("examschedules").createIndex({ examDate: 1 });
    await db.collection("examschedules").createIndex({ userId: 1, status: 1 });
    console.log("✅ Exam schedules indexes created");

    // Licenses collection indexes
    await db.collection("licenses").createIndex({ userId: 1 });
    await db
      .collection("licenses")
      .createIndex({ licenseNumber: 1 }, { unique: true, sparse: true });
    await db.collection("licenses").createIndex({ status: 1 });
    await db.collection("licenses").createIndex({ class: 1 });
    await db.collection("licenses").createIndex({ expiryDate: 1 });
    await db.collection("licenses").createIndex({ userId: 1, status: 1 });
    console.log("✅ Licenses indexes created");

    // Notifications collection indexes
    await db.collection("notifications").createIndex({ userId: 1 });
    await db.collection("notifications").createIndex({ isRead: 1 });
    await db.collection("notifications").createIndex({ type: 1 });
    await db.collection("notifications").createIndex({ createdAt: -1 });
    await db.collection("notifications").createIndex({ userId: 1, isRead: 1 });
    console.log("✅ Notifications indexes created");

    // User activities collection indexes
    await db.collection("useractivities").createIndex({ userId: 1 });
    await db.collection("useractivities").createIndex({ activityType: 1 });
    await db.collection("useractivities").createIndex({ createdAt: -1 });
    await db
      .collection("useractivities")
      .createIndex({ userId: 1, createdAt: -1 });
    await db.collection("useractivities").createIndex({ isVisible: 1 });
    console.log("✅ User activities indexes created");

    // News collection indexes
    await db.collection("news").createIndex({ status: 1, publishDate: -1 });
    await db.collection("news").createIndex({ category: 1, status: 1 });
    await db.collection("news").createIndex({ isSticky: -1, publishDate: -1 });
    await db.collection("news").createIndex({ tags: 1 });
    await db.collection("news").createIndex({ author: 1 });
    console.log("✅ News indexes created");

    // Feedbacks collection indexes
    await db.collection("feedbacks").createIndex({ status: 1 });
    await db.collection("feedbacks").createIndex({ category: 1 });
    await db.collection("feedbacks").createIndex({ createdAt: -1 });
    await db.collection("feedbacks").createIndex({ userId: 1 });
    console.log("✅ Feedbacks indexes created");

    // Reports collection indexes
    await db
      .collection("reports")
      .createIndex({ reportType: 1, createdAt: -1 });
    await db
      .collection("reports")
      .createIndex({ generatedBy: 1, createdAt: -1 });
    await db.collection("reports").createIndex({ status: 1, createdAt: -1 });
    console.log("✅ Reports indexes created");

    // Admins collection indexes
    await db
      .collection("admins")
      .createIndex({ admin_email: 1 }, { unique: true });
    await db
      .collection("admins")
      .createIndex({ admin_username: 1 }, { unique: true, sparse: true });
    console.log("✅ Admins indexes created");

    console.log("🎉 Database optimization completed successfully!");

    // Show index statistics
    const collections = await db.listCollections().toArray();
    console.log("\n📊 Index Statistics:");

    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      console.log(`${collection.name}: ${indexes.length} indexes`);
    }
  } catch (error) {
    console.error("❌ Database optimization failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run optimization
optimizeDatabase();
