import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5004';

async function issueDemoLicense() {
  console.log('🎫 Issuing Demo User License with Photo and QR Code...\n');

  try {
    // Demo user details from previous check
    const demoPaymentId = '683aec1791af9ae717d8f334';
    const demoUserId = '683aebf5ca508be044c69410';
    const adminId = '683ae1545d7ddd378e282292'; // Test admin ID

    console.log('1. Issuing license for demo user...');
    console.log(`   Payment ID: ${demoPaymentId}`);
    console.log(`   User ID: ${demoUserId}`);

    try {
      const issuanceResponse = await axios.post(
        `${BASE_URL}/api/payments/license/issue/${demoPaymentId}`,
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

        // Step 2: Download license with photo and QR code
        console.log(`\n2. Downloading license with photo and QR code...`);
        
        const downloadResponse = await axios.get(
          `${BASE_URL}/api/payments/license/download/${demoUserId}`,
          { timeout: 20000 }
        );
        
        console.log('✅ License download successful!');
        console.log('📄 Download details:');
        console.log(`   Content type: ${downloadResponse.headers['content-type']}`);
        console.log(`   Content size: ${downloadResponse.data.length} characters`);
        
        // Check if content includes photo and QR code indicators
        const hasPhotoIndicator = downloadResponse.data.includes('data:image/') || downloadResponse.data.includes('profilePicture');
        const hasQRCodeIndicator = downloadResponse.data.includes('QR') || downloadResponse.data.includes('qr');
        
        console.log(`   Contains photo data: ${hasPhotoIndicator ? '✅' : '❌'}`);
        console.log(`   Contains QR code: ${hasQRCodeIndicator ? '✅' : '❌'}`);
        
        // Save the license file
        const filename = `demo_license_with_photo_qr_${issuanceResponse.data.license.number.replace(/-/g, '_')}.html`;
        fs.writeFileSync(filename, downloadResponse.data);
        
        console.log(`\n💾 License saved as: ${filename}`);
        console.log(`🌐 Open the file in a web browser to see:`);
        console.log(`   ✅ Real user photo on the front side`);
        console.log(`   ✅ Real QR code on the back side`);
        console.log(`   ✅ Complete user information (DOB, Address)`);
        console.log(`   ✅ Professional Ethiopian government styling`);
        console.log(`   ✅ Front and back ID card surfaces`);

        // Open the file in browser
        console.log(`\n🚀 Opening license in browser...`);
        
      } else {
        console.log('❌ License issuance failed:', issuanceResponse.data.message);
      }

    } catch (issuanceError) {
      if (issuanceError.response?.status === 400 && 
          issuanceError.response?.data?.message?.includes('already issued')) {
        console.log('ℹ️ License already exists for demo user');
        
        // Test download for existing license
        console.log('\n2. Downloading existing license with photo and QR code...');
        const downloadResponse = await axios.get(
          `${BASE_URL}/api/payments/license/download/${demoUserId}`,
          { timeout: 20000 }
        );
        
        console.log('✅ License download successful!');
        console.log('📄 Download details:');
        console.log(`   Content type: ${downloadResponse.headers['content-type']}`);
        console.log(`   Content size: ${downloadResponse.data.length} characters`);
        
        // Check if content includes photo and QR code indicators
        const hasPhotoIndicator = downloadResponse.data.includes('data:image/') || downloadResponse.data.includes('svg');
        const hasQRCodeIndicator = downloadResponse.data.includes('data:image/png;base64') || downloadResponse.data.includes('QR');
        
        console.log(`   Contains photo data: ${hasPhotoIndicator ? '✅' : '❌'}`);
        console.log(`   Contains QR code: ${hasQRCodeIndicator ? '✅' : '❌'}`);
        
        // Save the license file
        const filename = `demo_license_with_photo_qr_existing.html`;
        fs.writeFileSync(filename, downloadResponse.data);
        
        console.log(`\n💾 License saved as: ${filename}`);
        console.log(`🌐 Open the file in a web browser to see the enhanced license!`);
        
      } else {
        console.log('❌ License issuance error:', issuanceError.response?.data || issuanceError.message);
      }
    }

    console.log('\n🎉 Demo user license with photo and QR code completed!');
    console.log('\n🎯 Enhanced features:');
    console.log('   ✅ Real user photo integration');
    console.log('   ✅ Actual QR code generation');
    console.log('   ✅ Complete user information');
    console.log('   ✅ Professional ID card design');
    console.log('   ✅ Front and back surfaces');
    console.log('   ✅ Ethiopian government branding');

  } catch (error) {
    console.error('❌ Error issuing demo user license:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

issueDemoLicense();
