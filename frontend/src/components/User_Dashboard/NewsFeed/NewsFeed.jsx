import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  IconButton,
  Avatar,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Share,
  Visibility,
  AccessTime,
  Person,
  Category,
  TrendingUp,
  Announcement,
  Close,
  Refresh,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../config/api";
import { sanitizeHtml } from "../../../utils/htmlSanitizer";

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedNews, setSelectedNews] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likedNews, setLikedNews] = useState(new Set());
  const [tabValue, setTabValue] = useState(0);

  const categories = [
    { value: "all", label: "All News", icon: "📰" },
    { value: "announcement", label: "Announcements", icon: "📢" },
    { value: "policy", label: "Policy Updates", icon: "📋" },
    { value: "exam", label: "Exam News", icon: "🎓" },
    { value: "license", label: "License Updates", icon: "🎫" },
    { value: "traffic", label: "Traffic News", icon: "🚦" },
    { value: "emergency", label: "Emergency", icon: "🚨" },
  ];

  const priorityColors = {
    low: "#4caf50",
    medium: "#ff9800",
    high: "#f44336",
    urgent: "#9c27b0",
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      const response = await api.get("/news/published", { params });

      if (response.data.success) {
        setNews(response.data.news);
      } else {
        setError("Failed to fetch news");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to load news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (newsId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to like news");
        return;
      }

      const response = await api.post(
        `/news/${newsId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const { liked, likeCount } = response.data;

        // Update liked news set
        const newLikedNews = new Set(likedNews);
        if (liked) {
          newLikedNews.add(newsId);
        } else {
          newLikedNews.delete(newsId);
        }
        setLikedNews(newLikedNews);

        // Update news list
        setNews((prevNews) =>
          prevNews.map((item) =>
            item._id === newsId
              ? {
                  ...item,
                  likeCount,
                  likes: liked
                    ? [...(item.likes || []), { user: "current" }]
                    : (item.likes || []).filter(
                        (like) => like.user !== "current"
                      ),
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error liking news:", error);
      alert("Failed to like news. Please try again.");
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to comment");
        return;
      }

      const response = await api.post(
        `/news/${selectedNews._id}/comment`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update the selected news with new comment
        const updatedNews = {
          ...selectedNews,
          comments: [...(selectedNews.comments || []), response.data.comment],
        };
        setSelectedNews(updatedNews);

        // Update news list
        setNews((prevNews) =>
          prevNews.map((item) =>
            item._id === selectedNews._id ? updatedNews : item
          )
        );

        setCommentText("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const openNewsDialog = async (newsItem) => {
    setSelectedNews(newsItem);
    setOpenDialog(true);

    // Increment view count
    try {
      await api.get(`/news/${newsItem._id}`);
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const newsDate = new Date(date);
    const diffInHours = Math.floor((now - newsDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(date);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TrendingUp sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                📰 News Feed
              </Typography>
              <Typography variant="subtitle1">
                Stay updated with the latest driving license news and
                announcements
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchNews}
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Category Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ p: 1 }}
        >
          {categories.map((category) => (
            <Tab
              key={category.value}
              value={category.value}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* News Grid */}
      <Grid container spacing={3}>
        <AnimatePresence>
          {news.map((newsItem, index) => (
            <Grid item xs={12} md={6} lg={4} key={newsItem._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    },
                  }}
                  onClick={() => openNewsDialog(newsItem)}
                >
                  {/* Priority Badge */}
                  {newsItem.priority !== "medium" && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 1,
                      }}
                    >
                      <Chip
                        label={newsItem.priority.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: priorityColors[newsItem.priority],
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    </Box>
                  )}

                  {/* Featured Image */}
                  {newsItem.featuredImage && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={`${newsItem.featuredImage}?t=${Date.now()}`}
                      alt={newsItem.title}
                      onError={(e) => {
                        console.error("❌ NEWSFEED IMAGE FAILED:", {
                          originalSrc: `${newsItem.featuredImage}`,
                          newsTitle: newsItem.title,
                        });
                        // Set fallback image
                        e.target.src =
                          "https://www.aadvlca.com/assets/uploads/media-uploader/71725703020.jpg";
                      }}
                      onLoad={() => {
                        console.log(
                          "✅ NEWSFEED IMAGE SUCCESS:",
                          `${newsItem.featuredImage}`
                        );
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Date */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {getTimeAgo(newsItem.publishDate || newsItem.createdAt)}
                      </Typography>
                    </Box>

                    {/* Title */}
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {newsItem.title}
                    </Typography>

                    {/* Summary */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {newsItem.summary}
                    </Typography>

                    {/* Author */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Avatar sx={{ width: 24, height: 24 }}>
                        <Person />
                      </Avatar>
                      <Typography variant="caption">
                        By {newsItem.authorName}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(newsItem._id);
                          }}
                          color={
                            likedNews.has(newsItem._id) ? "primary" : "default"
                          }
                        >
                          {likedNews.has(newsItem._id) ? (
                            <ThumbUp />
                          ) : (
                            <ThumbUpOutlined />
                          )}
                        </IconButton>
                        <Typography
                          variant="caption"
                          sx={{ alignSelf: "center" }}
                        >
                          {newsItem.likeCount || newsItem.likes?.length || 0}
                        </Typography>

                        <IconButton size="small">
                          <Comment />
                        </IconButton>
                        <Typography
                          variant="caption"
                          sx={{ alignSelf: "center" }}
                        >
                          {newsItem.commentCount ||
                            newsItem.comments?.length ||
                            0}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Visibility
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {newsItem.views || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {news.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📰 No news available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCategory === "all"
              ? "No news articles have been published yet."
              : `No news articles found in the ${selectedCategory} category.`}
          </Typography>
        </Paper>
      )}

      {/* News Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: "90vh" },
        }}
      >
        {selectedNews && (
          <>
            <DialogTitle sx={{ p: 0, position: "relative" }}>
              {selectedNews.featuredImage && (
                <CardMedia
                  component="img"
                  height="250"
                  image={`${selectedNews.featuredImage}?t=${Date.now()}`}
                  alt={selectedNews.title}
                  onError={(e) => {
                    console.error("❌ DIALOG IMAGE FAILED:", {
                      originalSrc: `${selectedNews.featuredImage}`,
                      newsTitle: selectedNews.title,
                    });
                    // Set fallback image
                    e.target.src =
                      "https://www.aadvlca.com/assets/uploads/media-uploader/71725703020.jpg";
                  }}
                  onLoad={() => {
                    console.log(
                      "✅ DIALOG IMAGE SUCCESS:",
                      `${selectedNews.featuredImage}`
                    );
                  }}
                />
              )}
              <IconButton
                onClick={() => setOpenDialog(false)}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                }}
              >
                <Close />
              </IconButton>
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Chip
                    label={selectedNews.priority.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: priorityColors[selectedNews.priority],
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {selectedNews.title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    color: "text.secondary",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person />
                    <Typography variant="body2">
                      By {selectedNews.authorName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTime />
                    <Typography variant="body2">
                      {formatDate(
                        selectedNews.publishDate || selectedNews.createdAt
                      )}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Visibility />
                    <Typography variant="body2">
                      {selectedNews.views || 0} views
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              {/* Content */}
              <Typography
                variant="body1"
                sx={{ mb: 3, lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(selectedNews.content),
                }}
              />

              <Divider sx={{ my: 3 }} />

              {/* Actions */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    startIcon={
                      likedNews.has(selectedNews._id) ? (
                        <ThumbUp />
                      ) : (
                        <ThumbUpOutlined />
                      )
                    }
                    onClick={() => handleLike(selectedNews._id)}
                    color={
                      likedNews.has(selectedNews._id) ? "primary" : "inherit"
                    }
                  >
                    {selectedNews.likeCount || selectedNews.likes?.length || 0}{" "}
                    Likes
                  </Button>
                  <Button startIcon={<Share />}>Share</Button>
                </Box>
              </Box>

              {/* Comments Section */}
              {selectedNews.allowComments && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Comments ({selectedNews.comments?.length || 0})
                  </Typography>

                  {/* Add Comment */}
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleComment}
                      disabled={!commentText.trim() || submittingComment}
                      startIcon={
                        submittingComment ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Comment />
                        )
                      }
                    >
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </Button>
                  </Box>

                  {/* Comments List */}
                  <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                    {selectedNews.comments &&
                    selectedNews.comments.length > 0 ? (
                      selectedNews.comments
                        .filter((comment) => comment.isApproved)
                        .map((comment, index) => (
                          <Box
                            key={index}
                            sx={{
                              mb: 2,
                              p: 2,
                              backgroundColor: "#f5f5f5",
                              borderRadius: 2,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <Avatar sx={{ width: 24, height: 24 }}>
                                <Person />
                              </Avatar>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {comment.userName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {getTimeAgo(comment.createdAt)}
                              </Typography>
                            </Box>
                            <Typography variant="body2">
                              {comment.content}
                            </Typography>
                          </Box>
                        ))
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: "center", py: 2 }}
                      >
                        No comments yet. Be the first to comment!
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default NewsFeed;
