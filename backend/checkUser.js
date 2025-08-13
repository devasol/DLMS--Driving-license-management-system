import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function checkUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the test user
    const user = await User.findOne({ email: 'testuser@example.com' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ User found:');
    console.log('- ID:', user._id);
    console.log('- Full Name:', user.fullName || user.full_name);
    console.log('- Email:', user.email || user.user_email);
    console.log('- Password field exists:', !!user.password);
    console.log('- User_password field exists:', !!user.user_password);
    console.log('- Password length:', user.password?.length || 'N/A');
    console.log('- User_password length:', user.user_password?.length || 'N/A');

    // Test password comparison
    const testPassword = 'password123';
    console.log('\n🔍 Testing password comparison...');
    
    if (user.password) {
      const isMatch1 = await bcrypt.compare(testPassword, user.password);
      console.log('- bcrypt.compare with password field:', isMatch1);
    }
    
    if (user.user_password) {
      const isMatch2 = await bcrypt.compare(testPassword, user.user_password);
      console.log('- bcrypt.compare with user_password field:', isMatch2);
    }

    // Test using the model method
    const isMatchMethod = await user.comparePassword(testPassword);
    console.log('- Using model comparePassword method:', isMatchMethod);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();
