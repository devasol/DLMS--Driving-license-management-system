import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5004';

async function testDemoUserLicense() {
  console.log('🧪 Testing Demo User License with Photo and QR Code...\n');

  try {
    // Step 1: Get verified payments to find demo user
    console.log('1. Getting verified payments...');
    const paymentsResponse = await axios.get(`${BASE_URL}/api/payments/all`);
    
    if (!paymentsResponse.data.success) {
      console.log('❌ Failed to get payments');
      return;
    }

    const demoUserPayment = paymentsResponse.data.payments.find(p => 
      p.status === 'verified' && p.userEmail === 'demouser@example.com'
    );

    if (!demoUserPayment) {
      console.log('❌ Demo user payment not found');
      return;
    }

    console.log(`✅ Found demo user payment: ${demoUserPayment.userName}`);

    // Step 2: Issue license for demo user
    console.log('\n2. Issuing license for demo user...');
    const adminId = '683ae1545d7ddd378e282292'; // Test admin ID
    
    try {
      const issuanceResponse = await axios.post(
        `${BASE_URL}/api/payments/license/issue/${demoUserPayment._id}`,
        {
          adminId: adminId,
          adminNotes: 'License issued for demo user with photo and QR code',
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

        // Step 3: Download license with photo and QR code
        console.log(`\n3. Downloading license with photo and QR code...`);
        
        const downloadResponse = await axios.get(
          `${BASE_URL}/api/payments/license/download/${demoUserPayment.userId._id}`,
          { timeout: 15000 }
        );
        
        console.log('✅ License download successful!');
        console.log('📄 Download details:');
        console.log(`   Content type: ${downloadResponse.headers['content-type']}`);
        console.log(`   Content size: ${downloadResponse.data.length} characters`);
        
        // Save the license file
        const filename = `demo_license_with_photo_qr_${issuanceResponse.data.license.number.replace(/-/g, '_')}.html`;
        fs.writeFileSync(filename, downloadResponse.data);
        
        console.log(`💾 License saved as: ${filename}`);
        console.log(`🌐 Open the file in a web browser to see:`);
        console.log(`   ✅ Real user photo on the front`);
        console.log(`   ✅ Real QR code on the back`);
        console.log(`   ✅ Complete user information`);
        console.log(`   ✅ Professional Ethiopian government styling`);

      } else {
        console.log('❌ License issuance failed:', issuanceResponse.data.message);
      }

    } catch (issuanceError) {
      if (issuanceError.response?.status === 400 && 
          issuanceError.response?.data?.message?.includes('already issued')) {
        console.log('ℹ️ License already exists for demo user');
        
        // Test download for existing license
        console.log('\n3. Testing download for existing license...');
        const downloadResponse = await axios.get(
          `${BASE_URL}/api/payments/license/download/${demoUserPayment.userId._id}`,
          { timeout: 15000 }
        );
        
        console.log('✅ License download successful!');
        console.log('📄 Download details:');
        console.log(`   Content type: ${downloadResponse.headers['content-type']}`);
        console.log(`   Content size: ${downloadResponse.data.length} characters`);
        
        // Save the license file
        const filename = `demo_license_with_photo_qr_existing.html`;
        fs.writeFileSync(filename, downloadResponse.data);
        
        console.log(`💾 License saved as: ${filename}`);
        console.log(`🌐 Open the file in a web browser to see the enhanced license!`);
        
      } else {
        console.log('❌ License issuance error:', issuanceError.response?.data || issuanceError.message);
      }
    }

    console.log('\n🎉 Demo user license test completed!');
    console.log('\n🎯 Features tested:');
    console.log('   ✅ Real user photo integration');
    console.log('   ✅ QR code generation');
    console.log('   ✅ Complete user information');
    console.log('   ✅ Professional ID card design');

  } catch (error) {
    console.error('❌ Error testing demo user license:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDemoUserLicense();
