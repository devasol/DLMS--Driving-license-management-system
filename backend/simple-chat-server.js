import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5005; // Use a different port to avoid conflicts

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "simple-chat-server",
    port: PORT,
  });
});

// Chat health endpoint
app.get("/api/chat/health", (req, res) => {
  try {
    const isConfigured = !!process.env.OPENAI_API_KEY;
    res.json({
      status: "ok",
      aiConfigured: isConfigured,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Chat message endpoint
app.post("/api/chat/message", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // DLMS-specific responses
    const dlmsResponses = {
      license:
        "**Ethiopian Driving License Categories:**\n\n🏍️ **Category 1** - Motorcycle License (any engine size) - Min age: 18\n🛺 **Category 2** - Three-wheel vehicles (tuk-tuks, tricycles) - Min age: 18\n🚗 **Category 3** - Automobiles (up to 8 seats, 10,000kg capacity) - Min age: 18\n🚌 **Category 4** - Public Transport (Public I: 20 seats, Public II: 45 seats, Public III: 45+ seats) - Min age: 21\n🚛 **Category 5** - Trucks (Truck I: 3,500kg, Truck II: no trailers/crane, Truck III: with/without trailers) - Min age: 21\n⛽ **Category 6** - Fuel Tankers (Fuel I: 18,000L, Fuel II: liquid-tank vehicles) - Min age: 21\n🏗️ **Category 7** - Machinery Operator License - Min age: 21\n\nTo apply, visit our Services page and select your category!",
      exam: "DLMS offers comprehensive online driving exams and practice tests. You can access trial questions for free to prepare, then schedule your official exam through your dashboard. Results are available immediately after completion.",
      dashboard:
        "Your user dashboard is your central hub for managing everything related to your driving license. You can view application status, exam results, update your profile, upload documents, and receive notifications about important updates.",
      features:
        "DLMS offers: 1) Online license applications, 2) Practice exams and official tests, 3) User dashboard for tracking, 4) Document upload system, 5) Real-time notifications, 6) Multi-language support, 7) Dark/light theme options, and 8) 24/7 customer support.",
      apply:
        "**Ethiopian License Application Process:**\n\n1️⃣ **Enroll in Accredited Driving School** - Must be certified under national standards\n2️⃣ **Complete Training** - Theory classes + practical driving lessons (mandatory)\n3️⃣ **Pass Theory Exam** - Written test (~ETB 200)\n4️⃣ **Pass Practical Test** - On-road assessment (~ETB 300)\n5️⃣ **Submit Documents** - Training certificate, National ID/passport, medical certificate, photos\n6️⃣ **Pay License Fee** - ~ETB 400-500\n7️⃣ **Track Status** - Monitor progress in your dashboard\n\n**Age Requirements:** 18+ for private vehicles, 21+ for commercial vehicles",
      documents:
        "Required documents typically include: Valid ID/passport, medical certificate, proof of residence, passport-sized photos, and any previous driving license (if applicable). All documents can be uploaded directly through our secure system.",
      status:
        "You can check your application status anytime by logging into your dashboard. You'll see real-time updates on processing stages, and we'll send notifications for any status changes or additional requirements.",
    };

    // Simple keyword matching for DLMS-specific responses
    const lowerMessage = message.toLowerCase();
    let response = "";

    if (lowerMessage.includes("license") || lowerMessage.includes("apply")) {
      response = dlmsResponses.license;
    } else if (
      lowerMessage.includes("exam") ||
      lowerMessage.includes("test") ||
      lowerMessage.includes("practice")
    ) {
      response = dlmsResponses.exam;
    } else if (
      lowerMessage.includes("dashboard") ||
      lowerMessage.includes("profile")
    ) {
      response = dlmsResponses.dashboard;
    } else if (
      lowerMessage.includes("feature") ||
      lowerMessage.includes("what") ||
      lowerMessage.includes("dlms")
    ) {
      response = dlmsResponses.features;
    } else if (
      lowerMessage.includes("document") ||
      lowerMessage.includes("upload")
    ) {
      response = dlmsResponses.documents;
    } else if (
      lowerMessage.includes("status") ||
      lowerMessage.includes("track")
    ) {
      response = dlmsResponses.status;
    } else if (
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("help")
    ) {
      response =
        "Hello! I'm your DLMS AI assistant. I can help you with information about license applications, online exams, using your dashboard, required documents, and navigating our website. What would you like to know?";
    } else {
      // Fallback responses
      const fallbackResponses = [
        "I'm here to help you with information about the DLMS system. You can ask me about license applications, online exams, user dashboard features, or how to navigate the website.",
        "The DLMS system offers comprehensive driving license management services. Would you like to know about our online application process, practice exams, or user dashboard features?",
        "I can help you understand how to use the DLMS website. Feel free to ask about license applications, exam scheduling, document uploads, or any other features you'd like to learn about.",
      ];
      response =
        fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
      fallback:
        !Object.values(dlmsResponses).includes(response) &&
        !response.includes("Hello!"),
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Simple chat server running on port ${PORT}`);
  console.log(`Chat API available at: http://localhost:${PORT}/api/chat`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
