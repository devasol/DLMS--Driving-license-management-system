import { sendVerificationEmail } from './services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

async function urgentEmailTest() {
  console.log('🚨 URGENT EMAIL TEST');
  console.log('===================\n');

  console.log('📧 Current Email Configuration:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER);
  console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');
  console.log('- EMAIL_SERVICE:', process.env.EMAIL_SERVICE);

  if (process.env.EMAIL_PASSWORD === 'NEED_REAL_GMAIL_APP_PASSWORD_HERE') {
    console.log('\n❌ GMAIL APP PASSWORD NOT SET!');
    console.log('\n🔧 TO FIX THIS RIGHT NOW:');
    console.log('1. Go to: https://myaccount.google.com/');
    console.log('2. Security → 2-Step Verification → App passwords');
    console.log('3. Generate password for Mail app');
    console.log('4. Replace "NEED_REAL_GMAIL_APP_PASSWORD_HERE" in .env file');
    console.log('5. Restart server and run this test again');
    return;
  }

  console.log('\n📤 Testing email to dawit8908@gmail.com...');
  
  try {
    const result = await sendVerificationEmail(
      'dawit8908@gmail.com',
      'Test User',
      'test_token_' + Date.now()
    );

    if (result.success && !result.simulated) {
      console.log('\n✅ SUCCESS! Email sent to dawit8908@gmail.com');
      console.log('📨 Message ID:', result.messageId);
      console.log('📧 CHECK YOUR EMAIL INBOX NOW!');
    } else if (result.simulated) {
      console.log('\n⚠️ EMAIL SIMULATION MODE');
      console.log('Real emails not configured yet');
    } else {
      console.log('\n❌ EMAIL FAILED:', result.error);
      
      if (result.error.includes('Invalid login')) {
        console.log('\n🔑 GMAIL AUTHENTICATION FAILED');
        console.log('- Check your Gmail App Password');
        console.log('- Make sure 2-Factor Authentication is enabled');
      }
    }

  } catch (error) {
    console.log('\n❌ EMAIL ERROR:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 GMAIL SETUP REQUIRED:');
      console.log('Your Gmail credentials are wrong or missing');
    }
  }
}

urgentEmailTest();
