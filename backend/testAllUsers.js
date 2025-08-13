import axios from 'axios';

const testAllUsers = async () => {
  console.log('🧪 Testing all user authentication...\n');

  const testCredentials = [
    { email: 'testuser@example.com', password: 'password123', type: 'user', name: 'Test User Direct' },
    { email: 'john@example.com', password: 'password123', type: 'user', name: 'John Doe' },
    { email: 'jane@example.com', password: 'password123', type: 'user', name: 'Jane Smith' },
    { email: 'mike@example.com', password: 'password123', type: 'user', name: 'Mike Johnson' },
    { email: 'admin@example.com', password: 'admin123', type: 'admin', name: 'Admin User Direct' }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const cred of testCredentials) {
    try {
      console.log(`🔐 Testing ${cred.type} login: ${cred.name} (${cred.email})`);
      
      const loginData = cred.type === 'admin' 
        ? { email: cred.email, password: cred.password, isAdmin: true }
        : { email: cred.email, password: cred.password };

      const response = await axios.post('http://localhost:5004/api/auth/login', loginData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      if (response.status === 200 && response.data.message === 'Login successful') {
        console.log(`✅ SUCCESS: ${cred.name} logged in successfully`);
        console.log(`   - User ID: ${response.data.user._id}`);
        console.log(`   - Role: ${response.data.user.role}`);
        console.log(`   - Type: ${response.data.user.type}\n`);
        successCount++;
      } else {
        console.log(`❌ UNEXPECTED: ${cred.name} - Unexpected response`);
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Data: ${JSON.stringify(response.data)}\n`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${cred.name} - ${error.response?.data?.message || error.message}`);
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Data: ${JSON.stringify(error.response.data)}`);
      }
      console.log('');
      failCount++;
    }
  }

  // Test invalid credentials
  console.log('🔐 Testing invalid credentials...');
  try {
    await axios.post('http://localhost:5004/api/auth/login', {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    console.log('❌ FAILED: Invalid credentials should have been rejected');
    failCount++;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ SUCCESS: Invalid credentials correctly rejected');
      successCount++;
    } else {
      console.log(`❌ UNEXPECTED: Invalid credentials test failed with status ${error.response?.status}`);
      failCount++;
    }
  }

  // Test wrong password
  console.log('\n🔐 Testing wrong password...');
  try {
    await axios.post('http://localhost:5004/api/auth/login', {
      email: 'testuser@example.com',
      password: 'wrongpassword'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    console.log('❌ FAILED: Wrong password should have been rejected');
    failCount++;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ SUCCESS: Wrong password correctly rejected');
      successCount++;
    } else {
      console.log(`❌ UNEXPECTED: Wrong password test failed with status ${error.response?.status}`);
      failCount++;
    }
  }

  console.log('\n📊 TEST SUMMARY:');
  console.log(`✅ Successful tests: ${successCount}`);
  console.log(`❌ Failed tests: ${failCount}`);
  console.log(`📈 Success rate: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`);

  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The authentication system is working correctly.');
    console.log('\n📝 WORKING CREDENTIALS FOR FRONTEND TESTING:');
    console.log('👤 Regular Users (use normal login):');
    console.log('  - testuser@example.com / password123');
    console.log('  - john@example.com / password123');
    console.log('  - jane@example.com / password123');
    console.log('  - mike@example.com / password123');
    console.log('👑 Admin (click "Sign in with Admin"):');
    console.log('  - admin@example.com / admin123');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
};

testAllUsers().catch(console.error);
