import axios from 'axios';

async function testNotificationsAPI() {
  try {
    console.log('🧪 Testing Notification API Endpoints...\n');
    
    // Get user ID from command line argument
    const userId = process.argv[2];
    
    if (!userId) {
      console.log('❌ Please provide a user ID as an argument');
      console.log('Usage: node test-notifications-api.js <userId>');
      console.log('Example: node test-notifications-api.js 67fc0dbe24455fbc9dae1d0d');
      console.log('\n💡 To find your user ID, run: node find-user-id.js <username>');
      return;
    }
    
    const baseURL = 'http://localhost:5004/api/notifications';
    
    console.log(`📋 Testing notifications for user: ${userId}\n`);
    
    // Test 1: Get existing notifications
    console.log('📋 TEST 1: Get User Notifications');
    try {
      const response = await axios.get(`${baseURL}/user/${userId}`);
      
      if (Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} notifications`);
        
        if (response.data.length > 0) {
          console.log('\n📝 Sample notification:');
          const first = response.data[0];
          console.log(`   Title: ${first.title}`);
          console.log(`   Message: ${first.message.substring(0, 80)}...`);
          console.log(`   Type: ${first.type}`);
          console.log(`   Seen: ${first.seen}`);
          console.log(`   Created: ${new Date(first.createdAt).toLocaleString()}`);
        } else {
          console.log('   No notifications found for this user');
        }
      }
    } catch (error) {
      console.log('❌ Failed to fetch notifications:', error.response?.data?.message || error.message);
    }
    
    // Test 2: Get unread count
    console.log('\n📋 TEST 2: Get Unread Count');
    try {
      const response = await axios.get(`${baseURL}/user/${userId}/unread-count`);
      
      if (response.data.success) {
        console.log(`✅ Unread count: ${response.data.unreadCount}`);
      }
    } catch (error) {
      console.log('❌ Failed to get unread count:', error.response?.data?.message || error.message);
    }
    
    // Test 3: Add sample notifications
    console.log('\n📋 TEST 3: Add Sample Notifications');
    try {
      const response = await axios.post(`${baseURL}/user/${userId}/sample`);
      
      if (response.data.success) {
        console.log(`✅ Added ${response.data.count} sample notifications`);
      }
    } catch (error) {
      console.log('❌ Failed to add sample notifications:', error.response?.data?.message || error.message);
    }
    
    // Test 4: Get notifications again to verify
    console.log('\n📋 TEST 4: Verify Notifications Added');
    try {
      const response = await axios.get(`${baseURL}/user/${userId}`);
      
      if (Array.isArray(response.data)) {
        console.log(`✅ Now found ${response.data.length} notifications`);
        
        // Show recent notifications
        console.log('\n📋 Recent Notifications:');
        response.data.slice(0, 5).forEach((notification, index) => {
          const status = notification.seen ? '✅' : '🔔';
          const typeEmoji = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
          }[notification.type] || '📝';
          
          console.log(`${index + 1}. ${status} ${typeEmoji} ${notification.title}`);
          console.log(`   ${notification.message.substring(0, 80)}...`);
          console.log(`   Created: ${new Date(notification.createdAt).toLocaleString()}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('❌ Failed to verify notifications:', error.response?.data?.message || error.message);
    }
    
    console.log('🎉 API Test Complete!');
    console.log('\n💡 Next steps:');
    console.log('1. Check the user dashboard notifications');
    console.log('2. The notification bell should show unread count');
    console.log('3. Click the bell to see the notifications menu');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotificationsAPI();
