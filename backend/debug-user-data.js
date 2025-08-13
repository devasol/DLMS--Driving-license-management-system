import mongoose from "mongoose";
import User from "./models/User.js";

async function debugUserData() {
  try {
    console.log("🔍 Debugging User Data Structure\n");

    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/dlms", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Check User model
    console.log("\n📊 User Model Schema:");
    console.log("Schema paths:", Object.keys(User.schema.paths));

    // Get all users
    console.log("\n👥 All Users in Database:");
    const allUsers = await User.find({}).limit(5);
    console.log("Total users found:", allUsers.length);

    if (allUsers.length > 0) {
      console.log("\n📋 First User Structure:");
      console.log(JSON.stringify(allUsers[0], null, 2));

      console.log("\n🔍 Field Analysis:");
      const user = allUsers[0];
      console.log("- _id:", user._id);
      console.log("- fullName:", user.fullName);
      console.log("- full_name:", user.full_name);
      console.log("- email:", user.email);
      console.log("- user_email:", user.user_email);
      console.log("- role:", user.role);
      console.log("- isEmailVerified:", user.isEmailVerified);
      console.log("- createdAt:", user.createdAt);
      console.log("- createdAt type:", typeof user.createdAt);
    }

    // Test the aggregation directly
    console.log("\n🧪 Testing Aggregation Directly:");
    const start = new Date("2024-01-01");
    const end = new Date("2025-12-31");

    const aggregationResult = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $project: {
          _id: 1,
          fullName: {
            $cond: {
              if: "$fullName",
              then: "$fullName",
              else: "$full_name",
            },
          },
          email: {
            $cond: {
              if: "$email",
              then: "$email",
              else: "$user_email",
            },
          },
          role: 1,
          isEmailVerified: 1,
          createdAt: 1,
          status: {
            $cond: {
              if: "$isEmailVerified",
              then: "verified",
              else: "pending",
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    console.log("Aggregation result count:", aggregationResult.length);
    if (aggregationResult.length > 0) {
      console.log("First aggregation result:");
      console.log(JSON.stringify(aggregationResult[0], null, 2));
    }

    await mongoose.disconnect();
    console.log("\n✅ Database check complete");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

debugUserData();
