import axios from 'axios';

async function testNewSignup() {
  try {
    console.log('🧪 Testing signup with new email...\n');

    // Generate a unique email
    const timestamp = Date.now();
    const signupData = {
      full_name: 'New Test User',
      user_email: `newuser${timestamp}@example.com`,
      user_password: 'testpass123',
      user_name: `newuser${timestamp}`,
      contact_no: '0987654321',
      gender: 'female',
      nic: '987654321098'
    };

    console.log('📤 Sending signup request to /api/auth/users/signup...');
    console.log('Data:', JSON.stringify(signupData, null, 2));

    try {
      const response = await axios.post('http://localhost:5004/api/auth/users/signup', signupData);
      
      console.log('\n✅ Signup successful!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      // Test login with unverified email
      console.log('\n🔐 Testing login with unverified email...');
      try {
        const loginResponse = await axios.post('http://localhost:5004/api/auth/login', {
          email: signupData.user_email,
          password: signupData.user_password,
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
      if (error.response) {
        console.log('\n❌ Signup failed:');
        console.log('Status:', error.response.status);
        console.log('Error data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('\n❌ Network error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
console.log('🧪 New User Signup Test');
console.log('======================\n');

testNewSignup();
