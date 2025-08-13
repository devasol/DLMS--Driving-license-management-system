import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from './models/Payment.js';
import License from './models/License.js';

dotenv.config();

async function testAdmin400Error() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('🔗 Connected to MongoDB');
    
    console.log('🧪 Testing Admin 400 Error...\n');
    
    // Get the payment ID that's causing the 400 error
    const paymentId = '683bcf469a3b11a42d991c05'; // From the error log
    
    console.log('🔍 Investigating payment:', paymentId);
    
    // Check payment details
    const payment = await Payment.findById(paymentId).populate('userId');
    if (!payment) {
      console.log('❌ Payment not found');
      mongoose.disconnect();
      return;
    }
    
    console.log('📋 Payment Details:');
    console.log('   ID:', payment._id);
    console.log('   Status:', payment.status);
    console.log('   User:', payment.userName);
    console.log('   Amount:', payment.amount);
    console.log('   Created:', payment.createdAt);
    
    // Check if license already exists
    const existingLicense = await License.findOne({ userId: payment.userId._id });
    console.log('\n🎫 License Check:');
    if (existingLicense) {
      console.log('   ⚠️ License already exists!');
      console.log('   License Number:', existingLicense.number);
      console.log('   Status:', existingLicense.status);
      console.log('   Issue Date:', existingLicense.issueDate);
      console.log('   This is likely causing the 400 error!');
    } else {
      console.log('   ✅ No existing license found');
    }
    
    // Test the actual API call that's failing
    console.log('\n🚀 Testing actual API call...');
    
    const adminId = '68273f8345157821a5bd6e75'; // Valid admin ID
    
    try {
      const response = await axios.post(
        `http://localhost:5004/api/payments/license/issue/${paymentId}`,
        {
          adminId: adminId,
          adminNotes: 'Test license issuance from debug',
          licenseClass: 'B'
        }
      );
      
      console.log('✅ API Success:');
      console.log('   License Number:', response.data.license?.number);
      console.log('   Message:', response.data.message);
      
    } catch (error) {
      console.log('❌ API Error:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Details:', error.response?.data?.details);
      console.log('   Full Error:', error.response?.data);
      
      // Analyze the specific error
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message;
        
        if (errorMessage?.includes('already processed')) {
          console.log('\n🔍 ANALYSIS: Payment already processed');
          console.log('   This means the payment status is not "pending"');
          console.log('   Current status:', payment.status);
          
        } else if (errorMessage?.includes('already issued')) {
          console.log('\n🔍 ANALYSIS: License already issued');
          console.log('   This means a license already exists for this user');
          
        } else if (errorMessage?.includes('exam results')) {
          console.log('\n🔍 ANALYSIS: Missing exam results');
          console.log('   This is the original bug we fixed');
          
        } else {
          console.log('\n🔍 ANALYSIS: Unknown 400 error');
          console.log('   Need to investigate further');
        }
      }
    }
    
    // Check what the correct flow should be
    console.log('\n💡 SOLUTION:');
    if (existingLicense) {
      console.log('✅ License already exists - admin should see this in the UI');
      console.log('✅ No action needed - license was issued successfully before');
    } else if (payment.status !== 'verified') {
      console.log('⚠️ Payment needs to be verified first');
      console.log('   Current status:', payment.status);
      console.log('   Admin should verify payment before issuing license');
    } else {
      console.log('🔧 Payment is verified but no license exists');
      console.log('   This should work - investigating further...');
    }
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

testAdmin400Error();
