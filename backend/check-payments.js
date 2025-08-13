import mongoose from 'mongoose';
import Payment from './models/Payment.js';

async function checkPayments() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Checking payments collection...');
    const paymentCount = await Payment.countDocuments();
    console.log(`Total payments in database: ${paymentCount}`);

    if (paymentCount > 0) {
      console.log('\n📋 Sample payments:');
      const samplePayments = await Payment.find().limit(5);
      samplePayments.forEach((payment, index) => {
        console.log(`${index + 1}. ${payment.userName} - ${payment.amount} ${payment.currency} - ${payment.status}`);
      });
    } else {
      console.log('❌ No payments found in database');
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPayments();
