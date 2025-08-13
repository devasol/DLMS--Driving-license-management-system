import axios from 'axios';

const testExamApproval = async () => {
  console.log('🧪 Testing Exam Approval Functionality...\n');

  const baseUrl = 'http://localhost:5004';
  const testUserId = '683627d7665fb16822bd8688'; // Test User Direct

  let successCount = 0;
  let failCount = 0;

  // Test 1: Create a test exam schedule
  console.log('📝 Creating test exam schedule...');
  let examScheduleId = null;
  try {
    const examData = {
      userId: testUserId,
      userName: 'Test User Direct',
      examType: 'theory',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      time: '14:00',
      location: 'online',
      notes: 'Test exam for approval testing'
    };

    const response = await axios.post(`${baseUrl}/api/exams/schedule`, examData, {
      timeout: 5000
    });

    if (response.data.success) {
      examScheduleId = response.data.data._id;
      console.log('✅ SUCCESS: Test exam schedule created');
      console.log(`   Exam ID: ${examScheduleId}`);
      console.log(`   Status: ${response.data.data.status}`);
      successCount++;
    } else {
      console.log('❌ FAILED: Exam schedule creation returned success=false');
      failCount++;
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already has a scheduled exam')) {
      console.log('ℹ️  User already has exam scheduled, fetching existing exam...');
      
      try {
        const existingResponse = await axios.get(`${baseUrl}/api/exams/schedules/user/${testUserId}`);
        if (existingResponse.data && existingResponse.data.length > 0) {
          examScheduleId = existingResponse.data[0]._id;
          console.log('✅ SUCCESS: Using existing exam schedule');
          console.log(`   Exam ID: ${examScheduleId}`);
          successCount++;
        }
      } catch (fetchError) {
        console.log('❌ FAILED: Could not fetch existing exam');
        failCount++;
      }
    } else {
      console.log('❌ FAILED: Exam schedule creation error');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      failCount++;
    }
  }
  console.log('');

  if (!examScheduleId) {
    console.log('❌ Cannot proceed with approval tests - no exam schedule available');
    return;
  }

  // Test 2: Test exam approval API endpoint
  console.log('✅ Testing exam approval API...');
  try {
    const approvalData = {
      adminMessage: 'Your exam has been approved. Good luck!'
    };

    const response = await axios.put(
      `${baseUrl}/api/exams/schedules/${examScheduleId}/approve`,
      approvalData,
      { timeout: 5000 }
    );

    if (response.data.success) {
      console.log('✅ SUCCESS: Exam approval API is working');
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Updated Status: ${response.data.data.status}`);
      console.log(`   Admin Message: ${response.data.data.adminMessage}`);
      successCount++;
    } else {
      console.log('❌ FAILED: Exam approval API returned success=false');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAILED: Exam approval API error');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log(`   Status: ${error.response?.status}`);
    failCount++;
  }
  console.log('');

  // Test 3: Test exam rejection API endpoint
  console.log('🚫 Testing exam rejection API...');
  try {
    const rejectionData = {
      adminMessage: 'Please reschedule your exam for a different time.'
    };

    const response = await axios.put(
      `${baseUrl}/api/exams/schedules/${examScheduleId}/reject`,
      rejectionData,
      { timeout: 5000 }
    );

    if (response.data.success) {
      console.log('✅ SUCCESS: Exam rejection API is working');
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Updated Status: ${response.data.data.status}`);
      console.log(`   Admin Message: ${response.data.data.adminMessage}`);
      successCount++;
    } else {
      console.log('❌ FAILED: Exam rejection API returned success=false');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAILED: Exam rejection API error');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log(`   Status: ${error.response?.status}`);
    failCount++;
  }
  console.log('');

  // Test 4: Test fetching exam schedules
  console.log('📋 Testing exam schedules fetch...');
  try {
    const response = await axios.get(`${baseUrl}/api/exams/schedules`, {
      timeout: 5000
    });

    if (response.status === 200) {
      console.log('✅ SUCCESS: Exam schedules fetch is working');
      console.log(`   Total schedules: ${response.data.length}`);
      
      const testSchedule = response.data.find(s => s._id === examScheduleId);
      if (testSchedule) {
        console.log(`   Test schedule status: ${testSchedule.status}`);
        console.log(`   Test schedule admin message: ${testSchedule.adminMessage || 'None'}`);
      }
      successCount++;
    } else {
      console.log('❌ FAILED: Exam schedules fetch returned unexpected status');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAILED: Exam schedules fetch error');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failCount++;
  }
  console.log('');

  // Test 5: Test exam deletion API
  console.log('🗑️  Testing exam deletion API...');
  try {
    const response = await axios.delete(`${baseUrl}/api/exams/schedules/${examScheduleId}`, {
      timeout: 5000
    });

    if (response.data.success) {
      console.log('✅ SUCCESS: Exam deletion API is working');
      console.log(`   Message: ${response.data.message}`);
      successCount++;
    } else {
      console.log('❌ FAILED: Exam deletion API returned success=false');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAILED: Exam deletion API error');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failCount++;
  }
  console.log('');

  // Summary
  console.log('📊 TEST SUMMARY:');
  console.log(`✅ Successful tests: ${successCount}`);
  console.log(`❌ Failed tests: ${failCount}`);
  console.log(`📈 Success rate: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`);

  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Exam approval functionality is working correctly.');
    console.log('\n📝 WORKING FUNCTIONALITIES:');
    console.log('1. ✅ Exam schedule creation');
    console.log('2. ✅ Exam approval API');
    console.log('3. ✅ Exam rejection API');
    console.log('4. ✅ Exam schedules fetch');
    console.log('5. ✅ Exam deletion API');
    console.log('\n🔗 Ready for admin testing at: http://localhost:5173/admin/dashboard');
    console.log('   Use: admin@example.com / admin123');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
};

testExamApproval().catch(console.error);
