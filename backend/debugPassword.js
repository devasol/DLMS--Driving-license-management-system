import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function debugPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the test user
    const user = await User.findOne({ email: 'testuser@example.com' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ User found:');
    console.log('- Email:', user.email);
    console.log('- Password field:', user.password ? 'exists' : 'missing');
    console.log('- Password starts with $2:', user.password?.startsWith('$2'));
    console.log('- Password length:', user.password?.length);
    console.log('- First 20 chars of password:', user.password?.substring(0, 20));

    // Test password comparison with the actual stored password
    const testPassword = 'password123';
    console.log('\n🔍 Testing password comparison...');
    
    try {
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log('- bcrypt.compare result:', isMatch);
    } catch (error) {
      console.log('- bcrypt.compare error:', error.message);
    }

    // Test with the model's comparePassword method
    try {
      const isMatchMethod = await user.comparePassword(testPassword);
      console.log('- Model comparePassword result:', isMatchMethod);
    } catch (error) {
      console.log('- Model comparePassword error:', error.message);
    }

    // Let's try to create a properly hashed password manually
    console.log('\n🔧 Creating properly hashed password...');
    const properlyHashed = await bcrypt.hash(testPassword, 10);
    console.log('- Properly hashed password:', properlyHashed.substring(0, 20) + '...');
    
    const testProperHash = await bcrypt.compare(testPassword, properlyHashed);
    console.log('- Test with proper hash:', testProperHash);

    // Update the user with the properly hashed password
    console.log('\n🔄 Updating user with properly hashed password...');
    user.password = properlyHashed;
    user.user_password = properlyHashed;
    
    // Save without triggering the pre-save hook
    await User.updateOne(
      { _id: user._id },
      { 
        password: properlyHashed,
        user_password: properlyHashed
      }
    );
    
    console.log('✅ User password updated');

    // Test login again
    const updatedUser = await User.findOne({ email: 'testuser@example.com' });
    const finalTest = await bcrypt.compare(testPassword, updatedUser.password);
    console.log('- Final test with updated password:', finalTest);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugPassword();
