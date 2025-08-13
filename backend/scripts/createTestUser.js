import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Use the direct MongoDB driver approach
    const db = mongoose.connection.db;

    // Check if user exists
    const existingUser = await db
      .collection("users")
      .findOne({ user_email: "test@example.com" });

    // Hash password
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique NIC with timestamp to avoid duplicates
    const uniqueNic = `TEST${Date.now()}`;

    if (existingUser) {
      console.log("Test user exists, updating password...");

      // Update user
      await db.collection("users").updateOne(
        { user_email: "test@example.com" },
        {
          $set: {
            user_password: hashedPassword,
            // Only update NIC if there's a duplicate key error
            nic: existingUser.nic || uniqueNic,
          },
        }
      );

      console.log("Test user password updated successfully");
    } else {
      console.log("Creating new test user...");

      // Create user document
      const userDoc = {
        full_name: "Test User",
        user_name: "testuser",
        user_password: hashedPassword,
        user_email: "test@example.com",
        gender: "male",
        contact_no: "1234567890",
        nic: uniqueNic,
        role: "user",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert user
      await db.collection("users").insertOne(userDoc);
      console.log("Test user created successfully");
    }

    // Verify user exists
    const user = await db
      .collection("users")
      .findOne({ user_email: "test@example.com" });
    console.log("Test user in database:", user);

    console.log("\n=== TEST USER LOGIN CREDENTIALS ===");
    console.log("Email: test@example.com");
    console.log("Password: password123");
    console.log("===================================");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the function
createTestUser().catch(console.error);
