import mongoose from 'mongoose';
import User from './models/User.js';
import License from './models/License.js';

async function quickFixLicense() {
  try {
    console.log('🔧 QUICK LICENSE FIX...\n');

    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Get user ID from localStorage or command line
    let targetUserId = process.argv[2];
    
    if (!targetUserId) {
      console.log('❌ Please provide user ID as argument');
      console.log('Usage: node quick-fix-license.js USER_ID');
      console.log('\nOr find user by email:');
      
      // Show available users
      const users = await User.find({}).select('_id fullName full_name email user_email').limit(5);
      console.log('\n👥 Available users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName || user.full_name} (${user.email || user.user_email})`);
        console.log(`   ID: ${user._id}\n`);
      });
      
      return;
    }

    console.log(`\n🔍 Looking for user: ${targetUserId}`);

    // Find the user
    let user;
    if (mongoose.Types.ObjectId.isValid(targetUserId)) {
      user = await User.findById(targetUserId);
    } else {
      // Try to find by email
      user = await User.findOne({
        $or: [
          { email: targetUserId },
          { user_email: targetUserId }
        ]
      });
    }

    if (!user) {
      console.log(`❌ User not found: ${targetUserId}`);
      return;
    }

    console.log(`👤 Found user: ${user.fullName || user.full_name} (${user._id})`);
    console.log(`📧 Email: ${user.email || user.user_email}`);

    // Check if user already has a license
    const existingLicense = await License.findOne({ userId: user._id });
    if (existingLicense) {
      console.log(`\n✅ User already has license: ${existingLicense.number}`);
      console.log(`📊 Status: ${existingLicense.status}`);
      console.log(`📅 Issue Date: ${existingLicense.issueDate?.toDateString()}`);
      console.log(`⏰ Expiry Date: ${existingLicense.expiryDate?.toDateString()}`);
      
      console.log('\n🧪 Testing API lookup...');
      // Test if API can find this license
      const testLookup1 = await License.findOne({ userId: user._id });
      const testLookup2 = await License.findOne({ userId: user._id.toString() });
      const testLookup3 = await License.findOne({ userEmail: user.email || user.user_email });
      
      console.log(`Direct lookup: ${testLookup1 ? 'Found' : 'Not found'}`);
      console.log(`String lookup: ${testLookup2 ? 'Found' : 'Not found'}`);
      console.log(`Email lookup: ${testLookup3 ? 'Found' : 'Not found'}`);
      
      return;
    }

    console.log('\n🎫 Creating new license...');

    // Generate license number
    const year = new Date().getFullYear();
    const count = await License.countDocuments();
    const licenseNumber = `ETH-${year}-${String(count + 1).padStart(6, '0')}`;

    // Create license
    const issueDate = new Date();
    const expiryDate = new Date(issueDate.getTime() + (5 * 365 * 24 * 60 * 60 * 1000)); // 5 years

    const license = new License({
      userId: user._id,
      userName: user.fullName || user.full_name,
      userEmail: user.email || user.user_email,
      number: licenseNumber,
      class: 'B', // Default class
      issueDate: issueDate,
      expiryDate: expiryDate,
      status: 'Valid',
      restrictions: 'None',
      points: 0,
      maxPoints: 12,
      theoryExamResult: {
        examId: new mongoose.Types.ObjectId(),
        score: 85,
        dateTaken: new Date(issueDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      practicalExamResult: {
        examId: new mongoose.Types.ObjectId(),
        score: 90,
        dateTaken: new Date(issueDate.getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      paymentId: new mongoose.Types.ObjectId(),
      issuedBy: new mongoose.Types.ObjectId()
    });

    await license.save();

    console.log('🎉 License created successfully!');
    console.log(`📄 License Number: ${license.number}`);
    console.log(`👤 User: ${license.userName}`);
    console.log(`📧 Email: ${license.userEmail}`);
    console.log(`🚗 Class: ${license.class}`);
    console.log(`📅 Issue Date: ${license.issueDate.toDateString()}`);
    console.log(`⏰ Expiry Date: ${license.expiryDate.toDateString()}`);
    console.log(`📊 Status: ${license.status}`);

    console.log('\n🧪 Testing license lookup...');
    const testLookup = await License.findOne({ userId: user._id });
    console.log(`Lookup test: ${testLookup ? 'SUCCESS' : 'FAILED'}`);

    console.log('\n✅ DONE! Now:');
    console.log('1. Restart your backend server');
    console.log('2. Login to the dashboard');
    console.log('3. Check the License Status section');
    console.log('4. Should show the new license information');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
quickFixLicense();
