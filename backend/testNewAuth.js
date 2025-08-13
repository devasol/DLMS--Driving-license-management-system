import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5004';

async function testNewAuth() {
  console.log('🔐 Testing NEW Authentication System...\n');

  // Test 1: Valid User Login
  console.log('1. Testing VALID USER login...');
  try {
    const userLoginData = {
      email: 'testuser@example.com',
      password: 'password123',
      isAdmin: false
    };

    const userResponse = await axios.post(`${BASE_URL}/api/auth/login`, userLoginData);
    console.log('✅ User login SUCCESS:', userResponse.data);
  } catch (error) {
    console.log('❌ User login FAILED:', error.response?.data?.message || error.message);
  }

  // Test 2: Valid Admin Login
  console.log('\n2. Testing VALID ADMIN login...');
  try {
    const adminLoginData = {
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true
    };

    const adminResponse = await axios.post(`${BASE_URL}/api/auth/login`, adminLoginData);
    console.log('✅ Admin login SUCCESS:', adminResponse.data);
  } catch (error) {
    console.log('❌ Admin login FAILED:', error.response?.data?.message || error.message);
  }

  // Test 3: Invalid Email
  console.log('\n3. Testing INVALID EMAIL...');
  try {
    const invalidEmailData = {
      email: 'nonexistent@example.com',
      password: 'password123',
      isAdmin: false
    };

    const response = await axios.post(`${BASE_URL}/api/auth/login`, invalidEmailData);
    console.log('❌ Should have failed but succeeded:', response.data);
  } catch (error) {
    console.log('✅ Correctly FAILED with invalid email:', error.response?.data?.message);
  }

  // Test 4: Invalid Password
  console.log('\n4. Testing INVALID PASSWORD...');
  try {
    const invalidPasswordData = {
      email: 'testuser@example.com',
      password: 'wrongpassword',
      isAdmin: false
    };

    const response = await axios.post(`${BASE_URL}/api/auth/login`, invalidPasswordData);
    console.log('❌ Should have failed but succeeded:', response.data);
  } catch (error) {
    console.log('✅ Correctly FAILED with invalid password:', error.response?.data?.message);
  }

  // Test 5: Admin trying to login as regular user
  console.log('\n5. Testing ADMIN trying to login as REGULAR USER...');
  try {
    const adminAsUserData = {
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: false  // Admin trying to login as regular user
    };

    const response = await axios.post(`${BASE_URL}/api/auth/login`, adminAsUserData);
    console.log('❌ Should have failed but succeeded:', response.data);
  } catch (error) {
    console.log('✅ Correctly FAILED admin as user:', error.response?.data?.message);
  }

  // Test 6: Regular user trying to login as admin
  console.log('\n6. Testing REGULAR USER trying to login as ADMIN...');
  try {
    const userAsAdminData = {
      email: 'testuser@example.com',
      password: 'password123',
      isAdmin: true  // Regular user trying to login as admin
    };

    const response = await axios.post(`${BASE_URL}/api/auth/login`, userAsAdminData);
    console.log('❌ Should have failed but succeeded:', response.data);
  } catch (error) {
    console.log('✅ Correctly FAILED user as admin:', error.response?.data?.message);
  }

  // Test 7: Missing fields
  console.log('\n7. Testing MISSING FIELDS...');
  try {
    const missingFieldsData = {
      email: 'testuser@example.com'
      // password missing
    };

    const response = await axios.post(`${BASE_URL}/api/auth/login`, missingFieldsData);
    console.log('❌ Should have failed but succeeded:', response.data);
  } catch (error) {
    console.log('✅ Correctly FAILED with missing fields:', error.response?.data?.message);
  }

  console.log('\n🏁 Authentication test completed!');
  console.log('\n📝 WORKING CREDENTIALS:');
  console.log('👤 User: testuser@example.com / password123 (isAdmin: false)');
  console.log('👑 Admin: admin@example.com / admin123 (isAdmin: true)');
}

testNewAuth();
