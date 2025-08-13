import OpenAI from "openai";

// Initialize OpenAI client only when needed
let openai = null;

const getOpenAIClient = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// DLMS Knowledge Base
const DLMS_CONTEXT = `
You are a helpful AI assistant for the DLMS (Driving License Management System) website.
You can help users understand the website's features and functionality.

DLMS Website Features:
1. **License Applications**: Users can apply for driving licenses online, upload required documents, and track application status
2. **Online Exams**: Practice tests and official driving theory exams with instant results
3. **User Dashboard**: Personal dashboard to manage applications, view exam results, and update profile
4. **Admin Panel**: Administrative interface for managing users, applications, and exam questions
5. **Trial Questions**: Free practice questions to help users prepare for their driving tests
6. **News & Updates**: Latest news about driving regulations and system updates
7. **Contact Support**: Multiple ways to contact support including live chat, email, and phone

Key Pages:
- Home: Overview of services and quick access to main features
- About: Information about the DLMS system and its benefits
- Services: Detailed description of all available services
- Contact: Support options and contact information
- User Manual: Comprehensive guide on how to use the system
- News: Latest updates and announcements

User Features:
- Secure login/signup system
- Profile management with photo upload
- Application tracking and status updates
- Exam scheduling and results viewing
- Document upload for license applications
- Notification system for important updates

Admin Features:
- User management and verification
- Application review and approval
- Exam question management
- System analytics and reporting
- Content management for news and updates

The system supports multiple languages and has both light and dark themes for better user experience.

Please provide helpful, accurate information about these features. If asked about something not related to DLMS or driving licenses, politely redirect the conversation back to DLMS topics.
`;

// Smart response generator for when OpenAI is not available
const generateSmartResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  // DLMS-specific intelligent responses
  const responses = {
    // Greetings and general help
    greetings: {
      keywords: [
        "hello",
        "hi",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
        "help",
        "start",
      ],
      response:
        "Hello! I'm your DLMS AI assistant. I can help you with:\n\n🚗 **License Applications** - How to apply online\n📝 **Practice Exams** - Free trial questions and official tests\n📊 **Dashboard Features** - Managing your profile and applications\n📄 **Document Upload** - Required documents and process\n📞 **Support** - Contact information and help\n\nWhat would you like to know about?",
    },

    // License application process
    license: {
      keywords: [
        "license",
        "apply",
        "application",
        "driving license",
        "permit",
      ],
      response:
        "**How to Apply for Ethiopian Driving License through DLMS:**\n\n🏫 **Step 1: Enroll in Accredited Driving School**\n- Must be certified under national standards\n- Regulated by Ethiopian Transport Authority\n\n📚 **Step 2: Complete Training Courses**\n- Theory classes: traffic laws, road signs, safe driving\n- Practical driving lessons: supervised driving, vehicle handling\n- Both modules are mandatory\n\n📝 **Step 3: Pass Theory Exam**\n- Written exam on traffic rules and regulations\n- Fee: ~ETB 200\n\n🚗 **Step 4: Pass Practical Test**\n- On-road driving assessment\n- Includes parking, maneuvering, road behavior\n- Fee: ~ETB 300\n\n📋 **Step 5: Submit Documents & Pay Fees**\n- Training completion certificate\n- National ID or passport (+ residence permit for foreigners)\n- Medical fitness certificate (mandatory)\n- Passport-size photographs\n- License issuance fee: ~ETB 400-500\n\n⏱️ **Processing Time:** 5-10 business days after completing all requirements",
    },

    // Exams and tests
    exams: {
      keywords: [
        "exam",
        "test",
        "practice",
        "trial",
        "questions",
        "quiz",
        "theory",
      ],
      response:
        "**DLMS Online Exam System:**\n\n🆓 **Free Practice:**\n- Access trial questions anytime\n- No registration required\n- Practice different categories\n- Instant feedback\n\n📝 **Official Exams:**\n- Schedule through your dashboard\n- Multiple choice format\n- Immediate results\n- Certificate upon passing\n\n📚 **Exam Categories:**\n- Theory test (traffic rules, signs)\n- Practical driving test\n- Specialized vehicle categories\n\n💡 **Tips:** Use our free trial questions to prepare before taking the official exam!",
    },

    // Dashboard and profile
    dashboard: {
      keywords: [
        "dashboard",
        "profile",
        "account",
        "login",
        "manage",
        "update",
      ],
      response:
        "**Your DLMS Dashboard Features:**\n\n👤 **Profile Management:**\n- Update personal information\n- Change profile photo\n- Manage contact details\n\n📋 **Application Tracking:**\n- View all your applications\n- Real-time status updates\n- Download certificates\n\n📊 **Exam Results:**\n- View test scores\n- Download certificates\n- Retake failed exams\n\n🔔 **Notifications:**\n- Application updates\n- Exam reminders\n- System announcements\n\n🔐 **Security:** Your data is encrypted and secure",
    },

    // Documents and upload
    documents: {
      keywords: [
        "document",
        "upload",
        "file",
        "photo",
        "certificate",
        "id",
        "medical",
      ],
      response:
        "**Document Upload Guide:**\n\n📄 **Required Documents:**\n- **ID/Passport** - Clear, valid copy\n- **Medical Certificate** - From approved clinic\n- **Photos** - Passport-sized, recent\n- **Proof of Residence** - Utility bill or bank statement\n- **Previous License** - If upgrading/renewing\n\n📱 **Upload Process:**\n1. Go to your dashboard\n2. Click 'Upload Documents'\n3. Select document type\n4. Choose file (JPG, PNG, PDF)\n5. Verify and submit\n\n✅ **Requirements:**\n- Max file size: 5MB\n- Clear, readable images\n- Valid, unexpired documents",
    },

    // Status and tracking
    status: {
      keywords: [
        "status",
        "track",
        "progress",
        "when",
        "how long",
        "processing",
      ],
      response:
        "**Track Your Application:**\n\n📍 **Check Status:**\n- Log into your dashboard\n- View 'My Applications' section\n- Real-time status updates\n\n📊 **Application Stages:**\n1. **Submitted** - Application received\n2. **Under Review** - Documents being verified\n3. **Approved** - Ready for exam/issuance\n4. **Completed** - License issued\n\n⏰ **Typical Timeline:**\n- Document review: 2-3 days\n- Approval process: 3-5 days\n- License issuance: 1-2 days\n\n🔔 **Notifications:** You'll receive updates via email and dashboard alerts",
    },

    // Features and services
    features: {
      keywords: [
        "feature",
        "service",
        "what",
        "dlms",
        "system",
        "offer",
        "provide",
      ],
      response:
        "**DLMS Features & Services:**\n\n🚗 **Core Services:**\n- Online license applications\n- Digital exam system\n- Document management\n- Application tracking\n\n💻 **User Features:**\n- Responsive web design\n- Mobile-friendly interface\n- Dark/light theme options\n- Multi-language support\n\n🔧 **Admin Tools:**\n- User management\n- Application processing\n- Exam question management\n- Analytics and reporting\n\n🛡️ **Security:**\n- Encrypted data storage\n- Secure payment processing\n- User authentication\n- Privacy protection\n\n📞 **Support:** 24/7 customer service available",
    },

    // Contact and support
    contact: {
      keywords: ["contact", "support", "help", "phone", "email", "call"],
      response:
        "**Contact DLMS Support:**\n\n📞 **Phone Support:**\n- Main Line: +1-800-DLMS-HELP\n- Emergency: +1-800-DLMS-911\n- Hours: 24/7 available\n\n📧 **Email Support:**\n- General: support@dlms.gov\n- Technical: tech@dlms.gov\n- Applications: applications@dlms.gov\n\n💬 **Live Chat:**\n- Available on this page\n- Instant responses\n- AI-powered assistance\n\n🏢 **Office Locations:**\n- Check our 'Contact' page for nearest office\n- Walk-in services available\n- Appointment booking online",
    },
  };

  // Check for keyword matches
  for (const [category, data] of Object.entries(responses)) {
    if (data.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return data.response;
    }
  }

  // Default response for unmatched queries
  return "I'm here to help you with the DLMS system! I can provide information about:\n\n🚗 **License Applications** - How to apply and requirements\n📝 **Exams & Tests** - Practice questions and official exams\n📊 **Dashboard** - Managing your account and applications\n📄 **Documents** - Upload requirements and process\n📞 **Support** - Contact information and help\n\nPlease ask me about any of these topics, or try asking something like:\n- 'How do I apply for a license?'\n- 'What documents do I need?'\n- 'How can I practice for the exam?'\n- 'How do I check my application status?'";
};

export const sendChatMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Try to get OpenAI client
    const openaiClient = getOpenAIClient();

    if (openaiClient) {
      try {
        // Prepare conversation messages
        const messages = [
          {
            role: "system",
            content: DLMS_CONTEXT,
          },
          // Add conversation history
          ...conversationHistory.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
          // Add current message
          {
            role: "user",
            content: message,
          },
        ];

        // Call OpenAI API
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        });

        const aiResponse = completion.choices[0]?.message?.content;

        if (aiResponse) {
          return res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (openaiError) {
        console.error("OpenAI API Error:", openaiError);
        // Fall through to fallback response
      }
    }

    // Smart fallback response system with keyword matching
    const response = generateSmartResponse(message);

    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getChatHealth = async (req, res) => {
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
};
