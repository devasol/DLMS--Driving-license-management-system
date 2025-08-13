import axios from 'axios';

const testUserDashboardAPIs = async () => {
  console.log('🧪 Testing User Dashboard API Endpoints...\n');

  const baseUrl = 'http://localhost:5004';
  const testUserId = '683627d7665fb16822bd8688'; // Test User Direct

  const endpoints = [
    {
      name: 'Health Check',
      method: 'GET',
      url: `${baseUrl}/api/health`,
      expectedStatus: 200
    },
    {
      name: 'License Routes Test',
      method: 'GET',
      url: `${baseUrl}/api/license/test`,
      expectedStatus: 200
    },
    {
      name: 'User Profile',
      method: 'GET',
      url: `${baseUrl}/api/users/${testUserId}`,
      expectedStatus: 200
    },
    {
      name: 'User Applications',
      method: 'GET',
      url: `${baseUrl}/api/license/applications/user/${testUserId}`,
      expectedStatus: 200
    },
    {
      name: 'License Status',
      method: 'GET',
      url: `${baseUrl}/api/license/status?userId=${testUserId}`,
      expectedStatus: 200
    },
    {
      name: 'Admin Users (for admin dashboard)',
      method: 'GET',
      url: `${baseUrl}/api/admin/users`,
      expectedStatus: 200
    },
    {
      name: 'Admin Dashboard Stats',
      method: 'GET',
      url: `${baseUrl}/api/admin/dashboard`,
      expectedStatus: 200
    },
    {
      name: 'Pending Applications (admin)',
      method: 'GET',
      url: `${baseUrl}/api/license/admin/applications/pending`,
      expectedStatus: 200
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);

      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        timeout: 5000
      });

      if (response.status === endpoint.expectedStatus) {
        console.log(`✅ SUCCESS: ${endpoint.name}`);
        console.log(`   Status: ${response.status}`);
        if (response.data) {
          if (typeof response.data === 'object') {
            console.log(`   Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
          } else {
            console.log(`   Data: ${response.data}`);
          }
        }
        successCount++;
      } else {
        console.log(`❌ UNEXPECTED STATUS: ${endpoint.name}`);
        console.log(`   Expected: ${endpoint.expectedStatus}, Got: ${response.status}`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${endpoint.name}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data?.message || 'Unknown error'}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      failCount++;
    }
    console.log(''); // Empty line for readability
  }

  // Test authentication endpoints
  console.log('🔐 Testing Authentication Endpoints...\n');

  const authTests = [
    {
      name: 'User Login',
      method: 'POST',
      url: `${baseUrl}/api/auth/login`,
      data: { email: 'testuser@example.com', password: 'password123' },
      expectedStatus: 200
    },
    {
      name: 'Admin Login',
      method: 'POST',
      url: `${baseUrl}/api/auth/login`,
      data: { email: 'admin@example.com', password: 'admin123', isAdmin: true },
      expectedStatus: 200
    },
    {
      name: 'User Registration',
      method: 'POST',
      url: `${baseUrl}/api/auth/register`,
      data: { 
        fullName: 'Test Registration User', 
        email: 'testregister@example.com', 
        password: 'password123' 
      },
      expectedStatus: 201
    }
  ];

  for (const test of authTests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        timeout: 5000
      });

      if (response.status === test.expectedStatus) {
        console.log(`✅ SUCCESS: ${test.name}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Message: ${response.data.message}`);
        successCount++;
      } else {
        console.log(`❌ UNEXPECTED STATUS: ${test.name}`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${response.status}`);
        failCount++;
      }
    } catch (error) {
      if (test.name === 'User Registration' && error.response?.status === 409) {
        // User already exists - this is expected
        console.log(`✅ EXPECTED: ${test.name} - User already exists`);
        successCount++;
      } else {
        console.log(`❌ FAILED: ${test.name}`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Error: ${error.response.data?.message || 'Unknown error'}`);
        } else {
          console.log(`   Error: ${error.message}`);
        }
        failCount++;
      }
    }
    console.log('');
  }

  console.log('📊 TEST SUMMARY:');
  console.log(`✅ Successful tests: ${successCount}`);
  console.log(`❌ Failed tests: ${failCount}`);
  console.log(`📈 Success rate: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`);

  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! User Dashboard APIs are working correctly.');
    console.log('\n📝 READY FOR TESTING:');
    console.log('1. Backend server is running on http://localhost:5004');
    console.log('2. All API endpoints are responding correctly');
    console.log('3. Authentication is working for both users and admins');
    console.log('4. User dashboard should now have full functionality');
    console.log('\n🔗 Test the user dashboard at: http://localhost:5173/signin');
    console.log('   Use: testuser@example.com / password123');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
};

testUserDashboardAPIs().catch(console.error);
