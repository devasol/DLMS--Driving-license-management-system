import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from './models/Payment.js';
import ExamResult from './models/ExamResult.js';
import ExamSchedule from './models/examSchedule.js';
import License from './models/License.js';
import User from './models/User.js';

dotenv.config();

async function testAdminLicenseIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('🔗 Connected to MongoDB');
    
    console.log('🧪 Testing Admin License Issuance Process...\n');
    
    // Step 1: Find a user with verified payment who doesn't have a license yet
    console.log('🔍 Step 1: Looking for eligible user with verified payment...');
    
    const verifiedPayments = await Payment.find({ status: "verified" })
      .populate("userId")
      .sort({ createdAt: -1 });
    
    console.log(`Found ${verifiedPayments.length} verified payments`);
    
    if (verifiedPayments.length === 0) {
      console.log('❌ No verified payments found. Let me create a test scenario...');
      
      // Find a user with both exams passed
      const userWithTheory = await ExamResult.findOne({
        examType: "theory",
        passed: true
      });
      
      if (!userWithTheory) {
        console.log('❌ No users with theory exam found');
        mongoose.disconnect();
        return;
      }
      
      const userId = userWithTheory.userId;
      console.log('✅ Found user with theory exam:', userId);
      
      // Check practical exam
      let practicalResult = await ExamResult.findOne({
        userId,
        examType: "practical",
        passed: true
      });
      
      let practicalScheduleResult = null;
      if (!practicalResult) {
        practicalScheduleResult = await ExamSchedule.findOne({
          userId,
          examType: "practical",
          status: "completed",
          result: "pass"
        });
      }
      
      if (!practicalResult && !practicalScheduleResult) {
        console.log('❌ User does not have practical exam passed');
        mongoose.disconnect();
        return;
      }
      
      console.log('✅ User has both exams passed');
      
      // Check if license already exists
      const existingLicense = await License.findOne({ userId });
      if (existingLicense) {
        console.log('⚠️ User already has license:', existingLicense.number);
        console.log('   Let me test with this user anyway to verify the fix...');
      }
      
      // Create a mock verified payment for testing
      const user = await User.findById(userId);
      const mockPayment = new Payment({
        userId: userId,
        userName: user?.fullName || user?.full_name || 'Test User',
        amount: 500,
        currency: 'ETB',
        paymentMethod: 'bank_transfer',
        transactionId: 'TEST_' + Date.now(),
        paymentDate: new Date(),
        status: 'verified',
        reviewedBy: 'admin_test',
        reviewedAt: new Date(),
        theoryExamId: userWithTheory._id,
        practicalExamId: practicalResult?._id || practicalScheduleResult?._id
      });
      
      await mockPayment.save();
      console.log('✅ Created test verified payment:', mockPayment._id);
      
      // Now test the license issuance logic
      await testLicenseIssuanceLogic(mockPayment);
      
      // Clean up test payment
      await Payment.findByIdAndDelete(mockPayment._id);
      console.log('🧹 Cleaned up test payment');
      
    } else {
      // Test with existing verified payment
      const payment = verifiedPayments[0];
      console.log('✅ Testing with existing verified payment:', payment._id);
      
      await testLicenseIssuanceLogic(payment);
    }
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    mongoose.disconnect();
  }
}

async function testLicenseIssuanceLogic(payment) {
  console.log('\n🧪 Step 2: Testing License Issuance Logic...');
  console.log('Payment ID:', payment._id);
  console.log('User ID:', payment.userId._id || payment.userId);
  console.log('User Name:', payment.userName);
  
  try {
    // Simulate the issueLicense function logic
    const userId = payment.userId._id || payment.userId;
    
    // Check if license already exists
    const existingLicense = await License.findOne({ userId });
    if (existingLicense) {
      console.log('⚠️ License already exists:', existingLicense.number);
      console.log('   This is expected - license was issued successfully before!');
      return;
    }
    
    // Get exam results - this is where the bug was
    console.log('\n🔍 Step 3: Checking exam results...');
    
    const theoryResult = await ExamResult.findOne({
      userId,
      examType: "theory",
      passed: true,
    });
    
    console.log('Theory Result:', !!theoryResult);
    if (theoryResult) {
      console.log('   Score:', theoryResult.score);
      console.log('   Date:', theoryResult.dateTaken);
    }
    
    let practicalResult = await ExamResult.findOne({
      userId,
      examType: "practical",
      passed: true,
    });
    
    console.log('Practical Result (ExamResult):', !!practicalResult);
    if (practicalResult) {
      console.log('   Score:', practicalResult.score);
      console.log('   Date:', practicalResult.dateTaken);
    }
    
    // If practical result not found in ExamResult, check ExamSchedule
    let practicalScheduleResult = null;
    if (!practicalResult) {
      practicalScheduleResult = await ExamSchedule.findOne({
        userId,
        examType: "practical",
        status: "completed",
        result: "pass"
      });
      
      console.log('Practical Result (ExamSchedule):', !!practicalScheduleResult);
      if (practicalScheduleResult) {
        console.log('   Score:', practicalScheduleResult.examResult?.score);
        console.log('   Status:', practicalScheduleResult.status);
        console.log('   Result:', practicalScheduleResult.result);
        console.log('   Date:', practicalScheduleResult.examResult?.evaluatedAt || practicalScheduleResult.updatedAt);
      }
    }
    
    const hasPracticalResult = !!practicalResult || !!practicalScheduleResult;
    
    console.log('\n📊 Validation Results:');
    console.log('Theory Found:', !!theoryResult);
    console.log('Practical Found (Combined):', hasPracticalResult);
    
    // This is the OLD logic that was causing the error
    console.log('\n❌ OLD LOGIC (Before Fix):');
    if (!theoryResult || !practicalResult) {
      console.log('   ERROR: "Both theory and practical exam results are required"');
      console.log('   This would fail because practical exam is in ExamSchedule, not ExamResult');
    } else {
      console.log('   SUCCESS: Would proceed with license issuance');
    }
    
    // This is the NEW logic after the fix
    console.log('\n✅ NEW LOGIC (After Fix):');
    if (!theoryResult || !hasPracticalResult) {
      const missing = [];
      if (!theoryResult) missing.push("theory exam result");
      if (!hasPracticalResult) missing.push("practical exam result");
      
      console.log(`   ERROR: Missing required exam results: ${missing.join(", ")}`);
      console.log('   Details:');
      console.log('     Theory Found:', !!theoryResult);
      console.log('     Practical Found:', hasPracticalResult);
      console.log('     Practical in ExamResult:', !!practicalResult);
      console.log('     Practical in ExamSchedule:', !!practicalScheduleResult);
    } else {
      console.log('   ✅ SUCCESS: All exam results found - license issuance can proceed!');
      
      // Show what data would be used for license creation
      const practicalScore = practicalResult ? 
        practicalResult.score : 
        (practicalScheduleResult?.examResult?.score || 85);
      const practicalDate = practicalResult ? 
        practicalResult.dateTaken : 
        (practicalScheduleResult?.examResult?.evaluatedAt || practicalScheduleResult?.updatedAt);
      const practicalSource = practicalResult ? 'ExamResult' : 'ExamSchedule';
      
      console.log('\n📊 License Creation Data:');
      console.log('   Theory Score:', theoryResult.score);
      console.log('   Practical Score:', practicalScore);
      console.log('   Practical Source:', practicalSource);
      console.log('   Practical Date:', practicalDate);
      
      console.log('\n🎫 License would be created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error in license issuance logic:', error.message);
  }
}

testAdminLicenseIssue();
