import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testExistingLicense() {
  console.log('🔍 Testing Existing License System...\n');

  try {
    // Step 1: Check all licenses
    console.log('1. Checking existing licenses...');
    const licensesResponse = await axios.get(`${BASE_URL}/api/payments/licenses`);

    console.log('✅ Licenses response:', {
      success: licensesResponse.data.success,
      count: licensesResponse.data.count,
      total: licensesResponse.data.total
    });

    if (licensesResponse.data.count > 0) {
      const license = licensesResponse.data.licenses[0];
      console.log('📋 Found license:', {
        number: license.number,
        userName: license.userName,
        userEmail: license.userEmail,
        class: license.class,
        status: license.status,
        issueDate: license.issueDate,
        expiryDate: license.expiryDate
      });

      // Step 2: Test license download
      const userId = license.userId._id || license.userId;
      console.log(`\n2. Testing license download for user ${userId}...`);

      try {
        const downloadResponse = await axios.get(
          `${BASE_URL}/api/payments/license/download/${userId}`,
          { timeout: 10000 }
        );

        console.log('✅ License download successful!');
        console.log('📄 Download details:');
        console.log(`   Content type: ${downloadResponse.headers['content-type']}`);
        console.log(`   Content size: ${downloadResponse.data.length} characters`);
        console.log(`   Contains license number: ${downloadResponse.data.includes(license.number)}`);
        console.log(`   Contains user name: ${downloadResponse.data.includes(license.userName)}`);

        // Save a sample of the content to see what it looks like
        const sampleContent = downloadResponse.data.substring(0, 500);
        console.log('\n📄 Sample content (first 500 chars):');
        console.log(sampleContent);

      } catch (downloadError) {
        console.log('❌ License download failed:', downloadError.response?.data || downloadError.message);
      }

    } else {
      console.log('❌ No licenses found');

      // Check if there are eligible users
      console.log('\n🔍 Checking for eligible users...');
      const testUserId = '683ae1545d7ddd378e28228f';

      try {
        const eligibilityResponse = await axios.get(`${BASE_URL}/api/payments/license/eligibility/${testUserId}`);
        console.log('📋 Eligibility check:', eligibilityResponse.data);

        if (eligibilityResponse.data.eligible) {
          console.log('✅ User is eligible for license issuance');
          console.log('💡 You can issue the license through the admin dashboard');
        }
      } catch (error) {
        console.log('❌ Eligibility check failed:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 License check completed!');

  } catch (error) {
    console.error('❌ Error checking licenses:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testExistingLicense();
