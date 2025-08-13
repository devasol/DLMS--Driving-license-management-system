import axios from 'axios';

async function testLogin403() {
  console.log('🧪 Testing Login 403 Response');
  console.log('==============================\n');

  // Test with an unverified user
  const loginData = {
    email: 'dawitsolo8908@gmail.com', // This should be unverified
    password: '123456', // Correct password
    isAdmin: false
  };

  console.log('📤 Sending login request...');
  console.log('Email:', loginData.email);
  console.log('Endpoint: http://localhost:5004/api/auth/login');

  try {
    const response = await axios.post('http://localhost:5004/api/auth/login', loginData);
    
    console.log('\n❌ UNEXPECTED: Login succeeded!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n📋 Login Error Response:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    
    if (error.response?.data) {
      console.log('\n📄 Response Data:');
      console.log(JSON.stringify(error.response.data, null, 2));
      
      // Check specific fields
      console.log('\n🔍 Field Analysis:');
      console.log('- message:', error.response.data.message);
      console.log('- requiresEmailVerification:', error.response.data.requiresEmailVerification);
      console.log('- userEmail:', error.response.data.userEmail);
      
      if (error.response.status === 403) {
        if (error.response.data.requiresEmailVerification) {
          console.log('\n✅ CORRECT: 403 with requiresEmailVerification = true');
          console.log('✅ Frontend should show email verification section');
        } else {
          console.log('\n❌ MISSING: requiresEmailVerification flag not set');
        }
      }
    }
    
    console.log('\n🎯 Frontend Logic Check:');
    console.log('if (error.response.status === 403 && error.response.data?.requiresEmailVerification) {');
    console.log('  // Should show email verification section');
    console.log('  // Should NOT show error alert');
    console.log('}');
    
    const shouldShowVerification = error.response?.status === 403 && error.response?.data?.requiresEmailVerification;
    console.log('\nShould show verification section:', shouldShowVerification);
  }
}

testLogin403();
