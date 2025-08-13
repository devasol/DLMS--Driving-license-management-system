import { sendVerificationEmail } from './services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

async function quickEmailTest() {
  console.log('🚀 Quick Email Test to dawit8908@gmail.com');
  console.log('===========================================\n');

  try {
    const testToken = 'test_' + Date.now();
    console.log('📤 Sending test verification email...');
    
    const result = await sendVerificationEmail(
      'dawit8908@gmail.com',
      'Dawit Solomon',
      testToken
    );

    if (result.success && !result.simulated) {
      console.log('✅ SUCCESS! Real email sent to dawit8908@gmail.com');
      console.log('📨 Message ID:', result.messageId);
      console.log('📧 Check your email inbox!');
      console.log('🔗 Verification link:', `http://localhost:3000/verify-email?token=${testToken}`);
    } else if (result.simulated) {
      console.log('⚠️  Email simulation mode - Gmail not configured yet');
      console.log('🔗 Manual verification link:', `http://localhost:3000/verify-email?token=${testToken}`);
    } else {
      console.log('❌ Email failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickEmailTest();
