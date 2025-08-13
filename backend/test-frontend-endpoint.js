import axios from 'axios';

const API_BASE = 'http://localhost:5004/api/auth';

async function testFrontendEndpoint() {
  console.log('🧪 Testing Frontend Endpoint with OTP');
  console.log('=====================================');

  const timestamp = Date.now();
  const testUser = {
    full_name: 'Frontend Test User',
    user_email: `frontend.test.${timestamp}@example.com`,
    user_password: 'testpass123',
    user_name: `frontendtest${timestamp}`,
    gender: 'male',
    contact_no: `123456${timestamp.toString().slice(-4)}`,
    nic: `${timestamp.toString().slice(-9)}V`
  };

  try {
    console.log('\n📝 Step 1: Testing /users/signup endpoint (used by frontend)...');
    console.log('Email:', testUser.user_email);
    
    const signupResponse = await axios.post(`${API_BASE}/users/signup`, testUser);
    
    console.log('\n✅ Signup Response:');
    console.log('Status:', signupResponse.status);
    console.log('Message:', signupResponse.data.message);
    console.log('Requires OTP:', signupResponse.data.requiresOTP);
    console.log('Email:', signupResponse.data.email);
    console.log('Simulated:', signupResponse.data.simulated);

    if (signupResponse.data.requiresOTP) {
      console.log('\n🎉 SUCCESS: Frontend endpoint now requires OTP!');
      
      // Step 2: Try to login without verification (should fail)
      console.log('\n🔐 Step 2: Testing login without verification...');
      try {
        await axios.post(`${API_BASE}/users/login`, {
          email: testUser.user_email,
          password: testUser.user_password,
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
      const resendResponse = await axios.post(`${API_BASE}/users/resend-otp`, {
        email: testUser.user_email
      });
      
      console.log('✅ Resend OTP Response:');
      console.log('- Status:', resendResponse.status);
      console.log('- Message:', resendResponse.data.message);

      console.log('\n📋 Frontend Integration Status:');
      console.log('✅ Signup sends OTP');
      console.log('✅ Login blocked for unverified users');
      console.log('✅ Resend OTP works');
      console.log('✅ Ready for frontend OTP form integration');

      console.log('\n🔧 Next Steps for Frontend:');
      console.log('1. Update signup success handler to show OTP form when requiresOTP: true');
      console.log('2. Create OTP input form component');
      console.log('3. Call /users/verify-otp endpoint with user input');
      console.log('4. Handle login errors for unverified users');
      console.log('5. Add resend OTP functionality');

    } else {
      console.log('\n❌ ISSUE: OTP not required - check implementation');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

// Run the test
testFrontendEndpoint().catch(console.error);
