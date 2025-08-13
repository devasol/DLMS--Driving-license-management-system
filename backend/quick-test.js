import axios from 'axios';

async function quickTest() {
  console.log('🧪 Quick notification test...');
  
  try {
    // Test the notification endpoint
    const response = await axios.get('http://localhost:5004/api/notifications/user/67fc0dbe24455fbc9dae1d0d');
    console.log('✅ Notifications endpoint working!');
    console.log(`Found ${response.data.length} notifications`);
    
    if (response.data.length === 0) {
      console.log('📝 No notifications found. Adding sample notifications...');
      
      // Add sample notifications
      const sampleResponse = await axios.post('http://localhost:5004/api/notifications/user/67fc0dbe24455fbc9dae1d0d/sample');
      console.log('✅ Sample notifications added:', sampleResponse.data);
      
      // Check again
      const newResponse = await axios.get('http://localhost:5004/api/notifications/user/67fc0dbe24455fbc9dae1d0d');
      console.log(`✅ Now found ${newResponse.data.length} notifications`);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
  }
}

quickTest();
