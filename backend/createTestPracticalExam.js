import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function createTestPracticalExam() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Get collections
    const examSchedulesCollection = mongoose.connection.db.collection('examschedules');
    const usersCollection = mongoose.connection.db.collection('users');

    // Find a real user to assign the exam to
    const testUser = await usersCollection.findOne({ 
      role: 'user',
      $or: [
        { fullName: { $exists: true, $ne: '' } },
        { full_name: { $exists: true, $ne: '' } }
      ]
    });

    if (!testUser) {
      console.log('❌ No users found to assign exam to');
      return;
    }

    console.log(`👤 Found user: ${testUser.fullName || testUser.full_name}`);
    console.log(`📧 Email: ${testUser.email || testUser.user_email}`);

    // Create a new practical exam that will be approved
    const newExam = {
      userId: testUser._id,
      fullName: testUser.fullName || testUser.full_name,
      examType: 'practical',
      title: 'Practical Driving Test',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: '09:00',
      location: 'Kality Testing Center, Addis Ababa',
      instructor: 'To be assigned',
      status: 'scheduled', // Will be approved by admin
      result: 'pending',
      notes: 'Test practical exam for examiner dashboard testing',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the new exam
    const result = await examSchedulesCollection.insertOne(newExam);
    console.log(`✅ Created new practical exam with ID: ${result.insertedId}`);

    // Now simulate admin approval (this should auto-assign an examiner)
    console.log('\n🔄 Simulating admin approval...');
    
    // Find an available examiner
    const availableExaminer = await usersCollection.findOne({
      role: 'examiner',
      'examinerDetails.isActive': true
    });

    if (availableExaminer) {
      // Update the exam to approved status with examiner assignment
      await examSchedulesCollection.updateOne(
        { _id: result.insertedId },
        {
          $set: {
            status: 'approved',
            adminMessage: 'Exam schedule approved - Auto-assigned examiner',
            examiner: availableExaminer._id,
            instructor: availableExaminer.fullName || availableExaminer.full_name,
            updatedAt: new Date()
          }
        }
      );

      console.log(`✅ Approved exam and assigned to examiner: ${availableExaminer.fullName || availableExaminer.full_name}`);
    } else {
      // Just approve without examiner assignment
      await examSchedulesCollection.updateOne(
        { _id: result.insertedId },
        {
          $set: {
            status: 'approved',
            adminMessage: 'Exam schedule approved - Awaiting examiner assignment',
            updatedAt: new Date()
          }
        }
      );

      console.log(`✅ Approved exam - No examiner assigned (available for self-assignment)`);
    }

    // Verify the exam was created and approved
    const createdExam = await examSchedulesCollection.findOne({ _id: result.insertedId });
    
    console.log('\n📋 Created Exam Details:');
    console.log(`- Student: ${createdExam.fullName}`);
    console.log(`- Date: ${new Date(createdExam.date).toLocaleDateString()}`);
    console.log(`- Time: ${createdExam.time}`);
    console.log(`- Location: ${createdExam.location}`);
    console.log(`- Status: ${createdExam.status}`);
    console.log(`- Examiner: ${createdExam.examiner ? 'Assigned' : 'Not assigned (available for self-assignment)'}`);
    console.log(`- Instructor: ${createdExam.instructor}`);

    // Show summary of all practical exams
    console.log('\n📊 All Practical Exams Summary:');
    const allPracticalExams = await examSchedulesCollection.find({ 
      examType: 'practical' 
    }).sort({ date: 1 }).toArray();

    console.log(`Total practical exams: ${allPracticalExams.length}`);
    
    const approvedExams = allPracticalExams.filter(exam => exam.status === 'approved');
    const scheduledExams = allPracticalExams.filter(exam => exam.status === 'scheduled');
    const completedExams = allPracticalExams.filter(exam => exam.status === 'completed');
    
    console.log(`- Approved: ${approvedExams.length}`);
    console.log(`- Scheduled: ${scheduledExams.length}`);
    console.log(`- Completed: ${completedExams.length}`);

    console.log('\n🎯 Next Steps:');
    console.log('1. Login to examiner dashboard with: sarah.examiner@dlms.gov.et / examiner123');
    console.log('2. Check if the new approved exam appears in the dashboard');
    console.log('3. If exam has no examiner, you should see "Assign to Me" button');
    console.log('4. If exam is assigned, you should see "Start Exam" button');

  } catch (error) {
    console.error('❌ Error creating test practical exam:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createTestPracticalExam();
