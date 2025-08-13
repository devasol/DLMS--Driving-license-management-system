import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function checkAccountStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check the specific user account
    const user = await User.findOne({ 
      $or: [
        { email: 'dawitsolo8908@gmail.com' },
        { user_email: 'dawitsolo8908@gmail.com' }
      ]
    });

    if (user) {
      console.log('\n👤 User Account Status:');
      console.log('='.repeat(40));
      console.log('Name:', user.fullName || user.full_name);
      console.log('Email:', user.email || user.user_email);
      console.log('Username:', user.user_name || user.userName);
      console.log('Email Verified:', user.isEmailVerified);
      console.log('Has Verification Token:', !!user.emailVerificationToken);
      console.log('Password Field:', user.password ? 'password' : user.user_password ? 'user_password' : 'MISSING');
      
      // Test password verification
      console.log('\n🔐 Password Testing:');
      const testPasswords = ['devina123', '123456', 'password123'];
      
      for (const testPassword of testPasswords) {
        try {
          const passwordField = user.password || user.user_password;
          if (passwordField) {
            const isMatch = await bcrypt.compare(testPassword, passwordField);
            console.log(`Password "${testPassword}":`, isMatch ? '✅ MATCH' : '❌ No match');
            if (isMatch) {
              console.log(`🎯 Correct password found: "${testPassword}"`);
              break;
            }
          } else {
            console.log('❌ No password field found in user document');
            break;
          }
        } catch (error) {
          console.log(`Error testing password "${testPassword}":`, error.message);
        }
      }

      // Show the user document structure
      console.log('\n📋 User Document Fields:');
      Object.keys(user.toObject()).forEach(key => {
        const value = user[key];
        if (key.includes('password')) {
          console.log(`${key}: [HASHED PASSWORD]`);
        } else if (key.includes('token')) {
          console.log(`${key}: ${value ? '[TOKEN EXISTS]' : 'null'}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      });

    } else {
      console.log('❌ User not found with email: dawitsolo8908@gmail.com');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔍 Account Status Check');
console.log('======================\n');

checkAccountStatus();
