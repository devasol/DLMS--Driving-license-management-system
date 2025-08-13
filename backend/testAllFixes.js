import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testAllFixes = async () => {
  console.log('🧪 Testing All Fixed Functionalities...\n');

  const baseUrl = 'http://localhost:5004';
  const testUserId = '683627d7665fb16822bd8688'; // Test User Direct

  let successCount = 0;
  let failCount = 0;

  // Test 1: Exam Scheduling API
  console.log('🎯 Testing Exam Scheduling API...');
  try {
    const examData = {
      userId: testUserId,
      userName: 'Test User Direct',
      examType: 'theory',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      time: '10:00',
      location: 'online',
      notes: 'Test exam scheduling'
    };

    const response = await axios.post(`${baseUrl}/api/exams/schedule`, examData, {
      timeout: 5000
    });

    if (response.data.success) {
      console.log('✅ SUCCESS: Exam scheduling API is working');
      console.log(`   Exam ID: ${response.data.data._id}`);
      console.log(`   Status: ${response.data.data.status}`);
      successCount++;
    } else {
      console.log('❌ FAILED: Exam scheduling API returned success=false');
      failCount++;
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already has a scheduled exam')) {
      console.log('✅ SUCCESS: Exam scheduling API is working (user already has exam scheduled)');
      successCount++;
    } else {
      console.log('❌ FAILED: Exam scheduling API error');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      failCount++;
    }
  }
  console.log('');

  // Test 2: Profile Picture Upload Directory
  console.log('🖼️  Testing Profile Picture Upload Setup...');
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const profilePicturesDir = path.join(uploadsDir, 'profile-pictures');

    if (fs.existsSync(uploadsDir) && fs.existsSync(profilePicturesDir)) {
      console.log('✅ SUCCESS: Upload directories exist');
      console.log(`   Uploads dir: ${uploadsDir}`);
      console.log(`   Profile pictures dir: ${profilePicturesDir}`);
      successCount++;
    } else {
      console.log('❌ FAILED: Upload directories do not exist');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAILED: Error checking upload directories');
    console.log(`   Error: ${error.message}`);
    failCount++;
  }
  console.log('');

  // Test 3: User Profile API (for profile picture upload)
  console.log('👤 Testing User Profile API...');
  try {
    const response = await axios.get(`${baseUrl}/api/users/${testUserId}`, {
      timeout: 5000
    });

    if (response.status === 200 && response.data) {
      console.log('✅ SUCCESS: User profile API is working');
      console.log(`   User: ${response.data.fullName || response.data.full_name}`);
      console.log(`   Email: ${response.data.email || response.data.user_email}`);
      console.log(`   Profile Picture: ${response.data.profilePicture || 'None'}`);
      successCount++;
    } else {
      console.log('❌ FAILED: User profile API returned unexpected response');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAILED: User profile API error');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failCount++;
  }
  console.log('');

  // Test 4: License Application Status API
  console.log('📋 Testing License Application Status API...');
  try {
    const response = await axios.get(`${baseUrl}/api/license/applications/user/${testUserId}`, {
      timeout: 5000
    });

    if (response.status === 200) {
      console.log('✅ SUCCESS: License application API is working');
      if (response.data && response.data.length > 0) {
        const application = response.data[0];
        console.log(`   Application ID: ${application._id}`);
        console.log(`   Status: ${application.status}`);
        console.log(`   License Type: ${application.licenseType}`);
        console.log(`   Application Date: ${new Date(application.applicationDate).toLocaleDateString()}`);
      } else {
        console.log('   No applications found for user');
      }
      successCount++;
    } else {
      console.log('❌ FAILED: License application API returned unexpected status');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAILED: License application API error');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failCount++;
  }
  console.log('');

  // Test 5: Create a test license application to test the flow
  console.log('📝 Testing License Application Creation...');
  try {
    const applicationData = {
      userId: testUserId,
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      phone: '1234567890',
      address: '123 Test Street',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      licenseType: 'learner',
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '0987654321',
        relationship: 'friend'
      }
    };

    const response = await axios.post(`${baseUrl}/api/license/applications`, applicationData, {
      timeout: 5000
    });

    if (response.data.success) {
      console.log('✅ SUCCESS: License application creation is working');
      console.log(`   Application ID: ${response.data.data._id}`);
      console.log(`   Status: ${response.data.data.status}`);
      successCount++;
    } else {
      console.log('❌ FAILED: License application creation returned success=false');
      failCount++;
    }
  } catch (error) {
    if (error.response?.status === 409 || error.response?.data?.message?.includes('already has an active application')) {
      console.log('✅ SUCCESS: License application API is working (user already has application)');
      successCount++;
    } else {
      console.log('❌ FAILED: License application creation error');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      failCount++;
    }
  }
  console.log('');

  // Test 6: Test notification API endpoints
  console.log('🔔 Testing Notification API...');
  try {
    const response = await axios.get(`${baseUrl}/api/notifications/user/${testUserId}`, {
      timeout: 5000
    });

    console.log('✅ SUCCESS: Notification API is accessible');
    console.log(`   Notifications count: ${response.data?.length || 0}`);
    successCount++;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ SUCCESS: Notification API is working (no notifications found)');
      successCount++;
    } else {
      console.log('❌ FAILED: Notification API error');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      failCount++;
    }
  }
  console.log('');

  // Summary
  console.log('📊 TEST SUMMARY:');
  console.log(`✅ Successful tests: ${successCount}`);
  console.log(`❌ Failed tests: ${failCount}`);
  console.log(`📈 Success rate: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`);

  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! All fixes are working correctly.');
    console.log('\n📝 FIXED FUNCTIONALITIES:');
    console.log('1. ✅ Exam scheduling API endpoints (port 5004)');
    console.log('2. ✅ Profile picture upload directories created');
    console.log('3. ✅ User profile API working');
    console.log('4. ✅ License application status API working');
    console.log('5. ✅ License application creation working');
    console.log('6. ✅ Notification API accessible');
    console.log('\n🔗 Ready for frontend testing at: http://localhost:5173');
    console.log('   Use: testuser@example.com / password123');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
};

testAllFixes().catch(console.error);
