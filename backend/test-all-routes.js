import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testAllRoutes() {
  console.log('🧪 Testing All Available Routes...\n');

  const routes = [
    '/api/health',
    '/api/license/test',
    '/api/license/status?userId=6439afc04f1b2e6c9b6d3d34',
    '/api/license/debug/user/6439afc04f1b2e6c9b6d3d34',
    '/api/license/applications',
    '/api/license/admin/applications'
  ];

  for (const route of routes) {
    try {
      console.log(`Testing: ${route}`);
      const response = await axios.get(`${BASE_URL}${route}`, { timeout: 5000 });
      console.log(`✅ Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...\n`);
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || error.code}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}\n`);
    }
  }
}

testAllRoutes();
