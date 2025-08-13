import axios from 'axios';

async function debugSignupResponse() {
  console.log('🔍 DEBUGGING SIGNUP RESPONSE');
  console.log('='.repeat(40));

  const timestamp = Date.now();
  const testUser = {
    full_name: 'Debug Test User',
    user_email: `debug.test.${timestamp}@example.com`,
    user_password: 'testpass123',
    user_name: `debugtest${timestamp}`,
    gender: 'male',
    contact_no: `123456${timestamp.toString().slice(-4)}`,
    nic: `${timestamp.toString().slice(-9)}V`
  };

  try {
    console.log('\n📝 Testing /api/auth/users/signup endpoint...');
    console.log('Request data:', JSON.stringify(testUser, null, 2));
    
    const response = await axios.post('http://localhost:5004/api/auth/users/signup', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ RESPONSE RECEIVED:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('\n📄 RESPONSE DATA:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check specific fields that frontend looks for
    console.log('\n🔍 FRONTEND CHECKS:');
    console.log('- requiresOTP:', response.data.requiresOTP);
    console.log('- requiresEmailVerification:', response.data.requiresEmailVerification);
    console.log('- success:', response.data.success);
    console.log('- email:', response.data.email);
    console.log('- message:', response.data.message);
    
    if (response.data.requiresOTP) {
      console.log('\n✅ SUCCESS: Backend returns requiresOTP: true');
      console.log('Frontend should redirect to /verify-otp');
    } else {
      console.log('\n❌ PROBLEM: Backend NOT returning requiresOTP: true');
      console.log('This is why frontend redirects to signin instead of OTP page');
    }

  } catch (error) {
    console.error('\n❌ SIGNUP FAILED:');
    console.log('Status:', error.response?.status);
    console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
  }
}

debugSignupResponse().catch(console.error);
