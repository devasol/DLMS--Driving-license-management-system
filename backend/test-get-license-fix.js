import axios from 'axios';

const testGetLicenseFix = async () => {
  console.log('🧪 Testing Get License Page Fix...\n');

  try {
    const userId = '68316136a465d5a249fe1845'; // User with completed practical exam

    // Test 1: Check license eligibility API response structure
    console.log('1. Testing license eligibility API response...');
    const eligibilityResponse = await axios.get(`http://localhost:5004/api/payments/license/eligibility/${userId}`);
    
    console.log('✅ API Response Structure:');
    console.log('📊 Success:', eligibilityResponse.data.success);
    console.log('📊 Status:', eligibilityResponse.data.status);
    console.log('📊 Requirements:');
    console.log('   - Theory Passed:', eligibilityResponse.data.requirements?.theoryPassed);
    console.log('   - Practical Passed:', eligibilityResponse.data.requirements?.practicalPassed);
    console.log('   - Payment Verified:', eligibilityResponse.data.requirements?.paymentVerified);

    // Test 2: Check practical exam details
    if (eligibilityResponse.data.requirements?.practicalResult) {
      console.log('\n📝 Practical Exam Details:');
      const practicalResult = eligibilityResponse.data.requirements.practicalResult;
      console.log('   - Score:', practicalResult.score + '%');
      console.log('   - Date:', practicalResult.dateTaken);
      console.log('   - Passed:', practicalResult.passed);
      console.log('   - Exam Type:', practicalResult.examType);
    }

    // Test 3: Check theory exam details
    if (eligibilityResponse.data.requirements?.theoryResult) {
      console.log('\n📝 Theory Exam Details:');
      const theoryResult = eligibilityResponse.data.requirements.theoryResult;
      console.log('   - Score:', theoryResult.score + '%');
      console.log('   - Date:', theoryResult.dateTaken);
      console.log('   - Passed:', theoryResult.passed);
      console.log('   - Exam Type:', theoryResult.examType);
    }

    // Test 4: Simulate frontend logic
    console.log('\n🎯 Frontend Logic Simulation:');
    const { theoryPassed, practicalPassed } = eligibilityResponse.data.requirements || {};
    
    console.log('Frontend will see:');
    console.log('   - eligibility.requirements.theoryPassed:', theoryPassed);
    console.log('   - eligibility.requirements.practicalPassed:', practicalPassed);
    
    if (theoryPassed && practicalPassed) {
      console.log('✅ RESULT: User will see "Ready for Payment" step');
      console.log('✅ RESULT: No more "You need to pass the practical exam" message');
    } else if (theoryPassed) {
      console.log('⚠️ RESULT: User will see "Need practical exam" step');
    } else {
      console.log('❌ RESULT: User will see "Need theory exam" step');
    }

    // Test 5: Check payment eligibility
    console.log('\n💳 Testing payment eligibility...');
    const paymentEligibilityResponse = await axios.get(`http://localhost:5004/api/payments/eligibility/${userId}`);
    
    console.log('Payment Eligibility:');
    console.log('   - Can Proceed to Payment:', paymentEligibilityResponse.data.eligibility?.canProceedToPayment);
    console.log('   - Theory Passed:', paymentEligibilityResponse.data.eligibility?.theoryPassed);
    console.log('   - Practical Passed:', paymentEligibilityResponse.data.eligibility?.practicalPassed);

    // Summary
    console.log('\n📊 SUMMARY:');
    if (theoryPassed && practicalPassed) {
      console.log('🎉 SUCCESS! Get License page will now work correctly!');
      console.log('✅ Practical exam is properly recognized');
      console.log('✅ User can proceed to payment step');
      console.log('✅ No more blocking error messages');
    } else {
      console.log('❌ Issue still exists - exams not properly recognized');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
  }
};

testGetLicenseFix();
