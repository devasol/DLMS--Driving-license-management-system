import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function diagnoseEmailIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check email configuration
    console.log('\n🔧 Email Configuration Check:');
    console.log('- EMAIL_SERVICE:', process.env.EMAIL_SERVICE || '❌ Not set');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER || '❌ Not set');
    console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
    console.log('- SMTP_HOST:', process.env.SMTP_HOST || '❌ Not set');
    console.log('- SMTP_PORT:', process.env.SMTP_PORT || '❌ Not set');
    console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Not set');

    // Find users who need email verification
    const unverifiedUsers = await User.find({ 
      isEmailVerified: false,
      emailVerificationToken: { $exists: true, $ne: null }
    });

    console.log('\n👥 Users Needing Email Verification:');
    console.log(`Found ${unverifiedUsers.length} unverified users`);

    for (const user of unverifiedUsers) {
      console.log(`\n📧 User: ${user.fullName || user.full_name}`);
      console.log(`   Email: ${user.email || user.user_email}`);
      console.log(`   Verified: ${user.isEmailVerified}`);
      console.log(`   Has Token: ${!!user.emailVerificationToken}`);
      console.log(`   Token Expires: ${user.emailVerificationExpires}`);
      
      if (user.emailVerificationToken) {
        console.log(`   Verification URL: http://localhost:3000/verify-email?token=${user.emailVerificationToken}`);
      }
    }

    // Test email service
    console.log('\n📧 Testing Email Service...');
    try {
      const emailService = await import('./services/emailService.js');
      
      // Test token generation
      const testToken = emailService.generateVerificationToken();
      console.log('✅ Token generation works');
      
      // Test email sending (this will likely fail due to credentials)
      if (unverifiedUsers.length > 0) {
        const testUser = unverifiedUsers[0];
        console.log(`\n📤 Attempting to send test email to: ${testUser.email || testUser.user_email}`);
        
        const emailResult = await emailService.sendVerificationEmail(
          testUser.email || testUser.user_email,
          testUser.fullName || testUser.full_name,
          testUser.emailVerificationToken
        );
        
        if (emailResult.success) {
          console.log('✅ Email sent successfully!');
          console.log('Message ID:', emailResult.messageId);
        } else {
          console.log('❌ Email failed to send:', emailResult.error);
        }
      }
      
    } catch (emailError) {
      console.log('❌ Email service error:', emailError.message);
      
      if (emailError.message.includes('Invalid login')) {
        console.log('\n🔑 Gmail Authentication Issue:');
        console.log('- Your Gmail credentials are incorrect');
        console.log('- You need to set up an App Password');
        console.log('- Check GMAIL_SETUP_GUIDE.md for instructions');
      }
    }

    // Provide manual verification option
    if (unverifiedUsers.length > 0) {
      console.log('\n🔧 Manual Verification Option:');
      console.log('Since email is not working, you can manually verify users:');
      
      for (const user of unverifiedUsers) {
        console.log(`\n👤 ${user.fullName || user.full_name} (${user.email || user.user_email}):`);
        console.log(`   Manual verification URL: http://localhost:5004/api/auth/verify-email?token=${user.emailVerificationToken}`);
        console.log(`   Or visit: http://localhost:3000/verify-email?token=${user.emailVerificationToken}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔍 Email Issue Diagnosis');
console.log('========================\n');

diagnoseEmailIssue();
