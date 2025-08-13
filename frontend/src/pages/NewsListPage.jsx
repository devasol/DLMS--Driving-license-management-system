import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/HomePage/Header/Header";
import Footer from "../components/HomePage/Footer/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../config/api";
import {
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaEye,
  FaShareAlt,
} from "react-icons/fa";
import styles from "./NewsListPage.module.css";

const DEBUG = import.meta.env.VITE_API_DEBUG === "true";

const NewsListPage = () => {
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [newsData, setNewsData] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [sortBy, setSortBy] = useState("newest"); // 'newest' or 'oldest'
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Fetch news from API
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      if (DEBUG)
        console.log("📰 Fetching all published news for news list page...");

      const response = await api.get("/news/published", {
        params: {
          limit: 50, // Get more news for the list page
          page: 1,
        },
      });

      if (response.data.success && response.data.news) {
        // Transform API data to match the expected format
        const transformedNews = response.data.news.map((item) => {
          // Construct image URL with proper fallback logic
          let imageUrl;
          if (item.featuredImage) {
            // Ensure the path starts with /uploads and use relative URL for proxy
            const imagePath = item.featuredImage.startsWith("/uploads")
              ? item.featuredImage
              : `/uploads/news/${item.featuredImage}`;
            imageUrl = `${imagePath}?t=${Date.now()}`;
          } else {
            imageUrl =
              "https://www.aadvlca.com/assets/uploads/media-uploader/71725703020.jpg";
          }

          return {
            id: item._id,
            image: imageUrl,
            header: item.title,
            text: item.summary || item.content?.substring(0, 200) + "...",
            dateCreated: new Date(
              item.publishDate || item.createdAt
            ).toLocaleDateString(),
            category: item.category,
            priority: item.priority,
            views: item.views || 0,
            author: item.authorName || "DLMS Admin",
            publishDate: item.publishDate || item.createdAt,
          };
        });

        setNewsData(transformedNews);
        setFilteredNews(sortNews(transformedNews, sortBy));
        if (DEBUG)
          console.log(
            `✅ Loaded ${transformedNews.length} news items for news list page`
          );
      } else {
        setNewsData([]);
        setFilteredNews([]);
      }
    } catch (error) {
      console.error("❌ Error fetching news:", error);
      setError("Failed to load news");
      setNewsData([]);
      setFilteredNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchNews();
  }, []);

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

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredNews(sortNews(newsData, sortBy));
    } else {
      const filtered = newsData.filter(
        (news) =>
          news.header.toLowerCase().includes(term.toLowerCase()) ||
          news.text.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredNews(sortNews(filtered, sortBy));
    }
  };

  const sortNews = (newsArray, sortType) => {
    if (sortType === "newest") {
      return [...newsArray].sort(
        (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
      );
    } else {
      return [...newsArray].sort(
        (a, b) => new Date(a.publishDate) - new Date(b.publishDate)
      );
    }
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    setFilteredNews(sortNews(filteredNews, sortType));
  };

  return (
    <div ref={containerRef} className={styles.pageContainer}>
      {/* Interactive mouse follower */}
      <div
        className={styles.mouseFollower}
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
      />

      <Header />
      <div className={styles.container}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{t("newsPage.title")}</h1>
          <p className={styles.subtitle}>{t("newsPage.subtitle")}</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading news articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className={styles.errorContainer}>
            <h2>⚠️ {error}</h2>
            <p>Unable to load news articles at the moment.</p>
            <button onClick={fetchNews} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        )}

        {/* No News State */}
        {!loading && !error && filteredNews.length === 0 && (
          <div className={styles.emptyContainer}>
            <h2>📰 No News Available</h2>
            <p>There are no news articles to display at the moment.</p>
            <p>Check back later for updates!</p>
          </div>
        )}

        {/* Content - only show if not loading, no error, and has news */}
        {!loading && !error && filteredNews.length > 0 && (
          <>
            {/* Search and filter bar */}
            <div className={styles.searchFilterBar}>
              <div className={styles.searchFilterContainer}>
                <div className={styles.searchContainer}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder={t("newsPage.searchPlaceholder")}
                    value={searchTerm}
                    onChange={handleSearch}
                    className={styles.searchInput}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={styles.filterButton}
                >
                  <FaFilter />
                  <span>{t("newsPage.filters")}</span>
                </button>
              </div>

              {/* Expanded filters */}
              {showFilters && (
                <div className={styles.expandedFilters}>
                  <div className={styles.filterOptions}>
                    <div>
                      <p className={styles.filterLabel}>
                        {t("newsPage.sortBy")}
                      </p>
                      <div className={styles.sortButtons}>
                        <button
                          onClick={() => handleSortChange("newest")}
                          className={`${styles.sortButton} ${
                            sortBy === "newest" ? styles.active : ""
                          }`}
                        >
                          {t("newsPage.newest")}
                        </button>
                        <button
                          onClick={() => handleSortChange("oldest")}
                          className={`${styles.sortButton} ${
                            sortBy === "oldest" ? styles.active : ""
                          }`}
                        >
                          {t("newsPage.oldest")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Featured news */}
            {filteredNews.length > 0 && (
              <div className={styles.featuredNews}>
                <Link
                  to={`/news/${filteredNews[0].id}`}
                  className={styles.featuredLink}
                >
                  <div className={styles.featuredCard}>
                    <div className={styles.featuredImageContainer}>
                      <img
                        src={filteredNews[0].image}
                        alt={filteredNews[0].header}
                        className={styles.featuredImage}
                        onError={(e) => {
                          console.error("❌ FEATURED IMAGE FAILED:", {
                            originalSrc: filteredNews[0].image,
                            error: e,
                            newsTitle: filteredNews[0].header,
                          });
                          // Set fallback image
                          e.target.src =
                            "https://www.aadvlca.com/assets/uploads/media-uploader/71725703020.jpg";
                        }}
                        onLoad={() => {
                          console.log(
                            "✅ FEATURED SUCCESS:",
                            filteredNews[0].image
                          );
                        }}
                      />
                      <div className={styles.featuredBadge}>
                        {t("newsPage.featured")}
                      </div>
                    </div>
                    <div className={styles.featuredContent}>
                      <div className={styles.featuredDate}>
                        <FaCalendarAlt />
                        <span>{filteredNews[0].dateCreated}</span>
                      </div>
                      <h2 className={styles.featuredHeader}>
                        {filteredNews[0].header}
                      </h2>
                      <p className={styles.featuredText}>
                        {filteredNews[0].text}
                      </p>
                      <div className={styles.featuredFooter}>
                        <div className={styles.featuredStats}>
                          <span className={styles.viewCount}>
                            <FaEye />
                            1.2K
                          </span>
                          <span className={styles.shareButton}>
                            <FaShareAlt />
                            {t("newsPage.share")}
                          </span>
                        </div>
                        <div className={styles.readMoreLink}>
                          <span>{t("newsPage.readFullArticle")}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={styles.arrowIcon}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* News grid */}
            {filteredNews.length > 0 ? (
              <div className={styles.newsGrid}>
                {filteredNews.slice(1).map((news) => (
                  <Link
                    to={`/news/${news.id}`}
                    key={news.id}
                    className={styles.newsCard}
                  >
                    <div className={styles.newsImageContainer}>
                      <img
                        src={news.image}
                        alt={news.header}
                        className={styles.newsImage}
                        onError={(e) => {
                          console.error("❌ NEWS LIST IMAGE FAILED:", {
                            originalSrc: news.image,
                            error: e,
                            newsTitle: news.header,
                          });
                          // Set fallback image
                          e.target.src =
                            "https://www.aadvlca.com/assets/uploads/media-uploader/71725703020.jpg";
                        }}
                        onLoad={() => {
                          console.log("✅ NEWS LIST SUCCESS:", news.image);
                        }}
                      />
                    </div>
                    <div className={styles.newsContent}>
                      <div className={styles.newsDate}>
                        <FaCalendarAlt />
                        <span>{news.dateCreated}</span>
                      </div>
                      <h3 className={styles.newsHeader}>{news.header}</h3>
                      <p className={styles.newsText}>{news.text}</p>
                      <div className={styles.readMore}>
                        {t("newsPage.readMore")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <div className={styles.noResultsEmoji}>😕</div>
                <h3 className={styles.noResultsTitle}>
                  {t("newsPage.noResults")}
                </h3>
                <p className={styles.noResultsText}>
                  {t("newsPage.noResultsDesc")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NewsListPage;
