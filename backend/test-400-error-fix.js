import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from './models/Payment.js';
import License from './models/License.js';

dotenv.config();

async function test400ErrorFix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('🔗 Connected to MongoDB');
    
    console.log('🧪 Testing 400 Error Fix...\n');
    
    // Find a verified payment
    const verifiedPayment = await Payment.findOne({ status: "verified" })
      .populate('userId');
    
    if (!verifiedPayment) {
      console.log('❌ No verified payment found');
      mongoose.disconnect();
      return;
    }
    
    console.log('✅ Testing with verified payment:', verifiedPayment._id);
    console.log('User:', verifiedPayment.userName);
    
    // Check if license already exists
    const existingLicense = await License.findOne({ userId: verifiedPayment.userId._id });
    console.log('License exists:', !!existingLicense);
    if (existingLicense) {
      console.log('License Number:', existingLicense.number);
    }
    
    // Test the API call
    console.log('\n🚀 Testing license issuance API...');
    
    const adminId = '68273f8345157821a5bd6e75'; // Valid admin ID
    
    try {
      const response = await axios.post(
        `http://localhost:5004/api/payments/license/issue/${verifiedPayment._id}`,
        {
          adminId: adminId,
          adminNotes: 'Test license issuance - fix verification',
          licenseClass: 'B'
        }
      );
      
      console.log('✅ API Success:');
      console.log('   Status Code:', response.status);
      console.log('   Success:', response.data.success);
      console.log('   Message:', response.data.message);
      console.log('   Already Issued:', response.data.alreadyIssued);
      console.log('   License Number:', response.data.license?.number);
      
      if (response.data.alreadyIssued) {
        console.log('\n🎉 SUCCESS! Fix is working correctly!');
        console.log('✅ No more 400 Bad Request error');
        console.log('✅ Returns 200 OK with alreadyIssued flag');
        console.log('✅ Frontend will show info message instead of error');
      } else {
        console.log('\n🎉 SUCCESS! New license issued!');
        console.log('✅ License issuance completed successfully');
      }
      
    } catch (error) {
      console.log('❌ API Error:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Details:', error.response?.data?.details);
      
      if (error.response?.status === 400) {
        console.log('\n❌ 400 Error still occurring!');
        console.log('   The fix did not work properly');
        
        const errorMessage = error.response.data?.message;
        if (errorMessage?.includes('already issued')) {
          console.log('   Issue: Still returning 400 for already issued license');
        } else if (errorMessage?.includes('exam results')) {
          console.log('   Issue: Exam validation problem');
        } else {
          console.log('   Issue: Unknown validation problem');
        }
      } else {
        console.log('\n⚠️ Different error (not 400)');
        console.log('   This might be a server connectivity issue');
      }
    }
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

// Start server first, then test
async function startServerAndTest() {
  console.log('🚀 Starting server...');
  
  // Import and start server
  try {
    const { spawn } = await import('child_process');
    const serverProcess = spawn('node', ['server.js'], {
      cwd: 'backend',
      stdio: 'pipe'
    });
    
    // Wait for server to start
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    
    console.log('✅ Server started, running test...\n');
    
    // Run the test
    await test400ErrorFix();
    
    // Kill server
    serverProcess.kill();
    console.log('\n🧹 Server stopped');
    
  } catch (error) {
    console.error('❌ Error starting server:', error.message);
    // Run test anyway in case server is already running
    await test400ErrorFix();
  }
}

startServerAndTest();
