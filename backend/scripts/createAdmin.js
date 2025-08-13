import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function createAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    const db = mongoose.connection.db;

    // Check if admin already exists
    const adminEmail = "admin@example.com";
    const existingAdmin = await db.collection("admins").findOne({ admin_email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.admin_email);
      return;
    }

    // Create admin collection if it doesn't exist
    const collections = await db.listCollections().toArray();
    if (!collections.some(c => c.name === "admins")) {
      console.log("Creating admins collection...");
      await db.createCollection("admins");
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = {
      admin_name: "System Admin",
      admin_email: adminEmail,
      admin_username: "admin",
      admin_password: hashedPassword,
      role: "admin",
      isAdmin: true,
      createdAt: new Date()
    };

    const result = await db.collection("admins").insertOne(admin);
    console.log("Admin created successfully with ID:", result.insertedId);

    // Also add admin to users collection for compatibility
    const userAdmin = {
      fullName: "System Admin",
      email: adminEmail,
      user_email: adminEmail,
      password: hashedPassword,
      user_password: hashedPassword,
      role: "admin",
      isAdmin: true,
      createdAt: new Date()
    };

    await db.collection("users").insertOne(userAdmin);
    console.log("Admin also added to users collection for compatibility");

    console.log("\nAdmin login credentials:");
    console.log("Email:", adminEmail);
    console.log("Password: admin123");

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error creating admin:", error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

createAdmin()
  .then(() => {
    console.log("Admin creation process completed");
    process.exit(0);
  })
  .catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
