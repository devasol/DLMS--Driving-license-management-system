import mongoose from "mongoose";
import User from "./models/User.js";
import ExamSchedule from "./models/examSchedule.js";
import ExamResult from "./models/ExamResult.js";
import Payment from "./models/Payment.js";

async function setupDemoUserLicense() {
  try {
    console.log("🔧 Setting up demo user for license testing...\n");

    await mongoose.connect("mongodb://localhost:27017/dlms");
    console.log("✅ Connected to MongoDB");

    // Find the demo user
    const demoUser = await User.findOne({ email: "demouser@example.com" });
    if (!demoUser) {
      console.log(
        "❌ Demo user not found. Please run create-user-with-photo.js first"
      );
      return;
    }

    console.log("👤 Found demo user:", demoUser.fullName);
    console.log("🖼️ Profile picture:", demoUser.profilePicture);

    // Create theory exam schedule
    const theoryExam = new ExamSchedule({
      userId: demoUser._id,
      fullName: demoUser.fullName,
      examType: "theory",
      date: new Date(),
      time: "10:00",
      location: "Online",
      status: "approved",
    });
    await theoryExam.save();
    console.log("📝 Created theory exam schedule");

    // Create practical exam schedule
    const practicalExam = new ExamSchedule({
      userId: demoUser._id,
      fullName: demoUser.fullName,
      examType: "practical",
      date: new Date(),
      time: "14:00",
      location: "Kality, Addis Ababa",
      status: "approved",
    });
    await practicalExam.save();
    console.log("🚗 Created practical exam schedule");

    // Create theory exam result (passed)
    const theoryResult = new ExamResult({
      userId: demoUser._id.toString(),
      userName: demoUser.fullName,
      examScheduleId: theoryExam._id,
      examType: "theory",
      score: 92,
      totalQuestions: 50,
      correctAnswers: 46,
      passed: true,
      dateTaken: new Date(),
      language: "english",
    });
    await theoryResult.save();
    console.log("✅ Created theory exam result (PASSED - 92%)");

    // Create practical exam result (passed)
    const practicalResult = new ExamResult({
      userId: demoUser._id.toString(),
      userName: demoUser.fullName,
      examScheduleId: practicalExam._id,
      examType: "practical",
      score: 95,
      totalQuestions: 10,
      correctAnswers: 10,
      passed: true,
      dateTaken: new Date(),
    });
    await practicalResult.save();
    console.log("✅ Created practical exam result (PASSED - 95%)");

    // Create verified payment
    const payment = new Payment({
      userId: demoUser._id,
      userName: demoUser.fullName,
      userEmail: demoUser.email,
      amount: 500,
      currency: "ETB",
      paymentMethod: "bank_transfer",
      transactionId: "TXN_DEMO_" + Date.now(),
      receiptImage: "demo-receipt.pdf",
      paymentDate: new Date(),
      status: "verified",
      theoryExamId: theoryExam._id,
      practicalExamId: practicalExam._id,
      adminNotes: "Payment verified for demo user with photo",
      reviewedAt: new Date(),
      reviewedBy: demoUser._id,
    });
    await payment.save();
    console.log("💰 Created verified payment");

    console.log("\n🎉 Demo user setup complete!");
    console.log("\n📋 Summary:");
    console.log(`👤 User: ${demoUser.fullName} (${demoUser.email})`);
    console.log(`🖼️ Profile Picture: ${demoUser.profilePicture}`);
    console.log(
      `📅 Date of Birth: ${demoUser.dateOfBirth.toLocaleDateString()}`
    );
    console.log(`📍 Address: ${demoUser.address}`);
    console.log(`📝 Theory Exam: PASSED (92%)`);
    console.log(`🚗 Practical Exam: PASSED (95%)`);
    console.log(`💰 Payment: VERIFIED (${payment.amount} ${payment.currency})`);
    console.log(`🎫 Status: ELIGIBLE FOR LICENSE ISSUANCE`);

    console.log("\n🔧 Next steps:");
    console.log("1. Go to Admin Dashboard > License Management");
    console.log('2. Click on "Eligible Users" tab');
    console.log('3. Click "Issue License" for the demo user');
    console.log("4. Download the license to see the real photo and QR code!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error setting up demo user:", error.message);
  }
}

setupDemoUserLicense();
