import jwt from "jsonwebtoken";
import User from "../models/User.js";
import mongoose from "mongoose";

// Simple in-memory cache for user data (expires after 5 minutes)
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedUser = (userId, role) => {
  const cacheKey = `${userId}_${role}`;
  const cached = userCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.user;
  }

  return null;
};

const setCachedUser = (userId, role, user) => {
  const cacheKey = `${userId}_${role}`;
  userCache.set(cacheKey, {
    user,
    timestamp: Date.now(),
  });

  // Clean up old cache entries periodically
  if (userCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of userCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        userCache.delete(key);
      }
    }
  }
};

export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Check cache first
    let user = getCachedUser(decoded.userId, decoded.role);

    if (!user) {
      // Check if this is an admin token
      if (decoded.role === "admin") {
        const adminCollection = mongoose.connection.db.collection("admins");
        const admin = await adminCollection.findOne(
          { _id: new mongoose.Types.ObjectId(decoded.userId) },
          { projection: { admin_password: 0 } } // Exclude password field
        );

        if (admin) {
          user = {
            _id: admin._id,
            role: "admin",
            email: admin.admin_email,
            name: admin.admin_name,
          };
        }
      } else if (decoded.role === "traffic_police") {
        // Find traffic police user with specific fields
        user = await User.findById(decoded.userId)
          .select(
            "_id email user_email fullName full_name role trafficPoliceDetails"
          )
          .lean();

        if (user) {
          user.badgeNumber = user.trafficPoliceDetails?.badgeNumber;
          user.department = user.trafficPoliceDetails?.department;
          user.rank = user.trafficPoliceDetails?.rank;
        }
      } else {
        // Find regular user with minimal fields
        user = await User.findById(decoded.userId)
          .select("_id email fullName role")
          .lean();
      }

      if (user) {
        setCachedUser(decoded.userId, decoded.role, user);
      }
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user to request
    req.userId = user._id;
    req.userRole = user.role || decoded.role;
    req.userEmail = user.email || decoded.email;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    await authenticateUser(req, res, () => {
      if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    });
  } catch (error) {
    console.error("Admin authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

export const authenticateExaminer = async (req, res, next) => {
  try {
    await authenticateUser(req, res, () => {
      if (req.userRole !== "examiner") {
        return res.status(403).json({ message: "Examiner access required" });
      }
      next();
    });
  } catch (error) {
    console.error("Examiner authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

export const authenticateAdminOrExaminer = async (req, res, next) => {
  try {
    await authenticateUser(req, res, () => {
      if (req.userRole !== "admin" && req.userRole !== "examiner") {
        return res
          .status(403)
          .json({ message: "Admin or Examiner access required" });
      }
      next();
    });
  } catch (error) {
    console.error("Admin/Examiner authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

export const authenticateTrafficPolice = async (req, res, next) => {
  try {
    await authenticateUser(req, res, () => {
      if (req.userRole !== "traffic_police") {
        return res
          .status(403)
          .json({ message: "Traffic Police access required" });
      }
      next();
    });
  } catch (error) {
    console.error("Traffic Police authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};
