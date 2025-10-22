import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    link: String,
  },
  {
    timestamps: true,
  }
);

// Create the model
const Notification = mongoose.model("Notification", notificationSchema);

// Export as default
export default Notification;
