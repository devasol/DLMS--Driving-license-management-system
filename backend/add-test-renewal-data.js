const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple schema definitions (adjust based on your actual schemas)
const userSchema = new mongoose.Schema({
  fullName: String,
  full_name: String,
  email: String,
  user_email: String,
  password: String,
  user_password: String,
  user_name: String,
  contact_no: String,
  phone: String,
  gender: String,
  nic: String,
  role: { type: String, default: 'user' },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const licenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  number: String,
  userName: String,
  userEmail: String,
  class: { type: String, enum: ['A', 'B', 'C', 'D', 'E'], default: 'B' },
  issueDate: { type: Date, default: Date.now },
  expiryDate: Date,
  status: { type: String, enum: ['Valid', 'Expired', 'Suspended', 'Revoked'], default: 'Valid' },
  restrictions: { type: String, default: 'None' },
  points: { type: Number, default: 0 },
  maxPoints: { type: Number, default: 12 },
  theoryExamResult: {
    examId: mongoose.Schema.Types.ObjectId,
    score: Number,
    dateTaken: Date,
  },
  practicalExamResult: {
    examId: mongoose.Schema.Types.ObjectId,
    score: Number,
    dateTaken: Date,
  },
  paymentId: mongoose.Schema.Types.ObjectId,
  issuedBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

// Generate license number before saving
licenseSchema.pre('save', async function(next) {
  if (!this.number) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('License').countDocuments();
    this.number = `ETH-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  if (!this.expiryDate && this.issueDate) {
    this.expiryDate = new Date(this.issueDate.getTime() + (5 * 365 * 24 * 60 * 60 * 1000));
  }
  next();
});

const User = mongoose.model('User', userSchema);
const License = mongoose.model('License', licenseSchema);

const addTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/dlms');
    console.log('✅ Connected to MongoDB');

    // Test users data
    const testUsers = [
      {
        fullName: "John Smith",
        email: "john.smith@test.com",
        password: "password123",
        nic: "123456789V",
        phone: "0711234567",
        gender: "male"
      },
      {
        fullName: "Sarah Johnson", 
        email: "sarah.johnson@test.com",
        password: "password123",
        nic: "987654321V",
        phone: "0712345678",
        gender: "female"
      },
      {
        fullName: "Michael Brown",
        email: "michael.brown@test.com", 
        password: "password123",
        nic: "456789123V",
        phone: "0713456789",
        gender: "male"
      },
      {
        fullName: "Emily Davis",
        email: "emily.davis@test.com",
        password: "password123", 
        nic: "789123456V",
        phone: "0714567890",
        gender: "female"
      }
    ];

    const createdUsers = [];

    // Create users
    for (const userData of testUsers) {
      try {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`👤 User ${userData.fullName} already exists`);
          createdUsers.push(existingUser);
          continue;
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = new User({
          fullName: userData.fullName,
          full_name: userData.fullName,
          email: userData.email,
          user_email: userData.email,
          password: hashedPassword,
          user_password: hashedPassword,
          user_name: userData.fullName.toLowerCase().replace(' ', ''),
          contact_no: userData.phone,
          phone: userData.phone,
          gender: userData.gender,
          nic: userData.nic,
          role: 'user',
          isAdmin: false
        });

        await user.save();
        createdUsers.push(user);
        console.log(`✅ Created user: ${userData.fullName}`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.fullName}:`, error.message);
      }
    }

    // Create licenses with different statuses
    const licenseData = [
      {
        user: createdUsers[0], // John Smith
        status: "Expired",
        issueDate: new Date('2018-06-15'),
        expiryDate: new Date('2023-06-15'), // Expired
        class: "B"
      },
      {
        user: createdUsers[1], // Sarah Johnson  
        status: "Expired",
        issueDate: new Date('2017-09-20'),
        expiryDate: new Date('2022-09-20'), // Expired
        class: "B"
      },
      {
        user: createdUsers[2], // Michael Brown
        status: "Valid", 
        issueDate: new Date('2022-03-10'),
        expiryDate: new Date('2025-02-28'), // Expiring soon
        class: "A"
      },
      {
        user: createdUsers[3], // Emily Davis
        status: "Expired",
        issueDate: new Date('2016-12-05'), 
        expiryDate: new Date('2021-12-05'), // Expired
        class: "B"
      }
    ];

    // Create licenses
    for (const data of licenseData) {
      try {
        if (!data.user) continue;

        const existingLicense = await License.findOne({ userId: data.user._id });
        if (existingLicense) {
          console.log(`🎫 License for ${data.user.fullName} already exists`);
          continue;
        }

        const license = new License({
          userId: data.user._id,
          userName: data.user.fullName,
          userEmail: data.user.email,
          class: data.class,
          issueDate: data.issueDate,
          expiryDate: data.expiryDate,
          status: data.status,
          restrictions: "None",
          points: Math.floor(Math.random() * 5),
          maxPoints: 12,
          theoryExamResult: {
            examId: new mongoose.Types.ObjectId(),
            score: 85 + Math.floor(Math.random() * 15),
            dateTaken: new Date(data.issueDate.getTime() - 30 * 24 * 60 * 60 * 1000)
          },
          practicalExamResult: {
            examId: new mongoose.Types.ObjectId(),
            score: 80 + Math.floor(Math.random() * 20),
            dateTaken: new Date(data.issueDate.getTime() - 15 * 24 * 60 * 60 * 1000)
          },
          paymentId: new mongoose.Types.ObjectId(),
          issuedBy: new mongoose.Types.ObjectId()
        });

        await license.save();
        console.log(`✅ Created ${data.status} license for: ${data.user.fullName} (Expires: ${data.expiryDate.toDateString()})`);
      } catch (error) {
        console.error(`❌ Error creating license:`, error.message);
      }
    }

    console.log('\n🎉 Test data added successfully!');
    console.log('\n📋 Test Users for License Renewal:');
    console.log('1. john.smith@test.com (password: password123) - EXPIRED LICENSE');
    console.log('2. sarah.johnson@test.com (password: password123) - EXPIRED LICENSE'); 
    console.log('3. emily.davis@test.com (password: password123) - EXPIRED LICENSE');
    console.log('4. michael.brown@test.com (password: password123) - VALID LICENSE (expiring soon)');
    console.log('\n💡 You can now test the license renewal system with these users!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

addTestData();
