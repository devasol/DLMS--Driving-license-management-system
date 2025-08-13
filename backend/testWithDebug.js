import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5004';

async function testWithDebug() {
  console.log('🔍 Testing login with detailed debugging...\n');

  // Test 1: Check server health
  try {
    console.log('1. Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is running:', healthResponse.data);
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
    return;
  }

  // Test 2: User login with detailed logging
  console.log('\n2. Testing USER login with debug...');
  try {
    const userLoginData = {
      email: 'testuser@example.com',
      password: 'password123',
      isAdmin: false
    };

    console.log('Sending user login request:', userLoginData);
    const userLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, userLoginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ User login successful:', userLoginResponse.data);
  } catch (error) {
    console.log('❌ User login failed:');
    console.log('- Status:', error.response?.status);
    console.log('- Data:', error.response?.data);
    console.log('- Message:', error.message);
  }

  // Test 3: Admin login with detailed logging
  console.log('\n3. Testing ADMIN login with debug...');
  try {
    const adminLoginData = {
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true
    };

    console.log('Sending admin login request:', adminLoginData);
    const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, adminLoginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Admin login successful:', adminLoginResponse.data);
  } catch (error) {
    console.log('❌ Admin login failed:');
    console.log('- Status:', error.response?.status);
    console.log('- Data:', error.response?.data);
    console.log('- Message:', error.message);
  }

  // Test 4: Try different admin login variations
  console.log('\n4. Testing admin login variations...');
  
  const adminVariations = [
    { email: 'admin@example.com', password: 'admin123', isAdmin: true },
    { email: 'admin@example.com', password: 'admin123', isAdmin: 'true' },
    { email: 'admin@example.com', password: 'admin123' }, // without isAdmin flag
  ];

  for (let i = 0; i < adminVariations.length; i++) {
    const variation = adminVariations[i];
    console.log(`\n4.${i + 1}. Testing variation:`, variation);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, variation);
      console.log(`✅ Variation ${i + 1} successful:`, response.data);
    } catch (error) {
      console.log(`❌ Variation ${i + 1} failed:`, error.response?.data?.message || error.message);
    }
  }

  console.log('\n🏁 Debug test completed!');
}

testWithDebug();
