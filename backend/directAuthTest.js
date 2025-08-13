import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function directAuthTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test the exact logic from the server
    async function testLogin(email, password, isAdmin) {
      console.log(`\n🔐 Testing: ${email} / ${password} (isAdmin: ${isAdmin})`);

      // Find user by email
      const user = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { user_email: email.toLowerCase() }
        ]
      });

      if (!user) {
        console.log("❌ No user found");
        return { success: false, message: "Invalid email or password" };
      }

      console.log("✅ User found:", user.fullName || user.full_name);
      console.log("📋 User details - Role:", user.role, "IsAdmin:", user.isAdmin);

      // Check admin privileges
      if (isAdmin) {
        if (user.role !== 'admin' && !user.isAdmin) {
          console.log("❌ User does not have admin privileges");
          return { success: false, message: "Invalid admin credentials" };
        }
        console.log("✅ Admin privileges verified");
      } else {
        if (user.role === 'admin' || user.isAdmin === true) {
          console.log("❌ Admin user trying to login as regular user");
          return { success: false, message: "This is an admin account. Please use admin login." };
        }
        console.log("✅ Regular user verified");
      }

      // Check password
      const passwordField = user.password || user.user_password;
      if (!passwordField) {
        console.log("❌ Password field missing");
        return { success: false, message: "Server configuration error" };
      }

      const isPasswordMatch = await bcrypt.compare(password, passwordField);
      if (!isPasswordMatch) {
        console.log("❌ Password does not match");
        return { success: false, message: "Invalid email or password" };
      }

      console.log("✅ Password verified successfully");
      return { 
        success: true, 
        message: "Login successful",
        user: {
          _id: user._id.toString(),
          full_name: user.fullName || user.full_name,
          user_email: user.email || user.user_email,
          role: user.role || 'user',
          type: isAdmin ? "admin" : "user",
        }
      };
    }

    // Test all scenarios
    console.log('🧪 DIRECT AUTHENTICATION TESTS');
    
    // Test 1: Valid user login
    const test1 = await testLogin('testuser@example.com', 'password123', false);
    console.log('Test 1 Result:', test1.success ? '✅ SUCCESS' : '❌ FAILED', test1.message);

    // Test 2: Valid admin login
    const test2 = await testLogin('admin@example.com', 'admin123', true);
    console.log('Test 2 Result:', test2.success ? '✅ SUCCESS' : '❌ FAILED', test2.message);

    // Test 3: Invalid email
    const test3 = await testLogin('nonexistent@example.com', 'password123', false);
    console.log('Test 3 Result:', test3.success ? '❌ UNEXPECTED SUCCESS' : '✅ CORRECTLY FAILED', test3.message);

    // Test 4: Invalid password
    const test4 = await testLogin('testuser@example.com', 'wrongpassword', false);
    console.log('Test 4 Result:', test4.success ? '❌ UNEXPECTED SUCCESS' : '✅ CORRECTLY FAILED', test4.message);

    // Test 5: Admin trying to login as user
    const test5 = await testLogin('admin@example.com', 'admin123', false);
    console.log('Test 5 Result:', test5.success ? '❌ UNEXPECTED SUCCESS' : '✅ CORRECTLY FAILED', test5.message);

    // Test 6: User trying to login as admin
    const test6 = await testLogin('testuser@example.com', 'password123', true);
    console.log('Test 6 Result:', test6.success ? '❌ UNEXPECTED SUCCESS' : '✅ CORRECTLY FAILED', test6.message);

    console.log('\n📊 SUMMARY:');
    console.log('✅ User Login: testuser@example.com / password123 (isAdmin: false)');
    console.log('✅ Admin Login: admin@example.com / admin123 (isAdmin: true)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

directAuthTest();
