import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import { generateVerificationToken } from './services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

async function createUnverifiedUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test unverified user
    const testEmail = 'testunverified@example.com';
    const testPassword = '123456';
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: testEmail },
        { user_email: testEmail }
      ]
    });

    if (existingUser) {
      console.log('👤 User already exists, updating to unverified status...');
      existingUser.isEmailVerified = false;
      existingUser.emailVerificationToken = generateVerificationToken();
      existingUser.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await existingUser.save();
      
      console.log('✅ Updated existing user to unverified status');
    } else {
      console.log('👤 Creating new unverified user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      // Create new unverified user
      const newUser = new User({
        full_name: 'Test Unverified User',
        user_email: testEmail,
        user_password: hashedPassword,
        user_name: 'testunverified',
        contact_no: '0911223344',
        gender: 'male',
        nic: '9876543210',
        isEmailVerified: false, // This is the key - unverified
        emailVerificationToken: generateVerificationToken(),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      await newUser.save();
      console.log('✅ Created new unverified user');
    }

    console.log('\n📋 Test User Details:');
    console.log('- Email:', testEmail);
    console.log('- Password:', testPassword);
    console.log('- Status: UNVERIFIED (will get 403 error on login)');
    
    console.log('\n🧪 Test Instructions:');
    console.log('1. Try logging in with these credentials on the frontend');
    console.log('2. You should see the email verification section (not error alert)');
    console.log('3. The verification section should have clear instructions');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🧪 Creating Unverified Test User');
console.log('=================================\n');

createUnverifiedUser();
