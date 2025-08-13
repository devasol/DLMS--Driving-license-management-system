import { sendVerificationEmail, sendWelcomeEmail } from './services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testRealEmail() {
  console.log('📧 Testing Real Email Sending');
  console.log('=============================\n');

  // Check email configuration
  console.log('🔧 Email Configuration:');
  console.log('- EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
  console.log('- EMAIL_USER:', process.env.EMAIL_USER);
  console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('- SMTP_HOST:', process.env.SMTP_HOST);
  console.log('- SMTP_PORT:', process.env.SMTP_PORT);
  console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);

  if (!process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD === 'your_app_password_will_go_here') {
    console.log('\n❌ Gmail App Password not configured!');
    console.log('\n📋 To set up Gmail App Password:');
    console.log('1. Go to https://myaccount.google.com/');
    console.log('2. Security → 2-Step Verification → App passwords');
    console.log('3. Generate password for "Mail" app');
    console.log('4. Update EMAIL_PASSWORD in .env file');
    console.log('5. Restart the server');
    return;
  }

  console.log('\n📤 Testing verification email...');
  
  try {
    // Test verification email
    const testToken = 'test_verification_token_' + Date.now();
    const emailResult = await sendVerificationEmail(
      'dawit8908@gmail.com',
      'Test User',
      testToken
    );

    if (emailResult.success) {
      console.log('✅ Verification email sent successfully!');
      console.log('📧 Email sent to: dawit8908@gmail.com');
      console.log('📨 Message ID:', emailResult.messageId);
      console.log('🔗 Verification URL:', `${process.env.FRONTEND_URL}/verify-email?token=${testToken}`);
      
      // Test welcome email
      console.log('\n📤 Testing welcome email...');
      const welcomeResult = await sendWelcomeEmail(
        'dawit8908@gmail.com',
        'Test User'
      );
      
      if (welcomeResult.success) {
        console.log('✅ Welcome email sent successfully!');
        console.log('📨 Message ID:', welcomeResult.messageId);
      } else {
        console.log('❌ Welcome email failed:', welcomeResult.error);
      }
      
    } else {
      console.log('❌ Verification email failed:', emailResult.error);
      
      if (emailResult.error.includes('Invalid login')) {
        console.log('\n🔑 Gmail Authentication Issue:');
        console.log('- Check your Gmail App Password');
        console.log('- Make sure 2-Factor Authentication is enabled');
        console.log('- Verify the App Password is correct');
      }
    }

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔑 Gmail Setup Required:');
      console.log('1. Enable 2-Factor Authentication on your Google account');
      console.log('2. Generate an App Password for Mail');
      console.log('3. Update the EMAIL_PASSWORD in .env file');
      console.log('4. Restart the server and try again');
    }
  }
}

// Run the test
testRealEmail();
