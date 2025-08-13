import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import LicenseApplication from "../models/LicenseApplication.js";
import ExamSchedule from "../models/examSchedule.js";
import ExamResult from "../models/ExamResult.js";
import Payment from "../models/Payment.js";
import License from "../models/License.js";
import Notification from "../models/Notification.js";
import ActivityLogger from "../utils/activityLogger.js";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dlms";

async function createRealTestData() {
  try {
    console.log("🏗️ Creating real test data for history functionality...");
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find or create a test user
    let testUser = await User.findOne({ email: "testuser@example.com" });
    if (!testUser) {
      testUser = new User({
        fullName: "Test User",
        email: "testuser@example.com",
        password: "password123", // This should be hashed in real implementation
        role: "user",
        phone: "+251911234567",
        address: "Addis Ababa, Ethiopia",
        gender: "male",
        dateOfBirth: new Date("1995-05-15"),
      });
      await testUser.save();
      console.log("👤 Created test user");
    } else {
      console.log("👤 Using existing test user");
    }

    console.log(`🆔 Test User ID: ${testUser._id}`);

    // 1. Create License Application
    console.log("\n📄 Creating license application...");
    const licenseApp = new LicenseApplication({
      userId: testUser._id.toString(),
      firstName: "Test",
      lastName: "User",
      dateOfBirth: new Date("1995-05-15"),
      gender: "male",
      nationality: "Ethiopian",
      bloodGroup: "O+",
      phoneNumber: "+251911234567",
      email: "testuser@example.com",
      address: "Addis Ababa",
      city: "Addis Ababa",
      state: "Addis Ababa",
      postalCode: "1000",
      country: "Ethiopia",
      licenseType: "permanent",
      status: "approved",
      statusMessage: "Application approved after document verification",
      applicationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      lastUpdated: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      documents: [
        {
          path: "/uploads/test-id.jpg",
          description: "ID Proof",
          originalName: "id-card.jpg",
        },
      ],
    });
    await licenseApp.save();
    console.log("✅ License application created");

    // 2. Create Theory Exam Schedule
    console.log("\n📝 Creating theory exam schedule...");
    const theoryExam = new ExamSchedule({
      userId: testUser._id,
      fullName: testUser.fullName,
      examType: "theory",
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      time: "10:00",
      location: "Online",
      status: "completed",
      result: "pass",
      examResult: {
        score: 85,
        notes: "Good performance on traffic rules",
        evaluatedBy: "System",
        evaluatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
    });
    await theoryExam.save();
    console.log("✅ Theory exam schedule created");

    // 3. Create Theory Exam Result
    console.log("\n📊 Creating theory exam result...");
    const theoryResult = new ExamResult({
      userId: testUser._id.toString(),
      userName: testUser.fullName,
      examScheduleId: theoryExam._id,
      examType: "theory",
      score: 85,
      totalQuestions: 50,
      correctAnswers: 42,
      passed: true,
      dateTaken: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      language: "english",
    });
    await theoryResult.save();
    console.log("✅ Theory exam result created");

    // 4. Create Practical Exam Schedule
    console.log("\n🚗 Creating practical exam schedule...");
    const practicalExam = new ExamSchedule({
      userId: testUser._id,
      fullName: testUser.fullName,
      examType: "practical",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      time: "14:00",
      location: "Kality, Addis Ababa",
      status: "completed",
      result: "pass",
      examResult: {
        score: 78,
        notes: "Good driving skills, minor issues with parking",
        evaluatedBy: "Instructor Ahmed",
        evaluatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    });
    await practicalExam.save();
    console.log("✅ Practical exam schedule created");

    // 5. Create Practical Exam Result
    console.log("\n📊 Creating practical exam result...");
    const practicalResult = new ExamResult({
      userId: testUser._id.toString(),
      userName: testUser.fullName,
      examScheduleId: practicalExam._id,
      examType: "practical",
      score: 78,
      totalQuestions: 20,
      correctAnswers: 16,
      passed: true,
      dateTaken: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      language: "english",
    });
    await practicalResult.save();
    console.log("✅ Practical exam result created");

    // 6. Create Payment
    console.log("\n💳 Creating payment record...");
    const payment = new Payment({
      userId: testUser._id,
      userName: testUser.fullName,
      userEmail: testUser.email,
      amount: 500,
      currency: "ETB",
      paymentMethod: "bank_transfer",
      transactionId: "TXN_TEST_" + Date.now(),
      receiptImage: "/uploads/test-receipt.jpg",
      paymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      status: "verified",
      theoryExamId: theoryExam._id,
      practicalExamId: practicalExam._id,
      adminNotes: "Payment verified - bank transfer confirmed",
      reviewedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
    });
    await payment.save();
    console.log("✅ Payment record created");

    // 7. Create License
    console.log("\n🪪 Creating license...");
    const license = new License({
      userId: testUser._id,
      number: "DL" + Date.now().toString().slice(-8),
      userName: testUser.fullName,
      userEmail: testUser.email,
      class: "B",
      issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years from now
      status: "Valid",
      restrictions: "None",
      points: 0,
      violations: [],
    });
    await license.save();
    console.log("✅ License created");

    // 8. Create Notifications
    console.log("\n🔔 Creating notifications...");
    const notifications = [
      {
        userId: testUser._id,
        title: "Application Approved",
        message: "Your license application has been approved. You can now schedule your exams.",
        type: "success",
        seen: true,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser._id,
        title: "Theory Exam Scheduled",
        message: "Your theory exam has been scheduled for tomorrow at 10:00 AM.",
        type: "info",
        seen: true,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser._id,
        title: "Theory Exam Passed",
        message: "Congratulations! You passed your theory exam with a score of 85%.",
        type: "success",
        seen: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser._id,
        title: "Practical Exam Passed",
        message: "Congratulations! You passed your practical exam. Your license will be issued soon.",
        type: "success",
        seen: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser._id,
        title: "License Issued",
        message: "Your driving license has been issued successfully. You can download it from your dashboard.",
        type: "success",
        seen: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const notificationData of notifications) {
      const notification = new Notification(notificationData);
      await notification.save();
    }
    console.log("✅ Notifications created");

    // 9. Log some activities using ActivityLogger
    console.log("\n📝 Logging additional activities...");
    
    // Login activities
    await ActivityLogger.logLogin(testUser._id, { ipAddress: "192.168.1.100" });
    await ActivityLogger.logLogin(testUser._id, { ipAddress: "192.168.1.101" });
    
    // Profile update
    await ActivityLogger.logProfileUpdate(testUser._id, ["phone", "address"], {
      oldPhone: "+251911111111",
      newPhone: "+251911234567",
    });

    // Document upload
    await ActivityLogger.logDocumentUpload(testUser._id, "identity_card", "id-card.jpg", {
      fileSize: "2.5MB",
      uploadTime: new Date(),
    });

    console.log("✅ Additional activities logged");

    console.log("\n🎉 Real test data creation completed!");
    console.log(`👤 Test User: ${testUser.fullName} (${testUser.email})`);
    console.log(`🆔 User ID: ${testUser._id}`);
    console.log(`🪪 License Number: ${license.number}`);
    
    console.log("\n📊 Summary of created data:");
    console.log("  ✅ 1 License Application");
    console.log("  ✅ 2 Exam Schedules (Theory & Practical)");
    console.log("  ✅ 2 Exam Results");
    console.log("  ✅ 1 Payment Record");
    console.log("  ✅ 1 License");
    console.log("  ✅ 5 Notifications");
    console.log("  ✅ Additional logged activities");

    console.log("\n🔗 You can now test the history API with:");
    console.log(`   GET http://localhost:5004/api/user-activity/${testUser._id}/history`);

  } catch (error) {
    console.error("❌ Error creating real test data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
createRealTestData();
