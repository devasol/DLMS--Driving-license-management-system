import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { checkLicenseEligibility } from './controllers/paymentController.js';

dotenv.config();

async function testControllerDirect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('🔗 Connected to MongoDB');
    
    const userId = '683a9406d2be4f89d428e218'; // Dawit Solomon with license issued
    
    console.log('🧪 Testing checkLicenseEligibility controller directly...');
    console.log('User ID:', userId);
    
    // Mock request and response objects
    const mockReq = {
      params: { userId }
    };
    
    let responseData = null;
    const mockRes = {
      json: (data) => {
        responseData = data;
        return mockRes;
      },
      status: (code) => ({
        json: (data) => {
          responseData = { ...data, statusCode: code };
          return mockRes;
        }
      })
    };
    
    // Call the controller function
    await checkLicenseEligibility(mockReq, mockRes);
    
    console.log('\n📊 Controller Response:');
    console.log('Success:', responseData?.success);
    console.log('Status:', responseData?.status);
    console.log('Eligible:', responseData?.eligible);
    console.log('Reason:', responseData?.reason);
    
    if (responseData?.license) {
      console.log('\n🎫 License Info:');
      console.log('Number:', responseData.license.number);
      console.log('Class:', responseData.license.class);
      console.log('Status:', responseData.license.status);
    }
    
    if (responseData?.requirements) {
      console.log('\n📋 Requirements (NEW):');
      console.log('Theory Passed:', responseData.requirements.theoryPassed);
      console.log('Practical Passed:', responseData.requirements.practicalPassed);
      console.log('Payment Verified:', responseData.requirements.paymentVerified);
      
      if (responseData.requirements.theoryResult) {
        console.log('\n📚 Theory Result:');
        console.log('Score:', responseData.requirements.theoryResult.score);
        console.log('Passed:', responseData.requirements.theoryResult.passed);
      }
      
      if (responseData.requirements.practicalResult) {
        console.log('\n🚗 Practical Result:');
        console.log('Score:', responseData.requirements.practicalResult.score);
        console.log('Date:', responseData.requirements.practicalResult.dateTaken);
        console.log('Location:', responseData.requirements.practicalResult.location);
        console.log('Examiner:', responseData.requirements.practicalResult.examiner);
      }
    } else {
      console.log('\n❌ No requirements data in response');
    }
    
    console.log('\n🎯 Frontend Logic Test:');
    const practicalPassed = responseData?.requirements?.practicalPassed;
    const theoryPassed = responseData?.requirements?.theoryPassed;
    
    console.log('Frontend will see:');
    console.log('   theoryPassed:', theoryPassed);
    console.log('   practicalPassed:', practicalPassed);
    
    if (theoryPassed && practicalPassed) {
      console.log('✅ Frontend will show: Both exams PASSED');
      console.log('✅ No more "You need to pass the practical exam" message');
    } else if (theoryPassed) {
      console.log('⚠️ Frontend will show: Need practical exam');
    } else {
      console.log('❌ Frontend will show: Need theory exam');
    }
    
    // Test with user who doesn't have license
    console.log('\n\n🧪 Testing user without license...');
    const testUserId = '68316136a465d5a249fe1845'; // Demo user
    
    const mockReq2 = { params: { userId: testUserId } };
    let responseData2 = null;
    const mockRes2 = {
      json: (data) => {
        responseData2 = data;
        return mockRes2;
      },
      status: (code) => ({
        json: (data) => {
          responseData2 = { ...data, statusCode: code };
          return mockRes2;
        }
      })
    };
    
    await checkLicenseEligibility(mockReq2, mockRes2);
    
    console.log('\n📊 No License User Response:');
    console.log('Status:', responseData2?.status);
    console.log('Theory Passed:', responseData2?.requirements?.theoryPassed);
    console.log('Practical Passed:', responseData2?.requirements?.practicalPassed);
    
    console.log('\n📊 SUMMARY:');
    if (responseData?.requirements?.practicalPassed) {
      console.log('🎉 SUCCESS! Fix is working!');
      console.log('✅ License issued user now has requirements data');
      console.log('✅ Practical exam shows as passed');
      console.log('✅ Frontend will display correct status');
    } else {
      console.log('❌ Fix not working - practical still not passed');
    }
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

testControllerDirect();
