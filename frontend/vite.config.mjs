import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // Enable CSS modules
      localsConvention: "camelCase",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL
          ? process.env.VITE_API_URL.replace(/\/api\/?$/, "")
          : "https://dlms-driving-license-management-system-v1.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: process.env.VITE_API_URL
          ? process.env.VITE_API_URL.replace(/\/api\/?$/, "")
          : "https://dlms-driving-license-management-system-v1.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
    // Performance optimizations
    hmr: {
      overlay: true, // Enable error overlay to surface runtime/build errors
    },
    host: true, // Allow external connections
  },
  build: {
    // Enhanced build optimizations for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ["react", "react-dom"],
          // Material-UI components
          mui: ["@mui/material", "@mui/icons-material", "@mui/system"],
          // Animation libraries
          animations: ["framer-motion"],
          // Charts and data visualization
          charts: ["chart.js", "react-chartjs-2"],
          // HTTP and utilities
          utils: ["axios"],
          // Router
          router: ["react-router-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Additional optimizations
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Enable source maps for debugging
    sourcemap: false, // Disable in production for smaller bundle
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server startup
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mui/material",
      "@mui/icons-material",
      "axios",
      "framer-motion",
    ],
  },
});
