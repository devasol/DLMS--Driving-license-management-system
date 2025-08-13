import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';
import License from './models/License.js';

const BASE_URL = 'http://localhost:5004';

async function testLicenseAPI() {
  console.log('🧪 Testing License API and Database...\n');

  try {
    // Connect to database to check data directly
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB\n');

    // 1. Check what's in the database
    console.log('📊 DATABASE CHECK:');
    const totalUsers = await User.countDocuments();
    const totalLicenses = await License.countDocuments();
    console.log(`👥 Total users: ${totalUsers}`);
    console.log(`🎫 Total licenses: ${totalLicenses}\n`);

    // 2. Find all licenses and their details
    console.log('🎫 ALL LICENSES IN DATABASE:');
    const allLicenses = await License.find({}).select('userId userName userEmail number status issueDate expiryDate');
    
    if (allLicenses.length === 0) {
      console.log('❌ No licenses found in database!');
      console.log('💡 This explains why users see "No License" message');
      console.log('📝 You need to create licenses for users who completed the process\n');
    } else {
      allLicenses.forEach((license, index) => {
        console.log(`${index + 1}. License: ${license.number}`);
        console.log(`   👤 User: ${license.userName}`);
        console.log(`   📧 Email: ${license.userEmail}`);
        console.log(`   🆔 User ID: ${license.userId}`);
        console.log(`   📊 Status: ${license.status}`);
        console.log(`   📅 Issue: ${license.issueDate}`);
        console.log(`   ⏰ Expiry: ${license.expiryDate}\n`);
      });
    }

    // 3. Test API for each license
    if (allLicenses.length > 0) {
      console.log('🔍 TESTING API FOR EACH LICENSE:');
      
      for (const license of allLicenses) {
        console.log(`\n🧪 Testing API for user: ${license.userName} (${license.userId})`);
        
        try {
          const response = await axios.get(
            `${BASE_URL}/api/license/status?userId=${license.userId}`,
            { timeout: 10000 }
          );

          console.log('✅ API Response:', {
            success: response.data.success,
            hasLicense: response.data.hasLicense,
            number: response.data.number,
            status: response.data.status,
            userName: response.data.userName
          });

        } catch (error) {
          console.log('❌ API Error:', error.response?.data?.message || error.message);
        }
      }
    }

    // 4. Test with a random user ID to see what happens
    console.log('\n🧪 TESTING WITH RANDOM USER ID:');
    try {
      const response = await axios.get(
        `${BASE_URL}/api/license/status?userId=507f1f77bcf86cd799439011`,
        { timeout: 5000 }
      );
      console.log('Response for random ID:', response.data);
    } catch (error) {
      console.log('Expected error for random ID:', error.response?.data?.message || error.message);
    }

    // 5. Check if there are users without licenses
    console.log('\n👥 USERS WITHOUT LICENSES:');
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
      },
      {
        $project: {
          fullName: 1,
          full_name: 1,
          email: 1,
          user_email: 1
        }
      }
    ]);

    if (usersWithoutLicenses.length > 0) {
      console.log(`Found ${usersWithoutLicenses.length} users without licenses:`);
      usersWithoutLicenses.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName || user.full_name} (${user.email || user.user_email})`);
      });
    } else {
      console.log('All users have licenses');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testLicenseAPI();
