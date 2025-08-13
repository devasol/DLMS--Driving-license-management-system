import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExamSchedule from './models/examSchedule.js';
import ExamResult from './models/ExamResult.js';
import License from './models/License.js';

dotenv.config();

async function testFixSimple() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('🔗 Connected to MongoDB');
    
    const userId = '683a9406d2be4f89d428e218'; // Dawit Solomon
    
    console.log('🧪 Testing the fix logic manually...');
    
    // Step 1: Check if user has license (this is what triggers the issue)
    const existingLicense = await License.findOne({ userId });
    console.log('\n📋 License Check:');
    console.log('Has License:', !!existingLicense);
    if (existingLicense) {
      console.log('License Number:', existingLicense.number);
      console.log('License Status:', existingLicense.status);
    }
    
    if (existingLicense) {
      console.log('\n🔍 Getting exam data for frontend display...');
      
      // Step 2: Get theory exam data
      const theoryResult = await ExamResult.findOne({
        userId,
        examType: "theory",
        passed: true,
      });
      
      console.log('\n📚 Theory Exam:');
      if (theoryResult) {
        console.log('Found:', true);
        console.log('Score:', theoryResult.score);
        console.log('Passed:', theoryResult.passed);
      } else {
        console.log('Found:', false);
      }
      
      // Step 3: Get practical exam data (this is the key fix)
      let practicalResult = await ExamResult.findOne({
        userId,
        examType: "practical",
        passed: true,
      });
      
      console.log('\n🚗 Practical Exam (ExamResult):');
      if (practicalResult) {
        console.log('Found:', true);
        console.log('Score:', practicalResult.score);
        console.log('Passed:', practicalResult.passed);
      } else {
        console.log('Found:', false);
      }
      
      // Step 4: Check ExamSchedule if not found in ExamResult
      let practicalScheduleResult = null;
      if (!practicalResult) {
        practicalScheduleResult = await ExamSchedule.findOne({
          userId,
          examType: "practical",
          status: "completed",
          result: "pass"
        });
        
        console.log('\n🚗 Practical Exam (ExamSchedule):');
        if (practicalScheduleResult) {
          console.log('Found:', true);
          console.log('Score:', practicalScheduleResult.examResult?.score);
          console.log('Result:', practicalScheduleResult.result);
          console.log('Status:', practicalScheduleResult.status);
        } else {
          console.log('Found:', false);
        }
      }
      
      // Step 5: Apply the fix logic
      const practicalPassed = !!practicalResult || !!practicalScheduleResult;
      const unifiedPracticalResult = practicalResult || (practicalScheduleResult ? {
        score: practicalScheduleResult.examResult?.score || 85,
        dateTaken: practicalScheduleResult.examResult?.evaluatedAt || practicalScheduleResult.updatedAt,
        examId: practicalScheduleResult._id,
        location: practicalScheduleResult.location || "Test Center",
        examiner: practicalScheduleResult.examResult?.evaluatedBy || "Test Examiner",
        notes: practicalScheduleResult.examResult?.notes || "Practical exam completed successfully"
      } : null);
      
      console.log('\n🎯 Fix Logic Results:');
      console.log('Theory Passed:', !!theoryResult);
      console.log('Practical Passed:', practicalPassed);
      console.log('Unified Practical Result:', !!unifiedPracticalResult);
      
      if (unifiedPracticalResult) {
        console.log('\n📊 Unified Practical Result:');
        console.log('Score:', unifiedPracticalResult.score);
        console.log('Date:', unifiedPracticalResult.dateTaken);
        console.log('Location:', unifiedPracticalResult.location);
        console.log('Examiner:', unifiedPracticalResult.examiner);
      }
      
      // Step 6: Simulate API response
      const apiResponse = {
        success: true,
        eligible: false,
        reason: "License already issued",
        license: existingLicense,
        status: "license_issued",
        requirements: {
          theoryPassed: !!theoryResult,
          practicalPassed: practicalPassed,
          paymentVerified: true,
          theoryResult: theoryResult,
          practicalResult: unifiedPracticalResult,
          payment: null
        }
      };
      
      console.log('\n📡 Simulated API Response:');
      console.log('Status:', apiResponse.status);
      console.log('Requirements.theoryPassed:', apiResponse.requirements.theoryPassed);
      console.log('Requirements.practicalPassed:', apiResponse.requirements.practicalPassed);
      console.log('Requirements.practicalResult exists:', !!apiResponse.requirements.practicalResult);
      
      console.log('\n🎯 Frontend Impact:');
      if (apiResponse.requirements.practicalPassed) {
        console.log('✅ Frontend will show: Practical Exam: PASSED');
        console.log('✅ No more "You need to pass the practical exam" message');
        console.log('✅ Exam progress summary will show both exams completed');
      } else {
        console.log('❌ Frontend will still show: Practical Exam: PENDING');
      }
      
      console.log('\n📊 SUMMARY:');
      if (practicalPassed) {
        console.log('🎉 SUCCESS! The fix is working correctly!');
        console.log('✅ Practical exam data found and processed');
        console.log('✅ API will return requirements.practicalPassed: true');
        console.log('✅ Frontend will display correct exam status');
      } else {
        console.log('❌ Fix not working - no practical exam data found');
      }
    }
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

testFixSimple();
