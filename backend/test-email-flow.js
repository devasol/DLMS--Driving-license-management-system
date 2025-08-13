import { sendVerificationEmail, sendWelcomeEmail } from './services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testEmailFlow() {
  console.log('📧 Email Flow Test - dawit8908@gmail.com as Sender');
  console.log('==================================================\n');

  console.log('🔧 Current Configuration:');
  console.log('- Sender Email:', process.env.EMAIL_USER);
  console.log('- SMTP Service:', process.env.EMAIL_SERVICE);
  console.log('- Password Set:', process.env.EMAIL_PASSWORD ? '✅ Yes' : '❌ No');
  console.log('- Frontend URL:', process.env.FRONTEND_URL);

  // Test different recipient emails
  const testEmails = [
    { email: 'testuser@example.com', name: 'Test User' },
    { email: 'newuser@gmail.com', name: 'New User' },
    { email: 'demo@yahoo.com', name: 'Demo User' }
  ];

  console.log('\n📤 Testing Email Sending to Different Recipients:');
  console.log('='.repeat(60));

  for (const recipient of testEmails) {
    console.log(`\n👤 Testing: ${recipient.name} (${recipient.email})`);
    
    try {
      // Generate unique verification token
      const verificationToken = 'verify_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      console.log(`📧 Sending verification email...`);
      console.log(`   From: ${process.env.EMAIL_USER}`);
      console.log(`   To: ${recipient.email}`);
      
      const result = await sendVerificationEmail(
        recipient.email,
        recipient.name,
        verificationToken
      );

      if (result.success) {
        if (result.simulated) {
          console.log('⚠️  EMAIL SIMULATED (Gmail not configured)');
          console.log(`🔗 Manual verification link: http://localhost:3000/verify-email?token=${verificationToken}`);
        } else {
          console.log('✅ REAL EMAIL SENT!');
          console.log(`📨 Message ID: ${result.messageId}`);
          console.log(`📧 Check ${recipient.email} for verification email`);
        }
      } else {
        console.log('❌ Email failed:', result.error);
      }

    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  // Test welcome email
  console.log('\n🎉 Testing Welcome Email:');
  console.log('='.repeat(30));
  
  try {
    const welcomeResult = await sendWelcomeEmail(
      'testuser@example.com',
      'Test User'
    );

    if (welcomeResult.success) {
      if (welcomeResult.simulated) {
        console.log('⚠️  Welcome email simulated');
      } else {
        console.log('✅ Welcome email sent!');
        console.log(`📨 Message ID: ${welcomeResult.messageId}`);
      }
    } else {
      console.log('❌ Welcome email failed:', welcomeResult.error);
    }

  } catch (error) {
    console.log('❌ Welcome email error:', error.message);
  }

  console.log('\n📋 Summary:');
  console.log('='.repeat(20));
  console.log('- Sender: dawit8908@gmail.com');
  console.log('- Recipients: Any email address users sign up with');
  console.log('- Status: ' + (process.env.EMAIL_PASSWORD === 'temp_test_password_for_demo' ? 'Simulation Mode' : 'Real Email Mode'));
  
  if (process.env.EMAIL_PASSWORD === 'temp_test_password_for_demo') {
    console.log('\n🔧 To Enable Real Emails:');
    console.log('1. Set up Gmail App Password for dawit8908@gmail.com');
    console.log('2. Update EMAIL_PASSWORD in .env file');
    console.log('3. Restart server');
    console.log('4. Run this test again');
  }
}

testEmailFlow();
