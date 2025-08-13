import axios from 'axios';

async function testSignup500Error() {
  try {
    console.log('🧪 Testing the exact signup data that caused 500 error...\n');

    // Use the exact same data from the frontend error
    const signupData = {
      "full_name": "Dawit Solomon",
      "user_email": "dawitsolo8908@gmail.com",
      "user_password": "123456",
      "user_name": "devina",
      "contact_no": "0920661433",
      "gender": "male",
      "nic": "0909090909"
    };

    console.log('📤 Sending signup request to /api/auth/users/signup...');
    console.log('Data:', JSON.stringify(signupData, null, 2));

    try {
      const response = await axios.post('http://localhost:5004/api/auth/users/signup', signupData);
      
      console.log('\n✅ Signup successful!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('\n❌ Signup failed:');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 500) {
        console.log('\n🔍 This is the 500 Internal Server Error!');
        console.log('Server Error Details:', error.response.data);
        
        if (error.response.data.error) {
          console.log('Detailed Error:', error.response.data.error);
          
          if (error.response.data.error.includes('E11000')) {
            console.log('\n💡 This is a MongoDB duplicate key error');
            console.log('The email or username already exists in the database');
          }
        }
      }
    }

    // Test with a new unique email
    console.log('\n📤 Testing with a unique email...');
    const uniqueSignupData = {
      "full_name": "Test User New",
      "user_email": `testuser${Date.now()}@example.com`,
      "user_password": "123456",
      "user_name": `testuser${Date.now()}`,
      "contact_no": "0987654321",
      "gender": "female",
      "nic": "1234567890"
    };

    console.log('Data:', JSON.stringify(uniqueSignupData, null, 2));

    try {
      const response2 = await axios.post('http://localhost:5004/api/auth/users/signup', uniqueSignupData);
      
      console.log('\n✅ Unique email signup successful!');
      console.log('Status:', response2.status);
      console.log('Response:', JSON.stringify(response2.data, null, 2));
      
    } catch (error2) {
      console.log('\n❌ Unique email signup also failed:');
      console.log('Status:', error2.response?.status);
      console.log('Error Data:', JSON.stringify(error2.response?.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('🔍 500 Error Diagnosis');
console.log('=====================\n');

testSignup500Error();
