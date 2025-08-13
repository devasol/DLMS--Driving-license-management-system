import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testNewRoute() {
  console.log('🧪 Testing New License Status Route...\n');

  const testUserId = '6439afc04f1b2e6c9b6d3d34';

  try {
    console.log(`Testing new route with userId: ${testUserId}`);
    
    const response = await axios.get(
      `${BASE_URL}/api/license/status-new?userId=${testUserId}`,
      { timeout: 10000 }
    );

    console.log('\n✅ New Route Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('\n❌ New Route Error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }

  // Also test the original route
  try {
    console.log('\n🔍 Testing original route for comparison...');
    
    const response = await axios.get(
      `${BASE_URL}/api/license/status?userId=${testUserId}`,
      { timeout: 10000 }
    );

    console.log('\n✅ Original Route Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('\n❌ Original Route Error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }
}

testNewRoute();
