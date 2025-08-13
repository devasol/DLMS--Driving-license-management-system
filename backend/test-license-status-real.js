import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import License from './models/License.js';

dotenv.config();

const BASE_URL = 'http://localhost:5004';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms';

async function testLicenseStatusReal() {
  try {
    console.log('🧪 Testing Real License Status Endpoint...\n');

    // First, connect to database to get real user data
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a real user from the database
    const users = await User.find({}).limit(3);
    console.log(`📊 Found ${users.length} users in database\n`);

    if (users.length === 0) {
      console.log('❌ No users found in database. Please register a user first.');
      return;
    }

    // Test with each user
    for (const user of users) {
      const userId = user._id.toString();
      const userName = user.fullName || user.full_name || user.firstName || 'Unknown';
      const userEmail = user.email || user.user_email || 'unknown@example.com';

      console.log(`🔍 Testing user: ${userName} (ID: ${userId})`);

      // Check if user has a license in database
      const license = await License.findOne({ userId: user._id });
      console.log(`   Database license: ${license ? `${license.number} (${license.status})` : 'None'}`);

      // Test the API endpoint
      try {
        console.log(`   Testing API: GET /api/license/status?userId=${userId}`);
        
        const response = await axios.get(
          `${BASE_URL}/api/license/status?userId=${userId}&userEmail=${userEmail}`,
          { timeout: 10000 }
        );

        console.log(`   ✅ API Response:`, {
          success: response.data.success,
          hasLicense: response.data.hasLicense,
          number: response.data.number,
          status: response.data.status,
          userName: response.data.userName
        });

        // Compare database vs API response
        if (license && response.data.hasLicense) {
          console.log(`   ✅ Match: Database and API both show license`);
        } else if (!license && !response.data.hasLicense) {
          console.log(`   ✅ Match: Database and API both show no license`);
        } else {
          console.log(`   ⚠️  Mismatch: Database=${!!license}, API=${response.data.hasLicense}`);
        }

      } catch (apiError) {
        console.log(`   ❌ API Error:`, {
          status: apiError.response?.status,
          message: apiError.response?.data?.message || apiError.message
        });

        if (apiError.response?.data?.message?.includes('not implemented')) {
          console.log(`   🔧 The license status endpoint is not properly implemented`);
        }
      }

      console.log(''); // Empty line for readability
    }

    // Test health endpoint
    console.log('🏥 Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
      console.log('   ✅ Health check passed:', healthResponse.data);
    } catch (healthError) {
      console.log('   ❌ Health check failed:', healthError.message);
      console.log('   🔧 Backend server may not be running on port 5004');
    }

    console.log('\n📋 Summary:');
    console.log('1. If API returns "not implemented" - backend server needs restart');
    console.log('2. If API returns 404 - routes not properly configured');
    console.log('3. If API returns license data - everything is working!');
    console.log('4. If no licenses in database - need to create licenses for users');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testLicenseStatusReal();
