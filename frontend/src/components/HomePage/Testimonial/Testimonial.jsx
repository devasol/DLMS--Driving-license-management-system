import React from "react";
import "./Testimonial.css";

// SVG Avatar Component
const SVGAvatar = ({ name, variant = 1, size = 50 }) => {
  const avatarVariants = {
    1: {
      bgColor: "#667eea",
      patternColor: "#764ba2",
      accentColor: "#ffffff",
      pattern: "circles",
    },
    2: {
      bgColor: "#4a5568",
      patternColor: "#2d3748",
      accentColor: "#ffffff",
      pattern: "waves",
    },
    3: {
      bgColor: "#ed8936",
      patternColor: "#dd6b20",
      accentColor: "#ffffff",
      pattern: "geometric",
    },
    4: {
      bgColor: "#38b2ac",
      patternColor: "#319795",
      accentColor: "#ffffff",
      pattern: "dots",
    },
    5: {
      bgColor: "#9f7aea",
      patternColor: "#805ad5",
      accentColor: "#ffffff",
      pattern: "lines",
    },
  };

  const config = avatarVariants[variant] || avatarVariants[1];
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  const renderPattern = () => {
    switch (config.pattern) {
      case "circles":
        return (
          <>
            <circle
              cx="15"
              cy="15"
              r="8"
              fill={config.patternColor}
              opacity="0.3"
            />
            <circle
              cx="35"
              cy="25"
              r="6"
              fill={config.patternColor}
              opacity="0.2"
            />
            <circle
              cx="25"
              cy="35"
              r="4"
              fill={config.patternColor}
              opacity="0.4"
            />
          </>
        );
      case "waves":
        return (
          <path
            d="M0,20 Q12.5,10 25,20 T50,20 V50 H0 Z"
            fill={config.patternColor}
            opacity="0.3"
          />
        );
      case "geometric":
        return (
          <>
            <polygon
              points="10,10 20,5 30,10 25,20 15,20"
              fill={config.patternColor}
              opacity="0.3"
            />
            <polygon
              points="30,25 40,20 45,30 35,35 25,30"
              fill={config.patternColor}
              opacity="0.2"
            />
          </>
        );
      case "dots":
        return (
          <>
            <circle
              cx="12"
              cy="12"
              r="2"
              fill={config.patternColor}
              opacity="0.4"
            />
            <circle
              cx="25"
              cy="8"
              r="1.5"
              fill={config.patternColor}
              opacity="0.3"
            />
            <circle
              cx="38"
              cy="15"
              r="2"
              fill={config.patternColor}
              opacity="0.4"
            />
            <circle
              cx="15"
              cy="30"
              r="1.5"
              fill={config.patternColor}
              opacity="0.3"
            />
            <circle
              cx="35"
              cy="35"
              r="2"
              fill={config.patternColor}
              opacity="0.4"
            />
          </>
        );
      case "lines":
        return (
          <>
            <line
              x1="5"
              y1="10"
              x2="45"
              y2="15"
              stroke={config.patternColor}
              strokeWidth="2"
              opacity="0.3"
            />
            <line
              x1="8"
              y1="25"
              x2="42"
              y2="30"
              stroke={config.patternColor}
              strokeWidth="1.5"
              opacity="0.2"
            />
            <line
              x1="10"
              y1="40"
              x2="40"
              y2="35"
              stroke={config.patternColor}
              strokeWidth="2"
              opacity="0.3"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      style={{
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${config.bgColor}, ${config.patternColor})`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <defs>
        <linearGradient
          id={`gradient-${variant}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={config.bgColor} />
          <stop offset="100%" stopColor={config.patternColor} />
        </linearGradient>
      </defs>

      <rect width="50" height="50" fill={`url(#gradient-${variant})`} rx="25" />
      {renderPattern()}

      <text
        x="25"
        y="32"
        textAnchor="middle"
        fill={config.accentColor}
        fontSize="18"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        {initial}
      </text>
    </svg>
  );
};

const Testimonial = () => {
  return (
    <>
      <div className="outerdiv">
        <div className="floating-particles"></div>
        <div className="testimonial_title">ምስክሮች</div>
        <div className="innerdiv">
          <div className="div1 eachdiv">
            <div className="userdetails">
              <div className="imgbox">
                <SVGAvatar name="ዳኒኤል ክሊፎርድ" variant={1} size={50} />
              </div>
              <div className="detbox">
                <p className="name">ዳኒኤል ክሊፎርድ</p>
                <p className="designation">የተረጋገጠ አሽከርካሪ</p>
              </div>
            </div>
            <div className="review">
              <h4>“የመንጃ ፈቃዴን በፍጥነት ተቀብያለሁ፣ ሲስተሙም ቀላል ነበር!”</h4>
              <p>
                “መንጃ ፈቃዴን ለማደስ እየጠበቅኩ ነበር፣ ይህ ሲስተም ግን ሂደቱን በጣም ቀላል አደረገው። መስሪያ
                ቤት ላይ ቆይታ ወይም ውስብስብ የነበሩ ወረቀቶችን አሳየኝ። በፍጥነትና በቅንነት ፈቃዴን ተቀብያለሁ።”
              </p>
            </div>
          </div>

          <div className="div2 eachdiv">
            <div className="userdetails">
              <div className="imgbox">
                <SVGAvatar name="ጆናታን ዋልተርስ" variant={2} size={50} />
              </div>
              <div className="detbox">
                <p className="name">ጆናታን ዋልተርስ</p>
                <p className="designation">የተረጋገጠ አሽከርካሪ</p>
              </div>
            </div>
            <div className="review">
              <h4>“ሲስተሙ በጣም ቀላል ነበር፣ በሂደቱ ሁሉ ላይ እንደምንም ነኝ ያሳየኝ።”</h4>
              <p>
                “እንደመገናኛ የመንጃ ፈቃድ ማደስን አላወቅሁም፣ ነገር ግን ከዚህ ሲስተም ጋር ሁሉንም መረጃ በጊዜው
                አግኝቻለሁ። ወረቀቶች ማስታወሻዎችና ቀጠሮዎች በጊዜ ላይ ተሰጡ። ሂደቱ በጣም ቀላልና ዘና የሌለበት
                ነበር።”
              </p>
            </div>
          </div>

          <div className="div3 eachdiv">
            <div className="userdetails">
              <div className="imgbox">
                <SVGAvatar name="ኪራ ውሊትል" variant={3} size={50} />
              </div>
              <div className="detbox">
                <p className="name dark">ኪራ ውሊትል</p>
                <p className="designation dark">የተረጋገጠ አሽከርካሪ</p>
              </div>
            </div>
            <div className="review dark">
              <h4>“ሲስተሙ የመንጃ ፈቃድ ፈተናዬን ማስያዝና ሁኔታዬን ማከታተል እንዲችል አድርጓኝ።”</h4>
              <p>
                “ቀደም ሲል እንዴት እንደሚገናኙ አላወቅሁም፣ ነገር ግን ይህ ሲስተም የፈተናዬን ቀጠሮ በቀላሉ ማስያዝ
                እንዲችል አደረገኝ፣ እና የመንጃ ፈቃዴ እንዴት እየተሳካ እንደሆነ በሁሉም ደረጃ አሳየኝ። አገልግሎቱ
                በጣም ቀላል ነበር፣ ደግሞ የደንበኞች አገልግሎት ፈጣን ነበር።”
              </p>
            </div>
          </div>

          <div className="div4 eachdiv">
            <div className="userdetails">
              <div className="imgbox">
                <SVGAvatar name="ጄኔት ሃርሞን" variant={4} size={50} />
              </div>
              <div className="detbox">
                <p className="name dark">ጄኔት ሃርሞን</p>
                <p className="designation dark">የተረጋገጠ አሽከርካሪ</p>
              </div>
            </div>
            <div className="review dark">
              <h4>“ማስያዝ ቀላል ነበር፣ መረጃዎቼን ሙሉ በመስመር ላይ አስገባሁ።”</h4>
              <p>
                “ሙሉ ሂደቱ ሳይጫኑኝ ቀላል ነበር። ሰነዶቼን የአሰሳ ዝማኔዎች ተሰጡኝ፣ ቀጠሮዬንም ቀላል በማድረግ
                በስራው ሁሉ ላይ ብለዋል።”
              </p>
            </div>
          </div>

          <div className="div5 eachdiv">
            <div className="userdetails">
              <div className="imgbox">
                <SVGAvatar name="ፓትሪክ አብራምስ" variant={5} size={50} />
              </div>
              <div className="detbox">
                <p className="name">ፓትሪክ አብራምስ</p>
                <p className="designation">የተረጋገጠ አሽከርካሪ</p>
              </div>
            </div>
            <div className="review">
              <h4>“የመስመር ላይ የደንበኞች አገልግሎት በፍጥነት ሞላኝ።”</h4>
              <p>
                “በመንጃ ፈቃድ ሂደቱ ላይ ጥያቄዎች ነበሩኝ፣ ነገር ግን የደንበኞች አገልግሎት ቡድኑ አስደናቂ ነበር።
                በቅርቡ መልስ በመስጠት ከድርጅቱ በሁሉም እንቅስቃሴ ላይ ምክር ሰጠኝ።”
              </p>
            </div>
          </div>
        </div>

        {/* Amazing Enhanced Wave Ending */}
        <div className="testimonial-wave-container">
          <svg
            className="testimonial-wave"
            viewBox="0 0 1200 150"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="amazingWaveGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#4ecdc4" />
                <stop offset="25%" stopColor="#44a08d" />
                <stop offset="50%" stopColor="#667eea" />
                <stop offset="75%" stopColor="#764ba2" />
                <stop offset="100%" stopColor="#4ecdc4" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  values="0 0;100 0;0 0"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </linearGradient>
              <linearGradient
                id="amazingWaveGradient2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(78, 205, 196, 0.6)" />
                <stop offset="50%" stopColor="rgba(102, 126, 234, 0.4)" />
                <stop offset="100%" stopColor="rgba(78, 205, 196, 0.6)" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  values="100 0;0 0;100 0"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </linearGradient>
              <linearGradient
                id="amazingWaveGradient3"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(240, 147, 251, 0.3)" />
                <stop offset="50%" stopColor="rgba(78, 205, 196, 0.2)" />
                <stop offset="100%" stopColor="rgba(240, 147, 251, 0.3)" />
              </linearGradient>
            </defs>

            {/* First amazing wave layer */}
            <path
              d="M0,70 C200,130 400,10 600,70 C800,130 1000,10 1200,70 L1200,150 L0,150 Z"
              fill="url(#amazingWaveGradient)"
            >
              <animate
                attributeName="d"
                values="M0,70 C200,130 400,10 600,70 C800,130 1000,10 1200,70 L1200,150 L0,150 Z;M0,80 C200,20 400,120 600,60 C800,20 1000,120 1200,80 L1200,150 L0,150 Z;M0,70 C200,130 400,10 600,70 C800,130 1000,10 1200,70 L1200,150 L0,150 Z"
                dur="12s"
                repeatCount="indefinite"
              />
            </path>

            {/* Second amazing wave layer */}
            <path
              d="M0,90 C300,30 600,110 900,50 C1050,90 1150,30 1200,90 L1200,150 L0,150 Z"
              fill="url(#amazingWaveGradient2)"
            >
              <animate
                attributeName="d"
                values="M0,90 C300,30 600,110 900,50 C1050,90 1150,30 1200,90 L1200,150 L0,150 Z;M0,100 C300,140 600,20 900,100 C1050,40 1150,120 1200,80 L1200,150 L0,150 Z;M0,90 C300,30 600,110 900,50 C1050,90 1150,30 1200,90 L1200,150 L0,150 Z"
                dur="10s"
                repeatCount="indefinite"
              />
            </path>

            {/* Third amazing wave layer */}
            <path
              d="M0,110 C400,60 800,140 1200,100 L1200,150 L0,150 Z"
              fill="url(#amazingWaveGradient3)"
            >
              <animate
                attributeName="d"
                values="M0,110 C400,60 800,140 1200,100 L1200,150 L0,150 Z;M0,120 C400,150 800,70 1200,120 L1200,150 L0,150 Z;M0,110 C400,60 800,140 1200,100 L1200,150 L0,150 Z"
                dur="8s"
                repeatCount="indefinite"
              />
            </path>

            {/* Amazing floating particles */}
            <circle cx="150" cy="40" r="4" fill="#ffffff" opacity="0.8">
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="40;30;40"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="450" cy="25" r="3" fill="#4ecdc4" opacity="0.6">
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="2.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="25;15;25"
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="750" cy="35" r="3.5" fill="#667eea" opacity="0.7">
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="35;25;35"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="1050" cy="20" r="2.5" fill="#f093fb" opacity="0.5">
              <animate
                attributeName="opacity"
                values="0.5;0.9;0.5"
                dur="4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="20;10;20"
                dur="5s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      </div>
    </>
  );
};

export default Testimonial;
