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

// CORS configuration (allow local dev and deployed frontend)
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  // Add the backend dev port used by the frontend code
  "http://localhost:5004",
  "https://dlms-skjh.onrender.com",
  process.env.FRONTEND_URL,
];

const envAllowed = [];
if (process.env.FRONTEND_URL) envAllowed.push(process.env.FRONTEND_URL.trim());
if (process.env.FRONTEND_URLS) {
  envAllowed.push(
    ...process.env.FRONTEND_URLS.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

const allowedOrigins = Array.from(
  new Set([...defaultAllowedOrigins, ...envAllowed])
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(
      (o) => o.replace(/\/$/, "") === normalized
    );
    if (isAllowed) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
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

// Add a catch-all route for debugging
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    requestedUrl: req.originalUrl,
    availableRoutes: [
      "/api",
      "/api/health",
      "/api/db-status",
      "/api/auth/login",
      "/api/auth/register",
      "/api/admin/*",
      "/api/users/*",
      "/api/license/*",
      "/api/exams/*",
      "/api/trial/*",
      "/api/payments/*",
      "/api/renewals/*",
      "/api/notifications/*",
      "/api/feedbacks/*",
      "/api/contact/*",
    ],
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Ensure upload directories exist
    ensureUploadsDirectories();

    // Connect to MongoDB
    const dbConnection = await connectDB();
    app.locals.dbConnection = dbConnection;

    // Start the main server
    app.listen(PORT, () => {
      console.log(`Main server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
