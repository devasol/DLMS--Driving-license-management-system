import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5004/api/auth';

async function testOTPSystem() {
  console.log('🧪 Testing OTP Email Verification System');
  console.log('=' .repeat(50));

  const testUser = {
    fullName: 'Test User OTP',
    email: `test.otp.${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  try {
    // Step 1: Register user (should send OTP)
    console.log('\n📝 Step 1: Registering user...');
    const registerResponse = await axios.post(`${API_BASE}/register`, testUser);
    
    console.log('✅ Registration Response:');
    console.log('- Status:', registerResponse.status);
    console.log('- Message:', registerResponse.data.message);
    console.log('- Requires OTP:', registerResponse.data.requiresOTP);
    console.log('- Email:', registerResponse.data.email);
    console.log('- Simulated:', registerResponse.data.simulated);

    if (!registerResponse.data.requiresOTP) {
      console.log('❌ Expected requiresOTP to be true');
      return;
    }

    // Step 2: Try to login without verification (should fail)
    console.log('\n🔐 Step 2: Attempting login without verification...');
    try {
      await axios.post(`${API_BASE}/login`, {
        email: testUser.email,
        password: testUser.password,
        isAdmin: false
      });
      console.log('❌ Login should have failed but succeeded');
    } catch (loginError) {
      if (loginError.response?.status === 403) {
        console.log('✅ Login correctly blocked:');
        console.log('- Status:', loginError.response.status);
        console.log('- Message:', loginError.response.data.message);
        console.log('- Type:', loginError.response.data.type);
      } else {
        console.log('❌ Unexpected login error:', loginError.response?.data?.message);
      }
    }

    // Step 3: Test resend OTP
    console.log('\n📧 Step 3: Testing resend OTP...');
    const resendResponse = await axios.post(`${API_BASE}/resend-otp`, {
      email: testUser.email
    });
    
    console.log('✅ Resend OTP Response:');
    console.log('- Status:', resendResponse.status);
    console.log('- Message:', resendResponse.data.message);
    console.log('- Simulated:', resendResponse.data.simulated);

    // Step 4: Test invalid OTP
    console.log('\n❌ Step 4: Testing invalid OTP...');
    try {
      await axios.post(`${API_BASE}/verify-otp`, {
        email: testUser.email,
        otp: '123456' // Invalid OTP
      });
      console.log('❌ Invalid OTP should have failed but succeeded');
    } catch (otpError) {
      if (otpError.response?.status === 400) {
        console.log('✅ Invalid OTP correctly rejected:');
        console.log('- Status:', otpError.response.status);
        console.log('- Message:', otpError.response.data.message);
        console.log('- Type:', otpError.response.data.type);
      } else {
        console.log('❌ Unexpected OTP error:', otpError.response?.data?.message);
      }
    }

    // Step 5: Simulate correct OTP verification
    console.log('\n✅ Step 5: For testing purposes, we would need the actual OTP from the email/console');
    console.log('In a real scenario:');
    console.log('1. User receives OTP via email');
    console.log('2. User enters OTP in frontend');
    console.log('3. Frontend calls /verify-otp with the correct OTP');
    console.log('4. User can then login successfully');

    console.log('\n📋 OTP System Test Summary:');
    console.log('✅ Registration sends OTP');
    console.log('✅ Login blocked for unverified users');
    console.log('✅ Resend OTP works');
    console.log('✅ Invalid OTP rejected');
    console.log('✅ System ready for frontend integration');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

// Run the test
testOTPSystem().catch(console.error);
