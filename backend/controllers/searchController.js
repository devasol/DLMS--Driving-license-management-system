import News from "../models/News.js";
import User from "../models/User.js";
import License from "../models/License.js";
import ExamSchedule from "../models/examSchedule.js";

export const performGlobalSearch = async (req, res) => {
  try {
    const { q: query, type, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
        results: [],
      });
    }

    const searchTerm = query.trim();
    const searchRegex = new RegExp(searchTerm, "i");
    const results = [];

    // Search News (public content)
    if (!type || type === "news") {
      try {
        const newsResults = await News.find({
          status: "published",
          $or: [
            { title: searchRegex },
            { summary: searchRegex },
            { content: searchRegex },
            { tags: { $in: [searchRegex] } },
          ],
        })
          .select("title summary category publishDate featuredImage")
          .limit(parseInt(limit))
          .sort({ publishDate: -1 });

        const formattedNews = newsResults.map((news) => ({
          type: "news",
          id: news._id,
          title: news.title,
          description: news.summary,
          category: news.category,
          date: news.publishDate,
          image: news.featuredImage,
          path: `/news/${news._id}`,
          icon: "📰",
        }));

        results.push(...formattedNews);
      } catch (error) {
        console.error("News search error:", error);
      }
    }

    // Static content search
    if (!type || type === "pages") {
      const staticContent = [
        {
          type: "page",
          title: "Home",
          description: "Main homepage with all services and information",
          path: "/",
          icon: "🏠",
          keywords: ["home", "main", "homepage", "services", "information"],
        },
        {
          type: "page",
          title: "Services",
          description: "License application, road test, renewal services",
          path: "/services",
          icon: "🚗",
          keywords: [
            "services",
            "license",
            "application",
            "road",
            "test",
            "renewal",
            "driving",
          ],
        },
        {
          type: "page",
          title: "About",
          description: "About our driving license management system",
          path: "/about",
          icon: "ℹ️",
          keywords: [
            "about",
            "information",
            "system",
            "management",
            "driving",
            "license",
          ],
        },
        {
          type: "page",
          title: "Contact",
          description: "Contact us for support and inquiries",
          path: "/contact",
          icon: "📞",
          keywords: [
            "contact",
            "support",
            "help",
            "inquiries",
            "phone",
            "email",
          ],
        },
        {
          type: "page",
          title: "User Manual",
          description: "Complete guide on how to use the system",
          path: "/user-manual",
          icon: "📖",
          keywords: [
            "manual",
            "guide",
            "help",
            "instructions",
            "tutorial",
            "how to",
          ],
        },
        {
          type: "service",
          title: "License Application",
          description: "Apply for your driving license online",
          path: "/services",
          icon: "🆔",
          keywords: [
            "license",
            "application",
            "apply",
            "driving",
            "online",
            "new",
          ],
        },
        {
          type: "service",
          title: "Road Test",
          description: "Schedule and take your driving test",
          path: "/services",
          icon: "🛣️",
          keywords: [
            "road",
            "test",
            "driving",
            "schedule",
            "exam",
            "practical",
          ],
        },
        {
          type: "service",
          title: "License Renewal",
          description: "Renew your existing driving license",
          path: "/services",
          icon: "🔄",
          keywords: [
            "renewal",
            "renew",
            "license",
            "existing",
            "extend",
            "update",
          ],
        },
        {
          type: "service",
          title: "License Verification",
          description: "Verify license authenticity with QR code",
          path: "/services",
          icon: "✅",
          keywords: [
            "verification",
            "verify",
            "authentic",
            "qr",
            "code",
            "check",
          ],
        },
      ];

      const matchingStatic = staticContent.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.keywords.some((keyword) => keyword.includes(searchLower))
        );
      });

      results.push(...matchingStatic);
    }

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchTerm.toLowerCase();
      const bExact = b.title.toLowerCase() === searchTerm.toLowerCase();

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStartsWith = a.title
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());
      const bStartsWith = b.title
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      return 0;
    });

    // Group results by type
    const groupedResults = sortedResults.reduce((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {});

    res.json({
      success: true,
      query: searchTerm,
      totalResults: sortedResults.length,
      results: sortedResults,
      groupedResults,
      searchTime: Date.now(),
    });
  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
      results: [],
    });
  }
};
