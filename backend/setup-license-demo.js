import mongoose from "mongoose";
import User from "./models/User.js";
import ExamSchedule from "./models/examSchedule.js";
import ExamResult from "./models/ExamResult.js";
import Payment from "./models/Payment.js";
import License from "./models/License.js";

async function setupLicenseDemo() {
  try {
    console.log("🔧 Setting up license demo data...\n");

    await mongoose.connect("mongodb://localhost:27017/dlms");
    console.log("✅ Connected to MongoDB");

    // Get test user
    const testUser = await User.findOne({ email: "testuser@example.com" });
    if (!testUser) {
      console.log(
        "❌ Test user not found. Please run create-test-users.js first"
      );
      return;
    }

    console.log("👤 Found test user:", testUser.fullName);

    // Create theory exam schedule
    const theoryExam = new ExamSchedule({
      userId: testUser._id,
      fullName: testUser.fullName,
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
      userId: testUser._id,
      fullName: testUser.fullName,
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
      userId: testUser._id.toString(),
      userName: testUser.fullName,
      examScheduleId: theoryExam._id,
      examType: "theory",
      score: 88,
      totalQuestions: 50,
      correctAnswers: 44,
      passed: true,
      dateTaken: new Date(),
      language: "english",
    });
    await theoryResult.save();
    console.log("✅ Created theory exam result (PASSED - 88%)");

    // Create practical exam result (passed)
    const practicalResult = new ExamResult({
      userId: testUser._id.toString(),
      userName: testUser.fullName,
      examScheduleId: practicalExam._id,
      examType: "practical",
      score: 92,
      totalQuestions: 10, // Practical exam has fewer "questions" (maneuvers)
      correctAnswers: 9, // 9 out of 10 maneuvers passed
      passed: true,
      dateTaken: new Date(),
    });
    await practicalResult.save();
    console.log("✅ Created practical exam result (PASSED - 92%)");

    // Create verified payment
    const payment = new Payment({
      userId: testUser._id,
      userName: testUser.fullName,
      userEmail: testUser.email,
      amount: 500,
      currency: "ETB",
      paymentMethod: "bank_transfer",
      transactionId: "TXN" + Date.now(),
      receiptImage: "demo-receipt.pdf",
      paymentDate: new Date(),
      status: "verified",
      theoryExamId: theoryExam._id,
      practicalExamId: practicalExam._id,
      adminNotes: "Payment verified for demo",
      reviewedAt: new Date(),
      reviewedBy: testUser._id, // Using test user as admin for demo
    });
    await payment.save();
    console.log("💰 Created verified payment");

    console.log("\n🎉 Demo data setup complete!");
    console.log("\n📋 Summary:");
    console.log(`👤 User: ${testUser.fullName} (${testUser.email})`);
    console.log(`📝 Theory Exam: PASSED (88%)`);
    console.log(`🚗 Practical Exam: PASSED (92%)`);
    console.log(`💰 Payment: VERIFIED (${payment.amount} ${payment.currency})`);
    console.log(`🎫 Status: ELIGIBLE FOR LICENSE ISSUANCE`);

    console.log("\n🔧 Next steps:");
    console.log("1. Go to Admin Dashboard > License Management");
    console.log('2. Click on "Eligible Users" tab');
    console.log('3. Click "Issue License" for the test user');
    console.log("4. The license will be created and available for download");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error setting up demo:", error.message);
  }
}

setupLicenseDemo();
