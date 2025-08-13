import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5004';

async function finalTest() {
  console.log('🔧 Final comprehensive test and fix...\n');

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clean up existing test users
    await User.deleteMany({ 
      email: { $in: ['testuser@example.com', 'admin@example.com'] }
    });
    console.log('🗑️ Cleaned up existing test users');

    // Create test user directly in database with proper password hashing
    console.log('\n1. Creating test user directly in database...');
    const testUser = new User({
      fullName: 'Test User Direct',
      email: 'testuser@example.com',
      password: 'password123'
    });
    await testUser.save();
    console.log('✅ Test user created directly');

    // Create admin user directly in database
    console.log('\n2. Creating admin user directly in database...');
    const adminUser = new User({
      fullName: 'Admin User Direct',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isAdmin: true
    });
    await adminUser.save();
    console.log('✅ Admin user created directly');

    await mongoose.disconnect();

    // Test user login
    console.log('\n3. Testing user login...');
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

    // Test admin login
    console.log('\n4. Testing admin login...');
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

    console.log('\n🏁 Final test completed!');
    console.log('\n📝 Working credentials:');
    console.log('User: testuser@example.com / password123');
    console.log('Admin: admin@example.com / admin123');

  } catch (error) {
    console.error('Error in final test:', error);
  }
}

finalTest();
