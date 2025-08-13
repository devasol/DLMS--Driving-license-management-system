import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkRealData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Get collections
    const examSchedulesCollection = mongoose.connection.db.collection('examschedules');
    const usersCollection = mongoose.connection.db.collection('users');

    // Check all exam schedules
    console.log('\n📋 All Exam Schedules:');
    const allExams = await examSchedulesCollection.find({}).toArray();
    console.log(`Total exams in database: ${allExams.length}`);

    // Group by exam type
    const practicalExams = allExams.filter(exam => exam.examType === 'practical');
    const theoryExams = allExams.filter(exam => exam.examType === 'theory');
    const otherExams = allExams.filter(exam => exam.examType !== 'practical' && exam.examType !== 'theory');

    console.log(`\n📊 Exam Types Breakdown:`);
    console.log(`- Practical exams: ${practicalExams.length}`);
    console.log(`- Theory exams: ${theoryExams.length}`);
    console.log(`- Other exams: ${otherExams.length}`);

    // Check practical exams in detail
    console.log('\n🚗 Practical Exams Details:');
    if (practicalExams.length > 0) {
      for (const exam of practicalExams.slice(0, 5)) { // Show first 5
        console.log(`\n📝 Exam ID: ${exam._id}`);
        console.log(`   Student: ${exam.fullName || 'Unknown'}`);
        console.log(`   User ID: ${exam.userId}`);
        console.log(`   Date: ${exam.date}`);
        console.log(`   Time: ${exam.time}`);
        console.log(`   Location: ${exam.location || 'Not specified'}`);
        console.log(`   Status: ${exam.status}`);
        console.log(`   Instructor: ${exam.instructor || 'Not assigned'}`);
        console.log(`   Examiner: ${exam.examiner || 'Not assigned'}`);
        console.log(`   Result: ${exam.result || 'Pending'}`);
      }
    } else {
      console.log('❌ No practical exams found in database');
    }

    // Check users who might need practical exams
    console.log('\n👥 Users Analysis:');
    const totalUsers = await usersCollection.countDocuments({ role: 'user' });
    const examiners = await usersCollection.countDocuments({ role: 'examiner' });
    const admins = await usersCollection.countDocuments({ role: 'admin' });

    console.log(`- Total users: ${totalUsers}`);
    console.log(`- Examiners: ${examiners}`);
    console.log(`- Admins: ${admins}`);

    // Check if there are users without practical exams
    const usersWithPracticalExams = practicalExams.map(exam => exam.userId?.toString()).filter(Boolean);
    const allUserIds = (await usersCollection.find({ role: 'user' }, { _id: 1 }).toArray()).map(u => u._id.toString());
    const usersWithoutPracticalExams = allUserIds.filter(userId => !usersWithPracticalExams.includes(userId));

    console.log(`\n📈 Practical Exam Coverage:`);
    console.log(`- Users with practical exams: ${usersWithPracticalExams.length}`);
    console.log(`- Users without practical exams: ${usersWithoutPracticalExams.length}`);

    // Check exam statuses
    const examStatuses = {};
    allExams.forEach(exam => {
      examStatuses[exam.status] = (examStatuses[exam.status] || 0) + 1;
    });

    console.log('\n📊 Exam Status Distribution:');
    Object.entries(examStatuses).forEach(([status, count]) => {
      console.log(`- ${status}: ${count}`);
    });

    // Sample real users for practical exam creation
    console.log('\n👤 Sample Real Users (for practical exam assignment):');
    const sampleUsers = await usersCollection.find({ 
      role: 'user',
      $or: [
        { fullName: { $exists: true, $ne: '' } },
        { full_name: { $exists: true, $ne: '' } }
      ]
    }).limit(10).toArray();

    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName || user.full_name} (${user.email || user.user_email})`);
    });

    // Check existing examiners
    console.log('\n👨‍🏫 Available Examiners:');
    const availableExaminers = await usersCollection.find({ role: 'examiner' }).toArray();
    availableExaminers.forEach((examiner, index) => {
      console.log(`${index + 1}. ${examiner.fullName || examiner.full_name} (${examiner.email || examiner.user_email})`);
    });

  } catch (error) {
    console.error('❌ Error checking real data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkRealData();
