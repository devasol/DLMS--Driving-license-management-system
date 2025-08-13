import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testLicenseStatus() {
  console.log('🧪 Testing License Status Endpoint...\n');

  // Test user IDs (you'll need to replace these with actual user IDs from your database)
  const testUserIds = [
    '507f1f77bcf86cd799439011', // Replace with actual user ID
    '507f1f77bcf86cd799439012', // Replace with actual user ID
    '507f1f77bcf86cd799439013', // Replace with actual user ID
  ];

  for (const userId of testUserIds) {
    try {
      console.log(`\n📋 Testing license status for user: ${userId}`);
      
      const response = await axios.get(
        `${BASE_URL}/api/license/status?userId=${userId}`,
        { timeout: 10000 }
      );

      if (response.data.success) {
        console.log('✅ License found:');
        console.log(`   📄 License Number: ${response.data.number}`);
        console.log(`   👤 User: ${response.data.userName}`);
        console.log(`   📧 Email: ${response.data.userEmail}`);
        console.log(`   🚗 Class: ${response.data.class}`);
        console.log(`   📅 Issue Date: ${response.data.issueDate}`);
        console.log(`   ⏰ Expiry Date: ${response.data.expiryDate}`);
        console.log(`   🔍 Status: ${response.data.status}`);
        console.log(`   ⚠️  Points: ${response.data.points}/${response.data.maxPoints}`);
        console.log(`   📊 Days Until Expiry: ${response.data.daysUntilExpiry}`);
        console.log(`   🔔 Expiring Soon: ${response.data.isExpiringSoon}`);
        console.log(`   ❌ Expired: ${response.data.isExpired}`);
        
        if (response.data.restrictions) {
          console.log(`   🚫 Restrictions: ${response.data.restrictions}`);
        }
      } else {
        console.log('❌ No license found for this user');
      }

    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ No license found for this user (404)');
      } else {
        console.log('❌ Error:', error.response?.data?.message || error.message);
      }
    }
  }

  // Test with invalid user ID
  console.log('\n🧪 Testing with invalid user ID...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/license/status?userId=invalid_id`,
      { timeout: 5000 }
    );
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Expected error for invalid ID:', error.response?.data?.message || error.message);
  }

  // Test without user ID
  console.log('\n🧪 Testing without user ID...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/license/status`,
      { timeout: 5000 }
    );
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Expected error for missing user ID:', error.response?.data?.message || error.message);
  }

  console.log('\n✅ License status endpoint testing completed!');
}

// Run the test
testLicenseStatus().catch(console.error);
