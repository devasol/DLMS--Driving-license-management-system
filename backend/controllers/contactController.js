import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Contact from "../models/Contact.js";

dotenv.config({ path: "./backend/.env" });

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "dlms.sys.2025@gmail.com",
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message, priority } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Save contact form submission to database
    try {
      const contactSubmission = new Contact({
        name,
        email,
        subject,
        message,
        priority,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      });

      await contactSubmission.save();
      console.log("✅ Contact form submission saved to database");
    } catch (dbError) {
      console.error("⚠️ Failed to save contact form to database:", dbError);
      // Continue with email sending even if database save fails
    }

    // Check if Gmail is properly configured
    if (
      !process.env.EMAIL_PASSWORD ||
      process.env.EMAIL_PASSWORD ===
        "paste_your_16_character_app_password_here" ||
      process.env.EMAIL_PASSWORD === "your_app_password_will_go_here" ||
      process.env.EMAIL_PASSWORD === "NEED_REAL_GMAIL_APP_PASSWORD_HERE"
    ) {
      console.log("\n📧 CONTACT FORM EMAIL SIMULATION (Gmail not configured):");
      console.log("=".repeat(60));
      console.log(`From: ${name} <${email}>`);
      console.log(`To: dlms.sys.2025@gmail.com`);
      console.log(`Subject: [DLMS Contact] ${subject}`);
      console.log(`Priority: ${priority}`);
      console.log(`Message: ${message}`);
      console.log("=".repeat(60));

      return res.status(200).json({
        success: true,
        message: "Contact form submitted successfully! (Email simulation mode)",
        data: {
          name,
          email,
          subject,
          message,
          priority,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Email content for DLMS admin
    const adminMailOptions = {
      from: `"DLMS Contact Form" <${
        process.env.EMAIL_USER || "dlms.sys.2025@gmail.com"
      }>`,
      to: "dlms.sys.2025@gmail.com",
      subject: `[DLMS Contact] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DLMS Contact Form Submission</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; }
            .field-label { font-weight: bold; color: #555; margin-bottom: 5px; display: block; }
            .field-value { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
            .priority { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .priority.low { background: #d4edda; color: #155724; }
            .priority.medium { background: #fff3cd; color: #856404; }
            .priority.high { background: #f8d7da; color: #721c24; }
            .priority.urgent { background: #f5c6cb; color: #721c24; animation: pulse 2s infinite; }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .message-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 DLMS Contact Form</h1>
              <p>New message received from website</p>
            </div>
            
            <div class="content">
              <div class="field">
                <span class="field-label">👤 Name:</span>
                <div class="field-value">${name}</div>
              </div>
              
              <div class="field">
                <span class="field-label">📧 Email:</span>
                <div class="field-value">${email}</div>
              </div>
              
              <div class="field">
                <span class="field-label">📋 Subject:</span>
                <div class="field-value">${subject}</div>
              </div>
              
              <div class="field">
                <span class="field-label">⚡ Priority:</span>
                <div class="field-value">
                  <span class="priority ${priority}">${priority.toUpperCase()}</span>
                </div>
              </div>
              
              <div class="field">
                <span class="field-label">💬 Message:</span>
                <div class="message-box">${message}</div>
              </div>
              
              <div class="field">
                <span class="field-label">🕒 Received:</span>
                <div class="field-value">${new Date().toLocaleString()}</div>
              </div>
            </div>
            
            <div class="footer">
              <p>This message was sent from the DLMS website contact form.</p>
              <p>Please respond to: <strong>${email}</strong></p>
              <p>&copy; 2024 Driving License Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        DLMS Contact Form Submission
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Priority: ${priority.toUpperCase()}
        
        Message:
        ${message}
        
        Received: ${new Date().toLocaleString()}
        
        Please respond to: ${email}
      `,
    };

    // Send email to admin
    const result = await transporter.sendMail(adminMailOptions);
    console.log("✅ Contact form email sent successfully:", result.messageId);

    // Send confirmation email to user
    const userMailOptions = {
      from: `"DLMS Support" <${
        process.env.EMAIL_USER || "dlms.sys.2025@gmail.com"
      }>`,
      to: email,
      subject: "Thank you for contacting DLMS - We received your message",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting DLMS</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .content { padding: 30px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .highlight { background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Thank You!</h1>
              <p>We received your message</p>
            </div>
            
            <div class="content">
              <p>Dear <strong>${name}</strong>,</p>
              
              <p>Thank you for contacting the Driving License Management System (DLMS). We have successfully received your message and our support team will review it shortly.</p>
              
              <div class="highlight">
                <h4>📋 Your Message Details:</h4>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Our support team will review your message within 2-4 hours</li>
                <li>You will receive a response at this email address: <strong>${email}</strong></li>
                <li>For urgent matters, you can also call us at +1 (555) 123-4567</li>
              </ul>
              
              <p>In the meantime, you can:</p>
              <ul>
                <li>Check our FAQ section for common questions</li>
                <li>Use our AI chat assistant on the website</li>
                <li>Browse our help documentation</li>
              </ul>
              
              <p>Thank you for using DLMS!</p>
              
              <p>Best regards,<br>
              <strong>DLMS Support Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This is an automated confirmation email.</p>
              <p>&copy; 2024 Driving License Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Dear ${name},
        
        Thank you for contacting the Driving License Management System (DLMS). 
        We have successfully received your message and our support team will review it shortly.
        
        Your Message Details:
        Subject: ${subject}
        Priority: ${priority.toUpperCase()}
        Submitted: ${new Date().toLocaleString()}
        
        What happens next?
        - Our support team will review your message within 2-4 hours
        - You will receive a response at: ${email}
        - For urgent matters, call us at +1 (555) 123-4567
        
        Thank you for using DLMS!
        
        Best regards,
        DLMS Support Team
      `,
    };

    // Send confirmation email to user
    await transporter.sendMail(userMailOptions);
    console.log("✅ Confirmation email sent to user:", email);

    res.status(200).json({
      success: true,
      message:
        "Contact form submitted successfully! You will receive a confirmation email shortly.",
      data: {
        name,
        email,
        subject,
        priority,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Contact form submission error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit contact form. Please try again later.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};
