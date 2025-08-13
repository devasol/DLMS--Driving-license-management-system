import axios from 'axios';

const testSignupFlow = async () => {
  console.log('🧪 Testing Complete Signup Flow...\n');

  const baseUrl = 'http://localhost:5004';

  // Test cases with different scenarios
  const testCases = [
    {
      name: "Complete Registration - All Fields",
      data: {
        fullName: "John Complete Test",
        email: "johncomplete@example.com",
        password: "password123",
        userName: "johncomplete",
        phoneNumber: "1234567890",
        gender: "male",
        nic: "123456789V"
      },
      expectedStatus: 201,
      shouldSucceed: true
    },
    {
      name: "Minimal Registration - Required Fields Only",
      data: {
        fullName: "Jane Minimal Test",
        email: "janeminimal@example.com",
        password: "password123"
      },
      expectedStatus: 201,
      shouldSucceed: true
    },
    {
      name: "Missing Required Field - No Email",
      data: {
        fullName: "Missing Email Test",
        password: "password123",
        userName: "missingemail"
      },
      expectedStatus: 400,
      shouldSucceed: false
    },
    {
      name: "Missing Required Field - No Password",
      data: {
        fullName: "Missing Password Test",
        email: "missingpassword@example.com",
        userName: "missingpassword"
      },
      expectedStatus: 400,
      shouldSucceed: false
    },
    {
      name: "Missing Required Field - No Full Name",
      data: {
        email: "missingname@example.com",
        password: "password123",
        userName: "missingname"
      },
      expectedStatus: 400,
      shouldSucceed: false
    },
    {
      name: "Duplicate Email Test",
      data: {
        fullName: "Duplicate Email Test",
        email: "johncomplete@example.com", // Same as first test
        password: "password123",
        userName: "duplicate"
      },
      expectedStatus: 409,
      shouldSucceed: false
    }
  ];

  let successCount = 0;
  let failCount = 0;

  // First, clean up any existing test users
  console.log('🧹 Cleaning up existing test users...');
  try {
    // We can't delete directly via API, so we'll just note if they exist
    console.log('Note: Some test users may already exist from previous tests\n');
  } catch (error) {
    console.log('Cleanup note:', error.message);
  }

  // Test each case
  for (const testCase of testCases) {
    try {
      console.log(`🔍 Testing: ${testCase.name}`);
      console.log(`   Data: ${JSON.stringify(testCase.data, null, 2)}`);

      const response = await axios.post(`${baseUrl}/api/auth/register`, testCase.data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      if (testCase.shouldSucceed && response.status === testCase.expectedStatus) {
        console.log(`✅ SUCCESS: ${testCase.name}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Message: ${response.data.message}`);
        if (response.data.user) {
          console.log(`   User ID: ${response.data.user._id}`);
          console.log(`   Email: ${response.data.user.email}`);
        }
        successCount++;
      } else if (!testCase.shouldSucceed) {
        console.log(`❌ UNEXPECTED SUCCESS: ${testCase.name} should have failed`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data: ${JSON.stringify(response.data)}`);
        failCount++;
      } else {
        console.log(`❌ UNEXPECTED STATUS: ${testCase.name}`);
        console.log(`   Expected: ${testCase.expectedStatus}, Got: ${response.status}`);
        failCount++;
      }
    } catch (error) {
      if (!testCase.shouldSucceed && error.response?.status === testCase.expectedStatus) {
        console.log(`✅ EXPECTED FAILURE: ${testCase.name}`);
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || 'No message'}`);
        if (error.response.data?.missingFields) {
          console.log(`   Missing Fields: ${error.response.data.missingFields.join(', ')}`);
        }
        successCount++;
      } else {
        console.log(`❌ FAILED: ${testCase.name}`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Error: ${error.response.data?.message || 'Unknown error'}`);
        } else {
          console.log(`   Error: ${error.message}`);
        }
        failCount++;
      }
    }
    console.log(''); // Empty line for readability
  }

  // Test login with newly created users
  console.log('🔐 Testing Login with New Users...\n');

  const loginTests = [
    {
      name: "Login with Complete User",
      email: "johncomplete@example.com",
      password: "password123"
    },
    {
      name: "Login with Minimal User",
      email: "janeminimal@example.com",
      password: "password123"
    }
  ];

  for (const loginTest of loginTests) {
    try {
      console.log(`🔍 Testing: ${loginTest.name}`);
      
      const response = await axios.post(`${baseUrl}/api/auth/login`, {
        email: loginTest.email,
        password: loginTest.password
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      if (response.status === 200) {
        console.log(`✅ SUCCESS: ${loginTest.name}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Message: ${response.data.message}`);
        console.log(`   User: ${response.data.user?.fullName || response.data.user?.full_name}`);
        successCount++;
      } else {
        console.log(`❌ UNEXPECTED STATUS: ${loginTest.name}`);
        console.log(`   Expected: 200, Got: ${response.status}`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${loginTest.name}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data?.message || 'Unknown error'}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      failCount++;
    }
    console.log('');
  }

  console.log('📊 TEST SUMMARY:');
  console.log(`✅ Successful tests: ${successCount}`);
  console.log(`❌ Failed tests: ${failCount}`);
  console.log(`📈 Success rate: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`);

  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Signup functionality is working correctly.');
    console.log('\n📝 READY FOR FRONTEND TESTING:');
    console.log('1. Backend registration endpoint is working correctly');
    console.log('2. All field validations are working');
    console.log('3. Duplicate email detection is working');
    console.log('4. New users can login successfully');
    console.log('\n🔗 Test the signup form at: http://localhost:5173/signup');
    console.log('   Fill in all fields and submit the form');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
};

testSignupFlow().catch(console.error);
