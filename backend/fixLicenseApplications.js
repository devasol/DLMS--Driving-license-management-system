import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function fixLicenseApplications() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    const db = mongoose.connection.db;

    // Check if licenseapplications collection exists
    const collectionExists = await db
      .listCollections({ name: "licenseapplications" })
      .hasNext();

    if (!collectionExists) {
      console.log(
        "Collection 'licenseapplications' does not exist, creating it..."
      );

      // Create the collection
      await db.createCollection("licenseapplications");
      console.log("Created 'licenseapplications' collection");

      // Create sample data
      const sampleApplications = [
        {
          userId: "user123",
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
              originalName: "id-card.jpg",
            },
          ],
          licenseType: "learner",
          status: "pending",
          statusMessage: "Application submitted and pending review",
          applicationDate: new Date(),
          lastUpdated: new Date(),
        },
        {
          userId: "user456",
          firstName: "Jane",
          lastName: "Smith",
          dateOfBirth: new Date("1985-05-15"),
          gender: "female",
          nationality: "US",
          bloodGroup: "A+",
          phoneNumber: "9876543210",
          email: "jane.smith@example.com",
          address: "456 Oak Ave",
          city: "Othertown",
          state: "State",
          postalCode: "54321",
          country: "USA",
          documents: [
            {
              path: "/uploads/sample-id-2.jpg",
              description: "ID Proof",
              originalName: "id-card.jpg",
            },
          ],
          licenseType: "permanent",
          status: "under_review",
          statusMessage: "Application is under review",
          reviewedBy: "admin123",
          applicationDate: new Date(Date.now() - 86400000), // Yesterday
          lastUpdated: new Date(),
        },
      ];

      const result = await db
        .collection("licenseapplications")
        .insertMany(sampleApplications);
      console.log(`Inserted ${result.insertedCount} sample applications`);
      console.log("Sample application IDs:", result.insertedIds);
    } else {
      console.log("Collection 'licenseapplications' already exists");

      // Count documents
      const count = await db.collection("licenseapplications").countDocuments();
      console.log(`Total documents in collection: ${count}`);

      if (count === 0) {
        console.log("Collection exists but is empty. Adding sample data...");

        // Create sample data
        const sampleApplications = [
          {
            userId: "user123",
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
                originalName: "id-card.jpg",
              },
            ],
            licenseType: "learner",
            status: "pending",
            statusMessage: "Application submitted and pending review",
            applicationDate: new Date(),
            lastUpdated: new Date(),
          },
          {
            userId: "user456",
            firstName: "Jane",
            lastName: "Smith",
            dateOfBirth: new Date("1985-05-15"),
            gender: "female",
            nationality: "US",
            bloodGroup: "A+",
            phoneNumber: "9876543210",
            email: "jane.smith@example.com",
            address: "456 Oak Ave",
            city: "Othertown",
            state: "State",
            postalCode: "54321",
            country: "USA",
            documents: [
              {
                path: "/uploads/sample-id-2.jpg",
                description: "ID Proof",
                originalName: "id-card.jpg",
              },
            ],
            licenseType: "permanent",
            status: "under_review",
            statusMessage: "Application is under review",
            reviewedBy: "admin123",
            applicationDate: new Date(Date.now() - 86400000), // Yesterday
            lastUpdated: new Date(),
          },
        ];

        const result = await db
          .collection("licenseapplications")
          .insertMany(sampleApplications);
        console.log(`Inserted ${result.insertedCount} sample applications`);
        console.log("Sample application IDs:", result.insertedIds);
      } else {
        // Display some sample documents
        console.log("Sample documents in collection:");
        const samples = await db
          .collection("licenseapplications")
          .find()
          .limit(2)
          .toArray();
        samples.forEach((doc, index) => {
          console.log(`\nDocument ${index + 1}:`);
          console.log("ID:", doc._id);
          console.log("Name:", `${doc.firstName} ${doc.lastName}`);
          console.log("Status:", doc.status);
          console.log("License Type:", doc.licenseType);
        });

        // Check for and fix any documents with missing required fields
        console.log("\nChecking for documents with missing required fields...");
        const requiredFields = [
          "userId",
          "firstName",
          "lastName",
          "dateOfBirth",
          "gender",
          "email",
          "phoneNumber",
          "licenseType",
          "status",
        ];

        const invalidDocs = await db
          .collection("licenseapplications")
          .find({
            $or: requiredFields.map((field) => ({
              [field]: { $exists: false },
            })),
          })
          .toArray();

        if (invalidDocs.length > 0) {
          console.log(
            `Found ${invalidDocs.length} documents with missing required fields`
          );

          for (const doc of invalidDocs) {
            console.log(`Fixing document with ID: ${doc._id}`);

            const updates = {};

            // Add missing fields with default values
            for (const field of requiredFields) {
              if (!doc[field]) {
                switch (field) {
                  case "userId":
                    updates[field] = "default-user-id";
                    break;
                  case "firstName":
                    updates[field] = "John";
                    break;
                  case "lastName":
                    updates[field] = "Doe";
                    break;
                  case "dateOfBirth":
                    updates[field] = new Date("1990-01-01");
                    break;
                  case "gender":
                    updates[field] = "male";
                    break;
                  case "email":
                    updates[field] = "default@example.com";
                    break;
                  case "phoneNumber":
                    updates[field] = "1234567890";
                    break;
                  case "licenseType":
                    updates[field] = "learner";
                    break;
                  case "status":
                    updates[field] = "pending";
                    break;
                }
              }
            }

            // Update the document if there are fields to fix
            if (Object.keys(updates).length > 0) {
              await db
                .collection("licenseapplications")
                .updateOne({ _id: doc._id }, { $set: updates });
              console.log(
                `Updated document with fields: ${Object.keys(updates).join(
                  ", "
                )}`
              );
            }
          }
        } else {
          console.log("All documents have required fields");
        }
      }
    }

    // Create indexes for better performance
    console.log("\nCreating indexes...");
    await db.collection("licenseapplications").createIndex({ userId: 1 });
    await db.collection("licenseapplications").createIndex({ status: 1 });
    await db
      .collection("licenseapplications")
      .createIndex({ applicationDate: -1 });
    console.log("Indexes created successfully");

    // Close the connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    console.log(
      "License applications collection has been fixed and populated with sample data"
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the function
fixLicenseApplications();
