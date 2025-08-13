import mongoose from "mongoose";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/dlms");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// News schema (simplified)
const newsSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    summary: String,
    featuredImage: String,
    category: String,
    priority: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    authorName: String,
    tags: [String],
    publishDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
        isApproved: { type: Boolean, default: false },
      },
    ],
    isSticky: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    notifyUsers: { type: Boolean, default: false },
    targetAudience: {
      type: String,
      enum: ["all", "users", "admins"],
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model("News", newsSchema);

const checkNewsDatabase = async () => {
  await connectDB();

  console.log("🔍 Checking news database...\n");

  try {
    // Get all news articles
    const allNews = await News.find({}).sort({ createdAt: -1 });

    console.log(`📊 Total news articles: ${allNews.length}\n`);

    allNews.forEach((news, index) => {
      console.log(`📰 News ${index + 1}:`);
      console.log(`   ID: ${news._id}`);
      console.log(`   Title: ${news.title}`);
      console.log(`   Status: ${news.status}`);
      console.log(`   Featured Image: ${news.featuredImage || "No image"}`);
      console.log(`   Created: ${news.createdAt}`);
      console.log(`   Author: ${news.authorName || "Unknown"}`);
      console.log("");
    });

    // Check for news with images
    const newsWithImages = allNews.filter((news) => news.featuredImage);
    console.log(`📸 News articles with images: ${newsWithImages.length}`);

    if (newsWithImages.length > 0) {
      console.log("\n🖼️ News articles with images:");
      newsWithImages.forEach((news, index) => {
        console.log(`   ${index + 1}. ${news.title}`);
        console.log(`      Image: ${news.featuredImage}`);
        console.log(
          `      Full URL: http://localhost:5004${news.featuredImage}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error checking database:", error);
  }

  mongoose.connection.close();
};

checkNewsDatabase();
