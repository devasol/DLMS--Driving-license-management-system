import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testDirectEndpoint() {
  console.log('🧪 Testing Direct License Status Endpoint...\n');

  // Test with the user we know has a license
  const testUserId = '6439afc04f1b2e6c9b6d3d34'; // John Doe from our previous test

  try {
    console.log(`Testing direct endpoint with userId: ${testUserId}`);
    
    const response = await axios.get(
      `${BASE_URL}/api/license/status-direct?userId=${testUserId}`,
      { timeout: 10000 }
    );

    console.log('\n✅ Direct Endpoint Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    // Verify the response has all expected fields
    const expectedFields = ['success', 'hasLicense', 'number', 'status', 'userName', 'class', 'issueDate', 'expiryDate'];
    const missingFields = expectedFields.filter(field => !(field in response.data));
    
    if (missingFields.length === 0) {
      console.log('\n✅ All expected fields present in response');
    } else {
      console.log('\n⚠️  Missing fields:', missingFields);
    }

    // Test the response format
    if (response.data.success === true && response.data.hasLicense === true) {
      console.log('\n✅ Response format is correct for license found');
      console.log(`   License Number: ${response.data.number}`);
      console.log(`   Status: ${response.data.status}`);
      console.log(`   User: ${response.data.userName}`);
      console.log(`   Class: ${response.data.class}`);
      console.log(`   Issue Date: ${response.data.issueDate}`);
      console.log(`   Expiry Date: ${response.data.expiryDate}`);
    } else {
      console.log('\n❌ Unexpected response format');
    }

  } catch (error) {
    console.log('\n❌ Direct Endpoint Error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
    
    if (error.response?.status === 404) {
      console.log('\n🔧 Route not found - server may need restart');
    }
  }

  // Also test with a user that doesn't have a license
  console.log('\n🔍 Testing with user without license...');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/license/status-direct?userId=67fc068e6a9ab9981039d09c`,
      { timeout: 10000 }
    );

    console.log('Response for user without license:', response.data);
    
    if (response.data.success === false && response.data.hasLicense === false) {
      console.log('✅ Correct response for user without license');
    } else {
      console.log('⚠️  Unexpected response for user without license');
    }

  } catch (noLicenseError) {
    if (noLicenseError.response?.status === 404) {
      console.log('✅ Correct 404 response for user without license');
    } else {
      console.log('❌ Unexpected error for user without license:', noLicenseError.message);
    }
  }
}

testDirectEndpoint();
