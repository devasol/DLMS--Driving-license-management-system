import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExamSchedule from './models/examSchedule.js';
import ExamResult from './models/ExamResult.js';
import User from './models/User.js';

dotenv.config();

async function debugPracticalExamIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('🔗 Connected to MongoDB');
    
    console.log('🔍 Looking for user with 86% practical exam score...\n');
    
    // Check ExamSchedule for practical exam with 86% score
    const practicalSchedule = await ExamSchedule.findOne({
      examType: 'practical',
      'examResult.score': 86
    });
    
    if (practicalSchedule) {
      console.log('📋 Found practical exam in ExamSchedule:');
      console.log('   User ID:', practicalSchedule.userId.toString());
      console.log('   Full Name:', practicalSchedule.fullName);
      console.log('   Status:', practicalSchedule.status);
      console.log('   Result:', practicalSchedule.result);
      console.log('   Score:', practicalSchedule.examResult?.score);
      console.log('   Date:', practicalSchedule.date);
      console.log('   Location:', practicalSchedule.location);
      
      const userId = practicalSchedule.userId.toString();
      
      // Check if this user also has data in ExamResult
      const examResult = await ExamResult.findOne({
        userId: practicalSchedule.userId,
        examType: 'practical'
      });
      
      console.log('\n📊 ExamResult collection check:');
      if (examResult) {
        console.log('✅ Found in ExamResult:');
        console.log('   Score:', examResult.score);
        console.log('   Passed:', examResult.passed);
        console.log('   Date Taken:', examResult.dateTaken);
      } else {
        console.log('❌ NOT found in ExamResult collection');
        console.log('   This might be the issue - practical exam only in ExamSchedule');
      }
      
      // Check theory exam for the same user
      console.log('\n📚 Checking theory exam for same user...');
      const theoryResult = await ExamResult.findOne({
        userId: practicalSchedule.userId,
        examType: 'theory'
      });
      
      if (theoryResult) {
        console.log('✅ Theory exam found in ExamResult:');
        console.log('   Score:', theoryResult.score);
        console.log('   Passed:', theoryResult.passed);
      } else {
        console.log('❌ Theory exam not found in ExamResult');
      }
      
      // Test the license eligibility for this user
      console.log('\n🧪 Testing license eligibility for this user...');
      
      try {
        const axios = (await import('axios')).default;
        const response = await axios.get(`http://localhost:5004/api/payments/license/eligibility/${userId}`);
        
        console.log('📊 License Eligibility API Response:');
        console.log('   Success:', response.data.success);
        console.log('   Status:', response.data.status);
        console.log('   Theory Passed:', response.data.requirements?.theoryPassed);
        console.log('   Practical Passed:', response.data.requirements?.practicalPassed);
        
        if (response.data.requirements?.practicalResult) {
          console.log('   Practical Result Found:');
          console.log('     Score:', response.data.requirements.practicalResult.score);
          console.log('     Passed:', response.data.requirements.practicalResult.passed);
        } else {
          console.log('   ❌ No practical result in API response');
        }
        
      } catch (apiError) {
        console.log('❌ API Error:', apiError.message);
      }
      
    } else {
      console.log('❌ No practical exam found with 86% score');
      
      // Look for any practical exams
      const anyPractical = await ExamSchedule.find({ examType: 'practical' }).limit(5);
      console.log('\n📋 Found practical exams:', anyPractical.length);
      anyPractical.forEach((exam, index) => {
        console.log(`   ${index + 1}. User: ${exam.fullName}, Score: ${exam.examResult?.score || 'N/A'}, Status: ${exam.status}, Result: ${exam.result || 'N/A'}`);
      });
    }
    
    // Check if there are any practical exams with results but not in ExamResult collection
    console.log('\n🔍 Checking for practical exams with results not in ExamResult...');
    const practicalWithResults = await ExamSchedule.find({
      examType: 'practical',
      'examResult.score': { $exists: true }
    });
    
    console.log(`Found ${practicalWithResults.length} practical exams with results in ExamSchedule`);
    
    for (const exam of practicalWithResults) {
      const existsInExamResult = await ExamResult.findOne({
        userId: exam.userId,
        examType: 'practical'
      });
      
      if (!existsInExamResult) {
        console.log(`❌ Missing in ExamResult: ${exam.fullName} (${exam.userId}) - Score: ${exam.examResult.score}`);
      }
    }
    
    mongoose.disconnect();
    console.log('\n✅ Debug complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

debugPracticalExamIssue();
