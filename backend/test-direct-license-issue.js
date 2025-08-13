import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { issueLicense } from './controllers/paymentController.js';
import Payment from './models/Payment.js';
import ExamResult from './models/ExamResult.js';
import ExamSchedule from './models/examSchedule.js';
import License from './models/License.js';
import User from './models/User.js';

dotenv.config();

async function testDirectLicenseIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('🔗 Connected to MongoDB');
    
    console.log('🧪 Testing Direct License Issuance...\n');
    
    // Find a verified payment that doesn't have a license yet
    console.log('🔍 Looking for verified payment without license...');
    
    const verifiedPayments = await Payment.find({ status: "verified" })
      .populate("userId")
      .sort({ createdAt: -1 });
    
    console.log(`Found ${verifiedPayments.length} verified payments`);
    
    let testPayment = null;
    
    for (const payment of verifiedPayments) {
      // Check if license already exists for this user
      const existingLicense = await License.findOne({ userId: payment.userId._id });
      if (!existingLicense) {
        testPayment = payment;
        break;
      }
    }
    
    if (!testPayment) {
      console.log('⚠️ No verified payment without license found. Creating test scenario...');
      
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
      
      console.log('✅ Found eligible user:', userId);
      
      // Check if license already exists
      const existingLicense = await License.findOne({ userId });
      if (existingLicense) {
        console.log('⚠️ User already has license. Testing with existing verified payment...');
        testPayment = verifiedPayments[0];
      } else {
        // Create a test verified payment
        const user = await User.findById(userId);
        testPayment = new Payment({
          userId: userId,
          userName: user?.fullName || user?.full_name || 'Test User',
          amount: 500,
          currency: 'ETB',
          paymentMethod: 'bank_transfer',
          transactionId: 'TEST_DIRECT_' + Date.now(),
          paymentDate: new Date(),
          status: 'verified',
          reviewedBy: 'admin_test',
          reviewedAt: new Date(),
          theoryExamId: userWithTheory._id,
          practicalExamId: practicalResult?._id || practicalScheduleResult?._id
        });
        
        await testPayment.save();
        console.log('✅ Created test verified payment:', testPayment._id);
      }
    }
    
    console.log('\n🎫 Testing License Issuance with Payment:', testPayment._id);
    console.log('User:', testPayment.userName);
    
    // Mock request and response objects
    const mockReq = {
      params: { paymentId: testPayment._id },
      body: {
        adminId: 'admin_test_123',
        adminNotes: 'Test license issuance',
        licenseClass: 'B'
      }
    };
    
    let responseData = null;
    let statusCode = 200;
    
    const mockRes = {
      json: (data) => {
        responseData = data;
        console.log('\n📊 License Issuance Response:');
        console.log('Success:', data.success);
        console.log('Message:', data.message);
        
        if (data.success) {
          console.log('✅ License Number:', data.license?.number);
          console.log('✅ License Class:', data.license?.class);
          console.log('✅ Theory Score:', data.license?.theoryExamResult?.score);
          console.log('✅ Practical Score:', data.license?.practicalExamResult?.score);
        } else {
          console.log('❌ Error Details:', data.details);
        }
        
        return mockRes;
      },
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = { ...data, statusCode: code };
            console.log('\n❌ License Issuance Error:');
            console.log('Status Code:', code);
            console.log('Success:', data.success);
            console.log('Message:', data.message);
            
            if (data.details) {
              console.log('📊 Error Details:');
              console.log('   Theory Found:', data.details.theoryFound);
              console.log('   Practical Found:', data.details.practicalFound);
              console.log('   Practical in ExamResult:', data.details.practicalInExamResult);
              console.log('   Practical in ExamSchedule:', data.details.practicalInExamSchedule);
            }
            
            return mockRes;
          }
        };
      }
    };
    
    // Call the issueLicense function directly
    console.log('\n🚀 Calling issueLicense function...');
    await issueLicense(mockReq, mockRes);
    
    // Analyze the result
    console.log('\n📊 ANALYSIS:');
    if (responseData?.success) {
      console.log('🎉 SUCCESS! License issued successfully!');
      console.log('✅ The fix is working correctly');
      console.log('✅ Admin can now issue licenses without errors');
    } else if (responseData?.statusCode === 400 && responseData?.message?.includes('exam results')) {
      console.log('❌ STILL FAILING! The old error is still occurring');
      console.log('❌ This means the fix is not being applied correctly');
      console.log('🔧 Need to investigate further...');
    } else if (responseData?.message?.includes('already issued')) {
      console.log('⚠️ License already issued - this is expected');
      console.log('✅ The fix is working (no exam validation error)');
    } else {
      console.log('⚠️ Different error occurred:', responseData?.message);
    }
    
    // Clean up test payment if we created one
    if (testPayment.transactionId?.startsWith('TEST_DIRECT_')) {
      await Payment.findByIdAndDelete(testPayment._id);
      console.log('🧹 Cleaned up test payment');
    }
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    mongoose.disconnect();
  }
}

testDirectLicenseIssue();
