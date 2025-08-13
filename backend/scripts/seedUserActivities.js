import mongoose from "mongoose";
import dotenv from "dotenv";
import UserActivity from "../models/UserActivity.js";
import User from "../models/User.js";
import ActivityLogger from "../utils/activityLogger.js";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function seedUserActivities() {
  try {
    console.log("🌱 Starting to seed user activities...");
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all users
    const users = await User.find({}).limit(5);
    console.log(`📋 Found ${users.length} users`);

    if (users.length === 0) {
      console.log("❌ No users found. Please create some users first.");
      return;
    }

    // Clear existing activities
    await UserActivity.deleteMany({});
    console.log("🗑️ Cleared existing activities");

    // Sample activities for each user
    const sampleActivities = [
      {
        activityType: "login",
        action: "logged_in",
        description: "User logged into the system",
        details: { ipAddress: "192.168.1.100" },
        severity: "low",
        status: "success",
        tags: ["authentication", "login"],
      },
      {
        activityType: "profile_update",
        action: "updated",
        description: "Profile information updated",
        details: { updatedFields: ["phone", "address"] },
        severity: "low",
        status: "success",
        tags: ["profile", "update"],
      },
      {
        activityType: "license_application",
        action: "submitted",
        description: "License application submitted",
        details: { applicationId: "APP" + Math.random().toString(36).substr(2, 9) },
        severity: "low",
        status: "pending",
        tags: ["license", "application"],
      },
      {
        activityType: "exam_schedule",
        action: "scheduled",
        description: "Theory exam scheduled",
        details: { examType: "theory", examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        severity: "low",
        status: "success",
        tags: ["exam", "theory", "scheduled"],
      },
      {
        activityType: "exam_completion",
        action: "completed",
        description: "Theory exam completed",
        details: { examType: "theory", score: 85, passed: true },
        severity: "low",
        status: "success",
        tags: ["exam", "theory", "completed"],
      },
      {
        activityType: "payment_made",
        action: "completed",
        description: "Payment made for license application",
        details: { amount: 50, purpose: "license_application", paymentMethod: "credit_card" },
        severity: "low",
        status: "success",
        tags: ["payment", "license_application"],
      },
      {
        activityType: "document_upload",
        action: "uploaded",
        description: "Document uploaded: Identity Card",
        details: { documentType: "identity_card", fileName: "id_card.jpg" },
        severity: "low",
        status: "success",
        tags: ["document", "upload", "identity_card"],
      },
      {
        activityType: "system_notification",
        action: "received",
        description: "Notification received: Application Status Update",
        details: { title: "Application Status Update", type: "info" },
        severity: "low",
        status: "success",
        tags: ["notification", "info"],
      },
      {
        activityType: "exam_result",
        action: "published",
        description: "Practical exam result published",
        details: { examType: "practical", score: 78, passed: true },
        severity: "low",
        status: "success",
        tags: ["exam", "practical", "result"],
      },
      {
        activityType: "license_issued",
        action: "issued",
        description: "Driving license issued",
        details: { licenseNumber: "DL" + Math.random().toString(36).substr(2, 9).toUpperCase() },
        severity: "low",
        status: "success",
        tags: ["license", "issued"],
      },
    ];

    let totalActivitiesCreated = 0;

    // Create activities for each user
    for (const user of users) {
      console.log(`\n👤 Creating activities for user: ${user.fullName || user.full_name || user.email}`);
      
      // Create 5-8 random activities for each user
      const numActivities = Math.floor(Math.random() * 4) + 5; // 5-8 activities
      const userActivities = [];
      
      for (let i = 0; i < numActivities; i++) {
        const randomActivity = sampleActivities[Math.floor(Math.random() * sampleActivities.length)];
        
        // Create activity with random timestamp in the last 30 days
        const randomDaysAgo = Math.floor(Math.random() * 30);
        const activityDate = new Date();
        activityDate.setDate(activityDate.getDate() - randomDaysAgo);
        
        const activity = {
          userId: user._id,
          ...randomActivity,
          createdAt: activityDate,
          updatedAt: activityDate,
        };
        
        userActivities.push(activity);
      }
      
      // Insert activities for this user
      const createdActivities = await UserActivity.insertMany(userActivities);
      console.log(`   ✅ Created ${createdActivities.length} activities`);
      totalActivitiesCreated += createdActivities.length;
    }

    console.log(`\n🎉 Successfully seeded ${totalActivitiesCreated} user activities!`);
    console.log(`📊 Activities created for ${users.length} users`);
    
    // Show summary
    const activityCounts = await UserActivity.aggregate([
      {
        $group: {
          _id: "$activityType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    
    console.log("\n📈 Activity Summary:");
    activityCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count} activities`);
    });

  } catch (error) {
    console.error("❌ Error seeding user activities:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the seeding function
seedUserActivities();
