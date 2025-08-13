import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// User schema (matching the actual User model)
const userSchema = new mongoose.Schema({
  fullName: { type: String },
  full_name: { type: String },
  email: { type: String },
  user_email: { type: String },
  password: { type: String },
  user_password: { type: String },
  user_name: { type: String },
  role: { type: String, enum: ["user", "admin", "examiner"], default: "user" },
  phone: { type: String },
  contact_no: { type: String },
  address: { type: String },
  gender: { type: String },
  dateOfBirth: { type: Date },
  dob: { type: Date },
  nic: { type: String },
  profilePicture: { type: String },
  isAdmin: { type: Boolean, default: false },
  
  // Examiner-specific fields
  examinerDetails: {
    employeeId: { type: String },
    certification: { type: String },
    specialization: { 
      type: [String], 
      enum: ["practical", "theory", "vision", "motorcycle", "heavy_vehicle"],
      default: []
    },
    licenseToExamine: {
      type: [String],
      enum: ["A", "B", "C", "D", "E"],
      default: []
    },
    isActive: { type: Boolean, default: true },
    hireDate: { type: Date },
    lastExamDate: { type: Date }
  },

  // Email verification fields
  isEmailVerified: { type: Boolean, default: false },
  emailOTP: { type: String },
  otpExpires: { type: Date },

  // Password reset fields
  passwordResetOTP: { type: String },
  passwordResetExpires: { type: Date },
}, {
  timestamps: true,
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') && !this.isModified('user_password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    
    if (this.password) {
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    if (this.user_password) {
      this.user_password = await bcrypt.hash(this.user_password, salt);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Sample examiner data
const examinerData = [
  {
    fullName: "Dr. Sarah Johnson",
    full_name: "Dr. Sarah Johnson",
    email: "sarah.examiner@dlms.gov.et",
    user_email: "sarah.examiner@dlms.gov.et",
    password: "examiner123",
    user_password: "examiner123",
    user_name: "sarah_examiner",
    role: "examiner",
    phone: "+251911234567",
    contact_no: "+251911234567",
    address: "Addis Ababa, Ethiopia",
    gender: "Female",
    dateOfBirth: new Date("1985-03-15"),
    dob: new Date("1985-03-15"),
    nic: "EX001234567",
    isEmailVerified: true,
    examinerDetails: {
      employeeId: "EX001",
      certification: "Advanced Driving Instructor Certification",
      specialization: ["practical", "theory"],
      licenseToExamine: ["A", "B", "C"],
      isActive: true,
      hireDate: new Date("2020-01-15"),
    }
  },
  {
    fullName: "Mr. Ahmed Hassan",
    full_name: "Mr. Ahmed Hassan",
    email: "ahmed.examiner@dlms.gov.et",
    user_email: "ahmed.examiner@dlms.gov.et",
    password: "examiner123",
    user_password: "examiner123",
    user_name: "ahmed_examiner",
    role: "examiner",
    phone: "+251922345678",
    contact_no: "+251922345678",
    address: "Dire Dawa, Ethiopia",
    gender: "Male",
    dateOfBirth: new Date("1982-07-22"),
    dob: new Date("1982-07-22"),
    nic: "EX002345678",
    isEmailVerified: true,
    examinerDetails: {
      employeeId: "EX002",
      certification: "Professional Driving Test Examiner",
      specialization: ["practical", "heavy_vehicle"],
      licenseToExamine: ["B", "C", "D", "E"],
      isActive: true,
      hireDate: new Date("2019-06-10"),
    }
  },
  {
    fullName: "Ms. Meron Tadesse",
    full_name: "Ms. Meron Tadesse",
    email: "meron.examiner@dlms.gov.et",
    user_email: "meron.examiner@dlms.gov.et",
    password: "examiner123",
    user_password: "examiner123",
    user_name: "meron_examiner",
    role: "examiner",
    phone: "+251933456789",
    contact_no: "+251933456789",
    address: "Bahir Dar, Ethiopia",
    gender: "Female",
    dateOfBirth: new Date("1988-11-08"),
    dob: new Date("1988-11-08"),
    nic: "EX003456789",
    isEmailVerified: true,
    examinerDetails: {
      employeeId: "EX003",
      certification: "Motorcycle and Light Vehicle Examiner",
      specialization: ["practical", "motorcycle"],
      licenseToExamine: ["A", "B"],
      isActive: true,
      hireDate: new Date("2021-03-20"),
    }
  },
  {
    fullName: "Mr. Dawit Bekele",
    full_name: "Mr. Dawit Bekele",
    email: "dawit.examiner@dlms.gov.et",
    user_email: "dawit.examiner@dlms.gov.et",
    password: "examiner123",
    user_password: "examiner123",
    user_name: "dawit_examiner",
    role: "examiner",
    phone: "+251944567890",
    contact_no: "+251944567890",
    address: "Hawassa, Ethiopia",
    gender: "Male",
    dateOfBirth: new Date("1980-05-12"),
    dob: new Date("1980-05-12"),
    nic: "EX004567890",
    isEmailVerified: true,
    examinerDetails: {
      employeeId: "EX004",
      certification: "Senior Driving Test Examiner",
      specialization: ["practical", "theory", "vision"],
      licenseToExamine: ["A", "B", "C", "D"],
      isActive: true,
      hireDate: new Date("2018-09-05"),
    }
  }
];

async function createExaminerData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Check if examiners already exist
    const existingExaminers = await User.find({ role: "examiner" });
    if (existingExaminers.length > 0) {
      console.log(`⚠️ Found ${existingExaminers.length} existing examiners. Skipping creation.`);
      console.log('Existing examiners:');
      existingExaminers.forEach(examiner => {
        console.log(`- ${examiner.fullName || examiner.full_name} (${examiner.email || examiner.user_email})`);
      });
      return;
    }

    // Create examiner accounts
    console.log('🔄 Creating examiner accounts...');
    
    for (const examinerInfo of examinerData) {
      try {
        const examiner = new User(examinerInfo);
        await examiner.save();
        console.log(`✅ Created examiner: ${examinerInfo.fullName} (${examinerInfo.email})`);
      } catch (error) {
        console.error(`❌ Error creating examiner ${examinerInfo.fullName}:`, error.message);
      }
    }

    console.log('\n🎉 Examiner data creation completed!');
    console.log('\n📋 Login credentials for testing:');
    examinerData.forEach(examiner => {
      console.log(`👤 ${examiner.fullName}`);
      console.log(`   Email: ${examiner.email}`);
      console.log(`   Password: examiner123`);
      console.log(`   Employee ID: ${examiner.examinerDetails.employeeId}`);
      console.log(`   Specialization: ${examiner.examinerDetails.specialization.join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error creating examiner data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createExaminerData();
