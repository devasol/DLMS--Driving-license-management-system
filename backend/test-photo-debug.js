import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5004';

async function testPhotoDebug() {
  console.log('🔍 Testing Photo Debug in License...\n');

  try {
    // Demo user details
    const demoUserId = '683aebf5ca508be044c69410';

    console.log('1. Downloading license and checking for photo...');
    console.log(`   User ID: ${demoUserId}`);

    const downloadResponse = await axios.get(
      `${BASE_URL}/api/payments/license/download/${demoUserId}`,
      { timeout: 20000 }
    );
    
    console.log('✅ License download successful!');
    console.log(`📄 Content size: ${downloadResponse.data.length} characters`);
    
    // Search for different photo indicators
    const searches = [
      'data:image/svg+xml',
      'data:image/',
      'profilePicture',
      'user-photo',
      'photo-placeholder',
      'Demo User',
      'DEMO USER',
      'demo-user',
      'svg',
      'base64'
    ];
    
    console.log('\n🔍 Searching for photo indicators:');
    searches.forEach(search => {
      const found = downloadResponse.data.includes(search);
      const count = (downloadResponse.data.match(new RegExp(search, 'g')) || []).length;
      console.log(`   "${search}": ${found ? '✅' : '❌'} (${count} occurrences)`);
    });
    
    // Look for the photo section specifically
    const photoSectionStart = downloadResponse.data.indexOf('<div class="photo-section">');
    if (photoSectionStart !== -1) {
      const photoSectionEnd = downloadResponse.data.indexOf('</div>', photoSectionStart + 200);
      const photoSection = downloadResponse.data.substring(photoSectionStart, photoSectionEnd + 6);
      console.log('\n📸 Photo section content:');
      console.log(photoSection);
    } else {
      console.log('\n❌ Photo section not found');
    }
    
    // Look for user-photo div specifically
    const userPhotoStart = downloadResponse.data.indexOf('<div class="user-photo">');
    if (userPhotoStart !== -1) {
      const userPhotoEnd = downloadResponse.data.indexOf('</div>', userPhotoStart + 50);
      const userPhotoContent = downloadResponse.data.substring(userPhotoStart, userPhotoEnd + 6);
      console.log('\n👤 User photo div content:');
      console.log(userPhotoContent);
    } else {
      console.log('\n❌ User photo div not found');
    }

    // Save a debug version
    const filename = `debug_license_${Date.now()}.html`;
    fs.writeFileSync(filename, downloadResponse.data);
    console.log(`\n💾 Debug license saved as: ${filename}`);

    console.log('\n🎉 Photo debug test completed!');

  } catch (error) {
    console.error('❌ Error in photo debug test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPhotoDebug();
