import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import License from './models/License.js';
import axios from 'axios';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms';
const BASE_URL = 'http://localhost:5004';

async function fixLicenseStatusIssue() {
  try {
    console.log('🔧 Fixing License Status Issue...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check if there are any users and licenses
    const userCount = await User.countDocuments();
    const licenseCount = await License.countDocuments();
    
    console.log(`👥 Users in database: ${userCount}`);
    console.log(`📄 Licenses in database: ${licenseCount}\n`);

    if (userCount === 0) {
      console.log('❌ No users found in database. Please register a user first.');
      return;
    }

    // 2. Get the first user (or you can specify a specific user ID)
    const firstUser = await User.findOne({});
    console.log(`🔍 Testing with user: ${firstUser.fullName || firstUser.full_name} (ID: ${firstUser._id})\n`);

    // 3. Check if this user has a license
    let license = await License.findOne({ userId: firstUser._id });
    
    if (!license) {
      console.log('❌ No license found for this user. Creating a test license...\n');
      
      // Create a test license
      const licenseNumber = `ETH-${new Date().getFullYear()}-${String(licenseCount + 1).padStart(6, '0')}`;
      const issueDate = new Date();
      const expiryDate = new Date(issueDate.getTime() + (5 * 365 * 24 * 60 * 60 * 1000)); // 5 years

      license = new License({
        userId: firstUser._id,
        userName: firstUser.fullName || firstUser.full_name,
        userEmail: firstUser.email || firstUser.user_email,
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

      await license.save();
      console.log(`✅ Created test license: ${license.number} for user ${license.userName}\n`);
    } else {
      console.log(`✅ License found: ${license.number} for user ${license.userName}\n`);
    }

    // 4. Test the license status API endpoint
    console.log('🧪 Testing license status API endpoint...\n');
    
    try {
      const response = await axios.get(
        `${BASE_URL}/api/license/status?userId=${firstUser._id}`,
        { timeout: 10000 }
      );

      console.log('✅ API Response:', {
        success: response.data.success,
        hasLicense: response.data.hasLicense,
        number: response.data.number,
        status: response.data.status,
        userName: response.data.userName,
        issueDate: response.data.issueDate,
        expiryDate: response.data.expiryDate
      });

    } catch (error) {
      console.log('❌ API Error:', error.response?.data || error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('\n⚠️  Backend server is not running. Please start the backend server first:');
        console.log('   cd backend && npm start\n');
      }
    }

    // 5. Show instructions for frontend testing
    console.log('\n📋 To test in frontend:');
    console.log(`   1. Make sure you're logged in as user: ${firstUser.fullName || firstUser.full_name}`);
    console.log(`   2. User ID should be: ${firstUser._id}`);
    console.log(`   3. Check localStorage in browser console:`);
    console.log(`      localStorage.getItem('userId') should return: ${firstUser._id}`);
    console.log(`   4. The license status should now show: ${license.status} (${license.number})\n`);

    console.log('✅ Fix complete!');
    
  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixLicenseStatusIssue();
