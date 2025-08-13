import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testLicenseEndpoint() {
  console.log('🧪 Testing License Endpoint...\n');

  try {
    // Test with demo user ID
    const demoUserId = '683aebf5ca508be044c69410';

    console.log('1. Testing license eligibility endpoint...');
    try {
      const eligibilityResponse = await axios.get(
        `${BASE_URL}/api/payments/license/eligibility/${demoUserId}`,
        { timeout: 10000 }
      );
      console.log('✅ Eligibility response:', eligibilityResponse.data);
    } catch (eligibilityError) {
      console.log('❌ Eligibility error:', eligibilityError.response?.data || eligibilityError.message);
    }

    console.log('\n2. Testing get user license endpoint...');
    try {
      const licenseResponse = await axios.get(
        `${BASE_URL}/api/payments/license/${demoUserId}`,
        { timeout: 10000 }
      );
      console.log('✅ License response:', licenseResponse.data);
    } catch (licenseError) {
      console.log('❌ License error:', licenseError.response?.data || licenseError.message);
    }

    console.log('\n3. Testing all licenses endpoint...');
    try {
      const allLicensesResponse = await axios.get(
        `${BASE_URL}/api/payments/licenses`,
        { timeout: 10000 }
      );
      console.log('✅ All licenses response:', {
        success: allLicensesResponse.data.success,
        count: allLicensesResponse.data.count,
        licenses: allLicensesResponse.data.licenses?.map(l => ({
          number: l.number,
          userName: l.userName,
          userId: l.userId._id || l.userId
        }))
      });
    } catch (allLicensesError) {
      console.log('❌ All licenses error:', allLicensesError.response?.data || allLicensesError.message);
    }

    console.log('\n4. Testing payment status endpoint...');
    try {
      const paymentResponse = await axios.get(
        `${BASE_URL}/api/payments/status/${demoUserId}`,
        { timeout: 10000 }
      );
      console.log('✅ Payment status response:', paymentResponse.data);
    } catch (paymentError) {
      console.log('❌ Payment status error:', paymentError.response?.data || paymentError.message);
    }

    console.log('\n🎉 License endpoint test completed!');

  } catch (error) {
    console.error('❌ Error testing license endpoint:', error.message);
  }
}

testLicenseEndpoint();
