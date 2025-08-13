import axios from 'axios';

const questions = [
  {
    question: "What is the maximum speed limit in urban areas?",
    options: ["30 km/h", "50 km/h", "60 km/h", "80 km/h"],
    correctAnswer: 1,
    category: "traffic-rules",
    difficulty: "easy"
  },
  {
    question: "When should you use your vehicle's horn?",
    options: [
      "To warn other drivers of danger",
      "To express anger at other drivers", 
      "To greet friends on the street",
      "Whenever you want"
    ],
    correctAnswer: 0,
    category: "safety",
    difficulty: "easy"
  },
  {
    question: "What does a red traffic light mean?",
    options: ["Stop completely", "Slow down", "Proceed with caution", "Speed up"],
    correctAnswer: 0,
    category: "road-signs",
    difficulty: "easy"
  },
  {
    question: "Before starting your vehicle, you should:",
    options: [
      "Check mirrors and adjust seat",
      "Turn on the radio",
      "Open all windows", 
      "Sound the horn"
    ],
    correctAnswer: 0,
    category: "vehicle-operation",
    difficulty: "easy"
  },
  {
    question: "When driving in fog, you should:",
    options: [
      "Use high beam headlights",
      "Use low beam headlights and fog lights",
      "Drive without lights",
      "Use hazard lights only"
    ],
    correctAnswer: 1,
    category: "safety",
    difficulty: "medium"
  },
  {
    question: "The minimum following distance in normal conditions should be:",
    options: ["1 second", "2 seconds", "3 seconds", "5 seconds"],
    correctAnswer: 2,
    category: "safety",
    difficulty: "medium"
  },
  {
    question: "When approaching a roundabout, you should:",
    options: [
      "Speed up to enter quickly",
      "Yield to traffic already in the roundabout",
      "Stop completely before entering",
      "Sound your horn"
    ],
    correctAnswer: 1,
    category: "traffic-rules",
    difficulty: "medium"
  },
  {
    question: "What should you do if your brakes fail while driving?",
    options: [
      "Turn off the engine immediately",
      "Use the handbrake gradually and look for a safe place to stop",
      "Continue driving normally",
      "Sound the horn continuously"
    ],
    correctAnswer: 1,
    category: "emergency",
    difficulty: "hard"
  },
  {
    question: "When is it legal to overtake another vehicle?",
    options: [
      "Anytime you want",
      "Only when there is a clear view and it's safe",
      "Only on highways",
      "Never"
    ],
    correctAnswer: 1,
    category: "traffic-rules",
    difficulty: "medium"
  },
  {
    question: "What is the purpose of ABS (Anti-lock Braking System)?",
    options: [
      "To make the car go faster",
      "To prevent wheels from locking during braking",
      "To reduce fuel consumption",
      "To improve engine performance"
    ],
    correctAnswer: 1,
    category: "vehicle-operation",
    difficulty: "hard"
  }
];

async function addQuestions() {
  try {
    console.log('Adding questions via API...');
    
    // Generate 60 questions by repeating and modifying the base questions
    const allQuestions = [];
    
    for (let i = 0; i < 6; i++) {
      questions.forEach((q, index) => {
        allQuestions.push({
          ...q,
          question: `${q.question} (Question ${i * 10 + index + 1})`
        });
      });
    }
    
    console.log(`Generated ${allQuestions.length} questions`);
    
    // Add questions one by one
    for (let i = 0; i < allQuestions.length; i++) {
      try {
        const response = await axios.post('http://localhost:5004/api/exams/questions', allQuestions[i]);
        if (response.data.success) {
          console.log(`✅ Added question ${i + 1}/${allQuestions.length}`);
        } else {
          console.log(`❌ Failed to add question ${i + 1}: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Error adding question ${i + 1}: ${error.response?.data?.message || error.message}`);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Finished adding questions');
    
    // Check total count
    const countResponse = await axios.get('http://localhost:5004/api/exams/questions');
    console.log(`📊 Total questions in database: ${countResponse.data.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addQuestions();
