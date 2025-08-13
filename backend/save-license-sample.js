import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5004';

async function saveLicenseSample() {
  console.log('💾 Saving License Sample...\n');

  try {
    // Get existing licenses
    console.log('1. Getting existing licenses...');
    const licensesResponse = await axios.get(`${BASE_URL}/api/payments/licenses`);
    
    if (licensesResponse.data.count > 0) {
      const license = licensesResponse.data.licenses[0];
      const userId = license.userId._id || license.userId;
      
      console.log(`📋 Found license: ${license.number} for ${license.userName}`);
      
      // Download license
      console.log('\n2. Downloading license...');
      const downloadResponse = await axios.get(
        `${BASE_URL}/api/payments/license/download/${userId}`,
        { timeout: 10000 }
      );
      
      // Save to file
      const filename = `sample_license_${license.number.replace(/-/g, '_')}.html`;
      fs.writeFileSync(filename, downloadResponse.data);
      
      console.log(`✅ License saved as: ${filename}`);
      console.log(`📄 File size: ${downloadResponse.data.length} characters`);
      console.log(`🌐 Open the file in a web browser to see the realistic ID card design!`);
      
    } else {
      console.log('❌ No licenses found');
    }

    console.log('\n🎉 License sample saved!');

  } catch (error) {
    console.error('❌ Error saving license sample:', error.message);
  }
}

saveLicenseSample();
