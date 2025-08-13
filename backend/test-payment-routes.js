import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testPaymentRoutes() {
  console.log('🧪 Testing Payment Routes...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test 2: Get all payments
    console.log('\n2. Testing get all payments...');
    const paymentsResponse = await axios.get(`${BASE_URL}/api/payments/all`);
    console.log('✅ All payments:', paymentsResponse.data);

    // Test 3: Get pending payments
    console.log('\n3. Testing get pending payments...');
    const pendingResponse = await axios.get(`${BASE_URL}/api/payments/pending`);
    console.log('✅ Pending payments:', pendingResponse.data);

    console.log('\n🎉 All payment routes are working!');

  } catch (error) {
    console.error('❌ Error testing payment routes:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPaymentRoutes();
