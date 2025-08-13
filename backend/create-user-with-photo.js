import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createUserWithPhoto() {
  try {
    console.log('👤 Creating user with profile photo...\n');
    
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Create a simple SVG profile picture
    const svgContent = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2196F3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#grad1)" />
  <circle cx="100" cy="80" r="30" fill="white" />
  <path d="M 70 140 Q 100 120 130 140 L 130 200 L 70 200 Z" fill="white" />
  <text x="100" y="190" text-anchor="middle" font-size="12" fill="white">DEMO USER</text>
</svg>`;

    // Ensure profile pictures directory exists
    const profilePicturesDir = path.join(__dirname, 'uploads', 'profile-pictures');
    if (!fs.existsSync(profilePicturesDir)) {
      fs.mkdirSync(profilePicturesDir, { recursive: true });
      console.log('📁 Created profile pictures directory');
    }

    // Save the SVG as a file
    const photoFilename = `demo-user-${Date.now()}.svg`;
    const photoPath = path.join(profilePicturesDir, photoFilename);
    fs.writeFileSync(photoPath, svgContent);
    console.log('🖼️ Created demo profile picture:', photoFilename);

    // Create user with photo
    const hashedPassword = await bcrypt.hash('demouser123', 10);
    
    const demoUser = new User({
      fullName: 'Demo User',
      full_name: 'Demo User',
      email: 'demouser@example.com',
      user_email: 'demouser@example.com',
      user_name: 'demouser_' + Date.now(),
      password: hashedPassword,
      user_password: hashedPassword,
      nic: 'DEMO_USER_' + Date.now(),
      contact_no: '0933333333',
      phone: '0933333333',
      gender: 'male',
      dateOfBirth: new Date('1995-06-15'),
      dob: new Date('1995-06-15'),
      address: 'Bole, Addis Ababa, Ethiopia',
      profilePicture: photoFilename,
      role: 'user',
      isAdmin: false
    });

    await demoUser.save();
    console.log('✅ Demo user created successfully!');
    
    console.log('\n📋 Demo User Details:');
    console.log(`👤 Name: ${demoUser.fullName}`);
    console.log(`📧 Email: ${demoUser.email}`);
    console.log(`🔑 Password: demouser123`);
    console.log(`🆔 User ID: ${demoUser._id}`);
    console.log(`🖼️ Profile Picture: ${demoUser.profilePicture}`);
    console.log(`📅 Date of Birth: ${demoUser.dateOfBirth.toLocaleDateString()}`);
    console.log(`📍 Address: ${demoUser.address}`);

    console.log('\n🔧 Next steps:');
    console.log('1. Use this user to test the license system');
    console.log('2. Create exam results and payment for this user');
    console.log('3. Issue a license to see the photo and QR code in action');

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
  }
}

createUserWithPhoto();
