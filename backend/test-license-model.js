import mongoose from 'mongoose';
import License from './models/License.js';

async function testLicenseModel() {
  try {
    console.log('🧪 Testing License Model...\n');
    
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a simple license with all required fields
    console.log('\n1. Testing license creation with all fields...');
    
    const testLicense = new License({
      userId: new mongoose.Types.ObjectId(),
      userName: 'Test User',
      userEmail: 'test@example.com',
      number: 'ETH-2025-000001',
      class: 'B',
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + (5 * 365 * 24 * 60 * 60 * 1000)),
      theoryExamResult: {
        examId: new mongoose.Types.ObjectId(),
        score: 88,
        dateTaken: new Date()
      },
      practicalExamResult: {
        examId: new mongoose.Types.ObjectId(),
        score: 92,
        dateTaken: new Date()
      },
      paymentId: new mongoose.Types.ObjectId(),
      issuedBy: new mongoose.Types.ObjectId()
    });

    console.log('📋 License data before save:', {
      number: testLicense.number,
      issueDate: testLicense.issueDate,
      expiryDate: testLicense.expiryDate,
      userName: testLicense.userName
    });

    await testLicense.save();
    console.log('✅ License created successfully:', testLicense.number);

    // Test 2: Test without explicit number and expiryDate (should use pre-save hook)
    console.log('\n2. Testing license creation with pre-save hook...');
    
    const testLicense2 = new License({
      userId: new mongoose.Types.ObjectId(),
      userName: 'Test User 2',
      userEmail: 'test2@example.com',
      class: 'B',
      issueDate: new Date(),
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

    console.log('📋 License data before save (no number/expiry):', {
      number: testLicense2.number,
      issueDate: testLicense2.issueDate,
      expiryDate: testLicense2.expiryDate,
      userName: testLicense2.userName
    });

    await testLicense2.save();
    console.log('✅ License created with pre-save hook:', testLicense2.number);

    // Clean up test data
    await License.deleteMany({ userName: { $in: ['Test User', 'Test User 2'] } });
    console.log('🧹 Cleaned up test data');

    await mongoose.disconnect();
    console.log('\n🎉 License model test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing license model:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  }
}

testLicenseModel();
