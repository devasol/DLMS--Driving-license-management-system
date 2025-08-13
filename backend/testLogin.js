import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5004';

async function testLogin() {
  console.log('🔍 Testing login functionality...\n');

  // Test 1: Check if server is running
  try {
    console.log('1. Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is running:', healthResponse.data);
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
    return;
  }

  // Test 2: Try to register a test user
  try {
    console.log('\n2. Creating test user...');
    const testUser = {
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: 'password123'
    };

    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('✅ Test user created:', registerResponse.data);
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️ Test user already exists, continuing...');
    } else {
      console.log('❌ Failed to create test user:', error.response?.data || error.message);
    }
  }

  // Test 3: Try user login
  try {
    console.log('\n3. Testing user login...');
    const userLoginData = {
      email: 'testuser@example.com',
      password: 'password123',
      isAdmin: false
    };

    const userLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, userLoginData);
    console.log('✅ User login successful:', userLoginResponse.data);
  } catch (error) {
    console.log('❌ User login failed:', error.response?.data || error.message);
  }

  // Test 4: Try admin login (this will likely fail unless admin exists)
  try {
    console.log('\n4. Testing admin login...');
    const adminLoginData = {
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true
    };

    const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, adminLoginData);
    console.log('✅ Admin login successful:', adminLoginResponse.data);
  } catch (error) {
    console.log('❌ Admin login failed (expected if no admin exists):', error.response?.data || error.message);
  }

  // Test 5: Check database status
  try {
    console.log('\n5. Checking database status...');
    const dbResponse = await axios.get(`${BASE_URL}/api/db-status`);
    console.log('✅ Database status:', dbResponse.data);
  } catch (error) {
    console.log('❌ Database status check failed:', error.response?.data || error.message);
  }

  console.log('\n🏁 Test completed!');
}

testLogin().catch(console.error);
