import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms';

async function addIndexes() {
  try {
    console.log('🚀 Adding database indexes for performance...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Helper function to safely create index
    const safeCreateIndex = async (collectionName, indexSpec, options = {}) => {
      try {
        await db.collection(collectionName).createIndex(indexSpec, options);
        console.log(`✅ Created index on ${collectionName}:`, indexSpec);
      } catch (error) {
        if (error.code === 11000 || error.code === 86) {
          console.log(`⚠️ Index already exists on ${collectionName}:`, indexSpec);
        } else {
          console.error(`❌ Failed to create index on ${collectionName}:`, error.message);
        }
      }
    };
    
    // Add performance indexes
    console.log('📊 Adding performance indexes...');
    
    // Users - most queried fields
    await safeCreateIndex('users', { email: 1 }, { sparse: true });
    await safeCreateIndex('users', { createdAt: -1 });
    await safeCreateIndex('users', { isEmailVerified: 1 });
    
    // Applications - status and user queries
    await safeCreateIndex('applications', { userId: 1 });
    await safeCreateIndex('applications', { status: 1 });
    await safeCreateIndex('applications', { userId: 1, status: 1 });
    
    // Payments - frequently filtered
    await safeCreateIndex('payments', { userId: 1 });
    await safeCreateIndex('payments', { status: 1 });
    await safeCreateIndex('payments', { createdAt: -1 });
    
    // Notifications - user and read status
    await safeCreateIndex('notifications', { userId: 1 });
    await safeCreateIndex('notifications', { userId: 1, isRead: 1 });
    await safeCreateIndex('notifications', { createdAt: -1 });
    
    // User activities - for dashboard
    await safeCreateIndex('useractivities', { userId: 1 });
    await safeCreateIndex('useractivities', { userId: 1, createdAt: -1 });
    await safeCreateIndex('useractivities', { isVisible: 1 });
    
    // News - public queries
    await safeCreateIndex('news', { status: 1, publishDate: -1 });
    await safeCreateIndex('news', { category: 1, status: 1 });
    
    // Exams and results
    await safeCreateIndex('examresults', { userId: 1 });
    await safeCreateIndex('examresults', { userId: 1, examType: 1 });
    await safeCreateIndex('examschedules', { userId: 1 });
    await safeCreateIndex('examschedules', { status: 1 });
    
    console.log('🎉 Database indexing completed!');
    
  } catch (error) {
    console.error('❌ Database indexing failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

addIndexes();
