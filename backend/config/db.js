import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";
    console.log("Attempting to connect to MongoDB...");
    console.log("Connection string:", MONGODB_URI);

    // Set mongoose options for better performance and stability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    };

    await mongoose.connect(MONGODB_URI, options);

    // Test the connection by getting the database name
    const dbName = mongoose.connection.name;
    console.log(`MongoDB Connected Successfully to database: ${dbName}`);

    // List all collections to verify connection
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "Available collections:",
      collections.map((c) => c.name).join(", ")
    );

    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
};

export default connectDB;
