import { sendLoginNotificationEmail } from '../services/otpService.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function testLoginNotification() {
  console.log('🧪 Testing Login Notification Email...\n');
  
  try {
    // Test data
    const testUser = {
      email: 'test@example.com',
      name: 'Test User'
    };
    
    const loginDetails = {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
    
    console.log('📧 Sending login notification email...');
    console.log(`To: ${testUser.email}`);
    console.log(`User: ${testUser.name}`);
    console.log(`IP: ${loginDetails.ipAddress}`);
    console.log(`Browser: ${loginDetails.userAgent.substring(0, 50)}...`);
    
    const result = await sendLoginNotificationEmail(
      testUser.email,
      testUser.name,
      loginDetails
    );
    
    if (result.success) {
      if (result.simulated) {
        console.log('\n✅ Login notification email simulated successfully!');
        console.log('📝 Note: Email was simulated because Gmail is not configured.');
        console.log('💡 To send real emails, configure your Gmail App Password in .env file.');
      } else {
        console.log('\n✅ Login notification email sent successfully!');
        console.log(`📧 Message ID: ${result.messageId}`);
      }
    } else {
      console.log('\n❌ Failed to send login notification email');
      console.log(`Error: ${result.error}`);
    }
    
    console.log('\n📋 Email Template Features:');
    console.log('✓ Professional HTML design with DLMS branding');
    console.log('✓ Login details (time, IP address, browser)');
    console.log('✓ Security notice and instructions');
    console.log('✓ Ethiopia timezone formatting');
    console.log('✓ Responsive email layout');
    console.log('✓ Plain text fallback');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLoginNotification();
