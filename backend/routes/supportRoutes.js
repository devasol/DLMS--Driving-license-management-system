import express from "express";
import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";

const router = express.Router();

// Create a new support ticket
router.post("/tickets", async (req, res) => {
  try {
    const { userId, subject, message, category, priority } = req.body;

    // Validate required fields
    if (!userId || !subject || !message) {
      return res.status(400).json({
        message: "User ID, subject, and message are required",
      });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Create new support ticket
    const supportTicket = new SupportTicket({
      userId,
      userName: user.fullName || user.full_name || user.user_name || "Unknown User",
      userEmail: user.email || user.user_email || "no-email@example.com",
      subject: subject.trim(),
      message: message.trim(),
      category: category || "general",
      priority: priority || "medium",
    });

    await supportTicket.save();

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket: {
        id: supportTicket._id,
        ticketId: supportTicket.ticketId,
        subject: supportTicket.subject,
        status: supportTicket.status,
        priority: supportTicket.priority,
        category: supportTicket.category,
        createdAt: supportTicket.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({
      message: "Failed to create support ticket",
      error: error.message,
    });
  }
});

// Get user's support tickets
router.get("/tickets/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      status,
      category,
      priority,
      limit = 50,
      skip = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const options = {
      status,
      category,
      priority,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sortBy,
      sortOrder: sortOrder === "desc" ? -1 : 1,
    };

    const tickets = await SupportTicket.getByUser(userId, options);

    res.json({
      tickets: tickets.map(ticket => ({
        id: ticket._id,
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        message: ticket.message,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
        lastUpdated: ticket.lastUpdated,
        responseCount: ticket.responseCount,
        ageInDays: ticket.ageInDays,
      })),
      total: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({
      message: "Failed to fetch support tickets",
      error: error.message,
    });
  }
});

// Get a specific support ticket
router.get("/tickets/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { userId } = req.query;

    let ticket;
    
    // Check if ticketId is MongoDB ObjectId or custom ticketId
    if (ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await SupportTicket.findById(ticketId);
    } else {
      ticket = await SupportTicket.findOne({ ticketId });
    }

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    // Check if user has permission to view this ticket
    if (userId && ticket.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Access denied. You can only view your own tickets.",
      });
    }

    res.json({
      ticket: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        message: ticket.message,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
        lastUpdated: ticket.lastUpdated,
        resolvedAt: ticket.resolvedAt,
        closedAt: ticket.closedAt,
        responses: ticket.responses.filter(response => !response.isInternal),
        responseCount: ticket.responseCount,
        ageInDays: ticket.ageInDays,
        tags: ticket.tags,
      },
    });
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    res.status(500).json({
      message: "Failed to fetch support ticket",
      error: error.message,
    });
  }
});

// Add response to a support ticket
router.post("/tickets/:ticketId/responses", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { userId, message, isInternal = false } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        message: "User ID and message are required",
      });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Find the ticket
    let ticket;
    if (ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await SupportTicket.findById(ticketId);
    } else {
      ticket = await SupportTicket.findOne({ ticketId });
    }

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    // Check permissions - users can only respond to their own tickets
    const userRole = user.role || (user.isAdmin ? "admin" : "user");
    if (userRole === "user" && ticket.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Access denied. You can only respond to your own tickets.",
      });
    }

    // Add response
    await ticket.addResponse(
      userId,
      user.fullName || user.full_name || user.user_name || "Unknown User",
      userRole,
      message.trim(),
      isInternal && userRole !== "user" // Only admin/support can add internal notes
    );

    res.json({
      message: "Response added successfully",
      ticket: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        status: ticket.status,
        lastUpdated: ticket.lastUpdated,
        responseCount: ticket.responseCount,
      },
    });
  } catch (error) {
    console.error("Error adding response to ticket:", error);
    res.status(500).json({
      message: "Failed to add response",
      error: error.message,
    });
  }
});

// Update support ticket status (admin only)
router.put("/tickets/:ticketId/status", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, userId } = req.body;

    if (!status || !userId) {
      return res.status(400).json({
        message: "Status and user ID are required",
      });
    }

    // Verify user is admin
    const user = await User.findById(userId);
    if (!user || (!user.isAdmin && user.role !== "admin")) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    // Find and update ticket
    let ticket;
    if (ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await SupportTicket.findById(ticketId);
    } else {
      ticket = await SupportTicket.findOne({ ticketId });
    }

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    await ticket.updateStatus(status);

    res.json({
      message: "Ticket status updated successfully",
      ticket: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        status: ticket.status,
        lastUpdated: ticket.lastUpdated,
        resolvedAt: ticket.resolvedAt,
        closedAt: ticket.closedAt,
      },
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({
      message: "Failed to update ticket status",
      error: error.message,
    });
  }
});

// Get support ticket statistics (admin only)
router.get("/stats", async (req, res) => {
  try {
    const { userId } = req.query;

    // Verify user is admin
    const user = await User.findById(userId);
    if (!user || (!user.isAdmin && user.role !== "admin")) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    const stats = await SupportTicket.getStats();

    res.json({
      stats,
    });
  } catch (error) {
    console.error("Error fetching support stats:", error);
    res.status(500).json({
      message: "Failed to fetch support statistics",
      error: error.message,
    });
  }
});

// Get all support tickets (admin only)
router.get("/tickets", async (req, res) => {
  try {
    const {
      userId,
      status,
      category,
      priority,
      limit = 50,
      skip = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Verify user is admin
    const user = await User.findById(userId);
    if (!user || (!user.isAdmin && user.role !== "admin")) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const tickets = await SupportTicket.find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("userId", "fullName email")
      .populate("assignedTo", "fullName email");

    const total = await SupportTicket.countDocuments(query);

    res.json({
      tickets: tickets.map(ticket => ({
        id: ticket._id,
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        userName: ticket.userName,
        userEmail: ticket.userEmail,
        createdAt: ticket.createdAt,
        lastUpdated: ticket.lastUpdated,
        responseCount: ticket.responseCount,
        ageInDays: ticket.ageInDays,
        assignedTo: ticket.assignedTo,
      })),
      total,
      page: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    res.status(500).json({
      message: "Failed to fetch support tickets",
      error: error.message,
    });
  }
});

export default router;
