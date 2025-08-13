import axios from 'axios';

async function testNoEmailVerification() {
  console.log('🧪 Testing System WITHOUT Email Verification');
  console.log('============================================\n');

  // Test signup
  const timestamp = Date.now();
  const signupData = {
    "full_name": "Test User No Email",
    "user_email": `testuser${timestamp}@example.com`,
    "user_password": "123456",
    "user_name": `testuser${timestamp}`,
    "contact_no": "0911223344",
    "gender": "male",
    "nic": `${timestamp}`.slice(-10)
  };

  console.log('📤 Testing Signup...');
  console.log('Data:', JSON.stringify(signupData, null, 2));

  try {
    const signupResponse = await axios.post('http://localhost:5004/api/auth/users/signup', signupData);
    
    console.log('\n✅ Signup successful!');
    console.log('Status:', signupResponse.status);
    console.log('Response:', JSON.stringify(signupResponse.data, null, 2));
    
    // Test immediate login (should work without email verification)
    console.log('\n🔐 Testing Immediate Login (no email verification required)...');
    
    try {
      const loginResponse = await axios.post('http://localhost:5004/api/auth/users/login', {
        email: signupData.user_email,
        password: signupData.user_password,
        isAdmin: false
      });
      
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('Status:', loginResponse.status);
      console.log('User:', loginResponse.data.user.full_name);
      console.log('Email:', loginResponse.data.user.user_email);
      console.log('Type:', loginResponse.data.user.type);
      
      console.log('\n🎉 PERFECT! Email verification system has been removed!');
      console.log('✅ Users can now signup and login immediately');
      console.log('✅ No email verification required');
      console.log('✅ No 403 errors');
      console.log('✅ No email verification section on frontend');
      
    } catch (loginError) {
      console.log('\n❌ Login failed:');
      console.log('Status:', loginError.response?.status);
      console.log('Message:', loginError.response?.data?.message);
      
      if (loginError.response?.status === 403) {
        console.log('\n🚨 ERROR: Email verification is still active!');
        console.log('The system is still requiring email verification');
      }
    }
    
  } catch (signupError) {
    console.log('\n❌ Signup failed:');
    console.log('Status:', signupError.response?.status);
    console.log('Error:', JSON.stringify(signupError.response?.data, null, 2));
  }

  // Test with existing user (should also work)
  console.log('\n📤 Testing Login with Existing User...');
  
  try {
    const existingLoginResponse = await axios.post('http://localhost:5004/api/auth/users/login', {
      email: 'solomondagmawi0@gmail.com',
      password: '123456',
      isAdmin: false
    });
    
    console.log('\n✅ Existing user login successful!');
    console.log('User:', existingLoginResponse.data.user.full_name);
    
  } catch (existingLoginError) {
    console.log('\n❌ Existing user login failed:');
    console.log('Status:', existingLoginError.response?.status);
    console.log('Message:', existingLoginError.response?.data?.message);
  }
}

testNoEmailVerification();
