import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testLicenseEndpoint() {
  console.log('🧪 Testing License Status Endpoint Directly...\n');

  // Test user ID from the previous script
  const testUserId = '6439afc04f1b2e6c9b6d3d34';

  try {
    console.log(`Testing with userId: ${testUserId}`);
    
    const response = await axios.get(
      `${BASE_URL}/api/license/status?userId=${testUserId}`,
      { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Full API Response:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('\n❌ API Error:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Backend server is not running on port 5004');
    }
  }

  // Also test the debug endpoint
  try {
    console.log('\n🔍 Testing debug endpoint...');
    const debugResponse = await axios.get(
      `${BASE_URL}/api/license/debug/${testUserId}`,
      { timeout: 10000 }
    );
    
    console.log('Debug Response:', JSON.stringify(debugResponse.data, null, 2));
    
  } catch (error) {
    console.log('Debug endpoint error:', error.response?.data || error.message);
  }

  // Test with a different user ID format
  try {
    console.log('\n🔍 Testing with different user ID...');
    const altResponse = await axios.get(
      `${BASE_URL}/api/license/status?userId=507f1f77bcf86cd799439011`,
      { timeout: 10000 }
    );
    
    console.log('Alt Response:', JSON.stringify(altResponse.data, null, 2));
    
  } catch (error) {
    console.log('Alt test error:', error.response?.data || error.message);
  }
}

testLicenseEndpoint();
