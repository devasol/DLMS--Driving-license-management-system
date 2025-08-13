import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import License from './models/License.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms';

async function debugLicenseStatus() {
  try {
    console.log('🔍 Debugging License Status...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check all users
    const users = await User.find({}).limit(5);
    console.log(`👥 Found ${users.length} users in database:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user._id}, Name: ${user.fullName || user.full_name}, Email: ${user.email || user.user_email}`);
    });

    // 2. Check all licenses
    const licenses = await License.find({});
    console.log(`\n📄 Found ${licenses.length} licenses in database:`);
    licenses.forEach((license, index) => {
      console.log(`  ${index + 1}. Number: ${license.number}, UserID: ${license.userId}, Status: ${license.status}, User: ${license.userName}`);
    });

    // 3. Check for orphaned licenses (licenses without matching users)
    console.log('\n🔍 Checking for license-user matches:');
    for (const license of licenses) {
      const user = await User.findById(license.userId);
      if (user) {
        console.log(`  ✅ License ${license.number} matches user ${user.fullName || user.full_name}`);
      } else {
        console.log(`  ❌ License ${license.number} has no matching user (UserID: ${license.userId})`);
      }
    }

    // 4. Check for users without licenses
    console.log('\n🔍 Checking for users without licenses:');
    for (const user of users) {
      const license = await License.findOne({ userId: user._id });
      if (license) {
        console.log(`  ✅ User ${user.fullName || user.full_name} has license ${license.number}`);
      } else {
        console.log(`  ❌ User ${user.fullName || user.full_name} (ID: ${user._id}) has no license`);
      }
    }

    // 5. Test the license status API logic for each user
    console.log('\n🧪 Testing license status logic:');
    for (const user of users.slice(0, 3)) { // Test first 3 users
      console.log(`\n  Testing user: ${user.fullName || user.full_name} (ID: ${user._id})`);
      
      // Try different search methods like the API does
      let license = null;
      
      // Method 1: Direct search
      license = await License.findOne({ userId: user._id });
      console.log(`    Method 1 (Direct): ${license ? `Found ${license.number}` : 'Not found'}`);
      
      // Method 2: ObjectId conversion
      if (!license && mongoose.Types.ObjectId.isValid(user._id)) {
        license = await License.findOne({ userId: new mongoose.Types.ObjectId(user._id) });
        console.log(`    Method 2 (ObjectId): ${license ? `Found ${license.number}` : 'Not found'}`);
      }
      
      // Method 3: String conversion
      if (!license) {
        license = await License.findOne({ userId: user._id.toString() });
        console.log(`    Method 3 (String): ${license ? `Found ${license.number}` : 'Not found'}`);
      }
      
      // Method 4: Email search
      if (!license && (user.email || user.user_email)) {
        license = await License.findOne({ userEmail: user.email || user.user_email });
        console.log(`    Method 4 (Email): ${license ? `Found ${license.number}` : 'Not found'}`);
      }
    }

    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugLicenseStatus();
