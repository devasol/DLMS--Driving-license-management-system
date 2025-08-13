import mongoose from 'mongoose';
import User from './models/User.js';
import License from './models/License.js';

async function debugLicenseIssue() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 DEBUGGING LICENSE ISSUE\n');

    // 1. Check total users and licenses
    const totalUsers = await User.countDocuments();
    const totalLicenses = await License.countDocuments();
    
    console.log(`👥 Total users in database: ${totalUsers}`);
    console.log(`🎫 Total licenses in database: ${totalLicenses}`);

    // 2. Find test users
    const testUsers = await User.find({
      email: { $regex: /@test\.com$/ }
    }).select('_id fullName full_name email user_email');

    console.log(`\n🧪 Test users found: ${testUsers.length}`);
    
    for (const user of testUsers) {
      console.log(`\n👤 User: ${user.fullName || user.full_name}`);
      console.log(`   📧 Email: ${user.email || user.user_email}`);
      console.log(`   🆔 ID: ${user._id}`);
      
      // Check if this user has a license
      const license = await License.findOne({ userId: user._id });
      
      if (license) {
        console.log(`   ✅ License found: ${license.number}`);
        console.log(`   📊 Status: ${license.status}`);
        console.log(`   📅 Issue Date: ${license.issueDate}`);
        console.log(`   ⏰ Expiry Date: ${license.expiryDate}`);
        console.log(`   🚗 Class: ${license.class}`);
      } else {
        console.log(`   ❌ No license found for this user`);
        
        // Check if there are any licenses with similar user data
        const licenseByEmail = await License.findOne({ 
          userEmail: user.email || user.user_email 
        });
        
        if (licenseByEmail) {
          console.log(`   🔍 Found license by email: ${licenseByEmail.number}`);
          console.log(`   ⚠️  But userId mismatch: ${licenseByEmail.userId} vs ${user._id}`);
        }
      }
    }

    // 3. Check all licenses and their user associations
    console.log(`\n🎫 ALL LICENSES IN DATABASE:`);
    const allLicenses = await License.find({}).select('userId userName userEmail number status');
    
    for (const license of allLicenses) {
      console.log(`\n📄 License: ${license.number}`);
      console.log(`   👤 User Name: ${license.userName}`);
      console.log(`   📧 User Email: ${license.userEmail}`);
      console.log(`   🆔 User ID: ${license.userId}`);
      console.log(`   📊 Status: ${license.status}`);
      
      // Check if the user still exists
      const userExists = await User.findById(license.userId);
      console.log(`   👤 User exists: ${userExists ? 'Yes' : 'No'}`);
    }

    // 4. Check for any data inconsistencies
    console.log(`\n🔍 CHECKING FOR INCONSISTENCIES:`);
    
    // Find licenses with non-existent users
    const licensesWithoutUsers = await License.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: {
          user: { $size: 0 }
        }
      }
    ]);
    
    console.log(`❌ Licenses with non-existent users: ${licensesWithoutUsers.length}`);
    
    // Find users without licenses
    const usersWithoutLicenses = await User.aggregate([
      {
        $lookup: {
          from: 'licenses',
          localField: '_id',
          foreignField: 'userId',
          as: 'license'
        }
      },
      {
        $match: {
          license: { $size: 0 }
        }
      }
    ]);
    
    console.log(`📋 Users without licenses: ${usersWithoutLicenses.length}`);

    // 5. Test the API endpoint logic
    console.log(`\n🧪 TESTING API ENDPOINT LOGIC:`);
    
    if (testUsers.length > 0) {
      const testUser = testUsers[0];
      console.log(`\nTesting with user: ${testUser.fullName || testUser.full_name} (${testUser._id})`);
      
      // Simulate the API call
      const userId = testUser._id.toString();
      console.log(`🔍 Searching for license with userId: ${userId}`);
      console.log(`🔍 ObjectId valid: ${mongoose.Types.ObjectId.isValid(userId)}`);
      
      const license = await License.findOne({ userId: testUser._id });
      console.log(`🎫 License found: ${license ? `Yes - ${license.number}` : 'No'}`);
      
      if (!license) {
        // Try different search methods
        const licenseByString = await License.findOne({ userId: userId });
        console.log(`🔍 License by string: ${licenseByString ? 'Yes' : 'No'}`);
        
        const licenseByEmail = await License.findOne({ userEmail: testUser.email || testUser.user_email });
        console.log(`🔍 License by email: ${licenseByEmail ? 'Yes' : 'No'}`);
      }
    }

    console.log('\n✅ Debug completed!');

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the debug
debugLicenseIssue();
