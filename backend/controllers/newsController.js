import News from "../models/News.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Get all published news (Public)
export const getPublishedNews = async (req, res) => {
  try {
    const { category, tags, limit = 20, page = 1 } = req.query;

    console.log("📰 Fetching published news");

    const parsedLimit = Math.min(parseInt(limit), 50); // Cap at 50 items
    const parsedPage = Math.max(parseInt(page), 1);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build query filter
    const filter = {
      status: "published",
      $or: [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }],
    };

    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(",") };

    // Use lean queries for better performance
    const [news, total] = await Promise.all([
      News.find(filter)
        .select(
          "title content summary excerpt category tags publishDate views isSticky author featuredImage priority authorName"
        )
        .populate("author", "fullName email")
        .sort({ isSticky: -1, publishDate: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      News.countDocuments(filter),
    ]);

    console.log(`✅ Found ${news.length} published news articles`);

    res.json({
      success: true,
      news,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: news.length,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Error fetching published news:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching news",
      error: error.message,
    });
  }
};

// Get single news article
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📰 Fetching news article:", id);

    const news = await News.findById(id)
      .populate("author", "fullName email")
      .populate("comments.user", "fullName");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    // Increment views for published articles
    if (news.status === "published") {
      await news.incrementViews();
    }

    console.log("✅ News article found and views incremented");

    res.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("Error fetching news article:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching news article",
      error: error.message,
    });
  }
};

// Create news (Admin only)
export const createNews = async (req, res) => {
  try {
    const {
      title,
      content,
      summary,
      category,
      priority,
      tags,
      publishDate,
      expiryDate,
      isSticky,
      allowComments,
      notifyUsers,
      targetAudience,
      status,
    } = req.body;

    const authorId = req.userId;

    console.log("📰 Creating news article by admin:", authorId);
    console.log("📋 User role:", req.userRole);

    // For admin users, get author information from admins collection
    let authorName = "Administrator";
    if (req.userRole === "admin") {
      try {
        const adminCollection = mongoose.connection.db.collection("admins");
        const admin = await adminCollection.findOne({
          _id: new mongoose.Types.ObjectId(authorId),
        });
        if (admin) {
          authorName = admin.admin_name || "Administrator";
        }
      } catch (error) {
        console.log("Could not fetch admin info, using default name");
      }
    } else {
      // For regular users with admin privileges
      const author = await User.findById(authorId);
      if (author) {
        authorName = author.fullName || author.full_name || author.email;
      }
    }

    const newsData = {
      title,
      content,
      summary,
      category: category || "general",
      priority: priority || "medium",
      author: authorId,
      authorName: authorName,
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(",").map((tag) => tag.trim())
        : [],
      publishDate:
        status === "published" ? publishDate || new Date() : publishDate,
      expiryDate,
      isSticky: isSticky || false,
      allowComments: allowComments !== false,
      notifyUsers: notifyUsers || false,
      targetAudience: targetAudience || "all",
      status: status || "draft",
    };

    // Handle featured image if uploaded
    if (req.file) {
      newsData.featuredImage = `/uploads/news/${req.file.filename}`;
    }

    const news = new News(newsData);
    await news.save();

    console.log("✅ News article created successfully:", news._id);

    res.status(201).json({
      success: true,
      message: "News article created successfully",
      news,
    });
  } catch (error) {
    console.error("Error creating news article:", error);
    res.status(500).json({
      success: false,
      message: "Error creating news article",
      error: error.message,
    });
  }
};

// Update news (Admin only)
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    console.log("📰 Updating news article:", id);

    // Handle tags
    if (updateData.tags && !Array.isArray(updateData.tags)) {
      updateData.tags = updateData.tags.split(",").map((tag) => tag.trim());
    }

    // Handle publish date
    if (updateData.status === "published" && !updateData.publishDate) {
      updateData.publishDate = new Date();
    }

    // Handle featured image if uploaded
    if (req.file) {
      updateData.featuredImage = `/uploads/news/${req.file.filename}`;
    }

    const news = await News.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "fullName email");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    console.log("✅ News article updated successfully");

    res.json({
      success: true,
      message: "News article updated successfully",
      news,
    });
  } catch (error) {
    console.error("Error updating news article:", error);
    res.status(500).json({
      success: false,
      message: "Error updating news article",
      error: error.message,
    });
  }
};

// Delete news (Admin only)
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📰 Deleting news article:", id);

    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    console.log("✅ News article deleted successfully");

    res.json({
      success: true,
      message: "News article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting news article:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting news article",
      error: error.message,
    });
  }
};

// Get all news for admin (including drafts)
export const getAllNewsAdmin = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    console.log("📰 Admin fetching all news");

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const news = await News.find(query)
      .populate("author", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(query);

    console.log(`✅ Found ${news.length} news articles for admin`);

    res.json({
      success: true,
      news,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: news.length,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Error fetching news for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching news",
      error: error.message,
    });
  }
};

// Like/Unlike news
export const toggleLikeNews = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log("👍 Toggling like for news:", id, "by user:", userId);

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    const existingLike = news.likes.find(
      (like) => like.user.toString() === userId
    );

    if (existingLike) {
      // Remove like
      news.likes = news.likes.filter((like) => like.user.toString() !== userId);
    } else {
      // Add like
      news.likes.push({ user: userId });
    }

    await news.save();

    console.log("✅ Like toggled successfully");

    res.json({
      success: true,
      liked: !existingLike,
      likeCount: news.likes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling like",
      error: error.message,
    });
  }
};

// Add comment to news
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    console.log("💬 Adding comment to news:", id);

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    if (!news.allowComments) {
      return res.status(403).json({
        success: false,
        message: "Comments are not allowed on this article",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const comment = {
      user: userId,
      userName: user.fullName || user.full_name || user.email,
      content: content.trim(),
      createdAt: new Date(),
      isApproved: true, // Auto-approve for now
    };

    news.comments.push(comment);
    await news.save();

    console.log("✅ Comment added successfully");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
};

// Get news categories and stats
export const getNewsStats = async (req, res) => {
  try {
    console.log("📊 Fetching news statistics");

    const stats = await News.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          published: {
            $sum: {
              $cond: [{ $eq: ["$status", "published"] }, 1, 0],
            },
          },
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    const totalNews = await News.countDocuments();
    const publishedNews = await News.countDocuments({ status: "published" });
    const draftNews = await News.countDocuments({ status: "draft" });

    console.log("✅ News statistics fetched");

    res.json({
      success: true,
      stats: {
        total: totalNews,
        published: publishedNews,
        draft: draftNews,
        byCategory: stats,
      },
    });
  } catch (error) {
    console.error("Error fetching news stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};
