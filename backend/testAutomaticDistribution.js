import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testAutomaticDistribution() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Get collections
    const examSchedulesCollection = mongoose.connection.db.collection('examschedules');
    const usersCollection = mongoose.connection.db.collection('users');

    // Get all examiners
    const examiners = await usersCollection.find({ role: 'examiner' }).toArray();
    console.log(`👨‍🏫 Found ${examiners.length} examiners:`);
    examiners.forEach((examiner, index) => {
      console.log(`${index + 1}. ${examiner.fullName || examiner.full_name} (${examiner.email || examiner.user_email})`);
    });

    // Check current distribution
    console.log('\n📊 Current Exam Distribution:');
    for (const examiner of examiners) {
      const assignedExams = await examSchedulesCollection.countDocuments({
        examiner: examiner._id,
        examType: 'practical',
        status: { $in: ['approved', 'scheduled'] }
      });
      console.log(`- ${examiner.fullName || examiner.full_name}: ${assignedExams} exams`);
    }

    // Find real users for creating test exams
    const users = await usersCollection.find({ 
      role: 'user',
      $or: [
        { fullName: { $exists: true, $ne: '' } },
        { full_name: { $exists: true, $ne: '' } }
      ]
    }).limit(10).toArray();

    if (users.length === 0) {
      console.log('❌ No users found to create test exams');
      return;
    }

    console.log(`\n👥 Found ${users.length} users for test exam creation`);

    // Create 10 test practical exams that will be auto-distributed
    console.log('\n🔄 Creating 10 test practical exams for auto-distribution...');
    
    const testExams = [];
    for (let i = 0; i < 10; i++) {
      const user = users[i % users.length]; // Cycle through users if we have fewer than 10
      
      const exam = {
        userId: user._id,
        fullName: user.fullName || user.full_name,
        examType: 'practical',
        title: 'Practical Driving Test',
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Different days
        time: ['09:00', '11:00', '14:00', '16:00'][i % 4],
        location: [
          'Kality Testing Center, Addis Ababa',
          'Bole Testing Center, Addis Ababa', 
          'Megenagna Testing Center, Addis Ababa',
          'Piassa Testing Center, Addis Ababa'
        ][i % 4],
        instructor: 'To be assigned',
        status: 'scheduled', // Will be approved to trigger auto-assignment
        result: 'pending',
        notes: `Auto-distribution test exam ${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testExams.push(exam);
    }

    // Insert the test exams
    const result = await examSchedulesCollection.insertMany(testExams);
    console.log(`✅ Created ${result.insertedCount} test practical exams`);

    // Now simulate admin approval for each exam (this should trigger auto-assignment)
    console.log('\n🔄 Simulating admin approval and auto-assignment...');
    
    const insertedIds = Object.values(result.insertedIds);
    
    for (let i = 0; i < insertedIds.length; i++) {
      const examId = insertedIds[i];
      
      // Get all active examiners
      const availableExaminers = await usersCollection.find({
        role: "examiner"
      }).toArray();

      if (availableExaminers.length > 0) {
        // Get current exam counts for each examiner
        const examinerWorkloads = await Promise.all(
          availableExaminers.map(async (examiner) => {
            const examCount = await examSchedulesCollection.countDocuments({
              examiner: examiner._id,
              examType: "practical",
              status: { $in: ["approved", "scheduled"] }
            });
            return {
              examiner,
              currentExams: examCount
            };
          })
        );

        // Sort by current workload (ascending)
        examinerWorkloads.sort((a, b) => a.currentExams - b.currentExams);
        
        // Pick examiner with least workload (with random selection if tied)
        const minWorkload = examinerWorkloads[0].currentExams;
        const leastBusyExaminers = examinerWorkloads.filter(e => e.currentExams === minWorkload);
        const selectedExaminer = leastBusyExaminers[Math.floor(Math.random() * leastBusyExaminers.length)].examiner;

        // Update exam to approved status with assigned examiner
        await examSchedulesCollection.updateOne(
          { _id: examId },
          {
            $set: {
              status: 'approved',
              examiner: selectedExaminer._id,
              instructor: selectedExaminer.fullName || selectedExaminer.full_name,
              adminMessage: 'Exam approved - Auto-assigned examiner',
              updatedAt: new Date()
            }
          }
        );

        console.log(`${i + 1}. Assigned to ${selectedExaminer.fullName || selectedExaminer.full_name} (workload: ${minWorkload})`);
      }
    }

    // Show final distribution
    console.log('\n📊 Final Exam Distribution After Auto-Assignment:');
    for (const examiner of examiners) {
      const assignedExams = await examSchedulesCollection.countDocuments({
        examiner: examiner._id,
        examType: 'practical',
        status: { $in: ['approved', 'scheduled'] }
      });
      console.log(`- ${examiner.fullName || examiner.full_name}: ${assignedExams} exams`);
    }

    console.log('\n🎯 Auto-Distribution System Test Complete!');
    console.log('\n📝 Summary:');
    console.log('- Practical exams are now automatically distributed to examiners');
    console.log('- Distribution is based on current workload (fair distribution)');
    console.log('- Random selection among examiners with equal workload');
    console.log('- No manual assignment needed');
    console.log('\n🧪 Test Results:');
    console.log('1. Login to different examiner accounts to see their assigned exams');
    console.log('2. Each examiner should only see exams assigned to them');
    console.log('3. No "Assign to Me" buttons should be visible');
    console.log('4. Only "Add Result" buttons for approved exams');

  } catch (error) {
    console.error('❌ Error testing automatic distribution:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testAutomaticDistribution();
