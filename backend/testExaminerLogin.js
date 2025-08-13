import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function testExaminerLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Test examiner credentials
    const testEmail = "sarah.examiner@dlms.gov.et";
    const testPassword = "examiner123";

    console.log(`🔍 Testing login for: ${testEmail}`);

    // Find the user
    const user = await User.findOne({
      $or: [
        { email: testEmail.toLowerCase() },
        { user_email: testEmail.toLowerCase() },
      ],
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("✅ User found:");
    console.log(`- Name: ${user.fullName || user.full_name}`);
    console.log(`- Email: ${user.email || user.user_email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Examiner Details:`, user.examinerDetails);

    // Check password
    const passwordField = user.password || user.user_password;
    if (!passwordField) {
      console.log("❌ No password field found");
      return;
    }

    const isMatch = await bcrypt.compare(testPassword, passwordField);
    console.log(`🔐 Password match: ${isMatch}`);

    if (isMatch) {
      console.log("🎉 Login would be successful!");
      console.log("Response would be:");
      console.log({
        success: true,
        message: "Login successful",
        user: {
          _id: user._id.toString(),
          full_name: user.fullName || user.full_name,
          user_email: user.email || user.user_email,
          type: user.role || "user",
          examinerDetails: user.role === "examiner" ? user.examinerDetails : undefined,
        },
      });
    } else {
      console.log("❌ Password mismatch");
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testExaminerLogin();
