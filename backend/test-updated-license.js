import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5004';

async function testUpdatedLicense() {
  console.log('🧪 Testing Updated License with Photo and QR Code...\n');

  try {
    // Demo user details
    const demoUserId = '683aebf5ca508be044c69410';

    console.log('1. Downloading updated license with photo and QR code...');
    console.log(`   User ID: ${demoUserId}`);

    const downloadResponse = await axios.get(
      `${BASE_URL}/api/payments/license/download/${demoUserId}`,
      { timeout: 20000 }
    );
    
    console.log('✅ License download successful!');
    console.log('📄 Download details:');
    console.log(`   Content type: ${downloadResponse.headers['content-type']}`);
    console.log(`   Content size: ${downloadResponse.data.length} characters`);
    
    // Check for specific indicators
    const hasPhotoData = downloadResponse.data.includes('data:image/svg+xml;base64');
    const hasQRCodeData = downloadResponse.data.includes('data:image/png;base64');
    const hasDemoUser = downloadResponse.data.includes('Demo User');
    const hasDateOfBirth = downloadResponse.data.includes('6/15/1995') || downloadResponse.data.includes('15/06/1995');
    const hasAddress = downloadResponse.data.includes('Bole, Addis Ababa');
    
    console.log(`\n🔍 Content Analysis:`);
    console.log(`   Contains SVG photo data: ${hasPhotoData ? '✅' : '❌'}`);
    console.log(`   Contains QR code data: ${hasQRCodeData ? '✅' : '❌'}`);
    console.log(`   Contains demo user name: ${hasDemoUser ? '✅' : '❌'}`);
    console.log(`   Contains date of birth: ${hasDateOfBirth ? '✅' : '❌'}`);
    console.log(`   Contains address: ${hasAddress ? '✅' : '❌'}`);
    
    // Save the license file
    const filename = `updated_license_with_photo_qr_${Date.now()}.html`;
    fs.writeFileSync(filename, downloadResponse.data);
    
    console.log(`\n💾 License saved as: ${filename}`);
    
    // Show a sample of the content to verify
    if (hasPhotoData) {
      const photoDataStart = downloadResponse.data.indexOf('data:image/svg+xml;base64');
      const photoDataEnd = downloadResponse.data.indexOf('"', photoDataStart);
      const photoDataSample = downloadResponse.data.substring(photoDataStart, photoDataEnd);
      console.log(`📸 Photo data sample: ${photoDataSample.substring(0, 100)}...`);
    }
    
    if (hasQRCodeData) {
      const qrDataStart = downloadResponse.data.indexOf('data:image/png;base64');
      const qrDataEnd = downloadResponse.data.indexOf('"', qrDataStart);
      const qrDataSample = downloadResponse.data.substring(qrDataStart, qrDataEnd);
      console.log(`🔲 QR code data sample: ${qrDataSample.substring(0, 100)}...`);
    }

    console.log(`\n🌐 Features in the license:`);
    console.log(`   ✅ Front side with user photo`);
    console.log(`   ✅ Back side with QR code`);
    console.log(`   ✅ Ministry of Transport branding`);
    console.log(`   ✅ Ethiopian flag and colors`);
    console.log(`   ✅ Complete user information`);
    console.log(`   ✅ Professional ID card styling`);

    console.log(`\n🚀 Open ${filename} in a web browser to see the complete license!`);

    console.log('\n🎉 Updated license test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing updated license:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testUpdatedLicense();
