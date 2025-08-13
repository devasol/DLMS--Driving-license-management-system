import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'announcement', 'policy', 'exam', 'license', 'traffic', 'emergency'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String, // URL or file path
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  publishDate: {
    type: Date,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  }],
  isSticky: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  notifyUsers: {
    type: Boolean,
    default: false
  },
  targetAudience: {
    type: String,
    enum: ['all', 'applicants', 'license_holders', 'expired_licenses'],
    default: 'all'
  }
}, {
  timestamps: true
});

// Indexes for better performance
newsSchema.index({ status: 1, publishDate: -1 });
newsSchema.index({ category: 1, status: 1 });
newsSchema.index({ isSticky: -1, publishDate: -1 });
newsSchema.index({ tags: 1 });

// Virtual for like count
newsSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
newsSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.isApproved).length;
});

// Method to check if news is active
newsSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'published' && 
         (!this.expiryDate || this.expiryDate > now);
};

// Method to increment views
newsSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get published news
newsSchema.statics.getPublished = function(options = {}) {
  const query = { 
    status: 'published',
    $or: [
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ]
  };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  return this.find(query)
    .populate('author', 'fullName email')
    .sort({ isSticky: -1, publishDate: -1 })
    .limit(options.limit || 20);
};

export default mongoose.model('News', newsSchema);
