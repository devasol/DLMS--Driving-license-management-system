import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function createUnassignedExam() {
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

    // Create a new practical exam that will be approved but NOT assigned to any examiner
    const newExam = {
      userId: testUser._id,
      fullName: testUser.fullName || testUser.full_name,
      examType: 'practical',
      title: 'Practical Driving Test',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      time: '14:00',
      location: 'Bole Testing Center, Addis Ababa',
      instructor: 'To be assigned',
      status: 'approved', // Approved but no examiner assigned
      result: 'pending',
      notes: 'Unassigned approved exam for self-assignment testing',
      adminMessage: 'Exam approved - Awaiting examiner assignment',
      // No examiner field - this makes it available for self-assignment
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the new exam
    const result = await examSchedulesCollection.insertOne(newExam);
    console.log(`✅ Created unassigned approved practical exam with ID: ${result.insertedId}`);

    // Verify the exam was created
    const createdExam = await examSchedulesCollection.findOne({ _id: result.insertedId });
    
    console.log('\n📋 Created Unassigned Exam Details:');
    console.log(`- Student: ${createdExam.fullName}`);
    console.log(`- Date: ${new Date(createdExam.date).toLocaleDateString()}`);
    console.log(`- Time: ${createdExam.time}`);
    console.log(`- Location: ${createdExam.location}`);
    console.log(`- Status: ${createdExam.status}`);
    console.log(`- Examiner: ${createdExam.examiner ? 'Assigned' : 'NOT ASSIGNED (available for self-assignment)'}`);
    console.log(`- Instructor: ${createdExam.instructor}`);

    // Show all unassigned approved practical exams
    console.log('\n📊 All Unassigned Approved Practical Exams:');
    const unassignedExams = await examSchedulesCollection.find({ 
      examType: 'practical',
      status: 'approved',
      $or: [
        { examiner: { $exists: false } },
        { examiner: null },
        { examiner: '' }
      ]
    }).toArray();

    console.log(`Total unassigned approved exams: ${unassignedExams.length}`);
    
    unassignedExams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.fullName} - ${new Date(exam.date).toLocaleDateString()} at ${exam.time}`);
    });

    console.log('\n🎯 Testing Instructions:');
    console.log('1. Login to examiner dashboard with: sarah.examiner@dlms.gov.et / examiner123');
    console.log('2. You should see the new unassigned exam in the "Assigned Practical Exams" section');
    console.log('3. The exam should show an "Assign to Me" button instead of "Start Exam"');
    console.log('4. Click "Assign to Me" to self-assign the exam');
    console.log('5. After assignment, the button should change to "Start Exam"');
    console.log('6. Check the "Available Exams" page to see more unassigned exams');

  } catch (error) {
    console.error('❌ Error creating unassigned exam:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createUnassignedExam();
