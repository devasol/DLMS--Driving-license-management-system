import Notification from '../models/Notification.js';

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📬 Fetching notifications for user: ${userId}`);

    const notifications = await Notification.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    console.log(`✅ Found ${notifications.length} notifications for user ${userId}`);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Mark notification as seen
export const markNotificationAsSeen = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { seen: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as seen:', error);
    res.status(500).json({ message: 'Error marking notification as seen' });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body;
    console.log(`📝 Creating notification for user: ${userId}`);

    const notification = new Notification({
      userId,
      title,
      message,
      type: type || 'info',
      link,
      seen: false
    });

    await notification.save();
    console.log(`✅ Notification created: ${notification._id}`);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// Mark all notifications as seen for a user
export const markAllNotificationsAsSeen = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`👁️ Marking all notifications as seen for user: ${userId}`);

    const result = await Notification.updateMany(
      { userId: userId, seen: false },
      { seen: true }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as seen`);
    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as seen`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as seen:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as seen',
      error: error.message
    });
  }
};

// Get unread notification count for a user
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Notification.countDocuments({
      userId: userId,
      seen: false
    });

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread count',
      error: error.message
    });
  }
};

// Add sample notifications for a user
export const addSampleNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📝 Adding sample notifications for user: ${userId}`);

    const sampleNotifications = [
      {
        userId: userId,
        title: 'Welcome to DLMS',
        message: 'Welcome to the Driving License Management System. Your account has been successfully created.',
        type: 'success'
      },
      {
        userId: userId,
        title: 'License Renewal Reminder',
        message: 'Your driving license will expire in 30 days. Please renew it to avoid any inconvenience.',
        type: 'warning'
      },
      {
        userId: userId,
        title: 'New Feature Available',
        message: 'You can now schedule your driving test online. Click here to learn more.',
        type: 'info',
        link: '/schedule-test'
      },
      {
        userId: userId,
        title: 'Document Verification',
        message: 'Your submitted documents have been verified successfully.',
        type: 'success'
      },
      {
        userId: userId,
        title: 'Payment Received',
        message: 'Your payment for license renewal has been received. Thank you for using our service.',
        type: 'success'
      }
    ];

    await Notification.insertMany(sampleNotifications);
    console.log(`✅ Added ${sampleNotifications.length} sample notifications`);

    res.status(201).json({
      success: true,
      message: 'Sample notifications added successfully',
      count: sampleNotifications.length
    });
  } catch (error) {
    console.error('❌ Error adding sample notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding sample notifications',
      error: error.message
    });
  }
};

// Helper function to create notifications (for use in other controllers)
export const createNotificationHelper = async (userId, title, message, type = 'info', link = null) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      link,
      seen: false
    });

    await notification.save();
    console.log(`✅ Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};