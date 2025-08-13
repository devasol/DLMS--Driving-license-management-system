import axios from 'axios';

async function checkAdminAPI() {
  console.log("Checking Admin API endpoints...");
  
  const endpoints = [
    { url: "http://localhost:5001/api", name: "API Root" },
    { url: "http://localhost:5001/api/admin/users", name: "Get All Users" },
    { url: "http://localhost:5001/api/admin/dashboard", name: "Dashboard Stats" }
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
  
  // Test creating a user
  try {
    console.log("\nTesting: Create Test User");
    const testUser = {
      fullName: "Test User",
      email: "testuser" + Date.now() + "@example.com",
      password: "password123",
      role: "user"
    };
    
    const response = await axios.post("http://localhost:5001/api/auth/register", testUser);
    console.log(`Status: ${response.status}`);
    console.log("Response:", response.data);
    console.log("✅ Create user endpoint working");
  } catch (error) {
    console.log(`❌ Error creating test user: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    }
  }
}

checkAdminAPI().catch(console.error