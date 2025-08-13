import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import ExamSchedule from "../models/examSchedule.js";
import User from "../models/User.js";
import ExamResult from "../models/ExamResult.js";
import ActivityLogger from "../utils/activityLogger.js";

// Exam Question Schema with multilingual support
const examQuestionSchema = new mongoose.Schema({
  question: {
    english: { type: String, required: true },
    amharic: { type: String, required: true },
  },
  options: {
    english: [{ type: String, required: true }],
    amharic: [{ type: String, required: true }],
  },
  correctAnswer: { type: Number, required: true },
  category: {
    type: String,
    enum: [
      "traffic-rules",
      "road-signs",
      "safety",
      "vehicle-operation",
      "emergency",
    ],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ExamQuestion = mongoose.model("ExamQuestion", examQuestionSchema);

// Schedule Exam
export const scheduleExam = async (req, res) => {
  try {
    const { userId, userName, examType, date, time, location, notes } =
      req.body;

    // Validate required fields
    if (!userId || !userName || !examType || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check if user already has an active exam of the same type (not completed, rejected, or expired)
    const existingSchedule = await ExamSchedule.findOne({
      userId,
      examType,
      status: { $in: ["scheduled", "approved", "in_progress"] },
    });

    if (existingSchedule) {
      const statusMessage =
        existingSchedule.status === "scheduled"
          ? "pending approval"
          : existingSchedule.status === "approved"
          ? "approved and ready to take"
          : "in progress";

      return res.status(400).json({
        success: false,
        message: `You already have a ${examType} exam that is ${statusMessage}. Please complete or cancel your existing exam before scheduling a new one.`,
        existingExam: {
          id: existingSchedule._id,
          status: existingSchedule.status,
          date: existingSchedule.date,
          time: existingSchedule.time,
        },
      });
    }

    const examSchedule = new ExamSchedule({
      userId,
      fullName: userName, // Use userName as fullName for compatibility
      examType,
      date: new Date(date),
      time,
      location: location || "online",
      notes,
      status: examType === "theory" ? "approved" : "scheduled", // Auto-approve theory exams
    });

    await examSchedule.save();

    // Log activity
    try {
      await ActivityLogger.logExamActivity(
        userId,
        "exam_schedule",
        "scheduled",
        examSchedule._id,
        {
          examType,
          date: new Date(date),
          time,
          location: location || "online",
          status: examSchedule.status,
        }
      );
    } catch (error) {
      console.error("Error logging exam schedule activity:", error);
    }

    // Create notification for the user
    const notificationMessage =
      examType === "theory"
        ? `Your ${examType} exam has been scheduled and approved for ${new Date(
            date
          ).toLocaleDateString()} at ${time}. You can take your exam anytime!`
        : `Your ${examType} exam has been scheduled for ${new Date(
            date
          ).toLocaleDateString()} at ${time}. Please wait for admin approval.`;

    await Notification.create({
      userId: userId,
      title:
        examType === "theory"
          ? "Theory Exam Ready"
          : "Exam Scheduled Successfully",
      message: notificationMessage,
      type: "success",
      link: `/exam/${examSchedule._id}`,
      seen: false,
    });

    res.status(201).json({
      success: true,
      message: "Exam scheduled successfully",
      data: examSchedule,
    });
  } catch (error) {
    console.error("Error scheduling exam:", error);
    res.status(500).json({
      success: false,
      message: "Error scheduling exam",
      error: error.message,
    });
  }
};

// Get Exam Schedules
export const getExamSchedules = async (req, res) => {
  try {
    const schedules = await ExamSchedule.find().sort({ date: 1 });
    res.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching exam schedules:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exam schedules",
      error: error.message,
    });
  }
};

// Get Single Exam Schedule by ID
export const getExamScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await ExamSchedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Error fetching exam schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exam schedule",
      error: error.message,
    });
  }
};

// Get User Exam Schedule
export const getUserExamSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const schedule = await ExamSchedule.findOne({
      userId,
      status: { $in: ["scheduled", "in_progress"] },
    });

    res.json(schedule);
  } catch (error) {
    console.error("Error fetching user exam schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user exam schedule",
      error: error.message,
    });
  }
};

// Get All User Exam Schedules (including completed ones)
export const getAllUserExamSchedules = async (req, res) => {
  try {
    const { userId } = req.params;
    const schedules = await ExamSchedule.find({ userId }).sort({ date: -1 });

    res.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching user exam schedules:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user exam schedules",
      error: error.message,
    });
  }
};

// Get User Practical Exam Results
export const getUserPracticalExamResults = async (req, res) => {
  try {
    const { userId } = req.params;
    const practicalExams = await ExamSchedule.find({
      userId,
      examType: "practical",
      status: {
        $in: [
          "scheduled",
          "approved",
          "completed",
          "pending_approval",
          "rejected",
          "cancelled",
          "no-show",
        ],
      },
    }).sort({ date: -1 });

    res.json({
      success: true,
      count: practicalExams.length,
      data: practicalExams,
    });
  } catch (error) {
    console.error("Error fetching user practical exam results:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user practical exam results",
      error: error.message,
    });
  }
};

// Update Exam Schedule
export const updateExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    const schedule = await ExamSchedule.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    res.json({
      success: true,
      message: "Exam schedule updated successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Error updating exam schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error updating exam schedule",
      error: error.message,
    });
  }
};

// Delete Exam Schedule
export const deleteExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await ExamSchedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    res.json({
      success: true,
      message: "Exam schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exam schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting exam schedule",
      error: error.message,
    });
  }
};

// Approve Exam Schedule
export const approveExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminMessage, assignExaminer } = req.body;

    // Find an available examiner for practical exams
    let examinerAssignment = {};
    const schedule = await ExamSchedule.findById(id);

    if (schedule && schedule.examType === "practical") {
      // Get all active examiners
      const availableExaminers = await User.find({
        role: "examiner",
        $or: [
          { "examinerDetails.isActive": true },
          { "examinerDetails.isActive": { $exists: false } }, // Include examiners without this field
        ],
      });

      if (availableExaminers.length > 0) {
        // Get current exam counts for each examiner to ensure fair distribution
        const examinerWorkloads = await Promise.all(
          availableExaminers.map(async (examiner) => {
            const examCount = await ExamSchedule.countDocuments({
              examiner: examiner._id,
              examType: "practical",
              status: { $in: ["approved", "scheduled"] },
            });
            return {
              examiner,
              currentExams: examCount,
            };
          })
        );

        // Sort by current workload (ascending) to assign to examiner with least exams
        examinerWorkloads.sort((a, b) => a.currentExams - b.currentExams);

        // If multiple examiners have the same low workload, pick randomly among them
        const minWorkload = examinerWorkloads[0].currentExams;
        const leastBusyExaminers = examinerWorkloads.filter(
          (e) => e.currentExams === minWorkload
        );
        const selectedExaminer =
          leastBusyExaminers[
            Math.floor(Math.random() * leastBusyExaminers.length)
          ].examiner;

        examinerAssignment = {
          examiner: selectedExaminer._id,
          instructor:
            selectedExaminer.fullName ||
            selectedExaminer.full_name ||
            "Assigned Examiner",
        };

        console.log(
          `🎯 Auto-assigning examiner ${
            selectedExaminer.fullName || selectedExaminer.full_name
          } to practical exam (current workload: ${minWorkload} exams)`
        );
      }
    }

    const updatedSchedule = await ExamSchedule.findByIdAndUpdate(
      id,
      {
        status: "approved",
        adminMessage: adminMessage || "Exam schedule approved",
        updatedAt: new Date(),
        ...examinerAssignment,
      },
      { new: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    // Create notification for the user
    await Notification.create({
      userId: schedule.userId,
      title: "Exam Schedule Approved",
      message: `Your ${schedule.examType} exam scheduled for ${new Date(
        schedule.date
      ).toLocaleDateString()} at ${
        schedule.time
      } has been approved. You can now take your exam at the scheduled time.`,
      type: "success",
      link: `/exam/${schedule._id}`,
      seen: false,
    });

    res.json({
      success: true,
      message: "Exam schedule approved successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Error approving exam schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error approving exam schedule",
      error: error.message,
    });
  }
};

// Reject Exam Schedule
export const rejectExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminMessage } = req.body;

    const schedule = await ExamSchedule.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        adminMessage: adminMessage || "Exam schedule rejected",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    // Create notification for the user
    await Notification.create({
      userId: schedule.userId,
      title: "Exam Schedule Rejected",
      message: `Your ${schedule.examType} exam scheduled for ${new Date(
        schedule.date
      ).toLocaleDateString()} at ${schedule.time} has been rejected. ${
        adminMessage || "Please contact support for more information."
      }`,
      type: "error",
      seen: false,
    });

    res.json({
      success: true,
      message: "Exam schedule rejected successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Error rejecting exam schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting exam schedule",
      error: error.message,
    });
  }
};

// Add Exam Question
export const addExamQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty } = req.body;

    // Validate required fields
    if (
      !question ||
      !options ||
      options.length !== 4 ||
      correctAnswer === undefined ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question, 4 options, correct answer, and category are required",
      });
    }

    // Handle both old format (string) and new format (multilingual object)
    let questionData, optionsData;

    if (typeof question === "string") {
      // Old format - convert to multilingual
      questionData = {
        english: question,
        amharic: question, // Use same text for both languages for now
      };
    } else {
      // New format - already multilingual
      questionData = question;
    }

    if (Array.isArray(options) && typeof options[0] === "string") {
      // Old format - convert to multilingual
      optionsData = {
        english: options,
        amharic: options, // Use same options for both languages for now
      };
    } else {
      // New format - already multilingual
      optionsData = options;
    }

    const examQuestion = new ExamQuestion({
      question: questionData,
      options: optionsData,
      correctAnswer,
      category,
      difficulty: difficulty || "medium",
    });

    await examQuestion.save();

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: examQuestion,
    });
  } catch (error) {
    console.error("Error adding exam question:", error);
    res.status(500).json({
      success: false,
      message: "Error adding exam question",
      error: error.message,
    });
  }
};

// Get Exam Questions
export const getExamQuestions = async (req, res) => {
  try {
    const { count } = req.params;
    let questions;

    if (count && !isNaN(count)) {
      // Get random questions for exam
      questions = await ExamQuestion.aggregate([
        { $sample: { size: parseInt(count) } },
      ]);
    } else {
      // Get all questions for admin
      questions = await ExamQuestion.find().sort({ createdAt: -1 });
    }

    res.json(questions);
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exam questions",
      error: error.message,
    });
  }
};

// Update Exam Question
export const updateExamQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    const question = await ExamQuestion.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.json({
      success: true,
      message: "Question updated successfully",
      data: question,
    });
  } catch (error) {
    console.error("Error updating exam question:", error);
    res.status(500).json({
      success: false,
      message: "Error updating exam question",
      error: error.message,
    });
  }
};

// Delete Exam Question
export const deleteExamQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await ExamQuestion.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exam question:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting exam question",
      error: error.message,
    });
  }
};

// Get Exam by ID
export const getExamById = async (req, res) => {
  try {
    console.log(
      "🔍 Getting exam by ID:",
      req.params.examId,
      "Language:",
      req.query.language
    );
    const { examId } = req.params;
    const { language = "english" } = req.query; // Get language from query params
    const schedule = await ExamSchedule.findById(examId);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // For theory exams, allow immediate access without time restrictions
    if (schedule.examType === "theory") {
      // Check if exam has already been completed
      if (schedule.status === "completed") {
        return res.status(403).json({
          success: false,
          message: "This exam has already been completed.",
        });
      }

      // Get random questions for the theory exam (10 questions)
      console.log("📝 Fetching questions for theory exam...");
      const totalQuestions = await ExamQuestion.countDocuments();
      console.log("📊 Total questions in database:", totalQuestions);

      const questions = await ExamQuestion.aggregate([
        { $sample: { size: Math.min(10, totalQuestions) } },
      ]);

      console.log("✅ Retrieved questions:", questions.length);

      if (questions.length === 0) {
        console.log("❌ No questions found in database");
        return res.status(404).json({
          success: false,
          message:
            "No questions available for this exam type. Please contact administrator to add questions.",
        });
      }

      res.json({
        success: true,
        exam: schedule,
        language: language,
        questions: questions.map((q) => ({
          _id: q._id,
          question: q.question?.[language] || q.question?.english || q.question,
          options: q.options?.[language] || q.options?.english || q.options,
          correctAnswer: q.correctAnswer, // Send correct answers for development
          category: q.category,
          difficulty: q.difficulty,
        })),
      });
      return;
    }

    // For practical exams, keep the original time-based restrictions
    // Check if exam is approved
    if (schedule.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Exam is not approved yet. Please wait for admin approval.",
        examStatus: schedule.status,
      });
    }

    // Check if exam time has arrived (allow taking exam 2 hours before scheduled time for flexibility)
    const examDateTime = new Date(
      `${schedule.date.toDateString()} ${schedule.time}`
    );
    const currentTime = new Date();
    const timeDifference = examDateTime.getTime() - currentTime.getTime();
    const minutesUntilExam = Math.floor(timeDifference / (1000 * 60));

    // Allow taking exam 2 hours (120 minutes) before scheduled time for more flexibility
    if (minutesUntilExam > 120) {
      return res.status(403).json({
        success: false,
        message: `Exam is not available yet. You can take the exam up to 2 hours before the scheduled time. Time remaining: ${Math.floor(
          minutesUntilExam / 60
        )} hours and ${minutesUntilExam % 60} minutes.`,
        timeUntilAvailable: minutesUntilExam,
      });
    }

    // Check if exam has already been completed
    if (schedule.status === "completed") {
      return res.status(403).json({
        success: false,
        message: "This exam has already been completed.",
      });
    }

    // Get random questions for the practical exam
    const questionCount = 10;
    const questions = await ExamQuestion.aggregate([
      { $sample: { size: questionCount } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions available for this exam type.",
      });
    }

    res.json({
      success: true,
      exam: schedule,
      questions: questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        category: q.category,
        difficulty: q.difficulty,
      })), // Don't send correct answers to frontend
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exam",
      error: error.message,
    });
  }
};

// Submit Exam Result
export const submitExamResult = async (req, res) => {
  try {
    const { examId } = req.params;
    const {
      userId,
      userName,
      answers,
      timeSpent,
      language = "english",
      cancelled = false,
    } = req.body;

    // Get the exam schedule
    const schedule = await ExamSchedule.findById(examId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Handle exam cancellation
    if (cancelled) {
      const cancelledResult = new ExamResult({
        userId,
        userName,
        examType: schedule.examType,
        language,
        questions: [],
        answers: [],
        score: 0,
        passed: false,
        timeSpent: timeSpent || 0,
        examScheduleId: examId,
        cancelled: true,
        cancelledAt: new Date(),
        totalQuestions: schedule.examType === "theory" ? 50 : 10,
        correctAnswers: 0,
      });

      await cancelledResult.save();

      // Update exam schedule status
      await ExamSchedule.findByIdAndUpdate(examId, {
        status: "cancelled",
        updatedAt: new Date(),
      });

      return res.json({
        success: true,
        message: "Exam cancelled successfully",
        result: {
          score: 0,
          passed: false,
          cancelled: true,
          totalQuestions: schedule.examType === "theory" ? 50 : 10,
          correctAnswers: 0,
        },
      });
    }

    // Get the questions that were used in this exam
    const questionCount = schedule.examType === "theory" ? 10 : 10; // 10 questions for theory exams
    const questions = await ExamQuestion.aggregate([
      { $sample: { size: questionCount } },
    ]);

    // Calculate score
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (questions[index] && answer === questions[index].correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 74; // Updated to 74% passing grade

    // Save exam result
    const examResult = new ExamResult({
      userId,
      userName,
      examType: schedule.examType,
      language,
      questions: questions.map((q) => q._id),
      answers,
      score,
      passed,
      timeSpent,
      examScheduleId: examId,
      cancelled: false,
      totalQuestions: questions.length,
      correctAnswers,
    });

    await examResult.save();

    // Log exam completion activity
    try {
      await ActivityLogger.logExamActivity(
        userId,
        "exam_completion",
        "completed",
        examId,
        {
          examType: schedule.examType,
          score,
          passed,
          language,
          totalQuestions: questions.length,
          correctAnswers,
        }
      );
    } catch (error) {
      console.error("Error logging exam completion activity:", error);
    }

    // Log exam result activity
    try {
      await ActivityLogger.logExamActivity(
        userId,
        "exam_result",
        "published",
        examResult._id,
        {
          examType: schedule.examType,
          score,
          passed,
          language,
        }
      );
    } catch (error) {
      console.error("Error logging exam result activity:", error);
    }

    // Update exam schedule status
    await ExamSchedule.findByIdAndUpdate(examId, { status: "completed" });

    // Create notification for the user about exam result
    await Notification.create({
      userId: userId,
      title: `Exam Result - ${passed ? "PASSED" : "FAILED"}`,
      message: `Your ${
        schedule.examType
      } exam has been completed. Score: ${score}%. ${
        passed
          ? "Congratulations! You have passed the exam."
          : "Unfortunately, you did not pass. You need at least 74% to pass."
      }`,
      type: passed ? "success" : "error",
      seen: false,
    });

    res.json({
      success: true,
      message: "Exam submitted successfully",
      result: {
        score,
        passed,
        correctAnswers,
        totalQuestions: questions.length,
      },
    });
  } catch (error) {
    console.error("Error submitting exam result:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting exam result",
      error: error.message,
    });
  }
};

// Get Exam Results
export const getExamResults = async (req, res) => {
  try {
    const { userId } = req.params;
    let query = {};

    if (userId) {
      query.userId = userId;
    }

    const results = await ExamResult.find(query)
      .populate("examScheduleId")
      .sort({ dateTaken: -1 });

    res.json(results);
  } catch (error) {
    console.error("Error fetching exam results:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exam results",
      error: error.message,
    });
  }
};

// Get User's Available Exams
export const getUserAvailableExams = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get scheduled and approved exams for the user (not completed or rejected)
    const availableExams = await ExamSchedule.find({
      userId: userId,
      status: { $in: ["scheduled", "approved"] },
    }).sort({ date: 1 });

    // Check which exams are currently available to take
    const examsWithAvailability = availableExams.map((exam) => {
      const examDateTime = new Date(`${exam.date.toDateString()} ${exam.time}`);
      const currentTime = new Date();
      const timeDifference = examDateTime.getTime() - currentTime.getTime();
      const minutesUntilExam = Math.floor(timeDifference / (1000 * 60));

      // For theory exams, make them immediately available regardless of time or approval status
      if (exam.examType === "theory") {
        return {
          ...exam.toObject(),
          isAvailable: true, // Theory exams are always available
          minutesUntilAvailable: 0,
          hasExpired: false,
          needsApproval: false, // Theory exams don't need approval
        };
      }

      // For practical exams, use more flexible time-based restrictions
      const canTakeExam =
        exam.status === "approved" &&
        minutesUntilExam <= 120 &&
        minutesUntilExam >= -240;

      return {
        ...exam.toObject(),
        isAvailable: canTakeExam,
        minutesUntilAvailable: minutesUntilExam > 120 ? minutesUntilExam : 0,
        hasExpired: minutesUntilExam < -240,
        needsApproval: exam.status === "scheduled",
      };
    });

    res.json({
      success: true,
      exams: examsWithAvailability,
    });
  } catch (error) {
    console.error("Error fetching user available exams:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available exams",
      error: error.message,
    });
  }
};

// Create Instant Theory Exam
export const createInstantTheoryExam = async (req, res) => {
  try {
    console.log("📚 Creating instant theory exam for user:", req.body);
    const { userId } = req.body;

    if (!userId) {
      console.log("❌ No userId provided");
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user already has an active theory exam
    const existingTheoryExam = await ExamSchedule.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      examType: "theory",
      status: { $in: ["scheduled", "approved"] },
    });

    if (existingTheoryExam) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active theory exam. Please complete or cancel it before creating a new one.",
        existingExam: existingTheoryExam,
      });
    }

    // Get user info (create a dummy user for testing if not found)
    let user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) {
      // For testing purposes, create a dummy user object
      user = {
        fullName: "Test User",
        full_name: "Test User",
      };
    }

    // Create instant theory exam schedule
    const examSchedule = new ExamSchedule({
      userId: new mongoose.Types.ObjectId(userId),
      fullName: user.fullName || user.full_name || "Unknown User",
      examType: "theory",
      date: new Date(), // Current date
      time: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }), // Current time
      location: "online",
      notes: "Instant theory exam - available immediately",
      status: "approved", // Auto-approve theory exams
    });

    await examSchedule.save();
    console.log(
      "✅ Instant theory exam created successfully:",
      examSchedule._id
    );

    res.json({
      success: true,
      message: "Instant theory exam created successfully",
      exam: examSchedule,
    });
  } catch (error) {
    console.error("❌ Error creating instant theory exam:", error);
    res.status(500).json({
      success: false,
      message: "Error creating instant theory exam",
      error: error.message,
    });
  }
};

// Placeholder for takeExam function
export const takeExam = async (req, res) => {
  try {
    // This function can be used for additional exam taking logic if needed
    res.json({ message: "Take exam functionality" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete Exam (mark as taken and pending approval)
export const completeExam = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      score,
      notes,
      evaluatedBy,
      maneuvers,
      trafficRules,
      overallPerformance,
    } = req.body;

    const schedule = await ExamSchedule.findByIdAndUpdate(
      id,
      {
        status: "pending_approval",
        examResult: {
          score,
          notes,
          evaluatedBy,
          evaluatedAt: new Date(),
          maneuvers: maneuvers || {},
          trafficRules: trafficRules || {},
          overallPerformance: overallPerformance || "",
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    // Create notification for the user
    await Notification.create({
      userId: schedule.userId,
      title: "Practical Exam Completed",
      message: `Your practical exam has been completed and is now pending admin approval. Score: ${score}%`,
      type: "info",
      seen: false,
    });

    return res.status(200).json({
      success: true,
      message: "Exam marked as completed and pending approval",
      data: schedule,
    });
  } catch (error) {
    console.error("Error completing exam:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete exam",
      error: error.message,
    });
  }
};

// Complete Exam with Final Result (directly mark as completed without approval)
export const completeExamWithFinalResult = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      score,
      notes,
      evaluatedBy,
      maneuvers,
      trafficRules,
      overallPerformance,
    } = req.body;

    // Determine result based on score (74% passing for theory exams)
    const examScore = score || 0;
    const result = examScore >= 74 ? "pass" : "fail";

    const schedule = await ExamSchedule.findByIdAndUpdate(
      id,
      {
        status: "completed",
        result: result,
        examResult: {
          score: examScore,
          notes,
          evaluatedBy,
          evaluatedAt: new Date(),
          maneuvers: maneuvers || {},
          trafficRules: trafficRules || {},
          overallPerformance: overallPerformance || "",
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    // Create notification for the user
    await Notification.create({
      userId: schedule.userId,
      title: "Practical Exam Result Available",
      message: `${
        result === "pass"
          ? "Congratulations! You have passed your practical driving test."
          : "Your practical exam has been completed. Unfortunately, you did not pass this time."
      } Score: ${examScore}%`,
      type: result === "pass" ? "success" : "warning",
      seen: false,
    });

    return res.status(200).json({
      success: true,
      message: "Exam completed successfully with final result",
      data: schedule,
    });
  } catch (error) {
    console.error("Error completing exam with final result:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete exam with final result",
      error: error.message,
    });
  }
};

// Approve Exam Result
export const approveExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminMessage } = req.body;

    const schedule = await ExamSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    // Determine result based on score (74% passing for theory exams)
    const examScore = schedule.examResult?.score || 0;
    const result = examScore >= 74 ? "pass" : "fail";

    const updatedSchedule = await ExamSchedule.findByIdAndUpdate(
      id,
      {
        status: "completed",
        result: result,
        adminMessage: adminMessage || "Exam result approved",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Failed to update exam schedule",
      });
    }

    // Create notification for the user
    await Notification.create({
      userId: updatedSchedule.userId,
      title: "Practical Exam Result Approved",
      message: `${
        result === "pass"
          ? "Congratulations! Your practical exam result has been approved. You have successfully passed the practical driving test."
          : "Your practical exam result has been reviewed. Unfortunately, you did not pass this time."
      } ${adminMessage ? `Admin note: ${adminMessage}` : ""}`,
      type: result === "pass" ? "success" : "warning",
      seen: false,
    });

    return res.status(200).json({
      success: true,
      message: "Exam result approved successfully",
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("Error approving exam result:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve exam result",
      error: error.message,
    });
  }
};

// Reject Exam Result
export const rejectExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminMessage } = req.body;

    const schedule = await ExamSchedule.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        result: "fail",
        adminMessage: adminMessage || "Exam result rejected",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    // Create notification for the user
    await Notification.create({
      userId: schedule.userId,
      title: "Practical Exam Result Rejected",
      message: `Unfortunately, your practical exam result has been rejected. You will need to retake the practical exam. ${
        adminMessage ? `Admin note: ${adminMessage}` : ""
      }`,
      type: "error",
      seen: false,
    });

    return res.status(200).json({
      success: true,
      message: "Exam result rejected successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Error rejecting exam result:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject exam result",
      error: error.message,
    });
  }
};

// Get Pending Approval Exams
export const getPendingApprovalExams = async (req, res) => {
  try {
    const pendingExams = await ExamSchedule.find({
      status: "pending_approval",
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingExams.length,
      data: pendingExams,
    });
  } catch (error) {
    console.error("Error fetching pending approval exams:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending approval exams",
      error: error.message,
    });
  }
};

// Update Exam Result
export const updateExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, passed, correctAnswers, totalQuestions, timeSpent } =
      req.body;

    // Validate input
    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 100",
      });
    }

    const updatedResult = await ExamResult.findByIdAndUpdate(
      id,
      {
        score: parseInt(score),
        passed: Boolean(passed),
        correctAnswers: parseInt(correctAnswers),
        totalQuestions: parseInt(totalQuestions),
        timeSpent: parseInt(timeSpent),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedResult) {
      return res.status(404).json({
        success: false,
        message: "Exam result not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam result updated successfully",
      data: updatedResult,
    });
  } catch (error) {
    console.error("Error updating exam result:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update exam result",
      error: error.message,
    });
  }
};

// Delete Exam Result
export const deleteExamResult = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedResult = await ExamResult.findByIdAndDelete(id);

    if (!deletedResult) {
      return res.status(404).json({
        success: false,
        message: "Exam result not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam result deleted successfully",
      data: deletedResult,
    });
  } catch (error) {
    console.error("Error deleting exam result:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete exam result",
      error: error.message,
    });
  }
};
