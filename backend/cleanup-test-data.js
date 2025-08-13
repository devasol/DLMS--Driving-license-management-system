import mongoose from 'mongoose';
import License from './models/License.js';

async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up test data...\n');
    
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Delete test licenses
    const result = await License.deleteMany({ 
      userName: { $in: ['Test User', 'Test User 2'] } 
    });
    console.log(`🗑️ Deleted ${result.deletedCount} test licenses`);

    await mongoose.disconnect();
    console.log('\n✅ Cleanup completed!');

  } catch (error) {
    console.error('❌ Error cleaning up:', error.message);
  }
}

cleanupTestData();
