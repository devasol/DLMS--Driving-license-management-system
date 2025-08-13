import axios from 'axios';

async function testLogin() {
  console.log('🧪 Testing login functionality...\n');

  // Test admin login
  console.log('📤 Testing admin login...');
  try {
    const adminResponse = await axios.post('http://localhost:5004/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123', // Common default password
      isAdmin: true
    });
    
    console.log('✅ Admin login successful!');
    console.log('Response:', JSON.stringify(adminResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Admin login failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
    
    // Try with different password
    try {
      console.log('\n📤 Trying admin login with password "password"...');
      const adminResponse2 = await axios.post('http://localhost:5004/api/auth/login', {
        email: 'admin@example.com',
        password: 'password',
        isAdmin: true
      });
      
      console.log('✅ Admin login successful with "password"!');
      console.log('Response:', JSON.stringify(adminResponse2.data, null, 2));
    } catch (error2) {
      console.log('❌ Admin login failed with "password" too:');
      console.log('Status:', error2.response?.status);
      console.log('Error:', JSON.stringify(error2.response?.data, null, 2));
    }
  }

  console.log('\n' + '='.repeat(50));
  
  // Test user login (if any users exist)
  console.log('\n📤 Testing user login...');
  try {
    const userResponse = await axios.post('http://localhost:5004/api/auth/login', {
      email: 'test@example.com',
      password: 'password',
      isAdmin: false
    });
    
    console.log('✅ User login successful!');
    console.log('Response:', JSON.stringify(userResponse.data, null, 2));
  } catch (error) {
    console.log('❌ User login failed (expected if no test user exists):');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
  }
}

testLogin().catch(console.error);
