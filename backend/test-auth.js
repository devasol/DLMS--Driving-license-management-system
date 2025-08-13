import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testAuth() {
  console.log('🧪 Testing Authentication Routes...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test 2: Test user login
    console.log('\n2. Testing user login...');
    const userLoginData = {
      email: 'testuser@example.com',
      password: 'password123',
      isAdmin: false
    };

    try {
      const userLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, userLoginData);
      console.log('✅ User login successful:', userLoginResponse.data);
    } catch (error) {
      console.log('❌ User login failed:', error.response?.data || error.message);
    }

    // Test 3: Test admin login
    console.log('\n3. Testing admin login...');
    const adminLoginData = {
      email: 'testadmin@example.com',
      password: 'admin123',
      isAdmin: true
    };

    try {
      const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, adminLoginData);
      console.log('✅ Admin login successful:', adminLoginResponse.data);
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data || error.message);
    }

    // Test 4: Test with invalid credentials
    console.log('\n4. Testing invalid credentials...');
    const invalidLoginData = {
      email: 'invalid@example.com',
      password: 'wrongpassword',
      isAdmin: false
    };

    try {
      const invalidLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, invalidLoginData);
      console.log('❌ Invalid login should have failed but succeeded:', invalidLoginResponse.data);
    } catch (error) {
      console.log('✅ Invalid login correctly failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Authentication tests completed!');

  } catch (error) {
    console.error('❌ Error testing authentication:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAuth();
