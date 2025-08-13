import fetch from "node-fetch";

async function checkServerStatus() {
  console.log("Checking server status...");

  const baseUrl = "http://localhost:5001";
  const endpoints = [
    `${baseUrl}/api`,
    `${baseUrl}/api/license/admin/debug/collections`,
    `${baseUrl}/api/license/admin/applications/pending`,
    `${baseUrl}/api/users/signup`, // Test another endpoint
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: endpoint.includes("signup") ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: endpoint.includes("signup")
          ? JSON.stringify({
              full_name: "Test User",
              user_email: "test@example.com",
              user_password: "password123",
            })
          : undefined,
      });

      const status = response.status;
      const data = await response.text();

      console.log(`Status: ${status}`);
      console.log(
        `Response: ${data.substring(0, 100)}${data.length > 100 ? "..." : ""}`
      );
    } catch (error) {
      console.error(`Error testing ${endpoint}: ${error.message}`);
    }
    console.log("-------------------");
  }
}

checkServerStatus().catch(console.error);
