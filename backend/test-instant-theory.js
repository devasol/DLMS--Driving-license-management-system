import axios from 'axios';

const testInstantTheoryRoute = async () => {
  try {
    console.log('🧪 Testing instant theory exam route...');
    
    // Test the route
    const response = await axios.post('http://localhost:5004/api/exams/instant-theory', {
      userId: '507f1f77bcf86cd799439011' // Test user ID
    });
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
};

// Test health endpoint first
const testHealth = async () => {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await axios.get('http://localhost:5004/api/health');
    console.log('✅ Health check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

const runTests = async () => {
  const healthOk = await testHealth();
  if (healthOk) {
    await testInstantTheoryRoute();
  } else {
    console.log('❌ Server is not running on port 5004');
  }
};

runTests();
