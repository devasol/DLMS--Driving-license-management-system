import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function checkAllCredentials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users from database
    const allUsers = await User.find({}).select('fullName full_name email user_email password user_password role isAdmin');
    
    console.log(`\n📊 Found ${allUsers.length} users in database:`);
    
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      console.log(`\n${i + 1}. User Details:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.fullName || user.full_name || 'N/A'}`);
      console.log(`   Email: ${user.email || user.user_email || 'N/A'}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   IsAdmin: ${user.isAdmin || false}`);
      console.log(`   Password exists: ${!!user.password}`);
      console.log(`   Password length: ${user.password?.length || 0}`);
      console.log(`   Password is hashed: ${user.password?.startsWith('$2') || false}`);
      
      // Test common passwords
      const testPasswords = ['password123', 'admin123', '123456', 'password', 'admin'];
      console.log(`   Testing common passwords...`);
      
      for (const testPass of testPasswords) {
        try {
          if (user.password) {
            const isMatch = await bcrypt.compare(testPass, user.password);
            if (isMatch) {
              console.log(`   ✅ WORKING PASSWORD: "${testPass}"`);
            }
          }
        } catch (error) {
          // Ignore comparison errors
        }
      }
    }

    // Check if there are any users with plain text passwords
    console.log('\n🔍 Checking for users with plain text passwords...');
    const plainTextUsers = await User.find({
      $or: [
        { password: { $not: /^\$2[ab]\$/ } },
        { user_password: { $not: /^\$2[ab]\$/ } }
      ]
    });

    if (plainTextUsers.length > 0) {
      console.log(`⚠️ Found ${plainTextUsers.length} users with potentially plain text passwords`);
      for (const user of plainTextUsers) {
        console.log(`- ${user.email || user.user_email}: password = "${user.password}"`);
      }
    } else {
      console.log('✅ All passwords are properly hashed');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAllCredentials();
