import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function testUserHistory() {
  try {
    console.log("🧪 Testing user history functionality...");
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get a test user
    const user = await User.findOne({}).limit(1);
    if (!user) {
      console.log("❌ No users found. Please create some users first.");
      return;
    }

    console.log(`👤 Testing with user: ${user.fullName || user.full_name || user.email}`);
    console.log(`🆔 User ID: ${user._id}`);

    // Test the API endpoint
    const response = await fetch(`http://localhost:5004/api/user-activity/${user._id}/history`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("\n📊 History API Response:");
      console.log(`✅ Success: ${data.success}`);
      console.log(`📈 Total Activities: ${data.data.statistics.totalActivities}`);
      console.log(`📋 Activities in current page: ${data.data.activities.length}`);
      
      if (data.data.activities.length > 0) {
        console.log("\n🔍 Sample Activities:");
        data.data.activities.slice(0, 3).forEach((activity, index) => {
          console.log(`  ${index + 1}. ${activity.description} (${activity.status})`);
          console.log(`     Type: ${activity.activityType}, Date: ${new Date(activity.createdAt).toLocaleDateString()}`);
        });
      }

      if (data.data.license) {
        console.log("\n🪪 License Information:");
        console.log(`  Number: ${data.data.license.number || "Not assigned"}`);
        console.log(`  Status: ${data.data.license.status}`);
        console.log(`  Points: ${data.data.license.points}`);
        console.log(`  Violations: ${data.data.license.violationsCount}`);
      }

      console.log("\n📈 Activity Breakdown:");
      data.data.statistics.activityBreakdown.forEach(item => {
        console.log(`  ${item._id}: ${item.count} activities`);
      });

    } else {
      console.log(`❌ API request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`Error details: ${errorText}`);
    }

  } catch (error) {
    console.error("❌ Error testing user history:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the test
testUserHistory();
