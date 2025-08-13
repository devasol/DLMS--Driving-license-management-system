import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testLicenseSystem() {
  console.log('🧪 Testing Complete License Management System...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test 2: Check license eligibility for test user
    console.log('\n2. Testing license eligibility check...');
    const testUserId = '683ae1545d7ddd378e28228f'; // Test user ID
    
    try {
      const eligibilityResponse = await axios.get(`${BASE_URL}/api/payments/license/eligibility/${testUserId}`);
      console.log('✅ License eligibility check:', eligibilityResponse.data);
    } catch (error) {
      console.log('❌ License eligibility check failed:', error.response?.data || error.message);
    }

    // Test 3: Get all payments (for admin)
    console.log('\n3. Testing get all payments...');
    const paymentsResponse = await axios.get(`${BASE_URL}/api/payments/all`);
    console.log('✅ All payments:', {
      success: paymentsResponse.data.success,
      count: paymentsResponse.data.count,
      total: paymentsResponse.data.total
    });

    // Test 4: Get all licenses
    console.log('\n4. Testing get all licenses...');
    const licensesResponse = await axios.get(`${BASE_URL}/api/payments/licenses`);
    console.log('✅ All licenses:', {
      success: licensesResponse.data.success,
      count: licensesResponse.data.count,
      total: licensesResponse.data.total
    });

    // Test 5: Test license download (if license exists)
    if (licensesResponse.data.success && licensesResponse.data.licenses.length > 0) {
      console.log('\n5. Testing license download...');
      const firstLicense = licensesResponse.data.licenses[0];
      
      try {
        const downloadResponse = await axios.get(
          `${BASE_URL}/api/payments/license/download/${firstLicense.userId}`,
          { timeout: 10000 }
        );
        
        console.log('✅ License download successful - Content type:', downloadResponse.headers['content-type']);
        console.log('✅ License download size:', downloadResponse.data.length, 'characters');
      } catch (error) {
        console.log('❌ License download failed:', error.response?.data || error.message);
      }
    } else {
      console.log('\n5. ⚠️ No licenses found to test download');
    }

    console.log('\n🎉 License system tests completed!');

  } catch (error) {
    console.error('❌ Error testing license system:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLicenseSystem();
