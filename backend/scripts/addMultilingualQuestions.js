import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Exam Question Schema with multilingual support
const examQuestionSchema = new mongoose.Schema({
  question: {
    english: { type: String, required: true },
    amharic: { type: String, required: true }
  },
  options: {
    english: [{ type: String, required: true }],
    amharic: [{ type: String, required: true }]
  },
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

const sampleQuestions = [
  {
    question: {
      english: "What is the maximum speed limit in urban areas in Ethiopia?",
      amharic: "በኢትዮጵያ በከተማ አካባቢዎች ከፍተኛው የፍጥነት ገደብ ምንድን ነው?"
    },
    options: {
      english: ["30 km/h", "50 km/h", "60 km/h", "80 km/h"],
      amharic: ["30 ኪ.ሜ/ሰ", "50 ኪ.ሜ/ሰ", "60 ኪ.ሜ/ሰ", "80 ኪ.ሜ/ሰ"]
    },
    correctAnswer: 1,
    category: "traffic-rules",
    difficulty: "easy"
  },
  {
    question: {
      english: "When should you use your vehicle's horn?",
      amharic: "የመኪናዎን ሆርን መቼ መጠቀም አለብዎት?"
    },
    options: {
      english: [
        "To warn other drivers of danger",
        "To express anger at other drivers", 
        "To greet friends on the street",
        "Whenever you want"
      ],
      amharic: [
        "ሌሎች ሹፌሮችን ስለ አደጋ ለማስጠንቀቅ",
        "በሌሎች ሹፌሮች ላይ ቁጣን ለመግለጽ",
        "በመንገድ ላይ ጓደኞችን ለመሰላም",
        "በፈለጉት ጊዜ"
      ]
    },
    correctAnswer: 0,
    category: "safety",
    difficulty: "easy"
  },
  {
    question: {
      english: "What does a red traffic light mean?",
      amharic: "ቀይ የትራፊክ መብራት ምን ማለት ነው?"
    },
    options: {
      english: ["Stop completely", "Slow down", "Proceed with caution", "Speed up"],
      amharic: ["ሙሉ በሙሉ ቁም", "ፍጥነት ቀንስ", "በጥንቃቄ ቀጥል", "ፍጥነት ጨምር"]
    },
    correctAnswer: 0,
    category: "road-signs",
    difficulty: "easy"
  },
  {
    question: {
      english: "Before starting your vehicle, you should:",
      amharic: "መኪናዎን ከመጀመርዎ በፊት:"
    },
    options: {
      english: [
        "Check mirrors and adjust seat",
        "Turn on the radio",
        "Open all windows", 
        "Sound the horn"
      ],
      amharic: [
        "መስተዋቶችን ይመልከቱ እና መቀመጫን ያስተካክሉ",
        "ሬዲዮን ያብሩ",
        "ሁሉንም መስኮቶች ይክፈቱ",
        "ሆርን ያሰሙ"
      ]
    },
    correctAnswer: 0,
    category: "vehicle-operation",
    difficulty: "easy"
  },
  {
    question: {
      english: "When driving in fog, you should:",
      amharic: "በጭጋራ ውስጥ በሚነዱበት ጊዜ:"
    },
    options: {
      english: [
        "Use high beam headlights",
        "Use low beam headlights and fog lights",
        "Drive without lights",
        "Use hazard lights only"
      ],
      amharic: [
        "ከፍተኛ የፊት መብራቶችን ይጠቀሙ",
        "ዝቅተኛ የፊት መብራቶችን እና የጭጋራ መብራቶችን ይጠቀሙ",
        "ያለ መብራት ይንዱ",
        "የአደጋ መብራቶችን ብቻ ይጠቀሙ"
      ]
    },
    correctAnswer: 1,
    category: "safety",
    difficulty: "medium"
  },
  {
    question: {
      english: "The minimum following distance in normal conditions should be:",
      amharic: "በመደበኛ ሁኔታዎች ውስጥ ዝቅተኛው የመከተል ርቀት መሆን አለበት:"
    },
    options: {
      english: ["1 second", "2 seconds", "3 seconds", "5 seconds"],
      amharic: ["1 ሰከንድ", "2 ሰከንድ", "3 ሰከንድ", "5 ሰከንድ"]
    },
    correctAnswer: 2,
    category: "safety",
    difficulty: "medium"
  },
  {
    question: {
      english: "When approaching a roundabout, you should:",
      amharic: "ወደ ክብ መንገድ በሚቀርቡበት ጊዜ:"
    },
    options: {
      english: [
        "Speed up to enter quickly",
        "Yield to traffic already in the roundabout",
        "Stop completely before entering",
        "Sound your horn"
      ],
      amharic: [
        "በፍጥነት ለመግባት ፍጥነት ጨምሩ",
        "ቀድሞ በክብ መንገዱ ውስጥ ላለው ትራፊክ መንገድ ስጡ",
        "ከመግባትዎ በፊት ሙሉ በሙሉ ቁሙ",
        "ሆርንዎን ያሰሙ"
      ]
    },
    correctAnswer: 1,
    category: "traffic-rules",
    difficulty: "medium"
  },
  {
    question: {
      english: "What should you do if your brakes fail while driving?",
      amharic: "በሚነዱበት ጊዜ ብሬኮች ካልሰሩ ምን ማድረግ አለብዎት?"
    },
    options: {
      english: [
        "Turn off the engine immediately",
        "Use the handbrake gradually and look for a safe place to stop",
        "Continue driving normally",
        "Sound the horn continuously"
      ],
      amharic: [
        "ሞተሩን ወዲያውኑ ያጥፉ",
        "የእጅ ብሬክን ቀስ በቀስ ይጠቀሙ እና ለማቆም ደህንነቱ የተጠበቀ ቦታ ይፈልጉ",
        "በመደበኛነት መንዳትን ይቀጥሉ",
        "ሆርንን ያለማቋረጥ ያሰሙ"
      ]
    },
    correctAnswer: 1,
    category: "emergency",
    difficulty: "hard"
  },
  {
    question: {
      english: "When is it legal to overtake another vehicle?",
      amharic: "ሌላ መኪና መለፍ ህጋዊ የሚሆነው መቼ ነው?"
    },
    options: {
      english: [
        "Anytime you want",
        "Only when there is a clear view and it's safe",
        "Only on highways",
        "Never"
      ],
      amharic: [
        "በፈለጉት ጊዜ",
        "ግልጽ እይታ ሲኖር እና ደህንነቱ ሲጠበቅ ብቻ",
        "በአውራ ጎዳናዎች ላይ ብቻ",
        "በጭራሽ"
      ]
    },
    correctAnswer: 1,
    category: "traffic-rules",
    difficulty: "medium"
  },
  {
    question: {
      english: "What is the purpose of ABS (Anti-lock Braking System)?",
      amharic: "የ ABS (ፀረ-መቆለፍ ብሬኪንግ ሲስተም) ዓላማ ምንድን ነው?"
    },
    options: {
      english: [
        "To make the car go faster",
        "To prevent wheels from locking during braking",
        "To reduce fuel consumption",
        "To improve engine performance"
      ],
      amharic: [
        "መኪናው በፍጥነት እንዲሄድ ለማድረግ",
        "በብሬኪንግ ጊዜ ጎማዎች እንዳይቆለፉ ለመከላከል",
        "የነዳጅ ፍጆታን ለመቀነስ",
        "የሞተር አፈጻጸምን ለማሻሻል"
      ]
    },
    correctAnswer: 1,
    category: "vehicle-operation",
    difficulty: "hard"
  }
];

async function addMultilingualQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dlms");
    console.log("Connected to MongoDB");

    // Clear existing questions (optional)
    await ExamQuestion.deleteMany({});
    console.log("Cleared existing questions");

    // Add new multilingual questions
    const insertedQuestions = await ExamQuestion.insertMany(sampleQuestions);
    console.log(`Added ${insertedQuestions.length} multilingual questions`);

    // Generate additional questions to reach 50+ total
    const additionalQuestions = [];
    for (let i = 0; i < 45; i++) {
      const baseQuestion = sampleQuestions[i % sampleQuestions.length];
      additionalQuestions.push({
        ...baseQuestion,
        question: {
          english: `${baseQuestion.question.english} (Variant ${i + 1})`,
          amharic: `${baseQuestion.question.amharic} (ልዩነት ${i + 1})`
        }
      });
    }

    const moreQuestions = await ExamQuestion.insertMany(additionalQuestions);
    console.log(`Added ${moreQuestions.length} additional questions`);

    console.log(`Total questions in database: ${await ExamQuestion.countDocuments()}`);
    
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error adding questions:", error);
    mongoose.disconnect();
  }
}

addMultilingualQuestions();
