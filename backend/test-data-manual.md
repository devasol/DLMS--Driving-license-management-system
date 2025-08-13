# Manual Test Data Setup for License Renewal

## Step 1: Add Test Users to MongoDB

Open MongoDB Compass or MongoDB shell and run these commands in your `dlms` database:

### Add Test Users (with hashed passwords)

```javascript
// Switch to dlms database
use dlms

// Add test users with expired licenses
db.users.insertMany([
  {
    fullName: "John Smith",
    full_name: "John Smith", 
    email: "john.smith@test.com",
    user_email: "john.smith@test.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password123
    user_password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    user_name: "johnsmith",
    contact_no: "0711234567",
    phone: "0711234567", 
    gender: "male",
    nic: "123456789V",
    role: "user",
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: "Sarah Johnson",
    full_name: "Sarah Johnson",
    email: "sarah.johnson@test.com", 
    user_email: "sarah.johnson@test.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password123
    user_password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    user_name: "sarahjohnson",
    contact_no: "0712345678",
    phone: "0712345678",
    gender: "female", 
    nic: "987654321V",
    role: "user",
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: "Emily Davis",
    full_name: "Emily Davis",
    email: "emily.davis@test.com",
    user_email: "emily.davis@test.com", 
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password123
    user_password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    user_name: "emilydavis",
    contact_no: "0714567890",
    phone: "0714567890",
    gender: "female",
    nic: "789123456V", 
    role: "user",
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: "Michael Brown",
    full_name: "Michael Brown",
    email: "michael.brown@test.com",
    user_email: "michael.brown@test.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password123
    user_password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    user_name: "michaelbrown",
    contact_no: "0713456789", 
    phone: "0713456789",
    gender: "male",
    nic: "456789123V",
    role: "user",
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

## Step 2: Get User IDs and Add Licenses

After adding users, get their IDs:

```javascript
// Get user IDs
var johnId = db.users.findOne({email: "john.smith@test.com"})._id;
var sarahId = db.users.findOne({email: "sarah.johnson@test.com"})._id;
var emilyId = db.users.findOne({email: "emily.davis@test.com"})._id;
var michaelId = db.users.findOne({email: "michael.brown@test.com"})._id;

// Add licenses with different statuses
db.licenses.insertMany([
  {
    userId: johnId,
    number: "ETH-2018-000001",
    userName: "John Smith",
    userEmail: "john.smith@test.com",
    class: "B",
    issueDate: new Date("2018-06-15"),
    expiryDate: new Date("2023-06-15"), // EXPIRED
    status: "Expired",
    restrictions: "None",
    points: 2,
    maxPoints: 12,
    theoryExamResult: {
      examId: ObjectId(),
      score: 88,
      dateTaken: new Date("2018-05-15")
    },
    practicalExamResult: {
      examId: ObjectId(), 
      score: 92,
      dateTaken: new Date("2018-06-01")
    },
    paymentId: ObjectId(),
    issuedBy: ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: sarahId,
    number: "ETH-2017-000002", 
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@test.com",
    class: "B",
    issueDate: new Date("2017-09-20"),
    expiryDate: new Date("2022-09-20"), // EXPIRED
    status: "Expired",
    restrictions: "None",
    points: 0,
    maxPoints: 12,
    theoryExamResult: {
      examId: ObjectId(),
      score: 95,
      dateTaken: new Date("2017-08-20")
    },
    practicalExamResult: {
      examId: ObjectId(),
      score: 89,
      dateTaken: new Date("2017-09-05")
    },
    paymentId: ObjectId(),
    issuedBy: ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: emilyId,
    number: "ETH-2016-000003",
    userName: "Emily Davis", 
    userEmail: "emily.davis@test.com",
    class: "B",
    issueDate: new Date("2016-12-05"),
    expiryDate: new Date("2021-12-05"), // EXPIRED
    status: "Expired",
    restrictions: "None",
    points: 1,
    maxPoints: 12,
    theoryExamResult: {
      examId: ObjectId(),
      score: 87,
      dateTaken: new Date("2016-11-05")
    },
    practicalExamResult: {
      examId: ObjectId(),
      score: 85,
      dateTaken: new Date("2016-11-20")
    },
    paymentId: ObjectId(),
    issuedBy: ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: michaelId,
    number: "ETH-2022-000004",
    userName: "Michael Brown",
    userEmail: "michael.brown@test.com", 
    class: "A",
    issueDate: new Date("2022-03-10"),
    expiryDate: new Date("2025-02-28"), // EXPIRING SOON
    status: "Valid",
    restrictions: "None",
    points: 3,
    maxPoints: 12,
    theoryExamResult: {
      examId: ObjectId(),
      score: 91,
      dateTaken: new Date("2022-02-10")
    },
    practicalExamResult: {
      examId: ObjectId(),
      score: 94,
      dateTaken: new Date("2022-02-25")
    },
    paymentId: ObjectId(),
    issuedBy: ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

## Step 3: Test Login Credentials

After adding the data, you can test with these credentials:

### Users with EXPIRED licenses (perfect for renewal testing):
- **Email:** john.smith@test.com | **Password:** password123
- **Email:** sarah.johnson@test.com | **Password:** password123  
- **Email:** emily.davis@test.com | **Password:** password123

### User with VALID license (expiring soon):
- **Email:** michael.brown@test.com | **Password:** password123

## Step 4: Testing the Renewal System

1. **Login as a user with expired license** (e.g., john.smith@test.com)
2. **Go to License Renewal** section in user dashboard
3. **Fill out the renewal form** with:
   - Name: John Smith
   - Email: john.smith@test.com
   - Password: password123
   - National ID: 123456789V
   - Upload a sample license document (any image or PDF)
   - Select renewal reason: "License Already Expired"
4. **Submit the application**
5. **Login as admin** to review the renewal application
6. **Approve and issue new license**

## Step 5: Verify Data

Check if data was added successfully:

```javascript
// Check users
db.users.find({email: {$regex: "@test.com"}}).count()

// Check licenses  
db.licenses.find({status: "Expired"}).count()

// View all test licenses
db.licenses.find({userName: {$in: ["John Smith", "Sarah Johnson", "Emily Davis", "Michael Brown"]}})
```

## Notes:
- All test users have the password: **password123**
- The password hash provided is for "password123" 
- Users with expired licenses are perfect for testing the renewal system
- Make sure your MongoDB is running before executing these commands
- You can use MongoDB Compass GUI or MongoDB shell to run these commands
