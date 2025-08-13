import axios from 'axios';

const testExamRoutes = async () => {
  const routes = [
    'http://localhost:5004/api/exams/schedules',
    'http://localhost:5004/api/exams/questions',
    'http://localhost:5004/api/exams/instant-theory'
  ];

  for (const route of routes) {
    try {
      console.log(`🧪 Testing: ${route}`);
      const response = await axios.get(route);
      console.log(`✅ Success: ${route} - Status: ${response.status}`);
    } catch (error) {
      console.error(`❌ Failed: ${route} - Status: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  }
};

testExamRoutes();
