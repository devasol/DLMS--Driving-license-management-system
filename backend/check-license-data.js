import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkLicenseData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('🔗 Connected to MongoDB');
    
    // Import License model
    const License = (await import('./models/License.js')).default;
    
    const userId = '67fc0dbe24455fbc9dae1d0d';
    
    console.log('🔍 Checking license data in database...\n');
    
    const license = await License.findOne({ userId });
    
    if (license) {
      console.log('✅ License found in database:');
      console.log('   ID:', license._id);
      console.log('   Number:', license.number);
      console.log('   Class:', license.class);
      console.log('   Status:', license.status);
      console.log('   Issue Date:', license.issueDate);
      console.log('   Expiry Date:', license.expiryDate);
      console.log('   User Name:', license.userName);
      console.log('   User Email:', license.userEmail);
      console.log('');
      console.log('📋 Raw license object:');
      console.log(JSON.stringify(license, null, 2));
      
      // Check if fields exist
      console.log('\n🔍 Field existence check:');
      console.log('   class exists:', license.class !== undefined);
      console.log('   issueDate exists:', license.issueDate !== undefined);
      console.log('   expiryDate exists:', license.expiryDate !== undefined);
      console.log('   class value:', license.class);
      console.log('   issueDate value:', license.issueDate);
      console.log('   expiryDate value:', license.expiryDate);
      
    } else {
      console.log('❌ No license found for user:', userId);
    }
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

checkLicenseData();
