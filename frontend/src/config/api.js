import axios from "axios";

// Toggle API debug logs via env flag. Default: silent (no console noise).
const DEBUG = import.meta.env.VITE_API_DEBUG === "true";

// Determine API base: prefer explicit VITE_API_URL, otherwise default to
// the requested production URL. For local development you can set
// VITE_API_URL to "/api" so the dev server proxy is used.
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5004";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    "Content-Type": "application/json",
  },
  // Enable request/response compression
  decompress: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (DEBUG) {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => {
    if (DEBUG) {
      console.warn("Request interceptor error:", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${response.status}`
      );
    }
    return response;
  },
  (error) => {
    // Suppress console errors by default; only log when DEBUG flag is set
    if (DEBUG) {
      console.warn(
        `API Error: ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        }`,
        {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          data: error.response?.data,
        }
      );
    }

    // Handle specific error cases

    if (error.response?.status === 401) {
      // Unauthorized - clear token but do NOT auto-redirect.
      // Let the caller decide how to handle 401 so UI can show messages.
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
    }

    return Promise.reject(error);
  }
);

export default api;

// Export specific API functions for reports
export const reportAPI = {
  generateReport: (params) => api.get("/admin/reports", { params }),
  getReports: (params) => api.get("/admin/reports", { params }),
};

// Export auth API functions
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  adminLogin: (credentials) => {
    // Try admin-specific endpoint first, fallback to regular login with admin flag
    return api
      .post("/auth/admin/login", credentials)
      .catch(() => api.post("/auth/login", { ...credentials, isAdmin: true }));
  },
  register: (userData) => api.post("/auth/register", userData),
  verifyOTP: (otpData) => api.post("/auth/verify-otp", otpData),
};

// Export admin API functions
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard"),
  getUsers: () => api.get("/admin/users"),
  getReports: (params) => api.get("/admin/reports", { params }),
  generateReport: (params) => api.get("/admin/reports", { params }),
};
