import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import License from './models/License.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms';

async function checkRealLicenseData() {
  try {
    console.log('🔍 Checking Real License Data in Database...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users in database:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user._id}`);
      console.log(`     Name: ${user.fullName || user.full_name || user.firstName || 'No name'}`);
      console.log(`     Email: ${user.email || user.user_email || 'No email'}`);
      console.log('');
    });

    // 2. Check all licenses
    const licenses = await License.find({});
    console.log(`📄 Found ${licenses.length} licenses in database:`);
    
    if (licenses.length === 0) {
      console.log('❌ No licenses found in database!\n');
      
      // Let's create a real license for the current user
      if (users.length > 0) {
        const firstUser = users[0];
        console.log(`🔧 Creating a real license for user: ${firstUser.fullName || firstUser.full_name || 'User'}`);
        
        const licenseNumber = `ETH-${new Date().getFullYear()}-${String(1).padStart(6, '0')}`;
        const issueDate = new Date();
        const expiryDate = new Date(issueDate.getTime() + (5 * 365 * 24 * 60 * 60 * 1000)); // 5 years

        const newLicense = new License({
          userId: firstUser._id,
          userName: firstUser.fullName || firstUser.full_name || firstUser.firstName || 'User',
          userEmail: firstUser.email || firstUser.user_email || 'user@example.com',
          number: licenseNumber,
          class: 'B',
          issueDate: issueDate,
          expiryDate: expiryDate,
          status: 'Valid',
          restrictions: 'None',
          points: 0,
          maxPoints: 12,
          theoryExamResult: {
            examId: new mongoose.Types.ObjectId(),
            score: 85,
            dateTaken: new Date(issueDate.getTime() - 30 * 24 * 60 * 60 * 1000)
          },
          practicalExamResult: {
            examId: new mongoose.Types.ObjectId(),
            score: 90,
            dateTaken: new Date(issueDate.getTime() - 15 * 24 * 60 * 60 * 1000)
          },
          paymentId: new mongoose.Types.ObjectId(),
          issuedBy: new mongoose.Types.ObjectId()
        });

        await newLicense.save();
        console.log(`✅ Created real license: ${licenseNumber} for user ${newLicense.userName}`);
        console.log(`   User ID: ${firstUser._id}`);
        console.log(`   License Status: ${newLicense.status}`);
        console.log(`   Issue Date: ${newLicense.issueDate.toDateString()}`);
        console.log(`   Expiry Date: ${newLicense.expiryDate.toDateString()}\n`);
      }
    } else {
      licenses.forEach((license, index) => {
        console.log(`  ${index + 1}. License: ${license.number}`);
        console.log(`     User ID: ${license.userId}`);
        console.log(`     User Name: ${license.userName}`);
        console.log(`     Status: ${license.status}`);
        console.log(`     Class: ${license.class}`);
        console.log(`     Issue Date: ${license.issueDate ? license.issueDate.toDateString() : 'N/A'}`);
        console.log(`     Expiry Date: ${license.expiryDate ? license.expiryDate.toDateString() : 'N/A'}`);
        console.log('');
      });
    }

    // 3. Test license lookup for each user
    console.log('🧪 Testing license lookup for each user:');
    for (const user of users) {
      console.log(`\n  Testing user: ${user.fullName || user.full_name || 'User'} (ID: ${user._id})`);
      
      // Try different search methods
      let license = await License.findOne({ userId: user._id });
      if (license) {
        console.log(`    ✅ Found license: ${license.number} (Status: ${license.status})`);
      } else {
        console.log(`    ❌ No license found for this user`);
      }
    }

    console.log('\n📋 Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Total Licenses: ${licenses.length}`);
    console.log(`   Users with Licenses: ${licenses.length}`);
    console.log(`   Users without Licenses: ${users.length - licenses.length}`);

    if (users.length > 0 && licenses.length > 0) {
      const firstUser = users[0];
      const userLicense = await License.findOne({ userId: firstUser._id });
      
      if (userLicense) {
        console.log('\n🎯 Test this in your frontend:');
        console.log(`   User ID: ${firstUser._id}`);
        console.log(`   Expected License: ${userLicense.number}`);
        console.log(`   Expected Status: ${userLicense.status}`);
        console.log(`   API URL: http://localhost:5004/api/license/status?userId=${firstUser._id}`);
      }
    }

    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkRealLicenseData();
