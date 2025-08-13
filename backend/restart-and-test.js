import { exec } from 'child_process';
import axios from 'axios';
import { promisify } from 'util';

const execAsync = promisify(exec);
const BASE_URL = 'http://localhost:5004';

async function restartAndTest() {
  console.log('🔄 Restarting Backend Server and Testing License Status...\n');

  try {
    // Kill the existing process on port 5004
    console.log('1. Killing existing process on port 5004...');
    try {
      await execAsync('taskkill /F /PID 1924');
      console.log('✅ Process killed successfully');
    } catch (error) {
      console.log('⚠️  Process might already be stopped:', error.message);
    }

    // Wait a moment for the port to be released
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start the server in the background
    console.log('\n2. Starting backend server...');
    const serverProcess = exec('cd "d:\\final-project\\v9 - Copy\\DLMS--Driving-license-management-system\\backend" && npm start', 
      (error, stdout, stderr) => {
        if (error) {
          console.log('Server error:', error);
        }
      }
    );

    // Wait for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Test the health endpoint first
    console.log('\n3. Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }

    // Test the license status endpoint
    console.log('\n4. Testing license status endpoint...');
    const testUserId = '6439afc04f1b2e6c9b6d3d34';
    
    try {
      const response = await axios.get(
        `${BASE_URL}/api/license/status?userId=${testUserId}`,
        { timeout: 10000 }
      );

      console.log('✅ License Status Response:');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
      console.log('❌ License Status Error:');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Message:', error.message);
    }

    // Test the debug endpoint
    console.log('\n5. Testing debug endpoint...');
    try {
      const debugResponse = await axios.get(
        `${BASE_URL}/api/license/debug/user/${testUserId}`,
        { timeout: 10000 }
      );

      console.log('✅ Debug Response:');
      console.log('Data:', JSON.stringify(debugResponse.data, null, 2));

    } catch (error) {
      console.log('❌ Debug Error:');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ Testing complete!');
    console.log('\n📋 Next steps:');
    console.log('1. If the license status endpoint is working, refresh your frontend');
    console.log('2. Make sure you\'re logged in with the correct user ID');
    console.log('3. Check the browser console for any errors');

  } catch (error) {
    console.error('❌ Error during restart and test:', error);
  }
}

restartAndTest();
