import axios from 'axios';

async function testLoginVerification() {
  try {
    console.log('🔐 Testing login with unverified email...\n');

    // Test login with the user who has isEmailVerified: false
    const loginData = {
      email: 'dawitsolo8908@gmail.com',
      password: 'devina123', // The password used during registration
      isAdmin: false
    };

    console.log('📤 Sending login request...');
    console.log('Email:', loginData.email);
    console.log('Password:', '[HIDDEN]');
    console.log('IsAdmin:', loginData.isAdmin);

    try {
      const response = await axios.post('http://localhost:5004/api/auth/login', loginData);
      
      console.log('\n❌ UNEXPECTED: Login succeeded when it should have failed!');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      if (error.response) {
        console.log('\n✅ EXPECTED: Login blocked due to email verification');
        console.log('Status:', error.response.status);
        console.log('Error message:', error.response.data.message);
        
        if (error.response.status === 403 && error.response.data.requiresEmailVerification) {
          console.log('✅ Correct error type: Email verification required');
          console.log('User email for resend:', error.response.data.userEmail);
        } else {
          console.log('❌ Wrong error type - expected 403 with requiresEmailVerification');
        }
      } else {
        console.log('\n❌ Network error:', error.message);
      }
    }

    // Test the resend verification endpoint
    console.log('\n📧 Testing resend verification email...');
    try {
      const resendResponse = await axios.post('http://localhost:5004/api/auth/resend-verification', {
        email: 'dawitsolo8908@gmail.com'
      });
      
      console.log('✅ Resend verification response:');
      console.log('Status:', resendResponse.status);
      console.log('Message:', resendResponse.data.message);
      
    } catch (resendError) {
      if (resendError.response) {
        console.log('❌ Resend verification failed:');
        console.log('Status:', resendError.response.status);
        console.log('Error:', resendError.response.data.message);
      } else {
        console.log('❌ Network error:', resendError.message);
      }
    }

    // Test the verification endpoint
    console.log('\n🔗 Testing email verification endpoint...');
    try {
      // Get the verification token from the database
      const mongoose = await import('mongoose');
      const User = (await import('./models/User.js')).default;
      const dotenv = await import('dotenv');
      
      dotenv.config();
      await mongoose.connect(process.env.MONGODB_URI);
      
      const user = await User.findOne({ 
        $or: [
          { email: 'dawitsolo8908@gmail.com' },
          { user_email: 'dawitsolo8908@gmail.com' }
        ]
      });
      
      if (user && user.emailVerificationToken) {
        console.log('Found verification token:', user.emailVerificationToken.substring(0, 20) + '...');
        
        const verifyResponse = await axios.get(`http://localhost:5004/api/auth/verify-email?token=${user.emailVerificationToken}`);
        
        console.log('✅ Email verification successful:');
        console.log('Status:', verifyResponse.status);
        console.log('Message:', verifyResponse.data.message);
        
        // Now test login again - it should work
        console.log('\n🔐 Testing login after email verification...');
        const loginResponse = await axios.post('http://localhost:5004/api/auth/login', loginData);
        
        console.log('✅ Login successful after verification:');
        console.log('Status:', loginResponse.status);
        console.log('User:', loginResponse.data.user.full_name);
        console.log('Email verified:', loginResponse.data.user.isEmailVerified || 'Not specified');
        
      } else {
        console.log('❌ No verification token found for user');
      }
      
      await mongoose.disconnect();
      
    } catch (verifyError) {
      if (verifyError.response) {
        console.log('❌ Verification failed:');
        console.log('Status:', verifyError.response.status);
        console.log('Error:', verifyError.response.data.message);
      } else {
        console.log('❌ Network error:', verifyError.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
console.log('🧪 Email Verification Test Suite');
console.log('==================================\n');

testLoginVerification();
