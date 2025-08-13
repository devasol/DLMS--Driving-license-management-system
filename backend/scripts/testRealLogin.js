import axios from "axios";

const BASE_URL = "http://localhost:5004";

async function testRealLogin() {
  console.log("🧪 Testing Real Login with Email Notification...\n");

  try {
    // Test admin login
    console.log("📧 Testing Admin Login...");
    const adminLoginData = {
      email: "admin@dlms.com",
      password: "admin123",
    };

    console.log("Attempting admin login with:", adminLoginData.email);

    const adminResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      adminLoginData
    );

    if (adminResponse.data.success) {
      console.log("✅ Admin login successful!");
      console.log("📧 Check the backend console for email notification logs");
      console.log("📧 Check the email inbox for:", adminLoginData.email);
    }
  } catch (adminError) {
    console.log(
      "⚠️ Admin login failed (this is expected if admin doesn't exist)"
    );
    console.log(
      "Error:",
      adminError.response?.data?.message || adminError.message
    );
  }

  console.log("\n" + "=".repeat(50) + "\n");

  try {
    // Test user login - you'll need to replace with actual user credentials
    console.log("📧 Testing User Login...");
    console.log(
      "⚠️ Note: Replace with actual user credentials from your database"
    );

    const userLoginData = {
      email: "user@example.com", // Replace with actual user email
      password: "password123", // Replace with actual user password
    };

    console.log("Attempting user login with:", userLoginData.email);

    const userResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      userLoginData
    );

    if (userResponse.data.success) {
      console.log("✅ User login successful!");
      console.log("📧 Check the backend console for email notification logs");
      console.log("📧 Check the email inbox for:", userLoginData.email);
    }
  } catch (userError) {
    console.log(
      "⚠️ User login failed (this is expected if user doesn't exist)"
    );
    console.log(
      "Error:",
      userError.response?.data?.message || userError.message
    );
  }

  console.log("\n📋 What to Check:");
  console.log("1. Backend console should show email notification logs");
  console.log("2. Look for messages like:");
  console.log(
    "   📧 Sending login notification email to admin: admin@dlms.com"
  );
  console.log("   ✅ Admin login notification email sent successfully");
  console.log("   📧 Email Message ID: <message-id>");
  console.log("");
  console.log("3. Check the email inbox for login notification emails");
  console.log("4. If emails are not being sent, check:");
  console.log("   - Gmail App Password is correct in .env file");
  console.log("   - Internet connection is working");
  console.log("   - Gmail SMTP settings are correct");
}

// Run the test
testRealLogin();
