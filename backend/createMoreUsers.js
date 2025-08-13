import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// User schema (simplified version)
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

const createMoreUsers = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create additional test users
    const testUsers = [
      {
        fullName: 'John Doe',
        full_name: 'John Doe',
        email: 'john@example.com',
        user_email: 'john@example.com',
        password: 'password123',
        user_password: 'password123',
        user_name: 'johndoe',
        role: 'user',
        isAdmin: false,
        contact_no: '1234567890',
        gender: 'male',
        nic: '123456789V'
      },
      {
        fullName: 'Jane Smith',
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        user_email: 'jane@example.com',
        password: 'password123',
        user_password: 'password123',
        user_name: 'janesmith',
        role: 'user',
        isAdmin: false,
        contact_no: '0987654321',
        gender: 'female',
        nic: '987654321V'
      },
      {
        fullName: 'Mike Johnson',
        full_name: 'Mike Johnson',
        email: 'mike@example.com',
        user_email: 'mike@example.com',
        password: 'password123',
        user_password: 'password123',
        user_name: 'mikejohnson',
        role: 'user',
        isAdmin: false,
        contact_no: '5555555555',
        gender: 'male',
        nic: '555555555V'
      }
    ];

    console.log('🧹 Cleaning up existing test users...');
    // Remove existing test users (except the main ones)
    await User.deleteMany({
      email: { $in: ['john@example.com', 'jane@example.com', 'mike@example.com'] }
    });

    console.log('👥 Creating new test users...');
    for (const userData of testUsers) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with hashed password
      const newUser = new User({
        ...userData,
        password: hashedPassword,
        user_password: hashedPassword
      });

      await newUser.save();
      console.log(`✅ Created user: ${userData.fullName} (${userData.email})`);
    }

    console.log('\n📊 All users in database:');
    const allUsers = await User.find({}, 'fullName email role isAdmin').sort({ email: 1 });
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} - ${user.email} (${user.role}${user.isAdmin ? ' - Admin' : ''})`);
    });

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📝 Available test credentials:');
    console.log('👤 Users:');
    console.log('  - testuser@example.com / password123');
    console.log('  - john@example.com / password123');
    console.log('  - jane@example.com / password123');
    console.log('  - mike@example.com / password123');
    console.log('👑 Admin:');
    console.log('  - admin@example.com / admin123');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createMoreUsers();
