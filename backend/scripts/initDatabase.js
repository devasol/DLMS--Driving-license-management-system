import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function initDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    console.log("Connection string:", MONGODB_URI);

    // Set mongoose options for better stability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log("Connected to MongoDB successfully");

    // Get database instance
    const db = mongoose.connection.db;

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("\n=== EXISTING COLLECTIONS ===");
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    // Check if users collection exists, create it if not
    if (!collections.some((c) => c.name === "users")) {
      console.log("\nCreating users collection...");
      await db.createCollection("users");
      console.log("Users collection created successfully");

      // Create sample users
      const sampleUsers = [
        {
          fullName: "Admin User",
          email: "admin@example.com",
          user_email: "admin@example.com",
          password:
            "$2a$10$ij3QFcxvs0oJKHZh5xQGkuBWMTB.wjUP5rT5bX.ghbNnkOFnggPXe", // "password123"
          role: "admin",
          isAdmin: true,
          phone: "1234567890",
          contact_no: "1234567890",
          address: "123 Admin St",
          gender: "Male",
          createdAt: new Date(),
        },
        {
          fullName: "Regular User",
          email: "user@example.com",
          user_email: "user@example.com",
          password:
            "$2a$10$ij3QFcxvs0oJKHZh5xQGkuBWMTB.wjUP5rT5bX.ghbNnkOFnggPXe", // "password123"
          role: "user",
          isAdmin: false,
          phone: "0987654321",
          contact_no: "0987654321",
          address: "456 User Ave",
          gender: "Female",
          createdAt: new Date(),
        },
      ];

      const result = await db.collection("users").insertMany(sampleUsers);
      console.log(`Created ${result.insertedCount} sample users`);
    } else {
      console.log("\nUsers collection already exists");

      // Count users
      const userCount = await db.collection("users").countDocuments();
      console.log(`Found ${userCount} existing users`);
    }

    // Check if licenseapplications collection exists, create it if not
    if (!collections.some((c) => c.name === "licenseapplications")) {
      console.log("\nCreating licenseapplications collection...");
      await db.createCollection("licenseapplications");
      console.log("License applications collection created successfully");
    } else {
      console.log("\nLicense applications collection already exists");

      // Count applications
      const appCount = await db
        .collection("licenseapplications")
        .countDocuments();
      console.log(`Found ${appCount} existing license applications`);
    }

    console.log("\nDatabase initialization completed successfully");

    // List all collections after initialization
    const updatedCollections = await db.listCollections().toArray();
    console.log("\n=== COLLECTIONS AFTER INITIALIZATION ===");
    updatedCollections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    // Close the connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");

    return { success: true };
  } catch (error) {
    console.error("Database initialization error:", error);

    // Try to close the connection if it's open
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log("Database connection closed after error");
      }
    } catch (closeError) {
      console.error("Error closing database connection:", closeError);
    }

    return { success: false, error: error.message };
  }
}

// Run the initialization function
initDatabase()
  .then((result) => {
    if (result.success) {
      console.log("Database initialization script completed successfully");
      process.exit(0);
    } else {
      console.error("Database initialization failed:", result.error);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Unhandled error in initialization script:", err);
    process.exit(1);
  });
