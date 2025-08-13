import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function createAdminUser() {
  try {
    console.log("🔧 Creating admin user...");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/dlms"
    );
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // Check if admin already exists
    const existingAdmin = await db
      .collection("admins")
      .findOne({ admin_email: "admin@dlms.com" });
    if (existingAdmin) {
      console.log("✅ Admin user already exists:", existingAdmin.admin_email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const adminUser = {
      admin_name: "System Administrator",
      admin_username: "admin",
      admin_email: "admin@dlms.com",
      admin_password: hashedPassword,
      role: "admin",
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection("admins").insertOne(adminUser);
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@dlms.com");
    console.log("🔑 Password: admin123");

    // Also create backup admin in users collection
    const User = mongoose.model(
      "User",
      new mongoose.Schema({}, { strict: false })
    );
    const backupAdmin = {
      full_name: "System Administrator",
      user_name: "admin",
      user_email: "admin@example.com",
      user_password: hashedPassword,
      role: "admin",
      isAdmin: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const existingBackupAdmin = await User.findOne({
      user_email: "admin@example.com",
    });
    if (!existingBackupAdmin) {
      await User.create(backupAdmin);
      console.log("✅ Backup admin user created in users collection!");
      console.log("📧 Backup Email: admin@example.com");
      console.log("🔑 Backup Password: admin123");
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

createAdminUser();
