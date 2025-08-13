import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5004';

async function testLoginFixed() {
  console.log('🔍 Testing login functionality after fix...\n');

  // First, clean up the old test user
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteOne({ email: 'testuser@example.com' });
    console.log('🗑️ Cleaned up old test user');
    await mongoose.disconnect();
  } catch (error) {
    console.log('ℹ️ No old test user to clean up');
  }

  // Test 1: Create a new test user with the fixed registration
  try {
    console.log('\n1. Creating new test user...');
    const testUser = {
      fullName: 'Test User Fixed',
      email: 'testuser@example.com',
      password: 'password123'
    };

    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('✅ Test user created:', registerResponse.data);
  } catch (error) {
    console.log('❌ Failed to create test user:', error.response?.data || error.message);
    return;
  }

  // Test 2: Try user login
  try {
    console.log('\n2. Testing user login...');
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

  // Test 3: Create an admin user for testing
  try {
    console.log('\n3. Creating admin user...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Delete existing admin user if any
    await User.deleteOne({ email: 'admin@example.com' });
    
    const adminUser = new User({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isAdmin: true
    });
    
    await adminUser.save();
    console.log('✅ Admin user created');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Failed to create admin user:', error.message);
  }

  // Test 4: Try admin login
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
    console.log('❌ Admin login failed:', error.response?.data || error.message);
  }

  console.log('\n🏁 Test completed!');
  console.log('\n📝 Test credentials:');
  console.log('User: testuser@example.com / password123');
  console.log('Admin: admin@example.com / admin123');
}

testLoginFixed().catch(console.error);
