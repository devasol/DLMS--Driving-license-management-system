import mongoose from 'mongoose';
import User from './models/User.js';
import License from './models/License.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugPhotoPath() {
  try {
    console.log('🔍 Debugging Photo Path...\n');
    
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Find demo user
    const demoUser = await User.findOne({ email: 'demouser@example.com' });
    if (!demoUser) {
      console.log('❌ Demo user not found');
      return;
    }

    console.log('👤 Demo user found:', demoUser.fullName);
    console.log('🖼️ Profile picture field:', demoUser.profilePicture);

    // Check if profile picture file exists
    if (demoUser.profilePicture) {
      const photoPath = path.join(__dirname, 'uploads', 'profile-pictures', demoUser.profilePicture);
      console.log('📁 Expected photo path:', photoPath);
      console.log('📁 File exists:', fs.existsSync(photoPath));
      
      if (fs.existsSync(photoPath)) {
        const stats = fs.statSync(photoPath);
        console.log('📊 File size:', stats.size, 'bytes');
        console.log('📅 File modified:', stats.mtime);
        
        // Try to read the file
        try {
          const photoData = fs.readFileSync(photoPath);
          console.log('✅ File read successfully, size:', photoData.length, 'bytes');
          
          // Check file extension
          const photoExt = path.extname(demoUser.profilePicture).toLowerCase();
          console.log('🔧 File extension:', photoExt);
          
          let mimeType = 'image/jpeg';
          if (photoExt === '.png') mimeType = 'image/png';
          if (photoExt === '.gif') mimeType = 'image/gif';
          if (photoExt === '.svg') mimeType = 'image/svg+xml';
          
          console.log('🔧 MIME type:', mimeType);
          
          const dataURL = `data:${mimeType};base64,${photoData.toString('base64')}`;
          console.log('📄 Data URL length:', dataURL.length);
          console.log('📄 Data URL preview:', dataURL.substring(0, 100) + '...');
          
        } catch (readError) {
          console.error('❌ Error reading file:', readError.message);
        }
      } else {
        console.log('❌ Photo file does not exist');
        
        // Check if uploads directory exists
        const uploadsDir = path.join(__dirname, 'uploads');
        const profilePicturesDir = path.join(__dirname, 'uploads', 'profile-pictures');
        
        console.log('📁 Uploads directory exists:', fs.existsSync(uploadsDir));
        console.log('📁 Profile pictures directory exists:', fs.existsSync(profilePicturesDir));
        
        if (fs.existsSync(profilePicturesDir)) {
          const files = fs.readdirSync(profilePicturesDir);
          console.log('📁 Files in profile pictures directory:', files);
        }
      }
    } else {
      console.log('❌ No profile picture set for demo user');
    }

    // Check license
    const license = await License.findOne({ userId: demoUser._id });
    if (license) {
      console.log('\n🎫 License found:', license.number);
      console.log('👤 License user name:', license.userName);
    } else {
      console.log('\n❌ No license found for demo user');
    }

    await mongoose.disconnect();
    console.log('\n🎉 Photo path debug completed!');

  } catch (error) {
    console.error('❌ Error debugging photo path:', error.message);
  }
}

debugPhotoPath();
