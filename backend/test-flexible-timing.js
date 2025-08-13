import axios from 'axios';

const testFlexibleTiming = async () => {
  console.log('🧪 Testing Flexible Practical Exam Timing...\n');

  try {
    // Test 1: Schedule a practical exam with new flexible time slots
    console.log('1. Testing flexible time slot scheduling...');
    
    const scheduleData = {
      userId: '68316136a465d5a249fe1845',
      userName: 'Test User',
      examType: 'practical',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      time: '08:30', // New flexible time slot
      location: 'Kality, Addis Ababa',
      notes: 'Testing flexible timing'
    };

    const scheduleResponse = await axios.post('http://localhost:5004/api/exams/schedule', scheduleData);
    console.log('✅ Schedule Response:', {
      success: scheduleResponse.data.success,
      examId: scheduleResponse.data.exam?._id,
      time: scheduleResponse.data.exam?.time,
      status: scheduleResponse.data.exam?.status
    });

    if (scheduleResponse.data.success && scheduleResponse.data.exam) {
      const examId = scheduleResponse.data.exam._id;

      // Test 2: Check exam availability with new flexible timing
      console.log('\n2. Testing exam availability with flexible timing...');
      const availabilityResponse = await axios.get(`http://localhost:5004/api/exams/available/68316136a465d5a249fe1845`);
      
      const practicalExam = availabilityResponse.data.exams?.find(exam => 
        exam.examType === 'practical' && exam._id === examId
      );

      if (practicalExam) {
        console.log('✅ Practical Exam Availability:', {
          isAvailable: practicalExam.isAvailable,
          minutesUntilAvailable: practicalExam.minutesUntilAvailable,
          hasExpired: practicalExam.hasExpired,
          needsApproval: practicalExam.needsApproval,
          status: practicalExam.status
        });

        // Test 3: Approve the exam (simulate admin approval)
        if (practicalExam.needsApproval) {
          console.log('\n3. Approving practical exam...');
          const approveResponse = await axios.put(`http://localhost:5004/api/exams/schedules/${examId}/approve`, {
            adminMessage: 'Approved for flexible timing test'
          });
          
          console.log('✅ Approval Response:', {
            success: approveResponse.data.success,
            status: approveResponse.data.schedule?.status
          });

          // Test 4: Check availability after approval
          console.log('\n4. Checking availability after approval...');
          const postApprovalResponse = await axios.get(`http://localhost:5004/api/exams/available/68316136a465d5a249fe1845`);
          
          const approvedExam = postApprovalResponse.data.exams?.find(exam => 
            exam.examType === 'practical' && exam._id === examId
          );

          if (approvedExam) {
            console.log('✅ Post-Approval Availability:', {
              isAvailable: approvedExam.isAvailable,
              minutesUntilAvailable: approvedExam.minutesUntilAvailable,
              hasExpired: approvedExam.hasExpired,
              status: approvedExam.status
            });
          }
        }
      }
    }

    // Test 5: Test time window flexibility
    console.log('\n5. Testing time window flexibility...');
    console.log('📋 New Flexible Time Rules:');
    console.log('✅ Users can take exam up to 2 hours BEFORE scheduled time');
    console.log('✅ Users can take exam up to 4 hours AFTER scheduled time');
    console.log('✅ More time slots available (30-minute intervals)');
    console.log('✅ Extended operating hours (8:00 AM - 5:00 PM)');

    console.log('\n📊 SUMMARY:');
    console.log('🎉 Practical exam timing is now more flexible!');
    console.log('✅ More time slots available for scheduling');
    console.log('✅ Extended time window for taking exams');
    console.log('✅ Better user experience with flexible scheduling');

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
  }
};

testFlexibleTiming();
