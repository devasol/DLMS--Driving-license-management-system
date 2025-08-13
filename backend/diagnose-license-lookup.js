import mongoose from 'mongoose';
import User from './models/User.js';
import License from './models/License.js';
import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function diagnoseLicenseLookup() {
  try {
    console.log('🔍 DIAGNOSING LICENSE LOOKUP ISSUE...\n');

    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB\n');

    // 1. Check what's in the database
    console.log('📊 DATABASE ANALYSIS:');
    const totalUsers = await User.countDocuments();
    const totalLicenses = await License.countDocuments();
    console.log(`👥 Total users: ${totalUsers}`);
    console.log(`🎫 Total licenses: ${totalLicenses}\n`);

    if (totalLicenses === 0) {
      console.log('❌ NO LICENSES FOUND IN DATABASE!');
      console.log('This explains why users see "No License" status.\n');
      
      // Create a test license
      const testUser = await User.findOne({});
      if (testUser) {
        console.log('🎫 Creating a test license...');
        
        const year = new Date().getFullYear();
        const count = await License.countDocuments();
        const licenseNumber = `ETH-${year}-${String(count + 1).padStart(6, '0')}`;

        const testLicense = new License({
          userId: testUser._id,
          userName: testUser.fullName || testUser.full_name || 'Test User',
          userEmail: testUser.email || testUser.user_email || 'test@example.com',
          number: licenseNumber,
          class: 'B',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + (5 * 365 * 24 * 60 * 60 * 1000)),
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
        console.log(`✅ Created test license: ${licenseNumber}`);
        console.log(`👤 For user: ${testUser.fullName || testUser.full_name} (${testUser._id})\n`);
      }
    }

    // 2. Analyze all licenses
    console.log('🎫 ALL LICENSES IN DATABASE:');
    const allLicenses = await License.find({}).select('userId userName userEmail number status issueDate expiryDate');
    
    allLicenses.forEach((license, index) => {
      console.log(`${index + 1}. License: ${license.number}`);
      console.log(`   👤 User: ${license.userName}`);
      console.log(`   📧 Email: ${license.userEmail}`);
      console.log(`   🆔 User ID: ${license.userId}`);
      console.log(`   📊 Status: ${license.status}`);
      console.log(`   📅 Issue: ${license.issueDate?.toDateString()}`);
      console.log(`   ⏰ Expiry: ${license.expiryDate?.toDateString()}\n`);
    });

    // 3. Test API lookup for each license
    console.log('🧪 TESTING API LOOKUP FOR EACH LICENSE:');
    
    for (const license of allLicenses) {
      console.log(`\n🔍 Testing API for license: ${license.number}`);
      console.log(`   User ID: ${license.userId}`);
      console.log(`   User Name: ${license.userName}`);
      
      try {
        // Test with userId
        const response = await axios.get(
          `${BASE_URL}/api/license/status?userId=${license.userId}`,
          { timeout: 10000 }
        );

        console.log('   ✅ API Response:', {
          success: response.data.success,
          hasLicense: response.data.hasLicense,
          number: response.data.number,
          status: response.data.status,
          userName: response.data.userName
        });

        if (!response.data.success || !response.data.hasLicense) {
          console.log('   ⚠️  API says no license found, but license exists in DB!');
          
          // Test with email as well
          if (license.userEmail) {
            console.log('   🔍 Testing with email parameter...');
            const emailResponse = await axios.get(
              `${BASE_URL}/api/license/status?userId=${license.userId}&userEmail=${license.userEmail}`,
              { timeout: 5000 }
            );
            console.log('   📧 Email response:', {
              success: emailResponse.data.success,
              hasLicense: emailResponse.data.hasLicense
            });
          }
        }

      } catch (error) {
        console.log('   ❌ API Error:', error.response?.data?.message || error.message);
        console.log('   📊 Error Status:', error.response?.status);
      }
    }

    // 4. Check for data type mismatches
    console.log('\n🔍 CHECKING FOR DATA TYPE ISSUES:');
    
    for (const license of allLicenses.slice(0, 2)) { // Check first 2 licenses
      console.log(`\nLicense: ${license.number}`);
      console.log(`User ID type: ${typeof license.userId}`);
      console.log(`User ID value: ${license.userId}`);
      console.log(`User ID toString: ${license.userId.toString()}`);
      
      // Check if user exists
      const user = await User.findById(license.userId);
      console.log(`User exists: ${user ? 'Yes' : 'No'}`);
      if (user) {
        console.log(`User name: ${user.fullName || user.full_name}`);
        console.log(`User email: ${user.email || user.user_email}`);
      }

      // Test different search methods
      console.log('\nTesting different search methods:');
      
      // Method 1: Direct ObjectId
      const method1 = await License.findOne({ userId: license.userId });
      console.log(`Method 1 (Direct): ${method1 ? 'Found' : 'Not found'}`);
      
      // Method 2: String conversion
      const method2 = await License.findOne({ userId: license.userId.toString() });
      console.log(`Method 2 (String): ${method2 ? 'Found' : 'Not found'}`);
      
      // Method 3: New ObjectId
      const method3 = await License.findOne({ userId: new mongoose.Types.ObjectId(license.userId) });
      console.log(`Method 3 (New ObjectId): ${method3 ? 'Found' : 'Not found'}`);
      
      // Method 4: Email search
      if (license.userEmail) {
        const method4 = await License.findOne({ userEmail: license.userEmail });
        console.log(`Method 4 (Email): ${method4 ? 'Found' : 'Not found'}`);
      }
    }

    console.log('\n✅ DIAGNOSIS COMPLETE!');
    console.log('\n📋 SUMMARY:');
    console.log(`- Total licenses in database: ${totalLicenses}`);
    console.log(`- API tests completed for all licenses`);
    console.log(`- Check the output above to see where the lookup is failing`);

  } catch (error) {
    console.error('❌ Diagnosis error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the diagnosis
diagnoseLicenseLookup();
