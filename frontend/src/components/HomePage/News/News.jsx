import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./News.module.css";
import { FaNewspaper } from "react-icons/fa";
import api from "../../../config/api";

const DEBUG = import.meta.env.VITE_API_DEBUG === "true";

const News = () => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const totalPages = Math.ceil(newsData.length / 3);

  // Fetch news from API
  const fetchNews = async () => {
    try {
      setLoading(true);

      if (DEBUG) console.log("📰 Fetching news for home page...");

      const response = await api.get("/news/published", {
        params: {
          limit: 6, // Get 6 latest news items for home page
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

          if (DEBUG)
            console.log(`🖼️ HOME NEWS IMAGE - ${item.title}:`, {
              featuredImage: item.featuredImage,
              finalUrl: imageUrl,
            });

          return {
            id: item._id,
            image: imageUrl,
            header: item.title,
            text: item.summary,
            dateCreated: new Date(
              item.publishDate || item.createdAt
            ).toLocaleDateString(),
            url: `/news/${item._id}`,
            category: item.category,
            priority: item.priority,
            views: item.views || 0,
          };
        });

        setNewsData(transformedNews);
        if (DEBUG)
          console.log(
            `✅ Loaded ${transformedNews.length} news items for home page`
          );
      } else {
        setNewsData([]);
      }
    } catch (_error) {
      // Silent fallback: do not show error UI or console noise
      setNewsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load news on component mount
  useEffect(() => {
    fetchNews();
  }, []);

  const scrollToIndex = (index) => {
    const container = scrollRef.current;
    const cardWidth = container.offsetWidth / 3; // Ensure only 3 cards are shown
    container.scrollTo({
      left: index * cardWidth * 3,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const handleScroll = () => {
    const scrollLeft = scrollRef.current.scrollLeft;
    const containerWidth = scrollRef.current.offsetWidth;
    const index = Math.round(scrollLeft / containerWidth);
    setActiveIndex(index);
  };

  const handleButtonClick = (index) => {
    scrollToIndex(index);
  };

  const handleMoreNewsClick = () => {
    try {
      navigate("/news");
    } catch (_e) {
      // Fallback to window.location only if needed
      window.location.href = "/news";
    }
  };

  return (
    <div className={styles.newsContainer}>
      <div className={styles.title}>News Feed</div>

      {loading ? (
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading latest news...</p>
        </div>
      ) : newsData.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <p>📰 No news available at the moment</p>
          <p>Check back later for updates!</p>
        </div>
      ) : (
        <>
          <div
            className={styles.scrollWrapper}
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {newsData.map((news) => (
              <div key={news.id} className={styles.newsCard}>
                <div className={styles.newsImage}>
                  <img
                    src={news.image}
                    alt={news.header}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholderContainer = e.target.parentElement;
                      if (placeholderContainer && !placeholderContainer.querySelector('.news-placeholder')) {
                        // Create SVG placeholder directly in the container
                        const variant = Math.floor(Math.random() * 3) + 1;
                        const colors = [
                          { primary: '#667eea', secondary: '#764ba2' }, // Blue-purple
                          { primary: '#38b2ac', secondary: '#319795' }, // Teal
                          { primary: '#ed8936', secondary: '#dd6b20' }  // Orange
                        ];
                        const color = colors[variant - 1];
                        
                        const svgPlaceholder = `
                        <svg width="100%" height="100%" viewBox="0 0 300 200" class="${styles.newsPlaceholder}" style="border-radius: 8px;">
                          <defs>
                            <linearGradient id="newsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stop-color="${color.primary}" />
                              <stop offset="100%" stop-color="${color.secondary}" />
                            </linearGradient>
                            <radialGradient id="newsRadial" cx="50%" cy="50%">
                              <stop offset="0%" stop-color="rgba(255,255,255,0.2)" />
                              <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                            </radialGradient>
                          </defs>
                          <rect width="300" height="200" fill="url(#newsGradient)" />
                          <circle cx="50" cy="50" r="30" fill="url(#newsRadial)" opacity="0.3" />
                          <circle cx="250" cy="150" r="40" fill="url(#newsRadial)" opacity="0.2" />
                          <g>
                            <rect x="110" y="70" width="80" height="60" fill="white" rx="4" opacity="0.9" />
                            <rect x="115" y="75" width="70" height="4" fill="#4a5568" />
                            <rect x="115" y="85" width="50" height="2" fill="#4a5568" opacity="0.7" />
                            <rect x="115" y="90" width="60" height="2" fill="#4a5568" opacity="0.7" />
                            <rect x="115" y="95" width="45" height="2" fill="#4a5568" opacity="0.7" />
                            <rect x="115" y="105" width="25" height="20" fill="${color.primary}" opacity="0.3" rx="2" />
                            <rect x="145" y="105" width="35" height="2" fill="#4a5568" opacity="0.5" />
                            <rect x="145" y="110" width="30" height="2" fill="#4a5568" opacity="0.5" />
                            <rect x="145" y="115" width="35" height="2" fill="#4a5568" opacity="0.5" />
                            <rect x="145" y="120" width="25" height="2" fill="#4a5568" opacity="0.5" />
                          </g>
                          <text x="150" y="45" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="12" font-weight="bold" font-family="Arial, sans-serif">
                            NEWS
                          </text>
                        </svg>`;
                        
                        placeholderContainer.innerHTML = svgPlaceholder;
                      }
                    }}
                  />
                </div>
                <div className={styles.newsContent}>
                  <h2 className={styles.newsHeader}>{news.header}</h2>
                  <p className={styles.newsText}>{news.text}</p>
                  <div className={styles.newsFooter}>
                    <span className={styles.newsDate}>{news.dateCreated}</span>
                    <Link to="/news" className={styles.readMoreButton}>
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - only show if there are multiple pages */}
          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={`${styles.paginationButton} ${
                    activeIndex === index ? styles.active : ""
                  }`}
                  onClick={() => handleButtonClick(index)}
                />
              ))}
            </div>
          )}
        </>
      )}
      <div className={styles.buttonsWrapper}>
        <div
          className={styles.viewAllButton}
          onClick={handleMoreNewsClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMoreNewsClick();
            }
          }}
        >
          <FaNewspaper className={styles.buttonIcon} />
          <span>ሁሉንም ዜናዎች ይመልከቱ</span>
        </div>
      </div>
    </div>
  );
};

export default News;
