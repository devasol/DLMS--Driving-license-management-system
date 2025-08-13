import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  // For development, you can use Gmail or any SMTP service
  // For production, use a proper email service like SendGrid, AWS SES, etc.

  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  }
  
  // Default SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (userEmail, userName, verificationToken) => {
  try {
    // Check if Gmail is properly configured
    if (!process.env.EMAIL_PASSWORD ||
        process.env.EMAIL_PASSWORD === 'paste_your_16_character_app_password_here' ||
        process.env.EMAIL_PASSWORD === 'your_app_password_will_go_here' ||
        process.env.EMAIL_PASSWORD === 'NEED_REAL_GMAIL_APP_PASSWORD_HERE') {

      console.log('\n📧 EMAIL SIMULATION (Gmail not configured):');
      console.log('='.repeat(50));
      console.log(`To: ${userEmail}`);
      console.log(`Subject: Verify Your Email Address - DLMS`);
      console.log(`Verification URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`);
      console.log('='.repeat(50));
      console.log('⚠️  To send real emails, set up Gmail App Password in .env file');
      console.log('📋 Instructions: Check GMAIL_SETUP_GUIDE.md');

      return {
        success: true,
        messageId: 'simulated-email-' + Date.now(),
        simulated: true
      };
    }

    console.log(`📧 Sending real verification email to: ${userEmail}`);
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: {
        name: 'DLMS - Driving License Management System',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'Verify Your Email Address - DLMS',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background: #5a6fd8;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚗 DLMS</h1>
            <h2>Email Verification Required</h2>
          </div>
          
          <div class="content">
            <h3>Hello ${userName}!</h3>
            
            <p>Thank you for registering with the Driving License Management System (DLMS). To complete your registration and secure your account, please verify your email address.</p>
            
            <p>Click the button below to verify your email:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This verification link will expire in 24 hours</li>
                <li>You must verify your email before you can log in to your account</li>
                <li>If you didn't create this account, please ignore this email</li>
              </ul>
            </div>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
              <li>✅ Apply for driving licenses</li>
              <li>✅ Schedule theory and practical exams</li>
              <li>✅ Track your application status</li>
              <li>✅ Access your digital license</li>
            </ul>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>DLMS Support Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Driving License Management System. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${userName}!
        
        Thank you for registering with the Driving License Management System (DLMS).
        
        To complete your registration, please verify your email address by clicking the link below:
        ${verificationUrl}
        
        This verification link will expire in 24 hours.
        
        If you didn't create this account, please ignore this email.
        
        Best regards,
        DLMS Support Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'DLMS - Driving License Management System',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'Welcome to DLMS! Your Account is Verified',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to DLMS</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #28a745;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .feature-box {
              background: white;
              padding: 20px;
              margin: 15px 0;
              border-radius: 8px;
              border-left: 4px solid #28a745;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome to DLMS!</h1>
            <h2>Your Account is Now Verified</h2>
          </div>
          
          <div class="content">
            <h3>Congratulations ${userName}!</h3>
            
            <p>Your email has been successfully verified and your DLMS account is now active. You can now access all features of our Driving License Management System.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to Your Account</a>
            </div>
            
            <h3>What you can do now:</h3>
            
            <div class="feature-box">
              <h4>📝 Apply for Driving License</h4>
              <p>Submit your driving license application with all required documents.</p>
            </div>
            
            <div class="feature-box">
              <h4>📚 Schedule Exams</h4>
              <p>Book your theory and practical driving exams at your convenience.</p>
            </div>
            
            <div class="feature-box">
              <h4>📊 Track Progress</h4>
              <p>Monitor your application status and exam results in real-time.</p>
            </div>
            
            <div class="feature-box">
              <h4>📱 Digital License</h4>
              <p>Access your digital driving license with QR code verification.</p>
            </div>
            
            <p>If you need any assistance getting started, our support team is here to help!</p>
            
            <p>Best regards,<br>
            <strong>DLMS Support Team</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 Driving License Management System. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

export default {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail
};
