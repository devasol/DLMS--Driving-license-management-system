import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import helmet from "helmet";
import path from "path";
import connectDB from "./config/db.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/User.js";
import ensureUploadsDirectories from "./ensureUploadsDir.js";

// Import route modules
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import licenseRoutes from "./routes/licenseRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import trialQuestionRoutes from "./routes/trialQuestionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import renewalRoutes from "./routes/renewalRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import userActivityRoutes from "./routes/userActivityRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import examinerRoutes from "./routes/examinerRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import authRoutes from "./routes/auth.js";
import authRoutesAlt from "./routes/authRoutes.js";
import trafficPoliceRoutes from "./routes/trafficPoliceRoutes.js";
import ActivityLogger from "./utils/activityLogger.js";

// For serving frontend static files in production
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Load environment variables from the backend folder's .env
// server.js already lives in the backend folder, so a plain config() is correct.
dotenv.config();

const app = express();
// Many frontend components expect the backend to run on 5004 in development.
// Default to 5004 to avoid connection errors when frontend is hardcoded to that port.
const PORT = process.env.PORT || 5004;

// Performance and security middleware
app.use(compression()); // Enable gzip compression
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginEmbedderPolicy: false,
  })
); // Basic security headers

// CORS configuration (allow frontend origin from environment variable)
const allowedOrigin = process.env.FRONTEND_URL || process.env.CLIENT_URL || "*";
const corsOptions = {
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

console.log(`🌐 CORS allowed origin: ${allowedOrigin}`);

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
    // Add CORS headers for static files using the same origin
    res.header("Access-Control-Allow-Origin", allowedOrigin);
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

// Only serve static files if the directory exists
if (fs.existsSync(frontendDir)) {
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
} else {
  console.warn(`⚠️ Frontend dist directory does not exist: ${frontendDir}`);
  console.log(`⚠️ The frontend may not have been built yet. Please ensure the build step runs before the server starts.`);
  
  // Fallback: API-only routes when frontend is not available
  app.get('*', (req, res) => {
    // Only serve API routes or return an error for non-API routes
    if (req.path.startsWith('/api/')) {
      // Let API routes continue to their handlers
      res.status(404).json({ error: 'API route not found' });
    } else {
      // For non-API routes, return a simple message
      res.status(404).send(`
        <h1>Frontend Not Available</h1>
        <p>The frontend build directory does not exist at: ${frontendDir}</p>
        <p>Please ensure the build process completes successfully.</p>
        <p>Available API endpoint: <a href="/api">/api</a></p>
      `);
    }
  });
}

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

// Routes
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

// Mount API routes
app.use("/api/auth", authRoutesAlt); // Mount main auth routes (includes forgot password)
// app.use("/api/auth", authRoutes); // Commented out to avoid conflicts
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/license", licenseRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/trial", trialQuestionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/renewals", renewalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/user-activity", userActivityRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/examiner", examinerRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/traffic-police", trafficPoliceRoutes);

// Database status route
app.get("/api/db-status", async (req, res) => {
  try {
    const dbStatus = {
      connected: false,
      collections: [],
      error: null,
    };

    if (app.locals.dbConnection && app.locals.dbConnection.readyState === 1) {
      dbStatus.connected = true;
      const collections = await app.locals.dbConnection.db
        .listCollections()
        .toArray();
      dbStatus.collections = collections.map((c) => c.name);
    } else {
      dbStatus.error = "Database not connected";
    }

    res.json(dbStatus);
  } catch (error) {
    console.error("Error checking DB status:", error);
    res.status(500).json({
      connected: false,
      error: error.message,
    });
  }
});

// Auth routes are handled by the mounted auth route modules above

// The catch-all route is handled by the frontend serving below

// Build frontend before starting server (in production)
const startServer = async () => {
  try {
    // Ensure upload directories exist
    ensureUploadsDirectories();

    // In production, ensure frontend is built before starting server
    if (process.env.NODE_ENV === 'production') {
      console.log('🏗️  Production mode detected');
      console.log('📁 Checking for frontend build...');
      
      const frontendDistPath = join(__dirname, '..', 'frontend', 'dist');
      if (!fs.existsSync(frontendDistPath)) {
        console.log('⚠️  Frontend build not found, attempting to build...');
        try {
          const { execSync } = await import('child_process');
          const frontendPath = join(__dirname, '..', 'frontend');
          
          // Change to frontend directory and build
          console.log('🔧 Installing frontend dependencies and building...');
          execSync('npm install', { 
            cwd: frontendPath,
            stdio: 'pipe'  // Use pipe to capture output
          });
          
          console.log('🔧 Running frontend build...');
          execSync('npm run build', { 
            cwd: frontendPath,
            stdio: 'pipe'  // Use pipe to capture output
          });
          
          console.log('✅ Frontend build completed successfully');
        } catch (buildError) {
          console.error('❌ Frontend build failed:', buildError.message);
          console.error('❌ Error output:', buildError.stderr?.toString() || 'No stderr');
          console.log('⚠️  Attempting to continue server start...');
        }
      } else {
        console.log('✅ Frontend build found at:', frontendDistPath);
      }
    }

    // Connect to MongoDB - but make it optional for static file serving
    try {
      const dbConnection = await connectDB();
      app.locals.dbConnection = dbConnection;
      console.log('✅ MongoDB connected successfully');
    } catch (dbError) {
      console.warn('⚠️  MongoDB connection failed:', dbError.message);
      console.log('⚠️  Server starting without DB connection (may affect API functionality)');
    }

    // Start the main server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API available at: http://localhost:${PORT}/api`);
      if (fs.existsSync(join(__dirname, '..', 'frontend', 'dist'))) {
        console.log(`🌐 Frontend available at: http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
