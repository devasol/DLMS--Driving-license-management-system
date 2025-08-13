// Script to remove duplicate notifications from the database
import mongoose from "mongoose";

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/dlms");

// Define notification schema
const notificationSchema = new mongoose.Schema({
  userId: String,
  title: String,
  message: String,
  type: String,
  seen: Boolean,
  createdAt: Date,
});

const Notification = mongoose.model("Notification", notificationSchema);

async function removeDuplicateNotifications() {
  try {
    console.log("🔍 Analyzing notifications for duplicates...\n");

    // Get all notifications
    const allNotifications = await Notification.find({}).sort({
      createdAt: -1,
    });
    console.log(
      `📊 Total notifications in database: ${allNotifications.length}`
    );

    // Group notifications by userId, title, and message to find duplicates
    const grouped = {};
    const duplicatesToRemove = [];

    allNotifications.forEach((notification) => {
      const key = `${notification.userId}|${notification.title}|${notification.message}`;

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(notification);
    });

    // Find duplicates and mark older ones for removal
    let duplicateGroups = 0;
    let totalDuplicates = 0;

    Object.keys(grouped).forEach((key) => {
      const group = grouped[key];
      if (group.length > 1) {
        duplicateGroups++;
        console.log(`\n🔄 Found ${group.length} duplicates for:`);
        console.log(`   User: ${group[0].userId}`);
        console.log(`   Title: ${group[0].title}`);
        console.log(
          `   Dates: ${group
            .map((n) => n.createdAt?.toISOString().split("T")[0])
            .join(", ")}`
        );

        // Sort by creation date (newest first) and mark older ones for removal
        group.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Keep the newest one, remove the rest
        for (let i = 1; i < group.length; i++) {
          duplicatesToRemove.push(group[i]._id);
          totalDuplicates++;
        }

        console.log(
          `   ✅ Keeping newest (${
            group[0].createdAt?.toISOString().split("T")[0]
          })`
        );
        console.log(`   🗑️  Removing ${group.length - 1} older duplicates`);
      }
    });

    if (duplicateGroups === 0) {
      console.log("\n✅ No duplicate notifications found!");
      return;
    }

    console.log(`\n📋 Summary:`);
    console.log(`   Duplicate groups found: ${duplicateGroups}`);
    console.log(`   Total duplicates to remove: ${totalDuplicates}`);

    // Remove duplicates
    if (duplicatesToRemove.length > 0) {
      console.log("\n🗑️  Removing duplicate notifications...");
      const result = await Notification.deleteMany({
        _id: { $in: duplicatesToRemove },
      });

      console.log(
        `✅ Successfully removed ${result.deletedCount} duplicate notifications`
      );
    }

    // Show final count
    const finalCount = await Notification.countDocuments();
    console.log(`\n📊 Final notification count: ${finalCount}`);

    // Show remaining notifications by user
    const userCounts = await Notification.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\n👥 Notifications per user:");
    userCounts.forEach((user) => {
      console.log(`   User ${user._id}: ${user.count} notifications`);
    });
  } catch (error) {
    console.error("❌ Error removing duplicates:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the cleanup
removeDuplicateNotifications();
