import axios from 'axios';

async function testUniqueSignup() {
  try {
    console.log('🧪 Testing signup with completely unique data...\n');

    // Generate completely unique data
    const timestamp = Date.now();
    const uniqueSignupData = {
      "full_name": "Unique Test User",
      "user_email": `uniqueuser${timestamp}@example.com`,
      "user_password": "123456",
      "user_name": `uniqueuser${timestamp}`,
      "contact_no": "0999888777",
      "gender": "female",
      "nic": `${timestamp}`.slice(-10) // Use last 10 digits of timestamp as NIC
    };

    console.log('📤 Sending signup request to /api/auth/users/signup...');
    console.log('Data:', JSON.stringify(uniqueSignupData, null, 2));

    try {
      const response = await axios.post('http://localhost:5004/api/auth/users/signup', uniqueSignupData);
      
      console.log('\n✅ Signup successful!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      // Test login with unverified email
      console.log('\n🔐 Testing login with unverified email...');
      try {
        const loginResponse = await axios.post('http://localhost:5004/api/auth/login', {
          email: uniqueSignupData.user_email,
          password: uniqueSignupData.user_password,
          isAdmin: false
        });
        
        console.log('\n❌ UNEXPECTED: Login succeeded when it should have failed!');
        console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
        
      } catch (loginError) {
        if (loginError.response && loginError.response.status === 403) {
          console.log('\n✅ EXPECTED: Login blocked due to email verification');
          console.log('Status:', loginError.response.status);
          console.log('Message:', loginError.response.data.message);
          console.log('Requires verification:', loginError.response.data.requiresEmailVerification);
        } else {
          console.log('\n❌ Unexpected login error:', loginError.response?.data || loginError.message);
        }
      }
      
    } catch (error) {
      console.log('\n❌ Signup failed:');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 409) {
        console.log('\n✅ Good! This is a proper duplicate error (409 Conflict)');
      } else if (error.response?.status === 500) {
        console.log('\n❌ Still getting 500 error - server needs restart');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('🧪 Unique Signup Test');
console.log('====================\n');

testUniqueSignup();
