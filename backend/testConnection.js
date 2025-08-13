import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function testConnection() {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("Connection string:", MONGODB_URI);

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB!");

    // Get database instance
    const db = mongoose.connection.db;

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("\n=== DATABASE COLLECTIONS ===");
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    // Check if users collection exists
    const hasUsers = collections.some((col) => col.name === "users");
    console.log(`\nUsers collection exists: ${hasUsers ? "Yes" : "No"}`);

    if (hasUsers) {
      // Count users
      const userCount = await db.collection("users").countDocuments();
      console.log(`Total users: ${userCount}`);

      // Show sample user (first user) without password
      if (userCount > 0) {
        const sampleUser = await db.collection("users").findOne({});
        const sanitizedUser = { ...sampleUser };
        if (sanitizedUser.user_password)
          sanitizedUser.user_password = "[HIDDEN]";
        if (sanitizedUser.password) sanitizedUser.password = "[HIDDEN]";
        console.log("Sample user structure:", sanitizedUser);
      }
    }

    // Check for license applications
    console.log("\n=== LICENSE APPLICATIONS ===");
    const possibleCollections = [
      "licenseapplications",
      "license_applications",
      "applications",
    ];

    for (const collectionName of possibleCollections) {
      if (collections.some((col) => col.name === collectionName)) {
        console.log(`Found collection: ${collectionName}`);
        const count = await db.collection(collectionName).countDocuments();
        console.log(`Total documents: ${count}`);

        if (count > 0) {
          const sample = await db.collection(collectionName).findOne({});
          console.log("Sample document structure:", sample);
        }
      } else {
        console.log(`Collection '${collectionName}' does not exist`);
      }
    }

    // Close connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
}

testConnection();
