import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import License from "../models/License.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dlms");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const createTestUsers = async () => {
  const testUsers = [
    {
      fullName: "John Smith",
      full_name: "John Smith",
      email: "john.smith@example.com",
      user_email: "john.smith@example.com",
      password: "password123",
      user_password: "password123",
      user_name: "johnsmith",
      contact_no: "0711234567",
      phone: "0711234567",
      gender: "male",
      nic: "123456789V",
      role: "user",
      isAdmin: false,
    },
    {
      fullName: "Sarah Johnson",
      full_name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      user_email: "sarah.johnson@example.com",
      password: "password123",
      user_password: "password123",
      user_name: "sarahjohnson",
      contact_no: "0712345678",
      phone: "0712345678",
      gender: "female",
      nic: "987654321V",
      role: "user",
      isAdmin: false,
    },
    {
      fullName: "Michael Brown",
      full_name: "Michael Brown",
      email: "michael.brown@example.com",
      user_email: "michael.brown@example.com",
      password: "password123",
      user_password: "password123",
      user_name: "michaelbrown",
      contact_no: "0713456789",
      phone: "0713456789",
      gender: "male",
      nic: "456789123V",
      role: "user",
      isAdmin: false,
    },
    {
      fullName: "Emily Davis",
      full_name: "Emily Davis",
      email: "emily.davis@example.com",
      user_email: "emily.davis@example.com",
      password: "password123",
      user_password: "password123",
      user_name: "emilydavis",
      contact_no: "0714567890",
      phone: "0714567890",
      gender: "female",
      nic: "789123456V",
      role: "user",
      isAdmin: false,
    },
    {
      fullName: "David Wilson",
      full_name: "David Wilson",
      email: "david.wilson@example.com",
      user_email: "david.wilson@example.com",
      password: "password123",
      user_password: "password123",
      user_name: "davidwilson",
      contact_no: "0715678901",
      phone: "0715678901",
      gender: "male",
      nic: "321654987V",
      role: "user",
      isAdmin: false,
    }
  ];

  const createdUsers = [];

  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { user_email: userData.email }
        ]
      });

      if (existingUser) {
        console.log(`👤 User ${userData.fullName} already exists`);
        createdUsers.push(existingUser);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
      userData.user_password = hashedPassword;

      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${userData.fullName}`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.fullName}:`, error.message);
    }
  }

  return createdUsers;
};

const createTestLicenses = async (users) => {
  const currentDate = new Date();
  
  const testLicenses = [
    {
      user: users[0], // John Smith
      status: "Expired",
      issueDate: new Date(2018, 5, 15), // June 15, 2018
      expiryDate: new Date(2023, 5, 15), // June 15, 2023 (expired)
      class: "B",
    },
    {
      user: users[1], // Sarah Johnson
      status: "Expired",
      issueDate: new Date(2017, 8, 20), // September 20, 2017
      expiryDate: new Date(2022, 8, 20), // September 20, 2022 (expired)
      class: "B",
    },
    {
      user: users[2], // Michael Brown
      status: "Valid",
      issueDate: new Date(2022, 2, 10), // March 10, 2022
      expiryDate: new Date(2025, 1, 28), // February 28, 2025 (expiring soon)
      class: "A",
    },
    {
      user: users[3], // Emily Davis
      status: "Expired",
      issueDate: new Date(2016, 11, 5), // December 5, 2016
      expiryDate: new Date(2021, 11, 5), // December 5, 2021 (expired)
      class: "B",
    },
    {
      user: users[4], // David Wilson
      status: "Valid",
      issueDate: new Date(2020, 3, 12), // April 12, 2020
      expiryDate: new Date(2025, 3, 12), // April 12, 2025 (valid)
      class: "C",
    }
  ];

  for (const licenseData of testLicenses) {
    try {
      // Check if license already exists for this user
      const existingLicense = await License.findOne({ userId: licenseData.user._id });

      if (existingLicense) {
        console.log(`🎫 License for ${licenseData.user.fullName} already exists`);
        continue;
      }

      // Create mock exam and payment IDs (you might need to adjust these based on your actual data)
      const mockExamId = new mongoose.Types.ObjectId();
      const mockPaymentId = new mongoose.Types.ObjectId();
      const mockAdminId = new mongoose.Types.ObjectId();

      const license = new License({
        userId: licenseData.user._id,
        userName: licenseData.user.fullName,
        userEmail: licenseData.user.email,
        class: licenseData.class,
        issueDate: licenseData.issueDate,
        expiryDate: licenseData.expiryDate,
        status: licenseData.status,
        restrictions: "None",
        points: Math.floor(Math.random() * 5), // Random points 0-4
        maxPoints: 12,
        theoryExamResult: {
          examId: mockExamId,
          score: 85 + Math.floor(Math.random() * 15), // Score between 85-99
          dateTaken: new Date(licenseData.issueDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days before issue
        },
        practicalExamResult: {
          examId: mockExamId,
          score: 80 + Math.floor(Math.random() * 20), // Score between 80-99
          dateTaken: new Date(licenseData.issueDate.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days before issue
        },
        paymentId: mockPaymentId,
        issuedBy: mockAdminId,
      });

      await license.save();
      console.log(`✅ Created ${licenseData.status} license for: ${licenseData.user.fullName} (Expires: ${licenseData.expiryDate.toDateString()})`);
    } catch (error) {
      console.error(`❌ Error creating license for ${licenseData.user.fullName}:`, error.message);
    }
  }
};

const addTestData = async () => {
  try {
    console.log("🚀 Starting to add test data for license renewal...");
    
    await connectDB();
    
    console.log("\n📝 Creating test users...");
    const users = await createTestUsers();
    
    console.log("\n🎫 Creating test licenses...");
    await createTestLicenses(users);
    
    console.log("\n✅ Test data creation completed!");
    console.log("\n📊 Summary:");
    console.log("- Created users with various license statuses");
    console.log("- Added expired licenses for renewal testing");
    console.log("- Added valid licenses expiring soon");
    console.log("- All test users have password: 'password123'");
    
    console.log("\n👥 Test Users Created:");
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email})`);
    });
    
    console.log("\n🔐 Login Credentials:");
    console.log("Email: john.smith@example.com | Password: password123 (Expired License)");
    console.log("Email: sarah.johnson@example.com | Password: password123 (Expired License)");
    console.log("Email: emily.davis@example.com | Password: password123 (Expired License)");
    console.log("Email: michael.brown@example.com | Password: password123 (Valid License)");
    console.log("Email: david.wilson@example.com | Password: password123 (Valid License)");
    
  } catch (error) {
    console.error("❌ Error adding test data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the script
addTestData();
