import fetch from 'node-fetch';

async function testAPI() {
  const baseUrl = 'http://localhost:5001';
  
  console.log('Testing API endpoints...');
  
  // Test endpoints
  const endpoints = [
    { url: `${baseUrl}/api`, method: 'GET', name: 'API Root' },
    { url: `${baseUrl}/api/license/test`, method: 'GET', name: 'License Routes Test' },
    { url: `${baseUrl}/api/license/admin/debug/collections`, method: 'GET', name: 'Debug Collections' },
    { url: `${baseUrl}/api/license/admin/applications/pending`, method: 'GET', name: 'Pending Applications' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      
      const response = await fetch(endpoint.url, { method: endpoint.method });
      const status = response.status;
      
      console.log(`Status: ${status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', JSON.stringify(data).substring(0, 200) + '...');
      } else {
        const text = await response.text();
        console.log('Error response:', text);
      }
    } catch (error) {
      console.error(`Error testing ${endpoint.name}:`, error.message);
    }
  }
}

testAPI().catch(console.error);