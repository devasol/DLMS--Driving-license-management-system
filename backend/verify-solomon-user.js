import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifySolomonUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'solomondagmawi0@gmail.com';
    
    // Find the user
    const user = await User.findOne({
      $or: [
        { email: email },
        { user_email: email }
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

        console.log('\n✅ USER MANUALLY VERIFIED!');
        console.log('🎉 You can now login with:');
        console.log('- Email:', email);
        console.log('- Password: 123456 (or your password)');
        
      } else {
        console.log('\n✅ User is already verified!');
        console.log('🎉 You can login with:');
        console.log('- Email:', email);
        console.log('- Password: 123456 (or your password)');
      }

    } else {
      console.log('❌ User not found with email:', email);
      
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

console.log('🔧 Manual Verification for solomondagmawi0@gmail.com');
console.log('===================================================\n');

verifySolomonUser();
