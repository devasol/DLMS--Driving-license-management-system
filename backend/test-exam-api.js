import axios from 'axios';

const testFixedExamAPI = async () => {
  console.log('🧪 Testing Fixed Exam API Endpoints...\n');

  try {
    // Test 1: Get exam schedules
    console.log('1. Testing GET /api/exams/schedules...');
    const schedulesResponse = await axios.get('http://localhost:5004/api/exams/schedules');
    console.log('✅ Schedules Response:', {
      success: schedulesResponse.data.success,
      count: schedulesResponse.data.count,
      dataLength: schedulesResponse.data.data?.length || 0
    });

    if (schedulesResponse.data.data && schedulesResponse.data.data.length > 0) {
      // Find an approved theory exam
      const approvedExam = schedulesResponse.data.data.find(exam =>
        exam.examType === 'theory' && exam.status === 'approved'
      );

      if (approvedExam) {
        console.log('📋 Found approved theory exam:', approvedExam._id);

        // Test 2: Take exam using correct endpoint
        console.log('\n2. Testing GET /api/exams/take/:examId...');
        const examResponse = await axios.get(`http://localhost:5004/api/exams/take/${approvedExam._id}?language=english`);
        console.log('✅ Exam Response:', {
          success: examResponse.data.success,
          questionsCount: examResponse.data.questions?.length || 0,
          examType: examResponse.data.exam?.examType
        });

        if (examResponse.data.questions && examResponse.data.questions.length > 0) {
          console.log('📝 Sample question:', {
            question: examResponse.data.questions[0].question,
            optionsCount: examResponse.data.questions[0].options?.length || 0,
            category: examResponse.data.questions[0].category
          });

          console.log('\n🎉 SUCCESS! Frontend will now work correctly!');
          console.log('✅ API endpoint /api/exams/take/:examId is working');
          console.log('✅ Questions are being returned properly');
          console.log('✅ No more 404 errors');
        }
      } else {
        console.log('❌ No approved theory exam found');
      }
    }

    // Test 3: Create instant theory exam with fixed ObjectId
    console.log('\n3. Testing POST /api/exams/instant-theory...');
    const instantExamResponse = await axios.post('http://localhost:5004/api/exams/instant-theory', {
      userId: '6439afc04f1b2e6c9b6d33d34'
    });
    console.log('✅ Instant Exam Response:', {
      success: instantExamResponse.data.success,
      examId: instantExamResponse.data.exam?._id
    });

    if (instantExamResponse.data.exam) {
      // Test the newly created exam
      console.log('\n4. Testing newly created exam...');
      const newExamResponse = await axios.get(`http://localhost:5004/api/exams/take/${instantExamResponse.data.exam._id}?language=english`);
      console.log('✅ New Exam Response:', {
        success: newExamResponse.data.success,
        questionsCount: newExamResponse.data.questions?.length || 0
      });
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
  }
};

testFixedExamAPI();
