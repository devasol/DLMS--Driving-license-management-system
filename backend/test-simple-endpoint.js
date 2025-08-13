import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testSimpleEndpoint() {
  console.log('🧪 Testing Simple Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test 2: Get all licenses
    console.log('\n2. Testing get all licenses...');
    const licensesResponse = await axios.get(`${BASE_URL}/api/payments/licenses`);
    console.log('✅ Licenses response:', {
      success: licensesResponse.data.success,
      count: licensesResponse.data.count
    });

    // Test 3: Test the new route exists
    console.log('\n3. Testing new license issuance route (should fail with 400 for invalid payment ID)...');
    try {
      const testResponse = await axios.post(`${BASE_URL}/api/payments/license/issue/invalid-id`, {
        adminId: 'test',
        adminNotes: 'test'
      });
      console.log('Response:', testResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Route not found - server needs restart');
      } else if (error.response?.status === 400 || error.response?.status === 500) {
        console.log('✅ Route exists but failed as expected:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Simple endpoint tests completed!');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSimpleEndpoint();
