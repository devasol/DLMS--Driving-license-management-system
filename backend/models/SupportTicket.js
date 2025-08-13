import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: ["general", "technical", "application", "exam", "payment", "other"],
      default: "general",
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    responses: [
      {
        responderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        responderName: {
          type: String,
          required: true,
        },
        responderRole: {
          type: String,
          enum: ["user", "admin", "support"],
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
          maxlength: 2000,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isInternal: {
          type: Boolean,
          default: false, // Internal notes only visible to admin/support
        },
      },
    ],
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    customerSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      feedback: {
        type: String,
        maxlength: 500,
        default: null,
      },
      submittedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique ticket ID before saving
supportTicketSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketId) {
    const count = await mongoose.model("SupportTicket").countDocuments();
    this.ticketId = `DLMS-${String(count + 1).padStart(6, "0")}`;
  }
  
  // Update lastUpdated timestamp
  this.lastUpdated = new Date();
  
  // Set resolved/closed timestamps based on status
  if (this.status === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  if (this.status === "closed" && !this.closedAt) {
    this.closedAt = new Date();
  }
  
  next();
});

// Index for better query performance
supportTicketSchema.index({ userId: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, priority: 1 });
supportTicketSchema.index({ ticketId: 1 });
supportTicketSchema.index({ category: 1 });

// Virtual for ticket age in days
supportTicketSchema.virtual("ageInDays").get(function () {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for response count
supportTicketSchema.virtual("responseCount").get(function () {
  return this.responses.length;
});

// Method to add response
supportTicketSchema.methods.addResponse = function (responderId, responderName, responderRole, message, isInternal = false) {
  this.responses.push({
    responderId,
    responderName,
    responderRole,
    message,
    isInternal,
    timestamp: new Date(),
  });
  this.lastUpdated = new Date();
  return this.save();
};

// Method to update status
supportTicketSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;
  this.lastUpdated = new Date();
  
  if (newStatus === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  if (newStatus === "closed" && !this.closedAt) {
    this.closedAt = new Date();
  }
  
  return this.save();
};

// Static method to get tickets by user
supportTicketSchema.statics.getByUser = function (userId, options = {}) {
  const {
    status,
    category,
    priority,
    limit = 50,
    skip = 0,
    sortBy = "createdAt",
    sortOrder = -1,
  } = options;

  const query = { userId };
  
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;

  return this.find(query)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip)
    .populate("userId", "fullName email")
    .populate("assignedTo", "fullName email");
};

// Static method to get admin dashboard stats
supportTicketSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await this.aggregate([
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ]);

  const categoryStats = await this.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    statusStats: stats,
    priorityStats,
    categoryStats,
    totalTickets: await this.countDocuments(),
    openTickets: await this.countDocuments({ status: "open" }),
    urgentTickets: await this.countDocuments({ priority: "urgent" }),
  };
};

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
