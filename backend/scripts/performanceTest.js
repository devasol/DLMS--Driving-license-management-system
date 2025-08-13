import axios from 'axios';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:5004';

// Test endpoints and their expected response times (in ms)
const testEndpoints = [
  { url: '/api/health', method: 'GET', expectedTime: 100, name: 'Health Check' },
  { url: '/api/news/published?limit=10', method: 'GET', expectedTime: 500, name: 'News List' },
  { url: '/api/payments/all?limit=20', method: 'GET', expectedTime: 800, name: 'Payments List' },
  { url: '/api/admin/dashboard', method: 'GET', expectedTime: 1000, name: 'Admin Dashboard' },
];

async function testEndpoint(endpoint) {
  const start = performance.now();
  
  try {
    const response = await axios({
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.url}`,
      timeout: 10000,
      headers: {
        'Authorization': 'Bearer test-token' // Add if needed
      }
    });
    
    const end = performance.now();
    const responseTime = Math.round(end - start);
    
    const status = responseTime <= endpoint.expectedTime ? '✅' : '⚠️';
    const statusText = response.status === 200 ? 'OK' : `${response.status}`;
    
    console.log(`${status} ${endpoint.name}: ${responseTime}ms (expected: ≤${endpoint.expectedTime}ms) - ${statusText}`);
    
    return {
      name: endpoint.name,
      responseTime,
      expectedTime: endpoint.expectedTime,
      status: response.status,
      success: responseTime <= endpoint.expectedTime && response.status === 200
    };
    
  } catch (error) {
    const end = performance.now();
    const responseTime = Math.round(end - start);
    
    console.log(`❌ ${endpoint.name}: ${responseTime}ms - ERROR: ${error.message}`);
    
    return {
      name: endpoint.name,
      responseTime,
      expectedTime: endpoint.expectedTime,
      status: error.response?.status || 'ERROR',
      success: false,
      error: error.message
    };
  }
}

async function runPerformanceTest() {
  console.log('🚀 Starting Performance Test...\n');
  console.log('Testing API endpoints for response times:\n');
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Performance Test Summary:');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`⚠️ Slow/Failed: ${total - successful}/${total}`);
  
  const avgResponseTime = Math.round(
    results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
  );
  
  console.log(`📈 Average Response Time: ${avgResponseTime}ms`);
  
  // Show slow endpoints
  const slowEndpoints = results.filter(r => !r.success);
  if (slowEndpoints.length > 0) {
    console.log('\n⚠️ Slow/Failed Endpoints:');
    slowEndpoints.forEach(endpoint => {
      console.log(`   - ${endpoint.name}: ${endpoint.responseTime}ms (expected: ≤${endpoint.expectedTime}ms)`);
    });
  }
  
  console.log('\n💡 Performance Tips:');
  console.log('   - Response times under 200ms are excellent');
  console.log('   - Response times under 500ms are good');
  console.log('   - Response times over 1000ms need optimization');
  
  return results;
}

// Database performance test
async function testDatabasePerformance() {
  console.log('\n🗄️ Database Performance Test...\n');
  
  const dbTests = [
    {
      name: 'User Query',
      test: async () => {
        const start = performance.now();
        await axios.get(`${BASE_URL}/api/admin/users?limit=50`);
        return performance.now() - start;
      }
    },
    {
      name: 'News Query',
      test: async () => {
        const start = performance.now();
        await axios.get(`${BASE_URL}/api/news/published?limit=20`);
        return performance.now() - start;
      }
    },
    {
      name: 'Payment Query',
      test: async () => {
        const start = performance.now();
        await axios.get(`${BASE_URL}/api/payments/all?limit=30`);
        return performance.now() - start;
      }
    }
  ];
  
  for (const test of dbTests) {
    try {
      const responseTime = await test.test();
      const status = responseTime < 500 ? '✅' : '⚠️';
      console.log(`${status} ${test.name}: ${Math.round(responseTime)}ms`);
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
}

// Run the performance test
async function main() {
  try {
    await runPerformanceTest();
    await testDatabasePerformance();
    
    console.log('\n🎉 Performance test completed!');
    console.log('\nTo improve performance:');
    console.log('1. Run: npm run optimize-db (add database indexes)');
    console.log('2. Enable compression in production');
    console.log('3. Use CDN for static assets');
    console.log('4. Implement caching for frequently accessed data');
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  }
}

main();
