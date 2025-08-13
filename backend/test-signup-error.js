import axios from 'axios';

async function testSignup() {
  try {
    console.log('🧪 Testing signup process...\n');

    // Test data for signup
    const signupData = {
      fullName: 'Test User',
      email: 'testuser123@example.com',
      password: 'testpass123',
      userName: 'testuser123',
      phoneNumber: '0912345678',
      gender: 'male',
      nic: '123456789012'
    };

    console.log('📤 Sending signup request to /api/auth/register...');
    console.log('Data:', JSON.stringify(signupData, null, 2));

    try {
      const response = await axios.post('http://localhost:5004/api/auth/register', signupData);
      
      console.log('\n✅ Signup successful!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      if (error.response) {
        console.log('\n❌ Signup failed with server error:');
        console.log('Status:', error.response.status);
        console.log('Error data:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 500) {
          console.log('\n🔍 This is a server error (500). Let me check what\'s happening...');
        }
      } else if (error.request) {
        console.log('\n❌ Network error - no response from server');
        console.log('Request details:', error.request);
      } else {
        console.log('\n❌ Request setup error:', error.message);
      }
    }

    // Also test the alternative signup endpoint
    console.log('\n📤 Testing alternative signup endpoint /api/auth/users/signup...');
    
    try {
      const response2 = await axios.post('http://localhost:5004/api/auth/users/signup', {
        full_name: signupData.fullName,
        user_email: signupData.email,
        user_password: signupData.password,
        user_name: signupData.userName,
        contact_no: signupData.phoneNumber,
        gender: signupData.gender,
        nic: signupData.nic
      });
      
      console.log('\n✅ Alternative signup successful!');
      console.log('Status:', response2.status);
      console.log('Response:', JSON.stringify(response2.data, null, 2));
      
    } catch (error2) {
      if (error2.response) {
        console.log('\n❌ Alternative signup failed:');
        console.log('Status:', error2.response.status);
        console.log('Error data:', JSON.stringify(error2.response.data, null, 2));
      } else {
        console.log('\n❌ Network/Request error:', error2.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
console.log('🧪 Signup Error Test');
console.log('===================\n');

testSignup();
