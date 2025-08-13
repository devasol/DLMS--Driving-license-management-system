import axios from 'axios';

const testLicenseEligibility = async () => {
  console.log('🧪 Testing License Eligibility with Fixed Logic...\n');

  try {
    // Test 1: Check payment eligibility (should now recognize practical exam from ExamSchedule)
    console.log('1. Testing GET /api/payments/eligibility...');
    const eligibilityResponse = await axios.get('http://localhost:5004/api/payments/eligibility/68316136a465d5a249fe1845');
    console.log('✅ Eligibility Response:', {
      success: eligibilityResponse.data.success,
      theoryPassed: eligibilityResponse.data.eligibility?.theoryPassed,
      practicalPassed: eligibilityResponse.data.eligibility?.practicalPassed,
      canProceedToPayment: eligibilityResponse.data.eligibility?.canProceedToPayment
    });

    if (eligibilityResponse.data.eligibility?.practicalResult) {
      console.log('📝 Practical Exam Details:', {
        score: eligibilityResponse.data.eligibility.practicalResult.score,
        dateTaken: eligibilityResponse.data.eligibility.practicalResult.dateTaken,
        location: eligibilityResponse.data.eligibility.practicalResult.location,
        examiner: eligibilityResponse.data.eligibility.practicalResult.examiner
      });
    }

    // Test 2: Check license eligibility
    console.log('\n2. Testing GET /api/payments/license/eligibility...');
    const licenseEligibilityResponse = await axios.get('http://localhost:5004/api/payments/license/eligibility/68316136a465d5a249fe1845');
    console.log('✅ License Eligibility Response:', licenseEligibilityResponse.data);

    if (licenseEligibilityResponse.data.eligibilityStatus?.practicalResult) {
      console.log('📝 Practical Exam Details from License Check:', {
        score: licenseEligibilityResponse.data.eligibilityStatus.practicalResult.score,
        dateTaken: licenseEligibilityResponse.data.eligibilityStatus.practicalResult.dateTaken,
        location: licenseEligibilityResponse.data.eligibilityStatus.practicalResult.location,
        examiner: licenseEligibilityResponse.data.eligibilityStatus.practicalResult.examiner
      });
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    if (eligibilityResponse.data.eligibility?.practicalPassed) {
      console.log('🎉 SUCCESS! Practical exam is now properly recognized!');
      console.log('✅ Users who passed practical exam can now proceed to payment');
      console.log('✅ Payment eligibility check is working correctly');

      if (licenseEligibilityResponse.data.eligibilityStatus?.practicalPassed) {
        console.log('✅ License eligibility check is also working correctly');
        console.log('✅ No more "You need to pass the practical exam" error');
      } else {
        console.log('⚠️ License eligibility needs to be checked - response structure may be different');
      }
    } else {
      console.log('❌ Issue still exists - practical exam not recognized');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
  }
};

testLicenseEligibility();
