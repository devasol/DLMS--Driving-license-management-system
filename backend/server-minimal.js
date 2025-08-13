import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 5004;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Serve profile pictures via API route for compatibility with frontend fallbacks
app.get("/api/users/profile-picture/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "profile-pictures",
      filename
    );

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "Profile picture not found" });
    }

    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.sendFile(filePath);
  } catch (err) {
    console.error("Error serving profile picture:", err);
    res
      .status(500)
      .json({ success: false, message: "Error serving profile picture" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "minimal-server",
    port: PORT,
  });
});

// Mock payment data
const mockPayments = [
  {
    _id: "payment_1",
    userName: "Alemayehu Tadesse",
    userId: {
      email: "alemayehu.tadesse@gmail.com",
      phone: "+251911234567",
      firstName: "Alemayehu",
      lastName: "Tadesse",
      dateOfBirth: "1995-03-15",
      address: "Bole, Addis Ababa",
    },
    amount: 500,
    currency: "ETB",
    paymentMethod: "telebirr",
    transactionId: "TB123456789",
    paymentDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    receiptImage: "uploads/demo_receipt_1.jpg",
    status: "pending",
  },
  {
    _id: "payment_2",
    userName: "Meron Bekele",
    userId: {
      email: "meron.bekele@yahoo.com",
      phone: "+251922345678",
      firstName: "Meron",
      lastName: "Bekele",
      dateOfBirth: "1992-08-22",
      address: "Piassa, Addis Ababa",
    },
    amount: 500,
    currency: "ETB",
    paymentMethod: "bank_transfer",
    transactionId: "BT987654321",
    paymentDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    receiptImage: "uploads/demo_receipt_2.jpg",
    status: "verified",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    adminNotes: "Payment verified and license issued",
  },
  {
    _id: "payment_3",
    userName: "Dawit Haile",
    userId: {
      email: "dawit.haile@outlook.com",
      phone: "+251933456789",
      firstName: "Dawit",
      lastName: "Haile",
      dateOfBirth: "1988-12-10",
      address: "Kazanchis, Addis Ababa",
    },
    amount: 500,
    currency: "ETB",
    paymentMethod: "cbe_birr",
    transactionId: "CBE445566778",
    paymentDate: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    receiptImage: "uploads/demo_receipt_3.jpg",
    status: "rejected",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    adminNotes: "Receipt image unclear, please resubmit",
  },
];

// Payment routes
app.get("/api/payments/all", (req, res) => {
  console.log("✅ GET /api/payments/all - Fetching all payments");

  const { status, page = 1, limit = 100 } = req.query;

  let filteredPayments = [...mockPayments];
  if (status && status !== "all") {
    filteredPayments = mockPayments.filter((p) => p.status === status);
  }

  // Calculate statistics
  const stats = {
    pending: mockPayments.filter((p) => p.status === "pending").length,
    verified: mockPayments.filter((p) => p.status === "verified").length,
    rejected: mockPayments.filter((p) => p.status === "rejected").length,
    total: mockPayments.length,
  };

  res.json({
    success: true,
    count: filteredPayments.length,
    total: mockPayments.length,
    page: parseInt(page),
    pages: Math.ceil(filteredPayments.length / limit),
    stats: stats,
    payments: filteredPayments,
    message: "Payments fetched successfully from minimal server",
  });
});

app.get("/api/payments/pending", (req, res) => {
  console.log("✅ GET /api/payments/pending - Fetching pending payments");

  const pendingPayments = mockPayments.filter((p) => p.status === "pending");

  res.json({
    success: true,
    count: pendingPayments.length,
    payments: pendingPayments,
    message: "Pending payments fetched successfully",
  });
});

// Submit payment route
app.post("/api/payments/submit", (req, res) => {
  console.log("✅ POST /api/payments/submit - Submitting payment");
  console.log("Request body:", req.body);

  const {
    userId,
    userName,
    paymentMethod,
    transactionId,
    paymentDate,
    amount = 500,
  } = req.body;

  // Create new payment
  const newPayment = {
    _id: "payment_" + Date.now(),
    userName,
    userId: {
      _id: userId,
      email: `${userName.toLowerCase().replace(" ", ".")}@example.com`,
      phone: "+251911234567",
      firstName: userName.split(" ")[0],
      lastName: userName.split(" ").slice(1).join(" "),
      dateOfBirth: "1995-01-01",
      address: "Demo Address, Addis Ababa",
    },
    amount,
    currency: "ETB",
    paymentMethod,
    transactionId,
    paymentDate: new Date(paymentDate).toISOString(),
    createdAt: new Date().toISOString(),
    receiptImage: "uploads/demo_receipt.jpg",
    status: "pending",
  };

  // Add to mock payments
  mockPayments.push(newPayment);

  res.status(201).json({
    success: true,
    message:
      "Payment submitted successfully. Please wait for admin verification.",
    payment: newPayment,
  });
});

// Verify payment route
app.put("/api/payments/verify/:paymentId", (req, res) => {
  console.log(
    `✅ PUT /api/payments/verify/${req.params.paymentId} - Verifying payment`
  );

  const { paymentId } = req.params;
  const { adminNotes } = req.body;

  const paymentIndex = mockPayments.findIndex((p) => p._id === paymentId);
  if (paymentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Payment not found",
    });
  }

  // Update payment status
  mockPayments[paymentIndex].status = "verified";
  mockPayments[paymentIndex].reviewedAt = new Date().toISOString();
  mockPayments[paymentIndex].adminNotes =
    adminNotes || "Payment verified and license issued";

  res.json({
    success: true,
    message: "Payment verified and license issued successfully",
    payment: mockPayments[paymentIndex],
  });
});

// Reject payment route
app.put("/api/payments/reject/:paymentId", (req, res) => {
  console.log(
    `✅ PUT /api/payments/reject/${req.params.paymentId} - Rejecting payment`
  );

  const { paymentId } = req.params;
  const { adminNotes } = req.body;

  const paymentIndex = mockPayments.findIndex((p) => p._id === paymentId);
  if (paymentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Payment not found",
    });
  }

  // Update payment status
  mockPayments[paymentIndex].status = "rejected";
  mockPayments[paymentIndex].reviewedAt = new Date().toISOString();
  mockPayments[paymentIndex].adminNotes = adminNotes || "Payment rejected";

  res.json({
    success: true,
    message: "Payment rejected successfully",
    payment: mockPayments[paymentIndex],
  });
});

// (Other routes above)

// Catch-all route for debugging
app.use("*", (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: "Route not found",
    requestedUrl: req.originalUrl,
    availableRoutes: [
      "/api/health",
      "/api/payments/all",
      "/api/payments/pending",
      "/api/payments/submit",
      "/api/payments/verify/:paymentId",
      "/api/payments/reject/:paymentId",
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal backend server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 All payments: http://localhost:${PORT}/api/payments/all`);
  console.log(
    `🔗 Pending payments: http://localhost:${PORT}/api/payments/pending`
  );
  console.log(`✅ Payment routes are now available!`);
});
