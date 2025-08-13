import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

async function checkDemoUser() {
  console.log('🔍 Checking Demo User Status...\n');

  try {
    // Check all payments
    console.log('1. Checking all payments...');
    const paymentsResponse = await axios.get(`${BASE_URL}/api/payments/all`);
    
    if (paymentsResponse.data.success) {
      console.log(`✅ Found ${paymentsResponse.data.count} total payments`);
      
      const demoPayments = paymentsResponse.data.payments.filter(p => 
        p.userEmail && p.userEmail.includes('demouser')
      );
      
      if (demoPayments.length > 0) {
        console.log(`📋 Found ${demoPayments.length} demo user payment(s):`);
        demoPayments.forEach((payment, index) => {
          console.log(`   ${index + 1}. ${payment.userName} (${payment.userEmail})`);
          console.log(`      Status: ${payment.status}`);
          console.log(`      Amount: ${payment.amount} ${payment.currency}`);
          console.log(`      User ID: ${payment.userId._id || payment.userId}`);
          console.log(`      Payment ID: ${payment._id}`);
        });
      } else {
        console.log('❌ No demo user payments found');
        
        // Show all payments for debugging
        console.log('\n📋 All payments:');
        paymentsResponse.data.payments.forEach((payment, index) => {
          console.log(`   ${index + 1}. ${payment.userName} (${payment.userEmail || 'No email'})`);
          console.log(`      Status: ${payment.status}`);
        });
      }
    }

    // Check eligibility for demo user if we can find their ID
    console.log('\n2. Checking demo user eligibility...');
    const demoUserEmail = 'demouser@example.com';
    
    // Try to find demo user in payments
    const allPayments = paymentsResponse.data.payments;
    const demoPayment = allPayments.find(p => 
      p.userName && p.userName.toLowerCase().includes('demo')
    );
    
    if (demoPayment) {
      const userId = demoPayment.userId._id || demoPayment.userId;
      console.log(`🔍 Checking eligibility for user ${userId}...`);
      
      try {
        const eligibilityResponse = await axios.get(`${BASE_URL}/api/payments/license/eligibility/${userId}`);
        console.log('📋 Eligibility result:', eligibilityResponse.data);
      } catch (error) {
        console.log('❌ Eligibility check failed:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Demo user check completed!');

  } catch (error) {
    console.error('❌ Error checking demo user:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

checkDemoUser();
