import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testDebugRoute() {
  console.log('🧪 Testing Debug Route...\n');

  const testUserId = '6439afc04f1b2e6c9b6d3d34';

  try {
    console.log(`Testing debug route with userId: ${testUserId}`);
    
    const response = await axios.get(
      `${BASE_URL}/api/license/debug/user/${testUserId}`,
      { timeout: 10000 }
    );

    console.log('\n✅ Debug Route Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('\n❌ Debug Route Error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }
}

testDebugRoute();
