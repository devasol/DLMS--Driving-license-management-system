import axios from 'axios';

const testUpdateRoute = async () => {
  try {
    console.log('🧪 Testing exam result update route...');
    
    // First, let's test if the server is running
    const healthResponse = await axios.get('http://localhost:5004/api/health');
    console.log('✅ Server is running:', healthResponse.data);
    
    // Test the update route with a dummy ID
    const testId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
    const updateUrl = `http://localhost:5004/api/exams/results/${testId}`;
    
    console.log('🔍 Testing URL:', updateUrl);
    
    try {
      const response = await axios.put(updateUrl, {
        score: 85,
        passed: true,
        correctAnswers: 8,
        totalQuestions: 10,
        timeSpent: 600
      });
      
      console.log('✅ Route exists and responded:', response.status);
    } catch (error) {
      if (error.response) {
        console.log('📊 Route exists but returned error:', error.response.status, error.response.data);
        if (error.response.status === 404 && error.response.data.message === 'Exam result not found') {
          console.log('✅ Route is working correctly (expected 404 for non-existent ID)');
        }
      } else {
        console.error('❌ Route not found or server error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testUpdateRoute();
