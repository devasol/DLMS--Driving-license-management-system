import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function assignRealExamsToExaminer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Get collections
    const examSchedulesCollection = mongoose.connection.db.collection('examschedules');
    const usersCollection = mongoose.connection.db.collection('users');

    // Get the first examiner (Dr. Sarah Johnson)
    const examiner = await usersCollection.findOne({ 
      email: 'sarah.examiner@dlms.gov.et',
      role: 'examiner'
    });

    if (!examiner) {
      console.log('❌ Examiner not found');
      return;
    }

    console.log(`👩‍🏫 Found examiner: ${examiner.fullName || examiner.full_name}`);
    console.log(`📧 Email: ${examiner.email || examiner.user_email}`);
    console.log(`🆔 ID: ${examiner._id}`);

    // Find practical exams that need examiner assignment
    const unassignedExams = await examSchedulesCollection.find({
      examType: 'practical',
      status: { $in: ['approved', 'scheduled'] },
      $or: [
        { examiner: { $exists: false } },
        { examiner: null },
        { examiner: '' }
      ]
    }).toArray();

    console.log(`\n📋 Found ${unassignedExams.length} unassigned practical exams`);

    if (unassignedExams.length === 0) {
      console.log('ℹ️ No unassigned practical exams found. Let me check all practical exams...');
      
      const allPracticalExams = await examSchedulesCollection.find({
        examType: 'practical'
      }).toArray();

      console.log(`\n📊 All practical exams (${allPracticalExams.length}):`);
      allPracticalExams.forEach((exam, index) => {
        console.log(`${index + 1}. ${exam.fullName} - Status: ${exam.status} - Examiner: ${exam.examiner || 'None'}`);
      });

      // Assign some approved exams to the examiner for testing
      const examsToAssign = allPracticalExams.filter(exam => 
        exam.status === 'approved' && !exam.examiner
      ).slice(0, 3);

      if (examsToAssign.length > 0) {
        console.log(`\n🔄 Assigning ${examsToAssign.length} approved exams to examiner...`);
        
        for (const exam of examsToAssign) {
          await examSchedulesCollection.updateOne(
            { _id: exam._id },
            { 
              $set: { 
                examiner: examiner._id,
                instructor: examiner.fullName || examiner.full_name
              } 
            }
          );
          console.log(`✅ Assigned exam for ${exam.fullName} to ${examiner.fullName || examiner.full_name}`);
        }
      }
    } else {
      // Assign the first 3 unassigned exams to the examiner
      const examsToAssign = unassignedExams.slice(0, 3);
      
      console.log(`\n🔄 Assigning ${examsToAssign.length} exams to examiner...`);
      
      for (const exam of examsToAssign) {
        await examSchedulesCollection.updateOne(
          { _id: exam._id },
          { 
            $set: { 
              examiner: examiner._id,
              instructor: examiner.fullName || examiner.full_name
            } 
          }
        );
        console.log(`✅ Assigned exam for ${exam.fullName} to ${examiner.fullName || examiner.full_name}`);
      }
    }

    // Verify the assignments
    console.log('\n🔍 Verifying examiner assignments...');
    const assignedExams = await examSchedulesCollection.find({
      examiner: examiner._id,
      examType: 'practical'
    }).toArray();

    console.log(`\n📋 Examiner now has ${assignedExams.length} assigned practical exams:`);
    assignedExams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.fullName} - ${new Date(exam.date).toLocaleDateString()} - Status: ${exam.status}`);
    });

    // Also create some future exams for testing
    console.log('\n🔄 Creating some future practical exams for testing...');
    
    const futureExams = [
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: 'Future Test Student 1',
        examType: 'practical',
        title: 'Practical Driving Test',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '10:00',
        location: 'Kality Testing Center, Addis Ababa',
        instructor: examiner.fullName || examiner.full_name,
        examiner: examiner._id,
        status: 'approved',
        result: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: 'Future Test Student 2',
        examType: 'practical',
        title: 'Practical Driving Test',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        time: '14:00',
        location: 'Bole Testing Center, Addis Ababa',
        instructor: examiner.fullName || examiner.full_name,
        examiner: examiner._id,
        status: 'scheduled',
        result: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await examSchedulesCollection.insertMany(futureExams);
    console.log(`✅ Created ${futureExams.length} future practical exams`);

    console.log('\n🎉 Real data assignment completed!');
    console.log('\n📝 Summary:');
    console.log(`- Examiner: ${examiner.fullName || examiner.full_name}`);
    console.log(`- Total assigned exams: ${assignedExams.length + futureExams.length}`);
    console.log(`- Login with: ${examiner.email || examiner.user_email} / examiner123`);

  } catch (error) {
    console.error('❌ Error assigning real exams:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

assignRealExamsToExaminer();
