const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = "mongodb://localhost:27017/dlms";

async function updateAdminPassword() {
  let client;
  
  try {
    // Connect directly using MongoClient
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    // Get the database and collection
    const db = client.db();
    const adminCollection = db.collection('admin');
    
    // Find the admin with placeholder password
    const admin = await adminCollection.findOne({ admin_password: "hashed_password_here" });
    
    if (!admin) {
      console.log('No admin found with placeholder password');
      return;
    }
    
    console.log(`Found admin: ${admin.admin_name} (${admin.admin_email})`);
    
    // Hash a new password
    const newPassword = "admin123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the admin's password
    const result = await adminCollection.updateOne(
      { _id: admin._id },
      { $set: { admin_password: hashedPassword } }
    );
    
    if (result.modifiedCount === 1) {
      console.log(`Successfully updated password for admin: ${admin.admin_email}`);
      console.log(`New login credentials:`);
      console.log(`Email: ${admin.admin_email}`);
      console.log(`Password: ${newPassword}`);
    } else {
      console.log('Failed to update admin password');
    }
    
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the function
updateAdminPassword();