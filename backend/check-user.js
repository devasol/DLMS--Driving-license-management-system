import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user that just registered
    const user = await User.findOne({ 
      $or: [
        { email: 'dawitsolo8908@gmail.com' },
        { user_email: 'dawitsolo8908@gmail.com' }
      ]
    });

    if (user) {
      console.log('\n📊 User Details:');
      console.log('- ID:', user._id);
      console.log('- Name:', user.fullName || user.full_name);
      console.log('- Email:', user.email || user.user_email);
      console.log('- Email Verified:', user.isEmailVerified);
      console.log('- Verification Token:', user.emailVerificationToken || 'Not set');
      console.log('- Token Expires:', user.emailVerificationExpires || 'Not set');
      console.log('- Created:', user.createdAt);
      console.log('- Updated:', user.updatedAt);
      
      console.log('\n🔍 All User Fields:');
      console.log(JSON.stringify(user.toObject(), null, 2));
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();
