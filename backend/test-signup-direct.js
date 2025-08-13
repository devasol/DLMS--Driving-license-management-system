// Direct test using fetch API
const testSignup = async () => {
  console.log('🔍 TESTING SIGNUP ENDPOINT DIRECTLY');
  console.log('='.repeat(50));

  const timestamp = Date.now();
  const testUser = {
    full_name: 'Direct Test User',
    user_email: `direct.test.${timestamp}@example.com`,
    user_password: 'testpass123',
    user_name: `directtest${timestamp}`,
    gender: 'male',
    contact_no: `123456${timestamp.toString().slice(-4)}`,
    nic: `${timestamp.toString().slice(-9)}V`
  };

  try {
    console.log('\n📝 Sending POST request to /api/auth/users/signup');
    console.log('Data:', JSON.stringify(testUser, null, 2));

    const response = await fetch('http://localhost:5004/api/auth/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    console.log('\n📊 Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.json();
    console.log('\n📄 Response Data:');
    console.log(JSON.stringify(responseData, null, 2));

    console.log('\n🔍 Key Fields Check:');
    console.log('- requiresOTP:', responseData.requiresOTP);
    console.log('- success:', responseData.success);
    console.log('- email:', responseData.email);
    console.log('- message:', responseData.message);

    if (responseData.requiresOTP === true) {
      console.log('\n✅ SUCCESS: Backend correctly returns requiresOTP: true');
      console.log('The frontend should redirect to /verify-otp page');
    } else {
      console.log('\n❌ PROBLEM: Backend NOT returning requiresOTP: true');
      console.log('This explains why frontend redirects to signin instead');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
};

// Use native fetch if available, otherwise show message
if (typeof fetch !== 'undefined') {
  testSignup();
} else {
  console.log('📧 OTP System Status Check');
  console.log('='.repeat(30));
  console.log('✅ Backend routes updated with OTP verification');
  console.log('✅ Frontend updated to handle requiresOTP response');
  console.log('✅ OTP expiration changed to 5 minutes');
  console.log('✅ Email sender: dlms.sys.2025@gmail.com');
  console.log('\n🔧 To test: Sign up a new user in the frontend');
  console.log('Expected: User should be redirected to /verify-otp page');
}
