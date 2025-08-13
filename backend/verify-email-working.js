import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyEmailWorking() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check the user we created earlier
    const user = await User.findOne({ 
      $or: [
        { email: 'dawitsolo8908@gmail.com' },
        { user_email: 'dawitsolo8908@gmail.com' }
      ]
    });

    if (user) {
      console.log('\n📊 Current User Status:');
      console.log('- Name:', user.fullName || user.full_name);
      console.log('- Email:', user.email || user.user_email);
      console.log('- Email Verified:', user.isEmailVerified);
      console.log('- Has Verification Token:', !!user.emailVerificationToken);
      console.log('- Token Expires:', user.emailVerificationExpires);

      if (user.emailVerificationToken) {
        console.log('\n🔗 Verification URL:');
        console.log(`http://localhost:3000/verify-email?token=${user.emailVerificationToken}`);
        
        // Test the verification endpoint
        console.log('\n🧪 Testing email verification endpoint...');
        
        try {
          const axios = await import('axios');
          const verifyResponse = await axios.default.get(`http://localhost:5004/api/auth/verify-email?token=${user.emailVerificationToken}`);
          
          console.log('✅ Email verification successful!');
          console.log('Status:', verifyResponse.status);
          console.log('Message:', verifyResponse.data.message);
          
          // Check user status after verification
          const updatedUser = await User.findById(user._id);
          console.log('\n📊 Updated User Status:');
          console.log('- Email Verified:', updatedUser.isEmailVerified);
          console.log('- Verification Token:', updatedUser.emailVerificationToken || 'Removed');
          
        } catch (verifyError) {
          console.log('❌ Verification failed:', verifyError.response?.data?.message || verifyError.message);
        }
      } else {
        console.log('\n⚠️ No verification token found. User might already be verified or token expired.');
      }

      // Test login
      console.log('\n🔐 Testing login...');
      try {
        const axios = await import('axios');
        const loginResponse = await axios.default.post('http://localhost:5004/api/auth/login', {
          email: user.email || user.user_email,
          password: 'devina123', // The password used during registration
          isAdmin: false
        });
        
        console.log('✅ Login successful!');
        console.log('User:', loginResponse.data.user.full_name);
        
      } catch (loginError) {
        if (loginError.response?.status === 403) {
          console.log('✅ Login correctly blocked - email verification required');
          console.log('Message:', loginError.response.data.message);
        } else {
          console.log('❌ Unexpected login error:', loginError.response?.data?.message || loginError.message);
        }
      }

    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🧪 Email Verification System Test');
console.log('=================================\n');

verifyEmailWorking();
