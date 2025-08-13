import React from "react";

// License Illustration
export const LicenseIllustration = ({ width = 300, height = 200 }) => (
  <svg width={width} height={height} viewBox="0 0 300 200" className="svg-illustration">
    <defs>
      <linearGradient id="licenseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f7fafc" />
        <stop offset="100%" stopColor="#edf2f7" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect width="300" height="200" fill="url(#licenseGradient)" rx="15" />
    
    {/* License Card */}
    <rect x="50" y="40" width="200" height="120" fill="url(#cardGradient)" rx="10" stroke="#e2e8f0" strokeWidth="2">
      <animate attributeName="y" values="40;35;40" dur="3s" repeatCount="indefinite" />
    </rect>
    
    {/* Photo placeholder */}
    <rect x="65" y="55" width="40" height="50" fill="#cbd5e0" rx="5" />
    <circle cx="85" cy="75" r="8" fill="#a0aec0" />
    <path d="M75,85 Q85,90 95,85" stroke="#a0aec0" strokeWidth="2" fill="none" />
    
    {/* Text lines */}
    <rect x="120" y="60" width="80" height="4" fill="#4a5568" rx="2" />
    <rect x="120" y="70" width="60" height="3" fill="#718096" rx="1.5" />
    <rect x="120" y="80" width="70" height="3" fill="#718096" rx="1.5" />
    
    {/* License number */}
    <rect x="65" y="115" width="100" height="6" fill="#667eea" rx="3" />
    
    {/* Decorative elements */}
    <circle cx="220" cy="70" r="15" fill="rgba(255,255,255,0.2)">
      <animate attributeName="r" values="15;18;15" dur="2s" repeatCount="indefinite" />
    </circle>
    <polygon points="220,62 225,72 215,72" fill="#667eea" />
    
    {/* Floating particles */}
    <circle cx="80" cy="25" r="2" fill="rgba(255,255,255,0.6)">
      <animate attributeName="cy" values="25;15;25" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="200" cy="30" r="1.5" fill="rgba(255,255,255,0.4)">
      <animate attributeName="cy" values="30;20;30" dur="5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

// Transport Illustration
export const TransportIllustration = ({ width = 300, height = 200 }) => (
  <svg width={width} height={height} viewBox="0 0 300 200" className="svg-illustration">
    <defs>
      <linearGradient id="transportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4a90e2" />
        <stop offset="100%" stopColor="#357abd" />
      </linearGradient>
      <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4a5568" />
        <stop offset="100%" stopColor="#2d3748" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect width="300" height="200" fill="url(#transportGradient)" rx="15" />
    
    {/* Road */}
    <ellipse cx="150" cy="160" rx="120" ry="25" fill="url(#roadGradient)" />
    
    {/* Road lines */}
    <rect x="130" y="158" width="40" height="4" fill="white" opacity="0.8" rx="2">
      <animate attributeName="x" values="130;140;130" dur="2s" repeatCount="indefinite" />
    </rect>
    
    {/* Main car */}
    <g className="main-car">
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0,0; 5,0; 0,0"
        dur="3s"
        repeatCount="indefinite"
      />
      
      {/* Car body */}
      <rect x="120" y="120" width="80" height="30" fill="#e53e3e" rx="5" />
      <rect x="130" y="105" width="60" height="20" fill="#e53e3e" rx="3" />
      
      {/* Windows */}
      <rect x="135" y="108" width="15" height="12" fill="rgba(255,255,255,0.3)" rx="2" />
      <rect x="155" y="108" width="15" height="12" fill="rgba(255,255,255,0.3)" rx="2" />
      <rect x="175" y="108" width="10" height="12" fill="rgba(255,255,255,0.3)" rx="2" />
      
      {/* Wheels */}
      <circle cx="140" cy="155" r="12" fill="#2d3748" />
      <circle cx="140" cy="155" r="8" fill="#4a5568" />
      <circle cx="180" cy="155" r="12" fill="#2d3748" />
      <circle cx="180" cy="155" r="8" fill="#4a5568" />
      
      {/* Headlights */}
      <circle cx="205" cy="135" r="4" fill="#ffd700" opacity="0.8">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
    
    {/* Background cars */}
    <g opacity="0.6">
      <rect x="50" y="130" width="40" height="15" fill="#38b2ac" rx="3" />
      <circle cx="60" cy="148" r="6" fill="#2d3748" />
      <circle cx="80" cy="148" r="6" fill="#2d3748" />
    </g>
    
    <g opacity="0.4">
      <rect x="220" y="135" width="35" height="12" fill="#9f7aea" rx="2" />
      <circle cx="230" cy="150" r="5" fill="#2d3748" />
      <circle cx="245" cy="150" r="5" fill="#2d3748" />
    </g>
    
    {/* Traffic elements */}
    <rect x="20" y="80" width="8" height="60" fill="#4a5568" />
    <circle cx="24" cy="85" r="4" fill="#e53e3e">
      <animate attributeName="fill" values="#e53e3e;#38a169;#ffd700;#e53e3e" dur="3s" repeatCount="indefinite" />
    </circle>
    
    {/* Clouds */}
    <ellipse cx="80" cy="40" rx="20" ry="10" fill="rgba(255,255,255,0.3)">
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0,0; 50,0; 0,0"
        dur="15s"
        repeatCount="indefinite"
      />
    </ellipse>
  </svg>
);

// Service Illustration
export const ServiceIllustration = ({ width = 300, height = 200 }) => (
  <svg width={width} height={height} viewBox="0 0 300 200" className="svg-illustration">
    <defs>
      <linearGradient id="serviceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38b2ac" />
        <stop offset="100%" stopColor="#319795" />
      </linearGradient>
      <radialGradient id="glowGradient" cx="50%" cy="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    
    {/* Background */}
    <rect width="300" height="200" fill="url(#serviceGradient)" rx="15" />
    
    {/* Central service hub */}
    <circle cx="150" cy="100" r="40" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
      <animate attributeName="r" values="40;45;40" dur="4s" repeatCount="indefinite" />
    </circle>
    
    {/* Service icon in center */}
    <rect x="135" y="85" width="30" height="30" fill="white" rx="5" opacity="0.9" />
    <circle cx="150" cy="95" r="6" fill="#38b2ac" />
    <rect x="145" y="105" width="10" height="3" fill="#38b2ac" />
    <rect x="143" y="110" width="14" height="2" fill="#38b2ac" />
    
    {/* Service nodes */}
    <g className="service-nodes">
      {/* Node 1 - Top */}
      <circle cx="150" cy="40" r="15" fill="rgba(255,255,255,0.3)">
        <animate attributeName="cy" values="40;35;40" dur="3s" repeatCount="indefinite" />
      </circle>
      <rect x="143" y="35" width="14" height="10" fill="#667eea" rx="2" />
      
      {/* Node 2 - Right */}
      <circle cx="220" cy="100" r="15" fill="rgba(255,255,255,0.3)">
        <animate attributeName="cx" values="220;225;220" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <polygon points="215,95 225,100 215,105" fill="#e53e3e" />
      
      {/* Node 3 - Bottom */}
      <circle cx="150" cy="160" r="15" fill="rgba(255,255,255,0.3)">
        <animate attributeName="cy" values="160;165;160" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <rect x="145" y="155" width="10" height="10" fill="#38a169" rx="2" />
      
      {/* Node 4 - Left */}
      <circle cx="80" cy="100" r="15" fill="rgba(255,255,255,0.3)">
        <animate attributeName="cx" values="80;75;80" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="100" r="5" fill="#ffd700" />
    </g>
    
    {/* Connection lines */}
    <line x1="150" y1="55" x2="150" y2="85" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5,5">
      <animate attributeName="stroke-dashoffset" values="0;10;0" dur="2s" repeatCount="indefinite" />
    </line>
    <line x1="205" y1="100" x2="175" y2="100" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5,5">
      <animate attributeName="stroke-dashoffset" values="0;10;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </line>
    <line x1="150" y1="145" x2="150" y2="115" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5,5">
      <animate attributeName="stroke-dashoffset" values="0;10;0" dur="2s" begin="1s" repeatCount="indefinite" />
    </line>
    <line x1="95" y1="100" x2="125" y2="100" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5,5">
      <animate attributeName="stroke-dashoffset" values="0;10;0" dur="2s" begin="1.5s" repeatCount="indefinite" />
    </line>
    
    {/* Data flow particles */}
    <circle cx="150" cy="70" r="2" fill="white" opacity="0.8">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 150 100; 360 150 100"
        dur="8s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="190" cy="100" r="1.5" fill="white" opacity="0.6">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 150 100; 360 150 100"
        dur="10s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="150" cy="130" r="2" fill="white" opacity="0.7">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 150 100; 360 150 100"
        dur="6s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);
