import mongoose from 'mongoose';
import User from './models/User.js';

async function checkUsers() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Checking users collection...');
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);

    if (userCount > 0) {
      console.log('\n📋 All users:');
      const users = await User.find().select('fullName full_name email user_email role isAdmin');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.fullName || user.full_name}`);
        console.log(`   Email: ${user.email || user.user_email}`);
        console.log(`   Role: ${user.role || 'user'}`);
        console.log(`   IsAdmin: ${user.isAdmin || false}`);
        console.log(`   ID: ${user._id}`);
        console.log('   ---');
      });
    } else {
      console.log('❌ No users found in database');
      console.log('💡 You may need to register some users first');
    }

    // Check for admin collections
    console.log('\n🔍 Checking for admin collections...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const adminCollections = collections.filter(c => 
      c.name.includes('admin') || c.name.includes('Admin')
    );
    
    if (adminCollections.length > 0) {
      console.log('📋 Found admin-related collections:');
      adminCollections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    } else {
      console.log('❌ No admin collections found');
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();
