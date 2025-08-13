import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function debugAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('- ID:', admin._id);
    console.log('- Name:', admin.fullName || admin.full_name);
    console.log('- Email:', admin.email || admin.user_email);
    console.log('- Role:', admin.role);
    console.log('- IsAdmin:', admin.isAdmin);
    console.log('- Password field exists:', !!admin.password);
    console.log('- User_password field exists:', !!admin.user_password);
    console.log('- Password length:', admin.password?.length);
    console.log('- Password starts with $2:', admin.password?.startsWith('$2'));

    // Test password comparison
    const testPassword = 'admin123';
    console.log('\n🔍 Testing admin password comparison...');
    
    if (admin.password) {
      try {
        const isMatch1 = await bcrypt.compare(testPassword, admin.password);
        console.log('- bcrypt.compare with password field:', isMatch1);
      } catch (error) {
        console.log('- bcrypt.compare error with password field:', error.message);
      }
    }
    
    if (admin.user_password) {
      try {
        const isMatch2 = await bcrypt.compare(testPassword, admin.user_password);
        console.log('- bcrypt.compare with user_password field:', isMatch2);
      } catch (error) {
        console.log('- bcrypt.compare error with user_password field:', error.message);
      }
    }

    // Test the admin query that the login uses
    console.log('\n🔍 Testing admin query from login logic...');
    const adminQuery = await User.findOne({
      $and: [
        {
          $or: [
            { email: 'admin@example.com' },
            { user_email: 'admin@example.com' }
          ]
        },
        {
          $or: [
            { role: 'admin' },
            { isAdmin: true }
          ]
        }
      ]
    });

    if (adminQuery) {
      console.log('✅ Admin query successful');
      console.log('- Found admin:', adminQuery.fullName || adminQuery.full_name);
      console.log('- Role:', adminQuery.role);
      console.log('- IsAdmin:', adminQuery.isAdmin);
    } else {
      console.log('❌ Admin query failed - no admin found with query');
    }

    // If password doesn't work, let's fix it
    if (admin.password && !admin.password.startsWith('$2')) {
      console.log('\n🔧 Password is not hashed, fixing...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await User.updateOne(
        { _id: admin._id },
        { 
          password: hashedPassword,
          user_password: hashedPassword
        }
      );
      console.log('✅ Admin password updated with proper hash');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugAdmin();
