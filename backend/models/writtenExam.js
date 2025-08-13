import mongoose from 'mongoose';

const writtenExamSchema = new mongoose.Schema({
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
  result: {
    type: String,
    enum: ['pending', 'pass', 'fail'],
    default: 'pending'
  },
  score: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const WrittenExam = mongoose.model('WrittenExam', writtenExamSchema);

export default WrittenExam; 