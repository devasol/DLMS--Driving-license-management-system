import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../components/HomePage/Header/Header";
import Footer from "../components/HomePage/Footer/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../config/api";
import {
  FaCalendarAlt,
  FaArrowLeft,
  FaShare,
  FaEye,
  FaComment,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaCopy,
  FaHome,
} from "react-icons/fa";
import styles from "./NewsPage.module.css";
import { sanitizeHtml } from "../utils/htmlSanitizer";

// Share button component in the NewsPage component
const ShareButton = ({ newsTitle }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareOptionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareOptionsRef.current &&
        !shareOptionsRef.current.contains(event.target)
      ) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleShareClick = () => {
    setShowShareOptions(!showShareOptions);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = newsTitle || "የመንጃ ፈቃድ አስተዳደር ስርዓት ዜና"; // Use provided title or default

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(
          title
        )}&body=${encodeURIComponent(`ይህን አንቀጽ ይመልከቱ: ${url}`)}`;
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
          alert("ሊንኩ ተቀድቷል!");
        });
    }

    setShowShareOptions(false);
  };

  return (
    <div className={styles.shareButtonContainer} ref={shareOptionsRef}>
      <button className={styles.shareButton} onClick={handleShareClick}>
        <FaShare className={styles.statsIcon} />
        <span>አጋራ</span>
      </button>
      {showShareOptions && (
        <div className={styles.shareOptions}>
          <button
            onClick={() => handleShare("facebook")}
            className={styles.shareOption}
          >
            <FaFacebookF className={styles.shareOptionIcon} /> Facebook
          </button>
          <button
            onClick={() => handleShare("twitter")}
            className={styles.shareOption}
          >
            <FaTwitter className={styles.shareOptionIcon} /> Twitter
          </button>
          <button
            onClick={() => handleShare("linkedin")}
            className={styles.shareOption}
          >
            <FaLinkedinIn className={styles.shareOptionIcon} /> LinkedIn
          </button>
          <button
            onClick={() => handleShare("email")}
            className={styles.shareOption}
          >
            <FaEnvelope className={styles.shareOptionIcon} /> ኢሜይል
          </button>
          <button
            onClick={() => handleShare("copy")}
            className={styles.shareOption}
          >
            <FaCopy className={styles.shareOptionIcon} /> ሊንክ ቅዳ
          </button>
        </div>
      )}
    </div>
  );
};

const NewsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribeMessage, setSubscribeMessage] = useState({
    text: "",
    type: "",
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Fetch news article from API
  const fetchNewsArticle = async (newsId) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📰 Fetching news article with ID: ${newsId}`);

      const response = await api.get(`/news/${newsId}`);

      if (response.data.success && response.data.news) {
        const newsItem = response.data.news;

        // Transform API data to match component format
        let imageUrl;
        if (newsItem.featuredImage) {
          // Ensure the path starts with /uploads and use relative URL for proxy
          const imagePath = newsItem.featuredImage.startsWith("/uploads")
            ? newsItem.featuredImage
            : `/uploads/news/${newsItem.featuredImage}`;
          imageUrl = `${imagePath}?t=${Date.now()}`;
        } else {
          imageUrl =
            "https://www.aadvlca.com/assets/uploads/media-uploader/71725703020.jpg";
        }

        console.log(`🖼️ NewsPage Image Processing:`, {
          title: newsItem.title,
          featuredImage: newsItem.featuredImage,
          finalImageUrl: imageUrl,
          isUsingFallback: !newsItem.featuredImage,
        });

        const transformedNews = {
          id: newsItem._id,
          image: imageUrl,
          header: newsItem.title,
          text: newsItem.content, // Full content for the article page
          summary: newsItem.summary,
          dateCreated: new Date(
            newsItem.publishDate || newsItem.createdAt
          ).toLocaleDateString(),
          category: newsItem.category,
          priority: newsItem.priority,
          views: newsItem.views || 0,
          author: newsItem.authorName || "DLMS Admin",

          likes: newsItem.likes?.length || 0,
          comments: newsItem.comments?.filter((c) => c.isApproved)?.length || 0,
        };

        setNews(transformedNews);
        console.log("✅ News article loaded successfully");

        // Fetch related news
        await fetchRelatedNews(newsItem.category, newsId);
      } else {
        setError("News article not found");
        console.log("❌ News article not found");
      }
    } catch (error) {
      console.error("❌ Error fetching news article:", error);
      setError("Failed to load news article");
    } finally {
      setLoading(false);
    }
  };

  // Fetch related news articles
  const fetchRelatedNews = async (category, currentId) => {
    try {
      console.log(`🔗 Fetching related news for category: ${category}`);

      const response = await api.get("/news/published", {
        params: {
          category: category,
          limit: 4, // Get 4 to exclude current and show 3
        },
      });

      if (response.data.success && response.data.news) {
        // Transform and filter out current article
        const transformedRelated = response.data.news
          .filter((item) => item._id !== currentId)
          .slice(0, 3)
          .map((item) => ({
            id: item._id,
            image: item.featuredImage
              ? `${item.featuredImage}?t=${Date.now()}`
              : "https://www.aadvlca.com/assets/uploads/media-uploader/71725703020.jpg",
            header: item.title,
            text: item.summary,
            dateCreated: new Date(
              item.publishDate || item.createdAt
            ).toLocaleDateString(),
            category: item.category,
          }));

        setRelatedNews(transformedRelated);
        console.log(
          `✅ Loaded ${transformedRelated.length} related news articles`
        );
      }
    } catch (error) {
      console.error("❌ Error fetching related news:", error);
      // Don't set error for related news, just log it
    }
  };

  useEffect(() => {
    if (id) {
      // Reset states
      setExpanded(false);
      setNews(null);
      setRelatedNews([]);

      // Fetch the news article
      fetchNewsArticle(id);

      // Scroll to top when article changes
      window.scrollTo(0, 0);
    }
  }, [id]);

  // Mouse tracking effect for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading news article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>⚠️ {error}</h2>
          <p>The news article you're looking for could not be found.</p>
          <div className={styles.errorActions}>
            <button
              onClick={() => navigate("/news")}
              className={styles.backButton}
            >
              ← Back to News
            </button>
            <button
              onClick={() => fetchNewsArticle(id)}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No news found
  if (!news) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>📰 News Article Not Found</h2>
          <p>
            The news article you're looking for does not exist or has been
            removed.
          </p>
          <button
            onClick={() => navigate("/news")}
            className={styles.backButton}
          >
            ← Back to News
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const toggleReadMore = () => {
    setExpanded(!expanded);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setSubscribeMessage({ text: "እባክዎ ትክክለኛ ኢሜይል ያስገቡ", type: "error" });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setSubscribeMessage({
        text: "ለዜናዎችን በተሳካ ሁኔታ ተመዝግበዋል!",
        type: "success",
      });
      setEmail("");

      // Clear message after 3 seconds
      setTimeout(() => {
        setSubscribeMessage({ text: "", type: "" });
      }, 3000);
    }, 1000);
  };

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Interactive mouse follower */}
      <div
        className={styles.mouseFollower}
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
      />

      <Header />
      <div className={styles.contentContainer}>
        {/* Navigation buttons */}
        <div className={styles.navigationButtons}>
          <Link to="/news" className={styles.backButton}>
            <FaArrowLeft className={styles.backIcon} />
            <span>{t("newsPage.backToNews")}</span>
          </Link>
          <Link to="/" className={styles.homeButton}>
            <FaHome className={styles.homeIcon} />
            <span>{t("newsPage.backToHome")}</span>
          </Link>
        </div>

        <div className={styles.newsCard}>
          {/* Hero image */}
          <div className={styles.heroImage}>
            <img
              src={news.image}
              alt={news.header}
              onError={(e) => {
                console.error("❌ MAIN NEWS IMAGE FAILED:", {
                  originalSrc: news.image,
                  error: e,
                  newsTitle: news.header,
                });
                // Set fallback image
                e.target.src =
                  "https://www.aadvlca.com/assets/uploads/media-uploader/71725703020.jpg";
              }}
              onLoad={() => {
                console.log("✅ MAIN NEWS SUCCESS:", news.image);
              }}
            />
            <div className={styles.imageOverlay}></div>
            <div className={styles.heroContent}>
              <h1 className={styles.newsTitle}>{news.header}</h1>
              <div className={styles.newsDate}>
                <FaCalendarAlt className={styles.dateIcon} />
                <span>{news.dateCreated}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={styles.contentSection}>
            <div className={styles.authorSection}>
              <div className={styles.author}>
                <div className={styles.authorAvatar}>
                  <span>DLMS</span>
                </div>
                <span className={styles.authorName}>የመንጃ ፈቃድ አስተዳደር ስርዓት</span>
              </div>
              <div className={styles.stats}>
                <div className={styles.viewCount}>
                  <FaEye className={styles.statsIcon} />
                  <span>{news.views || 0} ተመልካቾች</span>
                </div>
                <div className={styles.commentCount}>
                  <FaComment className={styles.statsIcon} />
                  <span>{news.comments || 0} አስተያየቶች</span>
                </div>
                <ShareButton newsTitle={news.header} />
              </div>
            </div>

            {/* Main content */}
            <div className={styles.newsContent}>
              {/* Display the full news content */}
              <div
                className={styles.contentBody}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.text) }}
              />

              {/* Show summary if different from content */}
              {news.summary && news.summary !== news.text && (
                <div className={styles.summaryBox}>
                  <h3 className={styles.summaryTitle}>Summary</h3>
                  <p className={styles.summaryText}>{news.summary}</p>
                </div>
              )}

              {/* Category badge */}
              <div className={styles.categoryBadge}>
                <span className={styles.categoryLabel}>
                  Category: {news.category}
                </span>
                {news.priority && news.priority !== "medium" && (
                  <span
                    className={`${styles.priorityBadge} ${
                      styles[news.priority]
                    }`}
                  >
                    {news.priority.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Call to action */}
              <div className={styles.ctaBox}>
                <h3 className={styles.ctaTitle}>Stay Updated</h3>
                <p className={styles.ctaText}>
                  Subscribe to our newsletter to receive the latest news and
                  updates about driving license management.
                </p>
                <div className={styles.subscribeForm}>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className={styles.emailInput}
                  />
                  <button className={styles.subscribeButton}>Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related news */}
        <div className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>{t("newsPage.relatedNews")}</h2>
          <div className={styles.relatedGrid}>
            {relatedNews.map((item) => (
              <Link
                to={`/news/${item.id}`}
                key={item.id}
                className={styles.relatedCard}
              >
                <div className={styles.relatedImage}>
                  <img
                    src={item.image}
                    alt={item.header}
                    onError={(e) => {
                      console.log(
                        "❌ Failed to load related news image:",
                        item.image
                      );
                      e.target.src =
                        "https://www.aadvlca.com/assets/uploads/media-uploader/71725703020.jpg";
                    }}
                    onLoad={() => {
                      console.log(
                        "✅ Successfully loaded related news image:",
                        item.image
                      );
                    }}
                  />
                </div>
                <div className={styles.relatedContent}>
                  <h3 className={styles.relatedHeader}>{item.header}</h3>
                  <p className={styles.relatedText}>{item.text}</p>
                  <div className={styles.relatedFooter}>
                    <span className={styles.relatedDate}>
                      <FaCalendarAlt className={styles.dateIcon} />
                      {item.dateCreated}
                    </span>
                    <span className={styles.readMore}>
                      {t("newsPage.readMore")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewsPage;
