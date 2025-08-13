import mongoose from 'mongoose';
import User from './models/User.js';
import License from './models/License.js';
import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function fixLicenseStatus() {
  try {
    console.log('🔧 Fixing License Status Issues...\n');

    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // 1. Check current state
    console.log('\n📊 CURRENT STATE:');
    const totalUsers = await User.countDocuments();
    const totalLicenses = await License.countDocuments();
    console.log(`👥 Total users: ${totalUsers}`);
    console.log(`🎫 Total licenses: ${totalLicenses}`);

    // 2. Find users without licenses
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

    console.log(`\n👥 Users without licenses: ${usersWithoutLicenses.length}`);

    // 3. Test API for existing licenses
    const allLicenses = await License.find({}).limit(3);
    console.log(`\n🧪 Testing API for existing licenses:`);

    for (const license of allLicenses) {
      console.log(`\nTesting license: ${license.number} (User: ${license.userId})`);
      
      try {
        const response = await axios.get(
          `${BASE_URL}/api/license/status?userId=${license.userId}`,
          { timeout: 5000 }
        );

        console.log('✅ API Response:', {
          success: response.data.success,
          hasLicense: response.data.hasLicense,
          number: response.data.number,
          status: response.data.status
        });

      } catch (error) {
        console.log('❌ API Error:', error.response?.data?.message || error.message);
      }
    }

    // 4. Create a test license if no licenses exist
    if (totalLicenses === 0) {
      console.log('\n🎫 No licenses found. Creating a test license...');
      
      const testUser = await User.findOne({});
      if (testUser) {
        const year = new Date().getFullYear();
        const licenseNumber = `ETH-${year}-000001`;

        const testLicense = new License({
          userId: testUser._id,
          userName: testUser.fullName || testUser.full_name || 'Test User',
          userEmail: testUser.email || testUser.user_email || 'test@example.com',
          number: licenseNumber,
          class: 'B',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + (5 * 365 * 24 * 60 * 60 * 1000)), // 5 years
          status: 'Valid',
          restrictions: 'None',
          points: 0,
          maxPoints: 12,
          theoryExamResult: {
            examId: new mongoose.Types.ObjectId(),
            score: 85,
            dateTaken: new Date()
          },
          practicalExamResult: {
            examId: new mongoose.Types.ObjectId(),
            score: 90,
            dateTaken: new Date()
          },
          paymentId: new mongoose.Types.ObjectId(),
          issuedBy: new mongoose.Types.ObjectId()
        });

        await testLicense.save();
        console.log(`✅ Created test license: ${licenseNumber} for user: ${testUser.fullName || testUser.full_name}`);

        // Test the API with the new license
        console.log('\n🧪 Testing API with new license:');
        try {
          const response = await axios.get(
            `${BASE_URL}/api/license/status?userId=${testUser._id}`,
            { timeout: 5000 }
          );

          console.log('✅ API Response for new license:', {
            success: response.data.success,
            hasLicense: response.data.hasLicense,
            number: response.data.number,
            status: response.data.status
          });

        } catch (error) {
          console.log('❌ API Error for new license:', error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n✅ License status fix completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Login to the user dashboard');
    console.log('3. Check the License Status section');
    console.log('4. Should show license information or clean "No License" status');

  } catch (error) {
    console.error('❌ Error fixing license status:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixLicenseStatus();
