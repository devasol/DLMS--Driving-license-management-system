import axios from 'axios';

async function testActualAPIResponse() {
  try {
    const userId = '683a9406d2be4f89d428e218'; // Dawit Solomon
    
    console.log('🧪 Testing actual API response for user:', userId);
    
    const response = await axios.get(`http://localhost:5004/api/payments/license/eligibility/${userId}`);
    
    console.log('\n📊 API Response:');
    console.log('Success:', response.data.success);
    console.log('Status:', response.data.status);
    console.log('Eligible:', response.data.eligible);
    console.log('Reason:', response.data.reason);
    
    if (response.data.requirements) {
      console.log('\n📋 Requirements:');
      console.log('Theory Passed:', response.data.requirements.theoryPassed);
      console.log('Practical Passed:', response.data.requirements.practicalPassed);
      console.log('Payment Verified:', response.data.requirements.paymentVerified);
      
      if (response.data.requirements.theoryResult) {
        console.log('\n📚 Theory Result:');
        console.log('Score:', response.data.requirements.theoryResult.score);
        console.log('Passed:', response.data.requirements.theoryResult.passed);
      }
      
      if (response.data.requirements.practicalResult) {
        console.log('\n🚗 Practical Result:');
        console.log('Score:', response.data.requirements.practicalResult.score);
        console.log('Date:', response.data.requirements.practicalResult.dateTaken);
        console.log('Location:', response.data.requirements.practicalResult.location);
        console.log('Examiner:', response.data.requirements.practicalResult.examiner);
      } else {
        console.log('\n❌ No practical result in requirements');
      }
    }
    
    if (response.data.license) {
      console.log('\n🎫 License Info:');
      console.log('Number:', response.data.license.number);
      console.log('Class:', response.data.license.class);
      console.log('Status:', response.data.license.status);
    }
    
    console.log('\n🎯 Frontend Logic Test:');
    const practicalPassed = response.data.requirements?.practicalPassed || response.data.eligibility?.practicalPassed;
    console.log('Frontend will see practicalPassed as:', practicalPassed);
    
    if (practicalPassed) {
      console.log('✅ Frontend should show: Practical Exam: PASSED');
    } else {
      console.log('❌ Frontend will show: Practical Exam: PENDING');
    }
    
    // Test with a user who doesn't have a license
    console.log('\n\n🧪 Testing user without license...');
    const testUserId = '68316136a465d5a249fe1845'; // Demo user
    
    try {
      const noLicenseResponse = await axios.get(`http://localhost:5004/api/payments/license/eligibility/${testUserId}`);
      
      console.log('\n📊 No License User Response:');
      console.log('Status:', noLicenseResponse.data.status);
      console.log('Theory Passed:', noLicenseResponse.data.requirements?.theoryPassed);
      console.log('Practical Passed:', noLicenseResponse.data.requirements?.practicalPassed);
      
      if (noLicenseResponse.data.requirements?.practicalResult) {
        console.log('Practical Score:', noLicenseResponse.data.requirements.practicalResult.score);
      }
      
    } catch (error) {
      console.log('Error testing no license user:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testActualAPIResponse();
