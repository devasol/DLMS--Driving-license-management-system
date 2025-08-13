import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function retrieveAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all collections in the database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Available collections:');
    collections.forEach(col => console.log(`- ${col.name}`));

    // Check Users collection
    console.log('\n👥 USERS COLLECTION:');
    const users = await User.find({}).select('fullName full_name email user_email password user_password role isAdmin').limit(10);
    
    if (users.length === 0) {
      console.log('❌ No users found in users collection');
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user._id}`);
        console.log(`   Name: ${user.fullName || user.full_name || 'N/A'}`);
        console.log(`   Email: ${user.email || user.user_email || 'N/A'}`);
        console.log(`   Password field: ${user.password ? 'exists' : 'missing'}`);
        console.log(`   User_password field: ${user.user_password ? 'exists' : 'missing'}`);
        console.log(`   Role: ${user.role || 'N/A'}`);
        console.log(`   IsAdmin: ${user.isAdmin || false}`);
      });
    }

    // Check for admin collection
    console.log('\n👑 ADMIN COLLECTIONS:');
    
    // Try 'admins' collection
    try {
      const adminsCollection = await db.collection('admins').find({}).limit(10).toArray();
      if (adminsCollection.length > 0) {
        console.log(`✅ Found ${adminsCollection.length} admins in 'admins' collection:`);
        adminsCollection.forEach((admin, index) => {
          console.log(`\n${index + 1}. Admin ID: ${admin._id}`);
          console.log(`   Name: ${admin.admin_name || admin.admin_username || admin.name || 'N/A'}`);
          console.log(`   Email: ${admin.admin_email || admin.email || 'N/A'}`);
          console.log(`   Password field: ${admin.admin_password ? 'exists' : 'missing'}`);
        });
      } else {
        console.log('❌ No admins found in "admins" collection');
      }
    } catch (error) {
      console.log('❌ "admins" collection not accessible');
    }

    // Try 'admin' collection
    try {
      const adminCollection = await db.collection('admin').find({}).limit(10).toArray();
      if (adminCollection.length > 0) {
        console.log(`✅ Found ${adminCollection.length} admins in 'admin' collection:`);
        adminCollection.forEach((admin, index) => {
          console.log(`\n${index + 1}. Admin ID: ${admin._id}`);
          console.log(`   Name: ${admin.admin_name || admin.admin_username || admin.name || 'N/A'}`);
          console.log(`   Email: ${admin.admin_email || admin.email || 'N/A'}`);
          console.log(`   Password field: ${admin.admin_password ? 'exists' : 'missing'}`);
        });
      } else {
        console.log('❌ No admins found in "admin" collection');
      }
    } catch (error) {
      console.log('❌ "admin" collection not accessible');
    }

    // Check for users with admin privileges
    console.log('\n🔑 USERS WITH ADMIN PRIVILEGES:');
    const adminUsers = await User.find({
      $or: [
        { role: 'admin' },
        { isAdmin: true },
        { user_type: 'admin' }
      ]
    }).select('fullName full_name email user_email role isAdmin user_type');

    if (adminUsers.length > 0) {
      console.log(`✅ Found ${adminUsers.length} users with admin privileges:`);
      adminUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. Admin User ID: ${user._id}`);
        console.log(`   Name: ${user.fullName || user.full_name || 'N/A'}`);
        console.log(`   Email: ${user.email || user.user_email || 'N/A'}`);
        console.log(`   Role: ${user.role || 'N/A'}`);
        console.log(`   IsAdmin: ${user.isAdmin || false}`);
        console.log(`   User_type: ${user.user_type || 'N/A'}`);
      });
    } else {
      console.log('❌ No users with admin privileges found');
    }

    // Check for any other potential user collections
    console.log('\n🔍 CHECKING OTHER POTENTIAL USER COLLECTIONS:');
    const potentialCollections = ['user', 'accounts', 'members', 'profiles'];
    
    for (const collectionName of potentialCollections) {
      try {
        const docs = await db.collection(collectionName).find({}).limit(5).toArray();
        if (docs.length > 0) {
          console.log(`✅ Found ${docs.length} documents in "${collectionName}" collection`);
          console.log(`   Sample document keys: ${Object.keys(docs[0]).join(', ')}`);
        }
      } catch (error) {
        // Collection doesn't exist, ignore
      }
    }

  } catch (error) {
    console.error('❌ Error retrieving users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

retrieveAllUsers();
