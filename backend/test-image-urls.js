import axios from 'axios';
import fs from 'fs';
import path from 'path';

const testImageUrls = async () => {
  console.log('🔍 Testing profile picture URLs...');
  
  // Test images from the uploads directory
  const profilePicturesDir = './uploads/profile-pictures';
  const files = fs.readdirSync(profilePicturesDir);
  
  console.log(`📁 Found ${files.length} files in profile-pictures directory`);
  
  // Test the first few image URLs
  const testFiles = files.slice(0, 3);
  
  for (const file of testFiles) {
    const imageUrl = `http://localhost:5004/uploads/profile-pictures/${file}`;
    console.log(`\n🔗 Testing: ${imageUrl}`);
    
    try {
      const response = await axios.get(imageUrl, {
        timeout: 5000,
        responseType: 'arraybuffer'
      });
      
      if (response.status === 200) {
        console.log(`✅ SUCCESS: Image accessible (${response.data.length} bytes)`);
        console.log(`   Content-Type: ${response.headers['content-type']}`);
      } else {
        console.log(`❌ FAILED: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log('   💡 Backend server might not be running on port 5004');
      }
    }
  }
  
  // Test the specific user's profile picture
  const testUserPicture = 'profile-1752072037597-842023827.jpg'; // dagmawi's picture
  const testUrl = `http://localhost:5004/uploads/profile-pictures/${testUserPicture}`;
  
  console.log(`\n🎯 Testing specific user's profile picture:`);
  console.log(`🔗 URL: ${testUrl}`);
  
  try {
    const response = await axios.get(testUrl, {
      timeout: 5000,
      responseType: 'arraybuffer'
    });
    
    if (response.status === 200) {
      console.log(`✅ SUCCESS: User's profile picture is accessible!`);
      console.log(`   Size: ${response.data.length} bytes`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      console.log(`\n💡 This image should display in the avatar!`);
    }
  } catch (error) {
    console.log(`❌ ERROR accessing user's profile picture: ${error.message}`);
  }
};

testImageUrls();
