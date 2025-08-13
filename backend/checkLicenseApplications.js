import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function checkLicenseApplications() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    
    const db = mongoose.connection.db;
    
    // Check if licenseapplications collection exists
    const collectionExists = await db.listCollections({ name: "licenseapplications" }).hasNext();
    
    if (!collectionExists) {
      console.error("Collection 'licenseapplications' does not exist!");
      console.log("Available collections:");
      
      const collections = await db.listCollections().toArray();
      collections.forEach(col => console.log(`- ${col.name}`));
      
      return;
    }
    
    console.log("Collection 'licenseapplications' exists");
    
    // Count documents
    const count = await db.collection("licenseapplications").countDocuments();
    console.log(`Total documents: ${count}`);
    
    if (count === 0) {
      console.log("No documents found in the collection");
      
      // Create a sample document for testing
      console.log("Creating a sample application document...");
      
      const sampleApplication = {
        userId: "sample-user-id",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("1990-01-01"),
        gender: "male",
        nationality: "US",
        bloodGroup: "O+",
        phoneNumber: "1234567890",
        email: "john.doe@example.com",
        address: "123 Main St",
        city: "Anytown",
        state: "State",
        postalCode: "12345",
        country: "USA",
        documents: [
          {
            path: "/uploads/sample-id.jpg",
            description: "ID Proof",
            originalName: "id-card.jpg"
          }
        ],
        licenseType: "learner",
        status: "pending",
        statusMessage: "Application submitted and pending review",
        applicationDate: new Date(),
        lastUpdated: new Date()
      };
      
      const result = await db.collection("licenseapplications").insertOne(sampleApplication);
      console.log("Sample application created with ID:", result.insertedId);
    } else {
      // Get and display sample documents
      console.log("Sample documents:");
      
      const samples = await db.collection("licenseapplications")
        .find({})
        .limit(3)
        .toArray();
      
      samples.forEach((doc, index) => {
        console.log(`\nDocument ${index + 1}:`);
        console.log("ID:", doc._id);
        console.log("User ID:", doc.userId);
        console.log("Name:", `${doc.firstName} ${doc.lastName}`);
        console.log("License Type:", doc.licenseType);
        console.log("Status:", doc.status);
        console.log("Application Date:", doc.applicationDate);
        console.log("Document Keys:", Object.keys(doc));
      });
      
      // Count by status
      const statusCounts = await db.collection("licenseapplications").aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]).toArray();
      
      console.log("\nApplications by status:");
      statusCounts.forEach(status => {
        console.log(`${status._id}: ${status.count}`);
      });
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error:", error);
  }
}

checkLicenseApplications();