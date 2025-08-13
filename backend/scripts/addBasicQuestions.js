import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Simple question schema for testing
const examQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  category: {
    type: String,
    enum: [
      "traffic-rules",
      "road-signs", 
      "safety",
      "vehicle-operation",
      "emergency",
    ],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ExamQuestion = mongoose.model("ExamQuestion", examQuestionSchema);

const basicQuestions = [
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
  }
];

async function addBasicQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dlms");
    console.log("Connected to MongoDB");

    // Check if questions already exist
    const existingCount = await ExamQuestion.countDocuments();
    console.log(`Existing questions: ${existingCount}`);

    if (existingCount === 0) {
      // Generate 60 questions by repeating the basic ones
      const allQuestions = [];
      for (let i = 0; i < 12; i++) {
        basicQuestions.forEach((q, index) => {
          allQuestions.push({
            ...q,
            question: `${q.question} (Question ${i * 5 + index + 1})`
          });
        });
      }

      const insertedQuestions = await ExamQuestion.insertMany(allQuestions);
      console.log(`Added ${insertedQuestions.length} basic questions`);
    } else {
      console.log("Questions already exist in database");
    }

    console.log(`Total questions in database: ${await ExamQuestion.countDocuments()}`);
    
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error adding questions:", error);
    mongoose.disconnect();
  }
}

addBasicQuestions();
