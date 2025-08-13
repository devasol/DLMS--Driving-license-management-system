import mongoose from 'mongoose';

const trialExamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  attempt: {
    type: Number,
    required: true,
    default: 1
  },
  schedule: [{
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    instructor: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  }],
  result: {
    type: String,
    enum: ['pending', 'pass', 'fail'],
    default: 'pending'
  },
  feedback: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TrialExam = mongoose.model('TrialExam', trialExamSchema);

export default TrialExam; 