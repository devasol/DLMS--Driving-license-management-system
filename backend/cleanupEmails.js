import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function cleanupEmails() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("Available collections:", collectionNames);
    
    // Collections that might contain user data
    const userCollections = ["users", "user", "User"];
    
    for (const collName of userCollections) {
      if (collectionNames.includes(collName)) {
        console.log(`\nChecking collection: ${collName}`);
        
        // Get all users
        const users = await db.collection(collName).find({}).toArray();
        console.log(`Found ${users.length} documents`);
        
        // Create a map to track emails
        const emailMap = new Map();
        const duplicates = [];
        
        // Find duplicates
        for (const user of users) {
          const email = user.user_email || user.email;
          if (!email) continue;
          
          const normalizedEmail = email.toLowerCase().trim();
          
          if (emailMap.has(normalizedEmail)) {
            duplicates.push({
              id: user._id,
              email: normalizedEmail,
              originalId: emailMap.get(normalizedEmail)
            });
          } else {
            emailMap.set(normalizedEmail, user._id);
          }
        }
        
        console.log(`Found ${duplicates.length} duplicate emails`);
        
        if (duplicates.length > 0) {
          console.log("Duplicate emails:");
          duplicates.forEach(dup => {
            console.log(`- ${dup.email} (IDs: ${dup.originalId}, ${dup.id})`);
          });
          
          // Ask for confirmation before deleting
          console.log("\nWould you like to delete these duplicates? (yes/no)");
          // In a real script, you'd add user input here
          // For safety, we'll just log what would be deleted
          console.log("Would delete the following duplicate documents:");
          duplicates.forEach(dup => {
            console.log(`- Document with ID: ${dup.id} (email: ${dup.email})`);
          });
        }
      }
    }
    
    // Check for case-sensitive duplicates
    console.log("\nChecking for case-sensitive email duplicates...");
    for (const collName of userCollections) {
      if (collectionNames.includes(collName)) {
        const users = await db.collection(collName).find({}).toArray();
        
        // Create a map with lowercase emails
        const emailMap = new Map();
        const caseSensitiveDuplicates = [];
        
        for (const user of users) {
          const email = user.user_email || user.email;
          if (!email) continue;
          
          const lowerEmail = email.toLowerCase().trim();
          const originalEmail = email.trim();
          
          if (lowerEmail !== originalEmail) {
            console.log(`Found case difference: "${originalEmail}" vs "${lowerEmail}"`);
          }
          
          if (emailMap.has(lowerEmail) && emailMap.get(lowerEmail) !== originalEmail) {
            caseSensitiveDuplicates.push({
              id: user._id,
              original: originalEmail,
              lower: lowerEmail,
              otherVersion: emailMap.get(lowerEmail)
            });
          } else {
            emailMap.set(lowerEmail, originalEmail);
          }
        }
        
        console.log(`Found ${caseSensitiveDuplicates.length} case-sensitive duplicates in ${collName}`);
        caseSensitiveDuplicates.forEach(dup => {
          console.log(`- "${dup.original}" and "${dup.otherVersion}" (same as "${dup.lower}")`);
        });
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed");
  }
}

cleanupEmails().catch(console.error);