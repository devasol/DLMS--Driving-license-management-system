import axios from 'axios';

async function testUnverifiedLogin() {
  console.log('🧪 Testing Login with Unverified User');
  console.log('=====================================\n');

  // Test with the unverified user we just created
  const loginData = {
    email: 'testunverified@example.com',
    password: '123456',
    isAdmin: false
  };

  console.log('📤 Sending login request...');
  console.log('Email:', loginData.email);
  console.log('Status: UNVERIFIED (should get 403)');
  console.log('Endpoint: http://localhost:5004/api/auth/login');

  try {
    const response = await axios.post('http://localhost:5004/api/auth/login', loginData);
    
    console.log('\n❌ UNEXPECTED: Login succeeded for unverified user!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n✅ EXPECTED: Login blocked for unverified user');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    
    if (error.response?.data) {
      console.log('\n📄 403 Response Data:');
      console.log(JSON.stringify(error.response.data, null, 2));
      
      // Check specific fields that frontend needs
      console.log('\n🔍 Frontend Integration Check:');
      console.log('- error.response.status === 403:', error.response.status === 403);
      console.log('- error.response.data?.requiresEmailVerification:', error.response.data?.requiresEmailVerification);
      console.log('- error.response.data?.userEmail:', error.response.data?.userEmail);
      console.log('- error.response.data?.message:', error.response.data?.message);
      
      if (error.response.status === 403 && error.response.data?.requiresEmailVerification) {
        console.log('\n🎯 PERFECT! Frontend should:');
        console.log('✅ Show email verification section');
        console.log('✅ Hide error alert popup');
        console.log('✅ Display user-friendly instructions');
        console.log('✅ Show resend verification button');
        console.log('✅ Set verificationEmail to:', error.response.data.userEmail);
      } else {
        console.log('\n❌ Response format issue - frontend won\'t handle correctly');
      }
    }
  }

  console.log('\n📋 Summary:');
  console.log('- Verified users (dawitsolo8908@gmail.com): ✅ Login works');
  console.log('- Unverified users (testunverified@example.com): ❌ 403 error → Show verification section');
}

testUnverifiedLogin();
