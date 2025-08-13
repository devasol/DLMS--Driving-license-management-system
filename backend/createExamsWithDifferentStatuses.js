import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function createExamsWithDifferentStatuses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Get collections
    const examSchedulesCollection = mongoose.connection.db.collection('examschedules');
    const usersCollection = mongoose.connection.db.collection('users');

    // Find real users to assign exams to
    const users = await usersCollection.find({ 
      role: 'user',
      $or: [
        { fullName: { $exists: true, $ne: '' } },
        { full_name: { $exists: true, $ne: '' } }
      ]
    }).limit(5).toArray();

    if (users.length === 0) {
      console.log('❌ No users found to assign exams to');
      return;
    }

    console.log(`👥 Found ${users.length} users for exam assignment`);

    // Create exams with different statuses to demonstrate the workflow
    const examStatuses = [
      {
        status: 'scheduled',
        adminMessage: null,
        description: 'Newly scheduled - awaiting admin approval'
      },
      {
        status: 'approved',
        adminMessage: 'Exam schedule approved by admin',
        description: 'Approved - ready for examiner to conduct'
      },
      {
        status: 'rejected',
        adminMessage: 'Student does not meet requirements for practical exam',
        description: 'Rejected by admin with reason'
      },
      {
        status: 'pending',
        adminMessage: null,
        description: 'Pending admin review'
      }
    ];

    const newExams = [];

    for (let i = 0; i < examStatuses.length && i < users.length; i++) {
      const user = users[i];
      const statusInfo = examStatuses[i];
      
      const exam = {
        userId: user._id,
        fullName: user.fullName || user.full_name,
        examType: 'practical',
        title: 'Practical Driving Test',
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Different days
        time: ['09:00', '11:00', '14:00', '16:00'][i],
        location: [
          'Kality Testing Center, Addis Ababa',
          'Bole Testing Center, Addis Ababa', 
          'Megenagna Testing Center, Addis Ababa',
          'Piassa Testing Center, Addis Ababa'
        ][i],
        instructor: 'To be assigned',
        status: statusInfo.status,
        result: 'pending',
        adminMessage: statusInfo.adminMessage,
        notes: `Test exam with ${statusInfo.status} status - ${statusInfo.description}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      newExams.push(exam);
    }

    // Insert the new exams
    const result = await examSchedulesCollection.insertMany(newExams);
    console.log(`✅ Created ${result.insertedCount} practical exams with different statuses`);

    // Display the created exams
    console.log('\n📋 Created Exams:');
    for (let i = 0; i < newExams.length; i++) {
      const exam = newExams[i];
      const statusInfo = examStatuses[i];
      
      console.log(`\n${i + 1}. ${exam.fullName}`);
      console.log(`   📅 Date: ${new Date(exam.date).toLocaleDateString()} at ${exam.time}`);
      console.log(`   📍 Location: ${exam.location}`);
      console.log(`   📊 Status: ${exam.status.toUpperCase()}`);
      console.log(`   📝 Description: ${statusInfo.description}`);
      if (exam.adminMessage) {
        console.log(`   💬 Admin Message: ${exam.adminMessage}`);
      }
    }

    // Show summary of all practical exams by status
    console.log('\n📊 All Practical Exams Summary by Status:');
    const allPracticalExams = await examSchedulesCollection.find({ 
      examType: 'practical' 
    }).toArray();

    const statusCounts = {};
    allPracticalExams.forEach(exam => {
      statusCounts[exam.status] = (statusCounts[exam.status] || 0) + 1;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`- ${status.toUpperCase()}: ${count} exams`);
    });

    console.log(`\nTotal practical exams: ${allPracticalExams.length}`);

    console.log('\n🎯 Examiner Dashboard Testing:');
    console.log('1. Login to examiner dashboard with: sarah.examiner@dlms.gov.et / examiner123');
    console.log('2. You should see ALL practical exams with different statuses:');
    console.log('   ✅ APPROVED exams: Green "Conduct Practical Test" button');
    console.log('   ⏳ SCHEDULED/PENDING exams: Orange "Awaiting Admin Approval" chip');
    console.log('   ❌ REJECTED exams: Red "Rejected by Admin" chip with reason');
    console.log('3. Only APPROVED exams can be conducted by clicking the green button');
    console.log('4. Dashboard statistics will show counts for each status');

  } catch (error) {
    console.error('❌ Error creating exams with different statuses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createExamsWithDifferentStatuses();
