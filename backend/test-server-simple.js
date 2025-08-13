// Simple test to check if the server can start
import express from "express";
import cors from "cors";

const app = express();
const PORT = 5004;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Simple server is running" });
});

// Test payments route
app.get("/api/payments/all", (req, res) => {
  res.json({
    success: true,
    message: "Test route working",
    payments: [
      {
        _id: "test1",
        userName: "Test User",
        amount: 500,
        status: "pending",
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Simple test server running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Payments URL: http://localhost:${PORT}/api/payments/all`);
});
