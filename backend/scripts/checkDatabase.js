import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get database instance
    const db = mongoose.connection.db;

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("\n=== DATABASE COLLECTIONS ===");
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Check users collection
    console.log("\n=== USERS COLLECTION ===");
    const users = await db.collection("users").find({}).toArray();
    console.log(`Total users: ${users.length}`);
    
    if (users.length > 0) {
      // Show sample user (first user) without password
      const sampleUser = { ...users[0] };
      sampleUser.user_password = "[HIDDEN]";
      console.log("Sample user structure:", sampleUser);
      
      // List all user emails
      console.log("User emails:");
      users.forEach(user => {
        console.log(`- ${user.user_email || user.email}`);
      });
    }

    // Check admins collection
    console.log("\n=== ADMINS COLLECTION ===");
    try {
      const admins = await db.collection("admins").find({}).toArray();
      console.log(`Total admins: ${admins.length}`);
      
      if (admins.length > 0) {
        // Show sample admin (first admin) without password
        const sampleAdmin = { ...admins[0] };
        sampleAdmin.admin_password = "[HIDDEN]";
        console.log("Sample admin structure:", sampleAdmin);
        
        // List all admin emails
        console.log("Admin emails:");
        admins.forEach(admin => {
          console.log(`- ${admin.admin_email || admin.email}`);
        });
      }
    } catch (error) {
      console.log("Admins collection not found or error:", error.message);
    }

    // Check admin collection (singular, in case it's using this name instead)
    console.log("\n=== ADMIN COLLECTION (singular) ===");
    try {
      const adminSingular = await db.collection("admin").find({}).toArray();
      console.log(`Total admins (in 'admin' collection): ${adminSingular.length}`);
      
      if (adminSingular.length > 0) {
        // Show sample admin (first admin) without password
        const sampleAdmin = { ...adminSingular[0] };
        sampleAdmin.admin_password = "[HIDDEN]";
        console.log("Sample admin structure:", sampleAdmin);
        
        // List all admin emails
        console.log("Admin emails:");
        adminSingular.forEach(admin => {
          console.log(`- ${admin.admin_email || admin.email}`);
        });
      }
    } catch (error) {
      console.log("Admin collection not found or error:", error.message);
    }

    // Check indexes on users collection
    console.log("\n=== INDEXES ON USERS COLLECTION ===");
    const userIndexes = await db.collection("users").indexes();
    console.log(userIndexes);

  } catch (error) {
    console.error("Database check error:", error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed");
  }
}

// Run the function
checkDatabase().catch(console.error);