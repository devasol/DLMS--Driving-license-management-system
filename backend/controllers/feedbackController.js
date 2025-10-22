import Feedback from "../models/Feedback.js";

export const getFeedbacks = async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
    console.log(`Retrieved ${feedbacks.length} feedbacks`);
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error in getFeedbacks:", error);
    res.status(500).json({ message: "Failed to fetch feedbacks", error: error.message });
  }
};

export const createFeedback = async (req, res) => {
  try {
    const { name, feedback, rating, userEmail, userId, writtenFeedback, category } = req.body;
    console.log("Received feedback data:", { name, feedback, rating, userEmail, userId, writtenFeedback, category });

    if (!name || !feedback || !rating) {
      console.log("Missing required fields:", { name, feedback, rating });
      return res
        .status(400)
        .json({ message: "Name, feedback, and rating are required" });
    }

    // Check if user is logged in (has userId)
    if (!userId) {
      console.log("User not logged in - userId missing");
      return res
        .status(401)
        .json({ message: "You must be logged in to submit feedback" });
    }

    const newFeedback = new Feedback({
      name,
      feedback,
      rating,
      userEmail,
      userId,
      writtenFeedback: writtenFeedback || null,
      category: category || 'other'
    });

    const savedFeedback = await newFeedback.save();
    console.log("Feedback saved successfully:", savedFeedback);
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: savedFeedback
    });
  } catch (error) {
    console.error("Error in createFeedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message
    });
  }
};

export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    console.log(`Updating feedback ${id} with:`, { status, adminResponse });

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      console.log(`Feedback not found with id: ${id}`);
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.status = status;
    if (adminResponse) feedback.adminResponse = adminResponse;

    const updatedFeedback = await feedback.save();
    console.log("Feedback updated successfully:", updatedFeedback);
    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("Error in updateFeedbackStatus:", error);
    res.status(500).json({
      message: "Failed to update feedback",
      error: error.message
    });
  }
};

export const getFeedbackStats = async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();
    const ratingStats = await Feedback.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = await Feedback.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    console.log("Feedback stats retrieved:", { totalFeedbacks, ratingStats, statusStats });

    res.status(200).json({
      totalFeedbacks,
      ratingStats,
      statusStats
    });
  } catch (error) {
    console.error("Error in getFeedbackStats:", error);
    res.status(500).json({
      message: "Failed to fetch feedback statistics",
      error: error.message
    });
  }
};
