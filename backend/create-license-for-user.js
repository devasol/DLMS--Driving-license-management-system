import mongoose from 'mongoose';
import User from './models/User.js';
import License from './models/License.js';

async function createLicenseForUser(userEmail) {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({
      $or: [
        { email: userEmail },
        { user_email: userEmail }
      ]
    });

    if (!user) {
      console.log(`❌ User not found with email: ${userEmail}`);
      return;
    }

    console.log(`👤 Found user: ${user.fullName || user.full_name} (${user._id})`);

    // Check if user already has a license
    const existingLicense = await License.findOne({ userId: user._id });
    if (existingLicense) {
      console.log(`✅ User already has license: ${existingLicense.number}`);
      console.log(`📊 Status: ${existingLicense.status}`);
      console.log(`📅 Issue Date: ${existingLicense.issueDate}`);
      console.log(`⏰ Expiry Date: ${existingLicense.expiryDate}`);
      return;
    }

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

  } catch (error) {
    console.error('❌ Error creating license:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Get email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('❌ Please provide user email as argument');
  console.log('Usage: node create-license-for-user.js user@example.com');
  process.exit(1);
}

createLicenseForUser(userEmail);
