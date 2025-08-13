import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function testEmailVerification() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const testUser = await User.findOne({ 
      $or: [
        { email: { $exists: true } },
        { user_email: { $exists: true } }
      ]
    });

    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('\n📊 Test User Details:');
    console.log('- ID:', testUser._id);
    console.log('- Name:', testUser.fullName || testUser.full_name || 'N/A');
    console.log('- Email:', testUser.email || testUser.user_email || 'N/A');
    console.log('- Email Verified:', testUser.isEmailVerified);
    console.log('- Verification Token:', testUser.emailVerificationToken ? 'Present' : 'Not set');
    console.log('- Token Expires:', testUser.emailVerificationExpires || 'Not set');

    // Check if email verification fields exist
    const usersWithVerificationFields = await User.countDocuments({
      isEmailVerified: { $exists: true }
    });

    const totalUsers = await User.countDocuments();

    console.log('\n📈 Database Statistics:');
    console.log('- Total Users:', totalUsers);
    console.log('- Users with verification fields:', usersWithVerificationFields);
    console.log('- Users verified:', await User.countDocuments({ isEmailVerified: true }));
    console.log('- Users not verified:', await User.countDocuments({ isEmailVerified: false }));

    // Test email configuration
    console.log('\n🔧 Email Configuration:');
    console.log('- EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'Not set');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
    console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
    console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');

    // Test email service import
    try {
      const emailService = await import('./services/emailService.js');
      console.log('✅ Email service imported successfully');
      
      // Test token generation
      const token = emailService.generateVerificationToken();
      console.log('✅ Token generation works, sample token length:', token.length);
    } catch (error) {
      console.log('❌ Email service import failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testEmailVerification();
