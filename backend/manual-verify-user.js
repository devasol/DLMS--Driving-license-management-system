import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function manualVerifyUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find your user account
    const user = await User.findOne({ 
      $or: [
        { email: 'dawitsolo8908@gmail.com' },
        { user_email: 'solomondagmawi0@gmail.com' }
      ]
    });

    if (user) {
      console.log('\n👤 Found User:');
      console.log('- Name:', user.fullName || user.full_name);
      console.log('- Email:', user.email || user.user_email);
      console.log('- Currently Verified:', user.isEmailVerified);

      if (!user.isEmailVerified) {
        // Manually verify the user
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        console.log('\n✅ User manually verified!');
        console.log('- Email Verified:', user.isEmailVerified);
        console.log('- Verification Token: Removed');
        
        console.log('\n🎉 You can now login with:');
        console.log('- Email: dawitsolo8908@gmail.com');
        console.log('- Password: [your password]');
        
      } else {
        console.log('\n✅ User is already verified!');
      }

      // Test login to make sure it works
      console.log('\n🧪 Testing login capability...');
      try {
        const axios = await import('axios');
        
        // This should work now
        console.log('Note: You can now test login on the frontend');
        console.log('Visit: http://localhost:3000/signin');
        
      } catch (error) {
        console.log('Note: Test login manually on the frontend');
      }

    } else {
      console.log('❌ User not found with email: dawitsolo8908@gmail.com');
      
      // Show all users for debugging
      const allUsers = await User.find({}, 'fullName full_name email user_email isEmailVerified').limit(10);
      console.log('\n📋 Available users:');
      allUsers.forEach(u => {
        console.log(`- ${u.fullName || u.full_name} (${u.email || u.user_email}) - Verified: ${u.isEmailVerified}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔧 Manual User Verification');
console.log('===========================\n');

manualVerifyUser();
