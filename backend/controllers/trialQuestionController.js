import TrialQuestion from "../models/TrialQuestion.js";
import TrialResult from "../models/TrialResult.js";
import User from "../models/User.js";

// Admin: Create a new trial question
export const createTrialQuestion = async (req, res) => {
  try {
    const {
      question,
      options,
      correctAnswer,
      category,
      difficulty,
      explanation,
      tags,
    } = req.body;
    const createdBy = req.body.createdBy || "admin"; // Default to admin if not provided

    // Validation
    if (!question || !options || correctAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: "Question, options, and correct answer are required",
      });
    }

    if (options.length < 2 || options.length > 6) {
      return res.status(400).json({
        success: false,
        message: "Question must have between 2 and 6 options",
      });
    }

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({
        success: false,
        message: "Correct answer index must be valid",
      });
    }

    const trialQuestion = new TrialQuestion({
      question: question.trim(),
      options: options.map((opt) => opt.trim()),
      correctAnswer,
      category: category || "General Knowledge",
      difficulty: difficulty || "Medium",
      explanation: explanation?.trim(),
      tags: tags || [],
      createdBy,
    });

    await trialQuestion.save();

    console.log("Trial question created successfully:", trialQuestion._id);

    res.status(201).json({
      success: true,
      message: "Trial question created successfully",
      question: trialQuestion,
    });
  } catch (error) {
    console.error("Error creating trial question:", error);
    res.status(500).json({
      success: false,
      message: "Error creating trial question",
      error: error.message,
    });
  }
};

// Admin: Get all trial questions
export const getAllTrialQuestions = async (req, res) => {
  try {
    const { category, difficulty, isActive } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const questions = await TrialQuestion.find(filter)
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    console.log(`Found ${questions.length} trial questions`);

    res.json({
      success: true,
      questions,
      total: questions.length,
    });
  } catch (error) {
    console.error("Error fetching trial questions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trial questions",
      error: error.message,
    });
  }
};

// Admin: Update trial question
export const updateTrialQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate correct answer if provided
    if (updates.correctAnswer !== undefined && updates.options) {
      if (
        updates.correctAnswer < 0 ||
        updates.correctAnswer >= updates.options.length
      ) {
        return res.status(400).json({
          success: false,
          message: "Correct answer index must be valid",
        });
      }
    }

    const question = await TrialQuestion.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("createdBy", "fullName email");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Trial question not found",
      });
    }

    console.log("Trial question updated successfully:", question._id);

    res.json({
      success: true,
      message: "Trial question updated successfully",
      question,
    });
  } catch (error) {
    console.error("Error updating trial question:", error);
    res.status(500).json({
      success: false,
      message: "Error updating trial question",
      error: error.message,
    });
  }
};

// Admin: Delete trial question
export const deleteTrialQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await TrialQuestion.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Trial question not found",
      });
    }

    console.log("Trial question deleted successfully:", id);

    res.json({
      success: true,
      message: "Trial question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting trial question:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting trial question",
      error: error.message,
    });
  }
};

// User: Get trial questions for exam (without correct answers)
export const getTrialQuestionsForExam = async (req, res) => {
  try {
    const { limit = 20, category, difficulty } = req.query;

    // Build filter object
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    // Get random questions
    const questions = await TrialQuestion.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(limit) } },
      {
        $project: {
          _id: 1,
          question: 1,
          options: 1,
          category: 1,
          difficulty: 1,
          // Don't include correctAnswer for security
        },
      },
    ]);

    console.log(`Serving ${questions.length} trial questions for exam`);

    res.json({
      success: true,
      questions,
      total: questions.length,
    });
  } catch (error) {
    console.error("Error fetching trial questions for exam:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trial questions",
      error: error.message,
    });
  }
};

// User: Submit trial exam results
export const submitTrialResult = async (req, res) => {
  try {
    const { userId, answers, timeStarted, timeCompleted } = req.body;

    if (!userId || !answers || !timeStarted || !timeCompleted) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get the questions with correct answers
    const questionIds = answers.map((answer) => answer.questionId);
    const questions = await TrialQuestion.find({ _id: { $in: questionIds } });

    if (questions.length !== answers.length) {
      return res.status(400).json({
        success: false,
        message: "Some questions not found",
      });
    }

    // Calculate results
    let correctAnswers = 0;
    const processedQuestions = [];

    for (let i = 0; i < answers.length; i++) {
      const userAnswer = answers[i];
      const question = questions.find(
        (q) => q._id.toString() === userAnswer.questionId
      );

      if (!question) continue;

      const isCorrect = question.correctAnswer === userAnswer.userAnswer;
      if (isCorrect) correctAnswers++;

      processedQuestions.push({
        questionId: question._id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer.userAnswer,
        isCorrect,
        timeSpent: userAnswer.timeSpent || 0,
      });
    }

    const totalQuestions = answers.length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passingScore = 70;
    const result = percentage >= passingScore ? "Pass" : "Fail";

    // Calculate total time spent
    const totalTimeSpent = Math.floor(
      (new Date(timeCompleted) - new Date(timeStarted)) / 1000
    );

    // Get user's attempt number
    const previousAttempts = await TrialResult.countDocuments({ userId });
    const attempt = previousAttempts + 1;

    // Create trial result
    const trialResult = new TrialResult({
      userId,
      userName: user.fullName || user.full_name || "Unknown User",
      questions: processedQuestions,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score: correctAnswers,
      percentage,
      passingScore,
      result,
      timeStarted: new Date(timeStarted),
      timeCompleted: new Date(timeCompleted),
      totalTimeSpent,
      attempt,
    });

    await trialResult.save();

    console.log(
      `Trial result saved for user ${userId}: ${result} (${percentage}%)`
    );

    res.json({
      success: true,
      message: "Trial result submitted successfully",
      result: {
        _id: trialResult._id,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        percentage,
        result,
        totalTimeSpent,
        attempt,
      },
    });
  } catch (error) {
    console.error("Error submitting trial result:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting trial result",
      error: error.message,
    });
  }
};

// User: Get user's trial results
export const getUserTrialResults = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const results = await TrialResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("-questions"); // Exclude detailed questions for list view

    console.log(`Found ${results.length} trial results for user ${userId}`);

    res.json({
      success: true,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error("Error fetching user trial results:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trial results",
      error: error.message,
    });
  }
};

// Admin: Get all trial results
export const getAllTrialResults = async (req, res) => {
  try {
    const { result, limit = 50 } = req.query;

    const filter = {};
    if (result) filter.result = result;

    const results = await TrialResult.find(filter)
      .populate("userId", "fullName email profilePicture")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("-questions"); // Exclude detailed questions for admin list view

    console.log(`Found ${results.length} trial results for admin`);

    res.json({
      success: true,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error("Error fetching trial results for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trial results",
      error: error.message,
    });
  }
};

// Get detailed trial result
export const getTrialResultDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await TrialResult.findById(id).populate(
      "userId",
      "fullName email profilePicture"
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Trial result not found",
      });
    }

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error fetching trial result details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trial result details",
      error: error.message,
    });
  }
};
