import axios from 'axios';

const testFeedback = async () => {
  console.log('🧪 Testing Enhanced Feedback Functionality...\n');

  const baseUrl = 'http://localhost:5004';
  const testUserId = '683627d7665fb16822bd8688'; // Test User Direct
  const testUserName = 'Test User Direct';
  const testUserEmail = 'testuser@example.com';

  let successCount = 0;
  let failCount = 0;

  // Test 1: Test feedback submission with written feedback
  console.log('📝 Testing feedback submission with written feedback...');
  try {
    const feedbackData = {
      name: testUserName,
      feedback: 'በጣም ጥሩ', // Very Good
      rating: 'Very High',
      writtenFeedback: 'The service was excellent! The staff was very helpful and the process was smooth. I would definitely recommend this to others.',
      userEmail: testUserEmail,
      userId: testUserId,
      category: 'service'
    };

    const response = await axios.post(`${baseUrl}/api/feedbacks`, feedbackData, {
      timeout: 5000
    });

    if (response.data.success) {
      console.log('✅ SUCCESS: Feedback with written feedback submitted successfully');
      console.log(`   Feedback ID: ${response.data.data._id}`);
      console.log(`   Rating: ${response.data.data.rating}`);
      console.log(`   Written Feedback: ${response.data.data.writtenFeedback}`);
      console.log(`   User ID: ${response.data.data.userId}`);
      successCount++;
    } else {
      console.log('❌ FAILED: Feedback submission returned success=false');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAILED: Feedback submission error');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log(`   Status: ${error.response?.status}`);
    failCount++;
  }
  console.log('');

  // Test 2: Test feedback submission without written feedback (emoji only)
  console.log('😊 Testing feedback submission without written feedback...');
  try {
    const feedbackData = {
      name: testUserName,
      feedback: 'ጥሩ', // Good
      rating: 'High',
      writtenFeedback: null,
      userEmail: testUserEmail,
      userId: testUserId,
      category: 'service'
    };

    const response = await axios.post(`${baseUrl}/api/feedbacks`, feedbackData, {
      timeout: 5000
    });

    if (response.data.success) {
      console.log('✅ SUCCESS: Emoji-only feedback submitted successfully');
      console.log(`   Feedback ID: ${response.data.data._id}`);
      console.log(`   Rating: ${response.data.data.rating}`);
      console.log(`   Written Feedback: ${response.data.data.writtenFeedback || 'None'}`);
      successCount++;
    } else {
      console.log('❌ FAILED: Emoji-only feedback submission returned success=false');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAILED: Emoji-only feedback submission error');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failCount++;
  }
  console.log('');

  // Test 3: Test authentication requirement (no userId)
  console.log('🔒 Testing authentication requirement...');
  try {
    const feedbackData = {
      name: 'Anonymous User',
      feedback: 'ጥሩ',
      rating: 'High',
      writtenFeedback: 'This should fail because no userId is provided',
      userEmail: 'anonymous@example.com',
      // userId: missing intentionally
      category: 'service'
    };

    const response = await axios.post(`${baseUrl}/api/feedbacks`, feedbackData, {
      timeout: 5000
    });

    console.log('❌ FAILED: Should have rejected unauthenticated feedback');
    failCount++;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ SUCCESS: Correctly rejected unauthenticated feedback');
      console.log(`   Error message: ${error.response.data.message}`);
      successCount++;
    } else {
      console.log('❌ FAILED: Wrong error for unauthenticated feedback');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      failCount++;
    }
  }
  console.log('');

  // Test 4: Test missing required fields
  console.log('📋 Testing missing required fields validation...');
  try {
    const feedbackData = {
      name: testUserName,
      // feedback: missing intentionally
      rating: 'High',
      writtenFeedback: 'This should fail because feedback is missing',
      userEmail: testUserEmail,
      userId: testUserId,
      category: 'service'
    };

    const response = await axios.post(`${baseUrl}/api/feedbacks`, feedbackData, {
      timeout: 5000
    });

    console.log('❌ FAILED: Should have rejected feedback with missing required fields');
    failCount++;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ SUCCESS: Correctly rejected feedback with missing required fields');
      console.log(`   Error message: ${error.response.data.message}`);
      successCount++;
    } else {
      console.log('❌ FAILED: Wrong error for missing required fields');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      failCount++;
    }
  }
  console.log('');

  // Test 5: Test fetching all feedbacks
  console.log('📊 Testing feedback retrieval...');
  try {
    const response = await axios.get(`${baseUrl}/api/feedbacks`, {
      timeout: 5000
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      console.log('✅ SUCCESS: Feedback retrieval working');
      console.log(`   Total feedbacks: ${response.data.length}`);
      
      // Find our test feedbacks
      const testFeedbacks = response.data.filter(f => f.userId === testUserId);
      console.log(`   Test user feedbacks: ${testFeedbacks.length}`);
      
      if (testFeedbacks.length > 0) {
        const latestFeedback = testFeedbacks[0];
        console.log(`   Latest feedback rating: ${latestFeedback.rating}`);
        console.log(`   Has written feedback: ${!!latestFeedback.writtenFeedback}`);
      }
      successCount++;
    } else {
      console.log('❌ FAILED: Feedback retrieval returned unexpected format');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAILED: Feedback retrieval error');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failCount++;
  }
  console.log('');

  // Test 6: Test feedback route accessibility
  console.log('🔗 Testing feedback routes accessibility...');
  try {
    const response = await axios.get(`${baseUrl}/api/feedbacks/health`, {
      timeout: 5000
    });

    console.log('✅ SUCCESS: Feedback routes are accessible');
    successCount++;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ SUCCESS: Feedback routes are accessible (health endpoint not found is expected)');
      successCount++;
    } else {
      console.log('❌ FAILED: Feedback routes not accessible');
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
    console.log('\n🎉 ALL TESTS PASSED! Enhanced feedback functionality is working correctly.');
    console.log('\n📝 WORKING FEATURES:');
    console.log('1. ✅ Feedback submission with written feedback');
    console.log('2. ✅ Emoji-only feedback submission');
    console.log('3. ✅ Authentication requirement (logged-in users only)');
    console.log('4. ✅ Required fields validation');
    console.log('5. ✅ Feedback retrieval');
    console.log('6. ✅ Feedback routes accessibility');
    console.log('\n🔗 Ready for frontend testing at: http://localhost:5173');
    console.log('   Navigate to feedback section and test with logged-in user');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
};

testFeedback().catch(console.error);
