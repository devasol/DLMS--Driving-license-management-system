import React from "react";

const NewsPlaceholder = ({ width = 300, height = 200, variant = 1 }) => {
  const variants = {
    1: {
      primaryColor: "#667eea",
      secondaryColor: "#764ba2",
      accentColor: "#4a5568",
      icon: "newspaper"
    },
    2: {
      primaryColor: "#38b2ac",
      secondaryColor: "#319795",
      accentColor: "#2c7a7b",
      icon: "announcement"
    },
    3: {
      primaryColor: "#ed8936",
      secondaryColor: "#dd6b20",
      accentColor: "#c05621",
      icon: "update"
    }
  };

  const config = variants[variant] || variants[1];

  const renderNewspaperIcon = () => (
    <g>
      {/* Newspaper */}
      <rect x="110" y="70" width="80" height="60" fill="white" rx="4" opacity="0.9" />
      <rect x="115" y="75" width="70" height="4" fill={config.accentColor} />
      <rect x="115" y="85" width="50" height="2" fill={config.accentColor} opacity="0.7" />
      <rect x="115" y="90" width="60" height="2" fill={config.accentColor} opacity="0.7" />
      <rect x="115" y="95" width="45" height="2" fill={config.accentColor} opacity="0.7" />
      
      {/* Image placeholder in newspaper */}
      <rect x="115" y="105" width="25" height="20" fill={config.primaryColor} opacity="0.3" rx="2" />
      <rect x="145" y="105" width="35" height="2" fill={config.accentColor} opacity="0.5" />
      <rect x="145" y="110" width="30" height="2" fill={config.accentColor} opacity="0.5" />
      <rect x="145" y="115" width="35" height="2" fill={config.accentColor} opacity="0.5" />
      <rect x="145" y="120" width="25" height="2" fill={config.accentColor} opacity="0.5" />
    </g>
  );

  const renderAnnouncementIcon = () => (
    <g>
      {/* Megaphone */}
      <path
        d="M120,90 L140,80 L160,85 L165,95 L160,105 L140,110 L120,100 Z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="165" cy="95" r="8" fill={config.primaryColor} opacity="0.8" />
      
      {/* Sound waves */}
      <path
        d="M170,85 Q175,90 170,95"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.7"
      >
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
      </path>
      <path
        d="M175,80 Q185,90 175,100"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      >
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </path>
      <path
        d="M180,75 Q195,90 180,105"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      >
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" begin="1s" repeatCount="indefinite" />
      </path>
    </g>
  );

  const renderUpdateIcon = () => (
    <g>
      {/* Circular arrow */}
      <circle cx="150" cy="100" r="25" fill="none" stroke="white" strokeWidth="3" opacity="0.9" />
      <path
        d="M150,75 L145,85 L155,85 Z"
        fill="white"
        opacity="0.9"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 150 100; 360 150 100"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Center dot */}
      <circle cx="150" cy="100" r="4" fill="white" opacity="0.8">
        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Update indicators */}
      <circle cx="130" cy="85" r="2" fill="white" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="170" cy="115" r="2" fill="white" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );

  const renderIcon = () => {
    switch (config.icon) {
      case "newspaper":
        return renderNewspaperIcon();
      case "announcement":
        return renderAnnouncementIcon();
      case "update":
        return renderUpdateIcon();
      default:
        return renderNewspaperIcon();
    }
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 200"
      className="news-placeholder"
      style={{ borderRadius: "8px" }}
    >
      <defs>
        <linearGradient id={`newsGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.primaryColor} />
          <stop offset="100%" stopColor={config.secondaryColor} />
        </linearGradient>
        <radialGradient id={`newsRadial-${variant}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      
      {/* Background */}
      <rect width="300" height="200" fill={`url(#newsGradient-${variant})`} />
      
      {/* Background pattern */}
      <circle cx="50" cy="50" r="30" fill={`url(#newsRadial-${variant})`} opacity="0.3" />
      <circle cx="250" cy="150" r="40" fill={`url(#newsRadial-${variant})`} opacity="0.2" />
      
      {/* Main icon */}
      {renderIcon()}
      
      {/* Decorative elements */}
      <circle cx="80" cy="30" r="3" fill="rgba(255,255,255,0.4)">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="220" cy="40" r="2" fill="rgba(255,255,255,0.3)">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="170" r="2.5" fill="rgba(255,255,255,0.5)">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="240" cy="180" r="2" fill="rgba(255,255,255,0.4)">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3.5s" repeatCount="indefinite" />
      </circle>
      
      {/* Bottom text placeholder */}
      <rect x="20" y="160" width="80" height="3" fill="rgba(255,255,255,0.6)" rx="1.5" />
      <rect x="20" y="170" width="60" height="2" fill="rgba(255,255,255,0.4)" rx="1" />
      <rect x="20" y="180" width="70" height="2" fill="rgba(255,255,255,0.4)" rx="1" />
      
      {/* News label */}
      <text
        x="150"
        y="45"
        textAnchor="middle"
        fill="rgba(255,255,255,0.8)"
        fontSize="12"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        NEWS
      </text>
    </svg>
  );
};

// Generate a placeholder based on text content
export const generateNewsPlaceholder = (title = "", category = "") => {
  let variant = 1;
  
  // Simple hash function to determine variant based on title
  if (title) {
    const hash = title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    variant = (Math.abs(hash) % 3) + 1;
  }
  
  // Override based on category if available
  if (category) {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('announcement') || categoryLower.includes('alert')) {
      variant = 2;
    } else if (categoryLower.includes('update') || categoryLower.includes('change')) {
      variant = 3;
    }
  }
  
  return variant;
};

export default NewsPlaceholder;
