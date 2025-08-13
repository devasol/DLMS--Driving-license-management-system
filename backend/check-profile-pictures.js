import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String },
  full_name: { type: String },
  email: { type: String },
  user_email: { type: String },
  password: { type: String },
  user_password: { type: String },
  user_name: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: { type: String },
  contact_no: { type: String },
  address: { type: String },
  gender: { type: String },
  dateOfBirth: { type: Date },
  dob: { type: Date },
  nic: { type: String },
  profilePicture: { type: String },
  isAdmin: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

async function checkProfilePictures() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    console.log('\n📋 Checking users with profile pictures...');
    
    // Find all users
    const allUsers = await User.find({}).select('fullName full_name email user_email profilePicture');
    console.log(`\n👥 Total users found: ${allUsers.length}`);

    // Find users with profile pictures
    const usersWithPictures = allUsers.filter(user => user.profilePicture);
    console.log(`🖼️ Users with profile pictures: ${usersWithPictures.length}`);

    if (usersWithPictures.length > 0) {
      console.log('\n📸 Users with profile pictures:');
      usersWithPictures.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName || user.full_name || 'Unknown'}`);
        console.log(`   📧 Email: ${user.email || user.user_email || 'No email'}`);
        console.log(`   🖼️ Profile Picture: ${user.profilePicture}`);
        console.log(`   🔗 Full URL: http://localhost:5004/uploads/profile-pictures/${user.profilePicture}`);
        console.log(`   🆔 User ID: ${user._id}`);
        console.log('');
      });

      // Show the first user with a profile picture for testing
      const testUser = usersWithPictures[0];
      console.log('🎯 TEST USER FOR AVATAR:');
      console.log(`   Name: ${testUser.fullName || testUser.full_name}`);
      console.log(`   Email: ${testUser.email || testUser.user_email}`);
      console.log(`   User ID: ${testUser._id}`);
      console.log(`   Profile Picture: ${testUser.profilePicture}`);
      console.log(`   Image URL: http://localhost:5004/uploads/profile-pictures/${testUser.profilePicture}`);
      console.log('\n💡 Use this user to test the avatar display!');
    } else {
      console.log('\n❌ No users found with profile pictures');
      console.log('💡 Upload a profile picture through the dashboard to test the avatar');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkProfilePictures();
