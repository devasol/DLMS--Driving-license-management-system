import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import styled from "styled-components";
import axios from "axios";

const StyledWrapper = styled.div`
  position: relative;

  .search {
    display: flex;
    align-items: center;
    position: relative;
    gap: 8px;
  }

  .search__input {
    font-size: 16px;
    background-color: var(--input-bg, #f4f2f2);
    border: 2px solid var(--border-color, #e2e8f0);
    color: var(--text-primary, #646464);
    padding: 0.7rem 1rem;
    border-radius: 30px;
    width: 12em;
    transition: all ease-in-out 0.3s;
    font-family: "Mulish", sans-serif;
    font-weight: lighter;
    letter-spacing: 0.5px;
  }

  .search__input:hover,
  .search__input:focus {
    box-shadow: 0 0 1em rgba(102, 126, 234, 0.2);
    outline: none;
    background-color: var(--input-bg-hover, #f0eeee);
    border-color: #667eea;
    width: 16em;
  }

  .search__button {
    border: 2px solid var(--border-color, #e2e8f0);
    background-color: var(--input-bg, #f4f2f2);
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .search__button:hover {
    background-color: var(--input-bg-hover, #f0eeee);
    border-color: #667eea;
  }

  .search__icon {
    height: 1.3em;
    width: 1.3em;
    fill: var(--text-secondary, #b4b4b4);
    transition: all 0.3s ease;
  }

  .search__button:hover .search__icon {
    fill: #667eea;
  }

  /* Search Results Dropdown */
  .search__results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    margin-top: 8px;
    backdrop-filter: blur(10px);
  }

  .search__results::-webkit-scrollbar {
    width: 6px;
  }

  .search__results::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .search__results::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 3px;
  }

  .search__category {
    padding: 12px 16px;
    font-weight: 600;
    font-size: 14px;
    color: #667eea;
    border-bottom: 1px solid #f0f0f0;
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  }

  .search__item {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .search__item:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .search__item:last-child {
    border-bottom: none;
  }

  .search__item-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .search__item-content {
    flex: 1;
  }

  .search__item-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .search__item-description {
    font-size: 12px;
    opacity: 0.8;
    line-height: 1.3;
  }

  .search__no-results {
    padding: 20px;
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .search__loading {
    padding: 20px;
    text-align: center;
    color: #667eea;
  }

  /* Dark Mode Styles */
  [data-theme="dark"] & {
    .search__input {
      background-color: var(--input-bg, #374151);
      border-color: var(--border-color, #4b5563);
      color: var(--text-primary, #f9fafb);
    }

    .search__input:hover,
    .search__input:focus {
      background-color: var(--input-bg-hover, #4b5563);
      border-color: #818cf8;
      box-shadow: 0 0 1em rgba(129, 140, 248, 0.3);
    }

    .search__button {
      background-color: var(--input-bg, #374151);
      border-color: var(--border-color, #4b5563);
    }

    .search__button:hover {
      background-color: var(--input-bg-hover, #4b5563);
      border-color: #818cf8;
    }

    .search__icon {
      fill: var(--text-secondary, #9ca3af);
    }

    .search__button:hover .search__icon {
      fill: #818cf8;
    }

    .search__results {
      background: #374151;
      border-color: #4b5563;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .search__category {
      background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
      color: #818cf8;
      border-bottom-color: #4b5563;
    }

    .search__item {
      border-bottom-color: #4b5563;
      color: #f9fafb;
    }

    .search__item:hover {
      background: linear-gradient(135deg, #818cf8 0%, #a855f7 100%);
    }

    .search__no-results,
    .search__loading {
      color: #9ca3af;
    }
  }

  /* Mobile behavior: collapse input unless expanded */
  @media (max-width: 600px) {
    .search__input {
      display: ${(props) => (props.$expanded ? "block" : "none")};
      width: ${(props) => (props.$expanded ? "60vw" : "0")};
      min-width: ${(props) => (props.$expanded ? "200px" : "0")};
    }

    .search__results {
      display: ${(props) => (props.$expanded ? "block" : "none")};
    }
  }
`;

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Static searchable content
  const staticContent = [
    {
      type: "page",
      title: t("nav.home") || "Home",
      description: "Main homepage with all services and information",
      path: "/",
      icon: "🏠",
    },
    {
      type: "page",
      title: t("nav.services") || "Services",
      description: "License application, road test, renewal services",
      path: "/services",
      icon: "🚗",
    },
    {
      type: "page",
      title: t("nav.about") || "About",
      description: "About our driving license management system",
      path: "/about",
      icon: "ℹ️",
    },
    {
      type: "page",
      title: t("nav.contact") || "Contact",
      description: "Contact us for support and inquiries",
      path: "/contact",
      icon: "📞",
    },
    {
      type: "page",
      title: "User Manual",
      description: "Complete guide on how to use the system",
      path: "/user-manual",
      icon: "📖",
    },
    {
      type: "service",
      title: "License Application",
      description: "Apply for your driving license online",
      path: "/services",
      icon: "🆔",
    },
    {
      type: "service",
      title: "Road Test",
      description: "Schedule and take your driving test",
      path: "/services",
      icon: "🛣️",
    },
    {
      type: "service",
      title: "License Renewal",
      description: "Renew your existing driving license",
      path: "/services",
      icon: "🔄",
    },
    {
      type: "service",
      title: "License Verification",
      description: "Verify license authenticity with QR code",
      path: "/services",
      icon: "✅",
    },
  ];

  // Search function with debouncing
  const performSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      // Use the new search API endpoint
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL ||
          "https://dlms-driving-license-management-system-2.onrender.com/api"
        }/search`,
        {
          params: { q: term, limit: 15 },
        }
      );

      if (response.data.success) {
        setSearchResults(response.data.results || []);
      } else {
        // Fallback to static content search
        const searchLower = term.toLowerCase();
        const staticResults = staticContent.filter(
          (item) =>
            item.title.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower)
        );
        setSearchResults(staticResults);
      }
    } catch (error) {
      console.error("Search error:", error);

      // Fallback to static content search
      const searchLower = term.toLowerCase();
      const staticResults = staticContent.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
      setSearchResults(staticResults);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle search button click (toggle input on mobile)
  const handleSearchClick = () => {
    if (window.innerWidth <= 600 && !expanded) {
      setExpanded(true);
      // Focus input after next paint
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    } else if (window.innerWidth <= 600) {
      // Collapse if empty
      setExpanded((e) => !e);
    }
  };

  // Handle result item click
  const handleResultClick = (result) => {
    navigate(result.path);
    setShowResults(false);
    setSearchTerm("");
  };

  // Handle click outside to close results / collapse on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        if (window.innerWidth <= 600) setExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Group results by type
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {});

  const getCategoryTitle = (type) => {
    switch (type) {
      case "page":
        return "Pages";
      case "service":
        return "Services";
      case "news":
        return "News";
      default:
        return "Results";
    }
  };

  return (
    <StyledWrapper ref={searchRef} $expanded={expanded}>
      <div className="search">
        <button
          className="search__button"
          onClick={handleSearchClick}
          aria-label="Search"
        >
          <svg className="search__icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          className="search__input"
          placeholder={t("search.placeholder") || "Search Anything"}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && setShowResults(true)}
        />

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="search__results">
            {isLoading ? (
              <div className="search__loading">
                {t("search.searching") || "Searching..."}
              </div>
            ) : searchResults.length > 0 ? (
              Object.entries(groupedResults).map(([type, results]) => (
                <div key={type}>
                  <div className="search__category">
                    {getCategoryTitle(type)}
                  </div>
                  {results.map((result, index) => (
                    <div
                      key={`${type}-${index}`}
                      className="search__item"
                      onClick={() => handleResultClick(result)}
                    >
                      <span className="search__item-icon">{result.icon}</span>
                      <div className="search__item-content">
                        <div className="search__item-title">{result.title}</div>
                        <div className="search__item-description">
                          {result.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : searchTerm.trim() ? (
              <div className="search__no-results">
                {t("search.noResults") || "No results found"}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </StyledWrapper>
  );
};

export default SearchBar;
