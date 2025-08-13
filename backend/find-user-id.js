import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function findUserId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('🔗 Connected to MongoDB');
    
    // Get username from command line argument
    const username = process.argv[2];
    
    if (!username) {
      console.log('❌ Please provide a username as an argument');
      console.log('Usage: node find-user-id.js <username>');
      console.log('Example: node find-user-id.js john_doe');
      
      // Show all users if no username provided
      console.log('\n📋 Available users:');
      const users = await User.find({}, 'userName fullName email _id').limit(10);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.userName || 'N/A'}`);
        console.log(`   Full Name: ${user.fullName || user.full_name || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   User ID: ${user._id}`);
        console.log('');
      });
      
      mongoose.disconnect();
      return;
    }
    
    console.log(`🔍 Searching for user: ${username}`);
    
    // Search for user by username (case insensitive)
    const user = await User.findOne({ 
      userName: { $regex: new RegExp(`^${username}$`, 'i') }
    });
    
    if (user) {
      console.log('✅ User found!');
      console.log(`   Username: ${user.userName}`);
      console.log(`   Full Name: ${user.fullName || user.full_name || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   User ID: ${user._id}`);
      console.log('');
      console.log('🎯 To add test notifications for this user, run:');
      console.log(`   node add-test-notifications.js ${user._id}`);
    } else {
      console.log('❌ User not found');
      console.log('');
      console.log('📋 Available users:');
      const users = await User.find({}, 'userName fullName email _id').limit(10);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.userName || 'N/A'}`);
        console.log(`   Full Name: ${user.fullName || user.full_name || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   User ID: ${user._id}`);
        console.log('');
      });
    }
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error finding user:', error);
    mongoose.disconnect();
  }
}

findUserId();
