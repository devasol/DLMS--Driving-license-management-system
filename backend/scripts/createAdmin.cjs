const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB connection string - make sure this matches your actual connection string
const MONGODB_URI = "mongodb://localhost:27017/dlms";

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Use the direct MongoDB driver approach for reliability
    const db = mongoose.connection.db;

    // Create or access the admin collection
    console.log("Accessing admin collection...");

    // Check if admin exists
    const existingAdmin = await db
      .collection("admin")
      .findOne({ admin_email: "admin@example.com" });

    // Hash password
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingAdmin) {
      console.log("Admin exists, updating password...");

      // Update admin
      await db.collection("admin").updateOne(
        { admin_email: "admin@example.com" },
        {
          $set: {
            admin_password: hashedPassword,
            admin_name: "System Administrator",
          },
        }
      );

      console.log("Admin password updated successfully");
    } else {
      console.log("Creating new admin...");

      // Create admin document matching the structure in db.json
      const adminDoc = {
        admin_name: "System Administrator",
        admin_username: "admin",
        admin_password: hashedPassword,
        admin_email: "admin@example.com",
        created_at: new Date(),
        admin_photo: null,
      };

      // Insert admin
      await db.collection("admin").insertOne(adminDoc);
      console.log("Admin created successfully");
    }

    // Verify admin exists
    const admin = await db
      .collection("admin")
      .findOne({ admin_email: "admin@example.com" });
    console.log("Admin in database:", admin);

    console.log("\n=== ADMIN LOGIN CREDENTIALS ===");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    console.log("===============================");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the function
createAdmin().catch(console.error);
