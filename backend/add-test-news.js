import mongoose from "mongoose";
import News from "./models/News.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/dlms"
    );
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Test news data in English and Amharic
const testNewsData = [
  // English News
  {
    title: "New Online Driving License Application System Launched",
    featuredImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center",
    content: `
      <h2>Revolutionary Digital Platform Now Available</h2>
      <p>The Ethiopian Transport Authority is proud to announce the launch of our new online driving license application system. This digital platform represents a significant step forward in modernizing our services and making them more accessible to citizens across the country.</p>
      
      <h3>Key Features:</h3>
      <ul>
        <li>24/7 online application submission</li>
        <li>Real-time application tracking</li>
        <li>Digital document upload</li>
        <li>Online payment processing</li>
        <li>SMS and email notifications</li>
      </ul>
      
      <h3>How to Apply:</h3>
      <p>Citizens can now visit our website and complete their driving license application from the comfort of their homes. The process includes:</p>
      <ol>
        <li>Create an account on our platform</li>
        <li>Fill out the application form</li>
        <li>Upload required documents</li>
        <li>Pay the application fee online</li>
        <li>Schedule your driving test</li>
      </ol>
      
      <p>This new system will significantly reduce waiting times and improve the overall experience for our citizens. We encourage everyone to take advantage of this convenient new service.</p>
    `,
    summary:
      "The Ethiopian Transport Authority launches a new online driving license application system, offering 24/7 access, real-time tracking, and digital document processing for improved citizen services.",
    category: "announcement",
    priority: "high",
    tags: [
      "online-system",
      "driving-license",
      "digital-services",
      "announcement",
    ],
    status: "published",
    publishDate: new Date(),
    isSticky: true,
    targetAudience: "all",
    allowComments: true,
    notifyUsers: true,
  },
  {
    title: "Updated Traffic Rules and Regulations - 2024",
    featuredImage:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop&crop=center",
    content: `
      <h2>Important Updates to Traffic Laws</h2>
      <p>The Ministry of Transport has announced several important updates to traffic rules and regulations that will take effect starting January 1, 2024. All drivers are required to familiarize themselves with these changes.</p>
      
      <h3>Major Changes Include:</h3>
      <ul>
        <li><strong>Speed Limits:</strong> New speed limits in urban areas reduced to 40 km/h</li>
        <li><strong>Mobile Phone Usage:</strong> Stricter penalties for using mobile phones while driving</li>
        <li><strong>Seat Belt Requirements:</strong> Mandatory for all passengers, including rear seats</li>
        <li><strong>Motorcycle Helmets:</strong> Required for both driver and passenger</li>
        <li><strong>Parking Regulations:</strong> New designated parking zones in major cities</li>
      </ul>
      
      <h3>Penalty Updates:</h3>
      <p>Fines for traffic violations have been updated to reflect the seriousness of road safety. The new penalty structure includes:</p>
      <ul>
        <li>Speeding: 500-2000 ETB depending on severity</li>
        <li>Mobile phone use: 300 ETB</li>
        <li>Not wearing seat belt: 200 ETB</li>
        <li>Parking violations: 150 ETB</li>
      </ul>
      
      <p>For complete details, please visit our website or contact your local transport office.</p>
    `,
    summary:
      "New traffic rules and regulations for 2024 include updated speed limits, stricter mobile phone penalties, mandatory seat belts for all passengers, and revised fine structures.",
    category: "policy",
    priority: "high",
    tags: ["traffic-rules", "regulations", "2024", "safety", "penalties"],
    status: "published",
    publishDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    isSticky: false,
    targetAudience: "license_holders",
    allowComments: true,
  },
  {
    title: "Driving Test Schedule Changes During Holiday Season",
    featuredImage:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop&crop=center",
    content: `
      <h2>Holiday Schedule Adjustments</h2>
      <p>Please be informed that driving test schedules will be adjusted during the upcoming holiday season. We want to ensure all applicants are aware of these temporary changes to avoid any inconvenience.</p>
      
      <h3>Schedule Changes:</h3>
      <ul>
        <li><strong>December 25-27:</strong> No driving tests scheduled</li>
        <li><strong>January 1-2:</strong> Limited testing slots available</li>
        <li><strong>January 7:</strong> Ethiopian Christmas - No tests</li>
        <li><strong>January 19:</strong> Timkat - No tests</li>
      </ul>
      
      <h3>Alternative Arrangements:</h3>
      <p>To accommodate the reduced schedule, we will be offering:</p>
      <ul>
        <li>Extended hours on regular testing days</li>
        <li>Additional weekend slots in January</li>
        <li>Priority rescheduling for affected applicants</li>
      </ul>
      
      <p>We apologize for any inconvenience and appreciate your understanding during this holiday period.</p>
    `,
    summary:
      "Driving test schedules will be adjusted during the holiday season with no tests on major holidays and alternative arrangements including extended hours and weekend slots.",
    category: "exam",
    priority: "medium",
    tags: ["driving-test", "schedule", "holidays", "arrangements"],
    status: "published",
    publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    targetAudience: "applicants",
  },

  // Amharic News
  {
    title: "አዲስ የመንጃ ፈቃድ ማመልከቻ ስርዓት ተጀመረ",
    featuredImage:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&crop=center",
    content: `
      <h2>አዲስ ዲጂታል መድረክ አሁን ይገኛል</h2>
      <p>የኢትዮጵያ ትራንስፖርት ባለስልጣን አዲሱን የመንጃ ፈቃድ ማመልከቻ ስርዓት ማስጀመሩን በኩራት ይገልጻል። ይህ ዲጂታል መድረክ አገልግሎታችንን ዘመናዊ ማድረግ እና በመላው ሀገሪቱ ላሉ ዜጎች የበለጠ ተደራሽ ማድረግ ረገድ ትልቅ እርምጃ ነው።</p>
      
      <h3>ዋና ዋና ባህሪያት:</h3>
      <ul>
        <li>24/7 የመስመር ላይ ማመልከቻ ማቅረቢያ</li>
        <li>በእውነተኛ ጊዜ ማመልከቻ ክትትል</li>
        <li>ዲጂታል ሰነድ መስቀያ</li>
        <li>የመስመር ላይ ክፍያ ሂደት</li>
        <li>የኤስኤምኤስ እና ኢሜይል ማሳወቂያዎች</li>
      </ul>
      
      <h3>እንዴት ማመልከት እንደሚቻል:</h3>
      <p>ዜጎች አሁን ድረ-ገጻችንን በመጎብኘት የመንጃ ፈቃድ ማመልከቻቸውን ከቤታቸው ሆነው ማጠናቀቅ ይችላሉ። ሂደቱ የሚከተሉትን ያካትታል:</p>
      <ol>
        <li>በመድረካችን ላይ መለያ ይፍጠሩ</li>
        <li>የማመልከቻ ቅጹን ይሙሉ</li>
        <li>የሚያስፈልጉ ሰነዶችን ይስቀሉ</li>
        <li>የማመልከቻ ክፍያውን በመስመር ላይ ይክፈሉ</li>
        <li>የመንጃ ፈተናዎን ይመድቡ</li>
      </ol>
      
      <p>ይህ አዲስ ስርዓት የመጠበቂያ ጊዜን በከፍተኛ ሁኔታ ይቀንሳል እና ለዜጎቻችን ያለውን አጠቃላይ ተሞክሮ ያሻሽላል። ሁሉም ሰው ይህንን ምቹ አዲስ አገልግሎት እንዲጠቀም እናበረታታለን።</p>
    `,
    summary:
      "የኢትዮጵያ ትራንስፖርት ባለስልጣን አዲስ የመስመር ላይ የመንጃ ፈቃድ ማመልከቻ ስርዓት ጀምሯል፣ 24/7 መዳረሻ፣ በእውነተኛ ጊዜ ክትትል እና የዲጂታል ሰነድ ሂደትን ያቀርባል።",
    category: "announcement",
    priority: "high",
    tags: ["የመስመር-ላይ-ስርዓት", "መንጃ-ፈቃድ", "ዲጂታል-አገልግሎቶች", "ማስታወቂያ"],
    status: "published",
    publishDate: new Date(),
    isSticky: true,
    targetAudience: "all",
    allowComments: true,
    notifyUsers: true,
  },
  {
    title: "የተሻሻሉ የትራፊክ ህጎች እና ደንቦች - 2024",
    featuredImage:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=400&fit=crop&crop=center",
    content: `
      <h2>ለትራፊክ ህጎች አስፈላጊ ማሻሻያዎች</h2>
      <p>የትራንስፖርት ሚኒስቴር ከጥር 1 ቀን 2024 ጀምሮ ተግባራዊ የሚሆኑ በርካታ አስፈላጊ የትራፊክ ህጎች እና ደንቦች ማሻሻያዎችን አስታውቋል። ሁሉም ሹፌሮች እነዚህን ለውጦች እንዲያውቁ ይጠበቅባቸዋል።</p>
      
      <h3>ዋና ዋና ለውጦች የሚከተሉትን ያካትታሉ:</h3>
      <ul>
        <li><strong>የፍጥነት ገደቦች:</strong> በከተማ አካባቢዎች አዲስ የፍጥነት ገደብ ወደ 40 ኪ.ሜ/ሰዓት ቀንሷል</li>
        <li><strong>የሞባይል ስልክ አጠቃቀም:</strong> በመንዳት ጊዜ ሞባይል ስልክ ለመጠቀም ጠንካራ ቅጣት</li>
        <li><strong>የደህንነት ቀበቶ መስፈርቶች:</strong> ለሁሉም ተሳፋሪዎች፣ የኋላ መቀመጫዎችን ጨምሮ ግዴታ</li>
        <li><strong>የሞተር ሳይክል ቁርኝት:</strong> ለሹፌር እና ለተሳፋሪ ሁለቱም ያስፈልጋል</li>
        <li><strong>የመኪና ማቆሚያ ደንቦች:</strong> በዋና ዋና ከተሞች አዲስ የተመደቡ የመኪና ማቆሚያ ዞኖች</li>
      </ul>
      
      <h3>የቅጣት ማሻሻያዎች:</h3>
      <p>የትራፊክ ጥሰት ቅጣቶች የመንገድ ደህንነትን ከግምት በማስገባት ተሻሽለዋል። አዲሱ የቅጣት መዋቅር የሚከተሉትን ያካትታል:</p>
      <ul>
        <li>ፍጥነት መጨመር: እንደ ክብደቱ 500-2000 ብር</li>
        <li>ሞባይል ስልክ መጠቀም: 300 ብር</li>
        <li>የደህንነት ቀበቶ አለመልበስ: 200 ብር</li>
        <li>የመኪና ማቆሚያ ጥሰቶች: 150 ብር</li>
      </ul>
      
      <p>ለሙሉ ዝርዝሮች፣ እባክዎ ድረ-ገጻችንን ይጎብኙ ወይም የአካባቢዎን የትራንስፖርት ቢሮ ያነጋግሩ።</p>
    `,
    summary:
      "ለ2024 አዲስ የትራፊክ ህጎች እና ደንቦች የተሻሻሉ የፍጥነት ገደቦች፣ ጠንካራ የሞባይል ስልክ ቅጣቶች፣ ለሁሉም ተሳፋሪዎች ግዴታ የደህንነት ቀበቶዎች እና የተሻሻሉ የቅጣት መዋቅሮችን ያካትታሉ።",
    category: "policy",
    priority: "high",
    tags: ["የትራፊክ-ህጎች", "ደንቦች", "2024", "ደህንነት", "ቅጣቶች"],
    status: "published",
    publishDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    targetAudience: "license_holders",
    allowComments: true,
  },
];

const addTestNews = async () => {
  try {
    await connectDB();

    // Find or create a test admin user
    let adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.log("No admin user found. Creating test admin user...");
      adminUser = new User({
        fullName: "System Administrator",
        user_name: "newsadmin",
        email: "newsadmin@dlms.com",
        password: "hashedpassword123",
        role: "admin",
        isAdmin: true,
        nic: "ADMIN001",
      });
      await adminUser.save();
    } else {
      console.log(
        "Using existing admin user:",
        adminUser.fullName || adminUser.user_name
      );
    }

    console.log("🗞️  Adding test news articles...\n");

    // Clear existing test news (optional)
    await News.deleteMany({ authorName: "System Administrator" });

    // Add new test news
    for (const newsItem of testNewsData) {
      const news = new News({
        ...newsItem,
        author: adminUser._id,
        authorName: adminUser.fullName,
      });

      await news.save();
      console.log(`✅ Added: ${news.title.substring(0, 50)}...`);
    }

    console.log(
      `\n🎉 Successfully added ${testNewsData.length} test news articles!`
    );
    console.log("📊 News breakdown:");
    console.log(
      `   - English articles: ${
        testNewsData.filter((n) => !n.title.includes("የ")).length
      }`
    );
    console.log(
      `   - Amharic articles: ${
        testNewsData.filter((n) => n.title.includes("የ")).length
      }`
    );
    console.log(
      `   - High priority: ${
        testNewsData.filter((n) => n.priority === "high").length
      }`
    );
    console.log(
      `   - Sticky articles: ${testNewsData.filter((n) => n.isSticky).length}`
    );
  } catch (error) {
    console.error("❌ Error adding test news:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

// Run the script
addTestNews();
