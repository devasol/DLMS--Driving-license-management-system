import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './models/Notification.js';

dotenv.config();

async function addTestNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('🔗 Connected to MongoDB');

    // Get user ID from command line argument or use default
    const userId = process.argv[2] || '67fc0dbe24455fbc9dae1d0d';

    console.log('📝 Adding test notifications for user:', userId);
    
    // Check existing notifications
    const existingCount = await Notification.countDocuments({ userId });
    console.log(`📊 User currently has ${existingCount} notifications`);
    
    // Create comprehensive test notifications
    const testNotifications = [
      {
        userId: userId,
        title: 'Welcome to DLMS!',
        message: 'Welcome to the Driving License Management System. Your account has been successfully created and verified. You can now apply for your driving license.',
        type: 'success',
        link: '/dashboard',
        seen: false
      },
      {
        userId: userId,
        title: 'License Application Submitted',
        message: 'Your license application has been submitted successfully. Application ID: APP-2025-001234. We will review your application and notify you of the status within 3-5 business days.',
        type: 'success',
        link: '/dashboard/applications',
        seen: false
      },
      {
        userId: userId,
        title: 'Document Verification Required',
        message: 'Please upload your national ID and driving school certificate to complete your application. Missing documents may delay the processing of your application.',
        type: 'warning',
        link: '/dashboard/applications',
        seen: false
      },
      {
        userId: userId,
        title: 'Theory Exam Scheduled',
        message: 'Your theory exam has been scheduled for January 15, 2025 at 10:00 AM. Please arrive 30 minutes early and bring your ID card.',
        type: 'info',
        link: '/dashboard/exams',
        seen: true
      },
      {
        userId: userId,
        title: 'Theory Exam Passed!',
        message: 'Congratulations! You have successfully passed your theory exam with a score of 88%. You can now schedule your practical exam.',
        type: 'success',
        link: '/dashboard/exams',
        seen: true
      },
      {
        userId: userId,
        title: 'Practical Exam Scheduled',
        message: 'Your practical exam has been scheduled for January 20, 2025 at 2:00 PM. Please bring your learner\'s permit and arrive 15 minutes early.',
        type: 'info',
        link: '/dashboard/exams',
        seen: true
      },
      {
        userId: userId,
        title: 'Practical Exam Completed',
        message: 'You have successfully completed your practical exam with a score of 92%. Excellent driving skills! You are now eligible for license payment.',
        type: 'success',
        link: '/dashboard/payment',
        seen: false
      },
      {
        userId: userId,
        title: 'Payment Submitted',
        message: 'Your payment of 500 ETB has been submitted successfully. Transaction ID: TXN-2025-789012. Please wait for admin verification.',
        type: 'success',
        link: '/dashboard/payment',
        seen: false
      },
      {
        userId: userId,
        title: 'License Issued Successfully!',
        message: 'Congratulations! Your driving license has been issued successfully. License Number: ETH-2025-000521335. You can now download your license from the dashboard.',
        type: 'success',
        link: '/dashboard/license',
        seen: false
      },
      {
        userId: userId,
        title: 'License Renewal Reminder',
        message: 'Your driving license will expire in 30 days (February 20, 2025). Please renew it to avoid any inconvenience. You can start the renewal process online.',
        type: 'warning',
        link: '/dashboard/renewal',
        seen: false
      },
      {
        userId: userId,
        title: 'System Maintenance Notice',
        message: 'The DLMS system will undergo scheduled maintenance on January 25, 2025 from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.',
        type: 'info',
        link: null,
        seen: true
      },
      {
        userId: userId,
        title: 'New Feature Available',
        message: 'You can now schedule your driving test online! This new feature allows you to choose your preferred date and time. Click here to learn more.',
        type: 'info',
        link: '/dashboard/schedule',
        seen: false
      },
      {
        userId: userId,
        title: 'Profile Update Required',
        message: 'Please update your profile information including your current address and phone number to ensure we can contact you for important updates.',
        type: 'warning',
        link: '/dashboard/profile',
        seen: false
      },
      {
        userId: userId,
        title: 'Feedback Request',
        message: 'How was your experience with our license application process? Your feedback helps us improve our services. Please take a moment to share your thoughts.',
        type: 'info',
        link: '/dashboard/feedback',
        seen: true
      },
      {
        userId: userId,
        title: 'Security Alert',
        message: 'Your account was accessed from a new device on January 6, 2025. If this was not you, please change your password immediately and contact support.',
        type: 'warning',
        link: '/dashboard/security',
        seen: false
      }
    ];
    
    // Insert the test notifications
    const insertedNotifications = await Notification.insertMany(testNotifications);
    
    console.log(`✅ Successfully added ${insertedNotifications.length} test notifications`);
    
    // Show summary of notifications by type
    const summary = await Notification.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📊 Notification Summary by Type:');
    summary.forEach(item => {
      const emoji = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }[item._id] || '📝';
      console.log(`   ${emoji} ${item._id}: ${item.count} notifications`);
    });
    
    // Show unread count
    const unreadCount = await Notification.countDocuments({ 
      userId: userId, 
      seen: false 
    });
    
    console.log(`\n🔔 Unread notifications: ${unreadCount}`);
    
    // Show recent notifications
    const recentNotifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('\n📋 Recent Notifications:');
    recentNotifications.forEach((notification, index) => {
      const status = notification.seen ? '✅' : '🔔';
      const typeEmoji = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }[notification.type] || '📝';
      
      console.log(`${index + 1}. ${status} ${typeEmoji} ${notification.title}`);
      console.log(`   ${notification.message.substring(0, 80)}...`);
      console.log(`   Created: ${notification.createdAt.toLocaleString()}`);
      console.log('');
    });
    
    console.log('🎉 Test notifications added successfully!');
    console.log('\n📱 To view these notifications in the dashboard:');
    console.log('1. Open the user dashboard in your browser');
    console.log('2. Look for the notification bell icon (🔔) in the top right');
    console.log('3. The bell should show a red badge with the unread count');
    console.log('4. Click the bell to see the notification dropdown');
    console.log('5. You should see all the test notifications with different colors:');
    console.log('   ✅ Green for success notifications');
    console.log('   ❌ Red for error notifications');
    console.log('   ⚠️ Yellow for warning notifications');
    console.log('   ℹ️ Blue for info notifications');
    console.log('');
    console.log('🔔 The dashboard should now show:');
    console.log(`   • ${unreadCount} unread notifications in the bell badge`);
    console.log('   • Recent activity section with latest notifications');
    console.log('   • Interactive notification menu with mark as seen/delete options');
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error adding test notifications:', error);
    mongoose.disconnect();
  }
}

addTestNotifications();
