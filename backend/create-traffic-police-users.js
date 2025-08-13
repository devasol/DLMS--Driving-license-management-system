import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// User schema (simplified version for traffic police creation)
const userSchema = new mongoose.Schema({
  fullName: { type: String },
  full_name: { type: String },
  email: { type: String },
  user_email: { type: String },
  password: { type: String },
  user_password: { type: String },
  user_name: { type: String },
  role: { type: String, enum: ["user", "admin", "examiner", "traffic_police"], default: "user" },
  phone: { type: String },
  contact_no: { type: String },
  address: { type: String },
  gender: { type: String },
  dateOfBirth: { type: Date },
  dob: { type: Date },
  nic: { type: String },
  profilePicture: { type: String },
  isAdmin: { type: Boolean, default: false },
  
  // Traffic Police-specific fields
  trafficPoliceDetails: {
    badgeNumber: { type: String },
    department: { type: String },
    rank: { 
      type: String,
      enum: ["Officer", "Sergeant", "Lieutenant", "Captain", "Inspector"],
      default: "Officer"
    },
    jurisdiction: { type: String },
    isActive: { type: Boolean, default: true },
    hireDate: { type: Date },
    lastViolationRecorded: { type: Date },
    totalViolationsRecorded: { type: Number, default: 0 },
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

const createTrafficPoliceUsers = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if model already exists to avoid overwrite warning
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Traffic police users to create
    const trafficPoliceUsers = [
      {
        fullName: 'Officer John Doe',
        full_name: 'Officer John Doe',
        email: 'officer.john@traffic.gov.et',
        user_email: 'officer.john@traffic.gov.et',
        user_name: 'officer_john',
        password: 'traffic123',
        user_password: 'traffic123',
        role: 'traffic_police',
        phone: '+251911234567',
        contact_no: '+251911234567',
        address: 'Addis Ababa Traffic Police Station',
        gender: 'Male',
        nic: 'TP001234567',
        isEmailVerified: true,
        trafficPoliceDetails: {
          badgeNumber: 'TP-001',
          department: 'Addis Ababa Traffic Police',
          rank: 'Officer',
          jurisdiction: 'Addis Ababa Central',
          isActive: true,
          hireDate: new Date('2020-01-15'),
          totalViolationsRecorded: 0,
        }
      },
      {
        fullName: 'Sergeant Mary Smith',
        full_name: 'Sergeant Mary Smith',
        email: 'sergeant.mary@traffic.gov.et',
        user_email: 'sergeant.mary@traffic.gov.et',
        user_name: 'sergeant_mary',
        password: 'traffic123',
        user_password: 'traffic123',
        role: 'traffic_police',
        phone: '+251922345678',
        contact_no: '+251922345678',
        address: 'Bole Traffic Police Station',
        gender: 'Female',
        nic: 'TP002345678',
        isEmailVerified: true,
        trafficPoliceDetails: {
          badgeNumber: 'TP-002',
          department: 'Bole Traffic Police',
          rank: 'Sergeant',
          jurisdiction: 'Bole Sub-City',
          isActive: true,
          hireDate: new Date('2018-06-20'),
          totalViolationsRecorded: 0,
        }
      },
      {
        fullName: 'Lieutenant Ahmed Hassan',
        full_name: 'Lieutenant Ahmed Hassan',
        email: 'lieutenant.ahmed@traffic.gov.et',
        user_email: 'lieutenant.ahmed@traffic.gov.et',
        user_name: 'lieutenant_ahmed',
        password: 'traffic123',
        user_password: 'traffic123',
        role: 'traffic_police',
        phone: '+251933456789',
        contact_no: '+251933456789',
        address: 'Kirkos Traffic Police Station',
        gender: 'Male',
        nic: 'TP003456789',
        isEmailVerified: true,
        trafficPoliceDetails: {
          badgeNumber: 'TP-003',
          department: 'Kirkos Traffic Police',
          rank: 'Lieutenant',
          jurisdiction: 'Kirkos Sub-City',
          isActive: true,
          hireDate: new Date('2016-03-10'),
          totalViolationsRecorded: 0,
        }
      }
    ];

    console.log('🔐 Creating traffic police users...');

    for (const userData of trafficPoliceUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { user_email: userData.user_email }
        ]
      });

      if (existingUser) {
        console.log(`⚠️ User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
      userData.user_password = hashedPassword;

      // Create user
      const newUser = new User(userData);
      await newUser.save();

      console.log(`✅ Created traffic police user: ${userData.fullName} (${userData.email})`);
      console.log(`   Badge: ${userData.trafficPoliceDetails.badgeNumber}`);
      console.log(`   Rank: ${userData.trafficPoliceDetails.rank}`);
      console.log(`   Department: ${userData.trafficPoliceDetails.department}`);
      console.log(`   Jurisdiction: ${userData.trafficPoliceDetails.jurisdiction}`);
      console.log('');
    }

    console.log('🎉 Traffic police users created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('===================');
    trafficPoliceUsers.forEach(user => {
      console.log(`👮 ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: traffic123`);
      console.log(`   Badge: ${user.trafficPoliceDetails.badgeNumber}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error creating traffic police users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createTrafficPoliceUsers();
