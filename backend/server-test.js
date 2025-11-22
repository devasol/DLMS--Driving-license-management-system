import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Load environment variables
dotenv.config();

const app = express();
// Use PORT from environment or default to 5004
const PORT = process.env.PORT || 5004;

// Performance and security middleware
app.use(compression()); // Enable gzip compression
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginEmbedderPolicy: false,
  })
); // Basic security headers

// CORS configuration (allow local dev and deployed frontend)
const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// Body parsing middleware with limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically with caching and CORS
app.use(
  "/uploads",
  (req, res, next) => {
    // Add CORS headers for static files
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    // Log static file requests for debugging
    console.log(`📁 Static file request: ${req.method} ${req.url}`);
    console.log(
      `📁 Full path: ${path.join(process.cwd(), "uploads", req.url)}`
    );

    next();
  },
  express.static("uploads", {
    maxAge: "1d", // Cache static files for 1 day
    etag: true,
    setHeaders: (res, filePath) => {
      // Set proper content type for images
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".jpg" || ext === ".jpeg") {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (ext === ".png") {
        res.setHeader("Content-Type", "image/png");
      } else if (ext === ".gif") {
        res.setHeader("Content-Type", "image/gif");
      } else if (ext === ".webp") {
        res.setHeader("Content-Type", "image/webp");
      }
      console.log(
        `📁 Serving file: ${filePath} with content-type: ${res.getHeader(
          "Content-Type"
        )}`
      );
    },
  })
);

// Optimized request logging (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    // Only log non-static file requests
    if (!req.url.startsWith("/uploads")) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  });
}

// Serve frontend static files (for both development and production)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In production (deployed), serve from dist directory; otherwise serve from regular frontend
const frontendDir = process.env.NODE_ENV === 'production' 
  ? join(__dirname, '..', 'frontend', 'dist') // Production build path
  : join(__dirname, '..', 'frontend', 'dist'); // Development - use dist since we already built

// Log the frontend directory for debugging
console.log(`📁 Frontend directory: ${frontendDir}`);
console.log(`📁 Directory exists for static files: ${fs.existsSync(frontendDir)}`);

// Serve static files from the frontend build directory BEFORE API routes
app.use(express.static(frontendDir, {
  // Set correct MIME types for static assets
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.css') {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    } else if (ext === '.js') {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (ext === '.json') {
      res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.jpg' || ext === '.jpeg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.gif') {
      res.setHeader('Content-Type', 'image/gif');
    } else if (ext === '.svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (ext === '.ico') {
      res.setHeader('Content-Type', 'image/x-icon');
    }
    console.log(`📁 Serving static file: ${filePath} with content-type: ${res.getHeader('Content-Type')}`);
  }
}));

// Basic API routes for health checking
app.get("/api", (req, res) => {
  res.json({ message: "API is running" });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "main-server",
    port: PORT,
  });
});

// Serve index.html for all other routes (for React Router) - this should be LAST
app.get('*', (req, res) => {
  const indexPath = join(frontendDir, 'index.html');
  console.log(`📁 Request for SPA fallback: ${req.originalUrl}, serving: ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`📁 Error sending index.html:`, err);
      res.status(404).send('Page not found');
    }
  });
});

// Start the main server
app.listen(PORT, () => {
  console.log(`Main server running on port ${PORT}`);
});

console.log('Server started without DB connection for static file testing');