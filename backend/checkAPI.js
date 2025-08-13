import axios from 'axios';

async function checkAPI() {
  console.log("Checking API endpoints...");
  
  const endpoints = [
    { url: "http://localhost:5001/api", name: "API Root" },
    { url: "http://localhost:5001/api/license/test", name: "License Routes Test" },
    { url: "http://localhost:5001/api/license/admin/debug/collections", name: "Debug Collections" },
    { url: "http://localhost:5001/api/license/admin/applications/pending", name: "Pending Applications" },
    { url: "http://localhost:5001/api/license/admin/applications", name: "All Applications" }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${endpoint.name} (${endpoint.url})`);
      const response = await axios.get(endpoint.url, { timeout: 5000 });
      
      console.log(`Status: ${response.status}`);
      console.log(`Data type: ${typeof response.data}`);
      
      if (Array.isArray(response.data)) {
        console.log(`Array length: ${response.data.length}`);
        if (response.data.length > 0) {
          console.log("First item:", JSON.stringify(response.data[0]).substring(0, 200) + "...");
        }
      } else if (typeof response.data === 'object') {
        console.log("Response object:", JSON.stringify(response.data).substring(0, 200) + "...");
      } else {
        console.log("Response:", response.data);
      }
      
      console.log("✅ Endpoint working");
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Data:`, error.response.data);
      }
    }
  }
}

checkAPI().catch(console.error);