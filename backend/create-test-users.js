import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function createTestUsers() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Test user credentials
    const testUser = {
      email: 'testuser@example.com',
      password: 'password123',
      fullName: 'Test User',
      role: 'user',
      isAdmin: false
    };

    // Test admin credentials
    const testAdmin = {
      email: 'testadmin@example.com',
      password: 'admin123',
      fullName: 'Test Admin',
      role: 'admin',
      isAdmin: true
    };

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (!existingUser) {
      console.log('👤 Creating test user...');
      const hashedUserPassword = await bcrypt.hash(testUser.password, 10);

      const timestamp = Date.now();
      const newUser = new User({
        fullName: testUser.fullName,
        full_name: testUser.fullName,
        email: testUser.email,
        user_email: testUser.email,
        user_name: 'testuser_' + timestamp,
        nic: 'TEST_USER_' + timestamp,
        contact_no: '0911111111',
        gender: 'male',
        password: hashedUserPassword,
        user_password: hashedUserPassword,
        role: testUser.role,
        isAdmin: testUser.isAdmin
      });

      await newUser.save();
      console.log('✅ Test user created:', testUser.email);
    } else {
      console.log('👤 Test user already exists:', testUser.email);
    }

    // Check if test admin already exists
    const existingAdmin = await User.findOne({ email: testAdmin.email });
    if (!existingAdmin) {
      console.log('👨‍💼 Creating test admin...');
      const hashedAdminPassword = await bcrypt.hash(testAdmin.password, 10);

      const adminTimestamp = Date.now() + 1;
      const newAdmin = new User({
        fullName: testAdmin.fullName,
        full_name: testAdmin.fullName,
        email: testAdmin.email,
        user_email: testAdmin.email,
        user_name: 'testadmin_' + adminTimestamp,
        nic: 'TEST_ADMIN_' + adminTimestamp,
        contact_no: '0922222222',
        gender: 'male',
        password: hashedAdminPassword,
        user_password: hashedAdminPassword,
        role: testAdmin.role,
        isAdmin: testAdmin.isAdmin
      });

      await newAdmin.save();
      console.log('✅ Test admin created:', testAdmin.email);
    } else {
      console.log('👨‍💼 Test admin already exists:', testAdmin.email);
    }

    console.log('\n📋 Test Credentials:');
    console.log('User Login:');
    console.log(`  Email: ${testUser.email}`);
    console.log(`  Password: ${testUser.password}`);
    console.log('\nAdmin Login:');
    console.log(`  Email: ${testAdmin.email}`);
    console.log(`  Password: ${testAdmin.password}`);

    await mongoose.disconnect();
    console.log('\n✅ Test users setup complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUsers();
