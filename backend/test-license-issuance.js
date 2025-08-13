import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function testLicenseIssuance() {
  console.log('🎫 Testing License Issuance Process...\n');

  try {
    // Step 1: Get all verified payments to find eligible users
    console.log('1. Getting verified payments...');
    const paymentsResponse = await axios.get(`${BASE_URL}/api/payments/all`);
    
    if (!paymentsResponse.data.success) {
      console.log('❌ Failed to get payments');
      return;
    }

    const verifiedPayments = paymentsResponse.data.payments.filter(p => p.status === 'verified');
    console.log(`✅ Found ${verifiedPayments.length} verified payments`);

    if (verifiedPayments.length === 0) {
      console.log('❌ No verified payments found');
      return;
    }

    // Step 2: Issue license for the first verified payment
    const payment = verifiedPayments[0];
    console.log(`\n2. Issuing license for payment ${payment._id}...`);
    console.log(`   User: ${payment.userName}`);
    console.log(`   Amount: ${payment.amount} ${payment.currency}`);

    const adminId = '683ae1545d7ddd378e282292'; // Test admin ID
    
    const issuanceResponse = await axios.put(
      `${BASE_URL}/api/payments/verify/${payment._id}`,
      {
        adminId: adminId,
        adminNotes: 'License issued via API test',
        licenseClass: 'B'
      }
    );

    if (issuanceResponse.data.success) {
      console.log('✅ License issued successfully!');
      console.log('📄 License details:', {
        number: issuanceResponse.data.license.number,
        class: issuanceResponse.data.license.class,
        userName: issuanceResponse.data.license.userName,
        issueDate: issuanceResponse.data.license.issueDate,
        expiryDate: issuanceResponse.data.license.expiryDate
      });

      // Step 3: Test license download
      console.log(`\n3. Testing license download for user ${payment.userId._id}...`);
      
      try {
        const downloadResponse = await axios.get(
          `${BASE_URL}/api/payments/license/download/${payment.userId._id}`,
          { timeout: 10000 }
        );
        
        console.log('✅ License download successful!');
        console.log('📄 Download details:');
        console.log(`   Content type: ${downloadResponse.headers['content-type']}`);
        console.log(`   Content size: ${downloadResponse.data.length} characters`);
        console.log(`   Contains license number: ${downloadResponse.data.includes(issuanceResponse.data.license.number)}`);
        
      } catch (downloadError) {
        console.log('❌ License download failed:', downloadError.response?.data || downloadError.message);
      }

      // Step 4: Verify license was created in database
      console.log('\n4. Verifying license in database...');
      const licensesResponse = await axios.get(`${BASE_URL}/api/payments/licenses`);
      
      if (licensesResponse.data.success && licensesResponse.data.count > 0) {
        console.log(`✅ Found ${licensesResponse.data.count} license(s) in database`);
        const license = licensesResponse.data.licenses[0];
        console.log('📋 License summary:', {
          number: license.number,
          userName: license.userName,
          status: license.status,
          class: license.class
        });
      } else {
        console.log('❌ No licenses found in database');
      }

    } else {
      console.log('❌ License issuance failed:', issuanceResponse.data.message);
    }

    console.log('\n🎉 License issuance test completed!');

  } catch (error) {
    console.error('❌ Error testing license issuance:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLicenseIssuance();
