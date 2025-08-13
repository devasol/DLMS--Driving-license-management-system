import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5004';

async function testRealUsers() {
  console.log('🔍 Testing login with real users from database...\n');

  // Test 1: User login
  console.log('1. Testing USER login...');
  try {
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

  // Test 2: Admin login
  console.log('\n2. Testing ADMIN login...');
  try {
    const adminLoginData = {
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true
    };

    const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, adminLoginData);
    console.log('✅ Admin login successful:', adminLoginResponse.data);
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data || error.message);
  }

  console.log('\n🏁 Real user test completed!');
  console.log('\n📝 Available credentials from your database:');
  console.log('👤 User: testuser@example.com / password123');
  console.log('👑 Admin: admin@example.com / admin123');
  console.log('\n💡 Use these credentials in your frontend signin page!');
}

testRealUsers();
