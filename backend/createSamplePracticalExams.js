import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
async function createSamplePracticalExams() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Get collections directly
    const examSchedulesCollection = mongoose.connection.db.collection('examschedules');
    const usersCollection = mongoose.connection.db.collection('users');

    // Find examiner users
    const examiners = await usersCollection.find({ role: "examiner" }).toArray();
    console.log(`Found ${examiners.length} examiners`);

    if (examiners.length === 0) {
      console.log('❌ No examiners found. Please create examiners first.');
      return;
    }

    // Find regular users for exam assignments
    const users = await usersCollection.find({ role: "user" }).limit(5).toArray();
    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }

    // Create sample practical exam schedules
    const sampleExams = [];
    const locations = [
      "Kality Testing Center, Addis Ababa",
      "Megenagna Testing Center, Addis Ababa", 
      "Bole Testing Center, Addis Ababa",
      "Piassa Testing Center, Addis Ababa"
    ];

    const times = ["09:00", "10:30", "14:00", "15:30"];

    for (let i = 0; i < Math.min(users.length, 8); i++) {
      const user = users[i % users.length];
      const examiner = examiners[i % examiners.length];
      
      // Create dates for the next few days
      const examDate = new Date();
      examDate.setDate(examDate.getDate() + (i % 7)); // Spread over next week
      
      const examSchedule = {
        userId: new mongoose.Types.ObjectId(user._id),
        fullName: user.fullName || user.full_name || `User ${i + 1}`,
        examType: "practical",
        title: "Practical Driving Test",
        date: examDate,
        time: times[i % times.length],
        location: locations[i % locations.length],
        instructor: examiner.fullName || examiner.full_name || "Assigned Examiner",
        examiner: new mongoose.Types.ObjectId(examiner._id), // Assign examiner
        status: i % 3 === 0 ? "approved" : "scheduled", // Mix of statuses
        result: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      sampleExams.push(examSchedule);
    }

    // Check if practical exams already exist
    const existingPracticalExams = await examSchedulesCollection.find({ 
      examType: "practical" 
    }).toArray();

    if (existingPracticalExams.length > 0) {
      console.log(`⚠️ Found ${existingPracticalExams.length} existing practical exams.`);
      
      // Update existing exams to assign examiners if they don't have one
      let updatedCount = 0;
      for (const exam of existingPracticalExams) {
        if (!exam.examiner) {
          const randomExaminer = examiners[Math.floor(Math.random() * examiners.length)];
          await examSchedulesCollection.updateOne(
            { _id: exam._id },
            { 
              $set: { 
                examiner: new mongoose.Types.ObjectId(randomExaminer._id),
                instructor: randomExaminer.fullName || randomExaminer.full_name || "Assigned Examiner"
              } 
            }
          );
          updatedCount++;
        }
      }
      console.log(`✅ Updated ${updatedCount} existing exams with examiner assignments.`);
    } else {
      // Insert new sample exams
      const result = await examSchedulesCollection.insertMany(sampleExams);
      console.log(`✅ Created ${result.insertedCount} sample practical exams.`);
    }

    // Display summary
    const allPracticalExams = await examSchedulesCollection.find({ 
      examType: "practical" 
    }).toArray();

    console.log('\n📋 Practical Exams Summary:');
    console.log(`Total practical exams: ${allPracticalExams.length}`);
    
    const examsWithExaminers = allPracticalExams.filter(exam => exam.examiner);
    console.log(`Exams with assigned examiners: ${examsWithExaminers.length}`);

    console.log('\n🎯 Sample Exam Assignments:');
    for (const exam of allPracticalExams.slice(0, 5)) {
      const examinerInfo = exam.examiner ? 
        examiners.find(e => e._id.toString() === exam.examiner.toString()) : null;
      
      console.log(`📅 ${exam.fullName} - ${new Date(exam.date).toLocaleDateString()}`);
      console.log(`   📍 ${exam.location}`);
      console.log(`   👤 Examiner: ${examinerInfo ? (examinerInfo.fullName || examinerInfo.full_name) : 'Not assigned'}`);
      console.log(`   📊 Status: ${exam.status}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error creating sample practical exams:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createSamplePracticalExams();
