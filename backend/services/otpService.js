import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  }

  // Default SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Calculate OTP expiration time (5 minutes from now)
export const getOTPExpiration = () => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

// Send OTP email
export const sendOTPEmail = async (userEmail, userName, otp) => {
  try {
    // Check if Gmail is properly configured
    if (
      !process.env.EMAIL_PASSWORD ||
      process.env.EMAIL_PASSWORD === "GMAIL_APP_PASSWORD_NEEDED" ||
      process.env.EMAIL_PASSWORD ===
        "paste_your_16_character_app_password_here" ||
      process.env.EMAIL_PASSWORD === "your_app_password_will_go_here" ||
      process.env.EMAIL_PASSWORD === "NEED_REAL_GMAIL_APP_PASSWORD_HERE"
    ) {
      console.log("\n📧 OTP EMAIL SIMULATION (Gmail not configured):");
      console.log("=".repeat(50));
      console.log(`To: ${userEmail}`);
      console.log(`Subject: Your DLMS Verification Code`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Expires in: 2 minutes`);
      console.log("=".repeat(50));
      console.log(
        "⚠️  To send real emails, set up Gmail App Password in .env file"
      );

      return {
        success: true,
        messageId: "simulated-otp-email-" + Date.now(),
        simulated: true,
      };
    }

    console.log(`📧 Sending OTP email to: ${userEmail}`);
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "DLMS - Driving License Management System",
        address: process.env.EMAIL_USER,
      },
      to: userEmail,
      subject: "Your DLMS Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification Code</title>
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
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            .otp-box {
              background: #f8f9fa;
              border: 2px dashed #667eea;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 5px;
              margin: 10px 0;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
              padding: 20px;
              background: #f8f9fa;
            }
            .timer {
              background: #e74c3c;
              color: white;
              padding: 10px;
              border-radius: 5px;
              text-align: center;
              margin: 15px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 DLMS</h1>
              <h2>Email Verification Code</h2>
            </div>
            
            <div class="content">
              <h3>Hello ${userName}!</h3>
              
              <p>Thank you for registering with the Driving License Management System (DLMS). To complete your registration, please use the verification code below:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 16px; color: #666;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; font-size: 14px; color: #666;">Enter this code to verify your email</p>
              </div>
              
              <div class="timer">
                ⏰ This code will expire in 5 minutes
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                  <li>This code is valid for only 5 minutes</li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this code, please ignore this email</li>
                  <li>For security, you can request a new code if this one expires</li>
                </ul>
              </div>
              
              <p>Once verified, you'll be able to access all DLMS features including license applications, exam scheduling, and more.</p>
              
              <p>If you have any questions or need assistance, please contact our support team.</p>
              
              <p>Best regards,<br>
              <strong>DLMS Support Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2025 Driving License Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${userName}!
        
        Thank you for registering with the Driving License Management System (DLMS).
        
        Your verification code is: ${otp}
        
        This code will expire in 2 minutes.
        
        Please enter this code to complete your registration.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        DLMS Support Team
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    return { success: false, error: error.message };
  }
};

// Verify OTP
export const verifyOTP = (userOTP, storedOTP, otpExpires) => {
  // Check if OTP exists
  if (!storedOTP || !otpExpires) {
    return {
      valid: false,
      reason: "No OTP found. Please request a new verification code.",
    };
  }

  // Check if OTP has expired
  if (new Date() > otpExpires) {
    return {
      valid: false,
      reason: "Verification code has expired. Please request a new code.",
    };
  }

  // Check if OTP matches
  if (userOTP !== storedOTP) {
    return {
      valid: false,
      reason: "Invalid verification code. Please check and try again.",
    };
  }

  return { valid: true, reason: "OTP verified successfully" };
};

// Check if OTP is expired
export const isOTPExpired = (otpExpires) => {
  if (!otpExpires) return true;
  return new Date() > otpExpires;
};

// Send password reset OTP email
export const sendPasswordResetOTP = async (userEmail, userName, otp) => {
  try {
    // Check if Gmail is properly configured
    if (
      !process.env.EMAIL_PASSWORD ||
      process.env.EMAIL_PASSWORD === "GMAIL_APP_PASSWORD_NEEDED" ||
      process.env.EMAIL_PASSWORD ===
        "paste_your_16_character_app_password_here" ||
      process.env.EMAIL_PASSWORD === "your_app_password_will_go_here" ||
      process.env.EMAIL_PASSWORD === "NEED_REAL_GMAIL_APP_PASSWORD_HERE"
    ) {
      console.log("📧 SIMULATED PASSWORD RESET EMAIL (Gmail not configured):");
      console.log("To:", userEmail);
      console.log("Subject: Password Reset - DLMS");
      console.log("Password Reset Code:", otp);
      console.log(
        "⚠️  Configure Gmail App Password in .env to send real emails"
      );

      return {
        success: true,
        simulated: true,
        message: "Password reset email simulated (check console for OTP)",
      };
    }

    console.log(`📧 Sending password reset email to: ${userEmail}`);
    console.log(`📧 Using email service: ${process.env.EMAIL_SERVICE}`);
    console.log(`📧 From email: ${process.env.EMAIL_USER}`);
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "DLMS - Driving License Management System",
        address: process.env.EMAIL_USER,
      },
      to: userEmail,
      subject: "Password Reset - DLMS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">🔐 Password Reset</h1>
              <p style="color: #7f8c8d; margin: 10px 0 0 0;">DLMS - Driving License Management System</p>
            </div>

            <div style="margin-bottom: 30px;">
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Use the verification code below to reset your password:
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #3498db; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 5px; display: inline-block;">
                ${otp}
              </div>
            </div>

            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                ⚠️ <strong>Important:</strong> This code will expire in 5 minutes. If you didn't request this password reset, please ignore this email.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #7f8c8d; font-size: 14px; text-align: center; margin: 0;">
                This is an automated message from DLMS. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Hello ${userName}!

        We received a request to reset your password for your DLMS account.

        Your password reset code is: ${otp}

        This code will expire in 5 minutes.

        Please enter this code to reset your password.

        If you didn't request this password reset, please ignore this email.

        Best regards,
        DLMS Support Team
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};

// Send login notification email
export const sendLoginNotificationEmail = async (
  userEmail,
  userName,
  loginDetails = {}
) => {
  try {
    // Check if Gmail is properly configured
    if (
      !process.env.EMAIL_PASSWORD ||
      process.env.EMAIL_PASSWORD === "GMAIL_APP_PASSWORD_NEEDED" ||
      process.env.EMAIL_PASSWORD ===
        "paste_your_16_character_app_password_here" ||
      process.env.EMAIL_PASSWORD === "your_app_password_will_go_here" ||
      process.env.EMAIL_PASSWORD === "NEED_REAL_GMAIL_APP_PASSWORD_HERE"
    ) {
      console.log(
        "\n📧 LOGIN NOTIFICATION EMAIL SIMULATION (Gmail not configured):"
      );
      console.log("=".repeat(50));
      console.log(`To: ${userEmail}`);
      console.log(`Subject: Login Alert - DLMS Account Access`);
      console.log(`User: ${userName}`);
      console.log(`Login Time: ${new Date().toLocaleString()}`);
      console.log(`IP Address: ${loginDetails.ipAddress || "Unknown"}`);
      console.log(`User Agent: ${loginDetails.userAgent || "Unknown"}`);
      console.log("=".repeat(50));
      console.log("✅ Login notification email simulated successfully");

      return { success: true, simulated: true };
    }

    const transporter = createTransporter();

    // Get current date and time
    const loginTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Addis_Ababa",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const mailOptions = {
      from: `"DLMS - Driving License Management System" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "🔐 Login Alert - DLMS Account Access",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .login-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .security-note { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚗 DLMS</div>
              <h2>Login Notification</h2>
              <p>Your account was accessed successfully</p>
            </div>

            <div class="content">
              <h3>Hello ${userName}!</h3>
              <p>We're writing to inform you that your DLMS account was accessed. Here are the login details:</p>

              <div class="login-details">
                <h4>📋 Login Information</h4>
                <div class="detail-row">
                  <span class="detail-label">👤 Account:</span>
                  <span class="detail-value">${userEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🕒 Login Time:</span>
                  <span class="detail-value">${loginTime} (Ethiopia Time)</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🌐 IP Address:</span>
                  <span class="detail-value">${
                    loginDetails.ipAddress || "Not available"
                  }</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">💻 Device/Browser:</span>
                  <span class="detail-value">${
                    loginDetails.userAgent
                      ? loginDetails.userAgent.substring(0, 100) + "..."
                      : "Not available"
                  }</span>
                </div>
              </div>

              <div class="security-note">
                <h4>🔒 Security Notice</h4>
                <p><strong>Was this you?</strong> If you recognize this login, no action is needed.</p>
                <p><strong>Didn't sign in?</strong> If this wasn't you, please:</p>
                <ul>
                  <li>Change your password immediately</li>
                  <li>Contact our support team</li>
                  <li>Review your account activity</li>
                </ul>
              </div>

              <p>Thank you for using DLMS - Driving License Management System!</p>

              <div class="footer">
                <p>This is an automated security notification from DLMS.</p>
                <p>© 2024 DLMS - Driving License Management System</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        DLMS - Login Notification

        Hello ${userName}!

        Your DLMS account was accessed successfully.

        Login Details:
        - Account: ${userEmail}
        - Time: ${loginTime} (Ethiopia Time)
        - IP Address: ${loginDetails.ipAddress || "Not available"}
        - Device: ${loginDetails.userAgent || "Not available"}

        If this wasn't you, please change your password immediately and contact support.

        Thank you for using DLMS!

        © 2024 DLMS - Driving License Management System
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(
      "✅ Login notification email sent successfully:",
      result.messageId
    );
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending login notification email:", error);
    return { success: false, error: error.message };
  }
};

export default {
  generateOTP,
  getOTPExpiration,
  sendOTPEmail,
  sendPasswordResetOTP,
  sendLoginNotificationEmail,
  verifyOTP,
  isOTPExpired,
};
