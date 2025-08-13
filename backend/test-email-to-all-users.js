import mongoose from 'mongoose';
import User from './models/User.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send test email to a user
const sendTestEmail = async (userEmail, userName) => {
  try {
    // Check if Gmail is properly configured
    if (!process.env.EMAIL_PASSWORD ||
        process.env.EMAIL_PASSWORD === 'GMAIL_APP_PASSWORD_NEEDED' ||
        process.env.EMAIL_PASSWORD === 'paste_your_16_character_app_password_here' ||
        process.env.EMAIL_PASSWORD === 'your_app_password_will_go_here' ||
        process.env.EMAIL_PASSWORD === 'NEED_REAL_GMAIL_APP_PASSWORD_HERE') {

      console.log(`📧 EMAIL SIMULATION for ${userEmail}:`);
      console.log('='.repeat(50));
      console.log(`To: ${userEmail}`);
      console.log(`Subject: DLMS System Test - Email Functionality Working`);
      console.log(`Message: Hello ${userName}, this is a test email from DLMS system.`);
      console.log('='.repeat(50));

      return {
        success: true,
        messageId: 'simulated-test-email-' + Date.now(),
        simulated: true
      };
    }

    console.log(`📧 Sending real test email to: ${userEmail}`);
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'DLMS - Driving License Management System',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'DLMS System Test - Email Functionality Working',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DLMS System Test</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            .success-box {
              background: #d4edda;
              border: 1px solid #c3e6cb;
              color: #155724;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
              padding: 20px;
              background: #f8f9fa;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 DLMS</h1>
              <h2>Email System Test</h2>
            </div>
            
            <div class="content">
              <h3>Hello ${userName}!</h3>
              
              <div class="success-box">
                <h4>✅ Email System Working Successfully!</h4>
                <p>This is a test email to verify that the DLMS email system is functioning properly.</p>
              </div>
              
              <p>We're testing our email functionality to ensure you receive important notifications about:</p>
              
              <ul>
                <li>📧 Account verification codes (OTP)</li>
                <li>🔔 License application updates</li>
                <li>📅 Exam scheduling notifications</li>
                <li>📄 License renewal reminders</li>
                <li>🎉 System announcements</li>
              </ul>
              
              <p><strong>Email Configuration Details:</strong></p>
              <ul>
                <li>Sender: dlms.sys.2025@gmail.com</li>
                <li>System: DLMS Email Service</li>
                <li>Date: ${new Date().toLocaleString()}</li>
              </ul>
              
              <p>If you received this email, it means our email system is working correctly and you'll receive all future notifications from DLMS.</p>
              
              <p>Thank you for being part of the DLMS community!</p>
              
              <p>Best regards,<br>
              <strong>DLMS Development Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This is a test email from the DLMS system.</p>
              <p>&copy; 2025 Driving License Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${userName}!
        
        This is a test email to verify that the DLMS email system is functioning properly.
        
        Email System Working Successfully!
        
        We're testing our email functionality to ensure you receive important notifications about:
        - Account verification codes (OTP)
        - License application updates
        - Exam scheduling notifications
        - License renewal reminders
        - System announcements
        
        Email Configuration Details:
        - Sender: dlms.sys.2025@gmail.com
        - System: DLMS Email Service
        - Date: ${new Date().toLocaleString()}
        
        If you received this email, it means our email system is working correctly.
        
        Thank you for being part of the DLMS community!
        
        Best regards,
        DLMS Development Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Test email sent successfully to ${userEmail}:`, result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error(`❌ Error sending test email to ${userEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Main function to send emails to all users
async function sendTestEmailsToAllUsers() {
  try {
    console.log('🧪 DLMS Email System Test');
    console.log('='.repeat(50));
    console.log('📧 Sender Email:', process.env.EMAIL_USER);
    console.log('🔧 Email Service:', process.env.EMAIL_SERVICE);
    console.log('='.repeat(50));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users from database
    const users = await User.find({}, {
      email: 1,
      user_email: 1,
      fullName: 1,
      full_name: 1,
      isEmailVerified: 1
    });

    console.log(`\n📊 Found ${users.length} users in database`);

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    let emailsSent = 0;
    let emailsSimulated = 0;
    let emailsFailed = 0;

    console.log('\n📧 Sending test emails...\n');

    // Send email to each user
    for (const user of users) {
      const userEmail = user.email || user.user_email;
      const userName = user.fullName || user.full_name || 'User';
      
      if (!userEmail) {
        console.log(`⚠️  Skipping user ${user._id} - no email address`);
        continue;
      }

      console.log(`📤 Sending to: ${userEmail} (${userName})`);
      
      const result = await sendTestEmail(userEmail, userName);
      
      if (result.success) {
        if (result.simulated) {
          emailsSimulated++;
          console.log(`   ✅ Simulated (Gmail not configured)`);
        } else {
          emailsSent++;
          console.log(`   ✅ Sent successfully`);
        }
      } else {
        emailsFailed++;
        console.log(`   ❌ Failed: ${result.error}`);
      }

      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 Email Test Summary:');
    console.log('='.repeat(30));
    console.log(`📧 Total Users: ${users.length}`);
    console.log(`✅ Emails Sent: ${emailsSent}`);
    console.log(`🔄 Emails Simulated: ${emailsSimulated}`);
    console.log(`❌ Emails Failed: ${emailsFailed}`);
    console.log('='.repeat(30));

    if (emailsSimulated > 0) {
      console.log('\n⚠️  Note: Emails were simulated because Gmail App Password is not configured.');
      console.log('To send real emails, update EMAIL_PASSWORD in .env file with a valid Gmail App Password.');
    }

    if (emailsSent > 0) {
      console.log('\n🎉 Email system is working! Users should receive test emails.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the test
sendTestEmailsToAllUsers().catch(console.error);
