# Troubleshooting License Status Issue

## 🚨 Problem
Users with licenses are showing "No License" status in the dashboard instead of their actual license information.

## 🔍 Debugging Steps

### Step 1: Run the Debug Script
```bash
cd backend
node debug-license-issue.js
```

This will show you:
- Total users and licenses in database
- Test users and their license associations
- Any data inconsistencies
- API endpoint simulation

### Step 2: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Login to user dashboard
4. Look for these log messages:
   - `🔍 Fetching license data for user: [userId]`
   - `🔍 Debug data for user: [data]`
   - `✅ License data received:` or `❌ No license found`

### Step 3: Test API Endpoint Directly
Replace `[USER_ID]` with actual user ID from database:

```bash
# Test the debug endpoint
curl "http://localhost:5004/api/license/debug/user/[USER_ID]"

# Test the license status endpoint
curl "http://localhost:5004/api/license/status?userId=[USER_ID]"
```

### Step 4: Check Database Data
Open MongoDB Compass or shell and run:

```javascript
// Check users
db.users.find({email: {$regex: "@test.com"}})

// Check licenses
db.licenses.find({})

// Check user-license associations
db.licenses.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId", 
      foreignField: "_id",
      as: "user"
    }
  }
])
```

## 🔧 Common Issues and Solutions

### Issue 1: User ID Mismatch
**Symptoms:** Debug shows user exists but no license found
**Cause:** License `userId` field doesn't match user `_id`
**Solution:**
```javascript
// Fix userId references in licenses
db.licenses.updateMany(
  {},
  [
    {
      $set: {
        userId: { $toObjectId: "$userId" }
      }
    }
  ]
)
```

### Issue 2: Invalid ObjectId Format
**Symptoms:** "Invalid user ID format" error
**Cause:** User ID is not a valid MongoDB ObjectId
**Solution:** Check localStorage for correct user ID format

### Issue 3: Missing Test Data
**Symptoms:** No licenses found in database
**Solution:** Re-run the test data setup from `test-data-manual.md`

### Issue 4: Wrong Collection Names
**Symptoms:** Queries return empty results
**Cause:** Collection names don't match model names
**Solution:** Check actual collection names in MongoDB:
```javascript
db.runCommand("listCollections")
```

### Issue 5: User ID Not in localStorage
**Symptoms:** "No user ID found in localStorage" 
**Solution:** 
1. Check if user is properly logged in
2. Verify login process stores userId in localStorage
3. Check browser Application tab > Local Storage

## 🛠️ Quick Fixes

### Fix 1: Ensure Test Data is Correct
```bash
cd backend
node add-test-renewal-data.js
```

### Fix 2: Verify User Login
Check that login stores userId correctly:
```javascript
// In browser console after login
console.log('User ID:', localStorage.getItem('userId'));
```

### Fix 3: Manual License Creation
If test data is missing, create manually:
```javascript
// In MongoDB shell
use dlms

// Get user ID
var user = db.users.findOne({email: "john.smith@test.com"});
console.log("User ID:", user._id);

// Create license
db.licenses.insertOne({
  userId: user._id,
  number: "ETH-2018-000001",
  userName: "John Smith", 
  userEmail: "john.smith@test.com",
  class: "B",
  issueDate: new Date("2018-06-15"),
  expiryDate: new Date("2023-06-15"),
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
});
```

## 📋 Verification Checklist

- [ ] Backend server is running on port 5004
- [ ] MongoDB is running and accessible
- [ ] Test users exist in database
- [ ] Test licenses exist in database
- [ ] User IDs match between users and licenses collections
- [ ] User is properly logged in with valid userId in localStorage
- [ ] API endpoints are accessible
- [ ] No CORS or network errors in browser console

## 🔍 Expected Behavior

When working correctly, you should see:

1. **Browser Console:**
   ```
   🔍 Fetching license data for user: 507f1f77bcf86cd799439011
   🔍 Debug data for user: {userExists: true, licenseExists: true, ...}
   ✅ License data received: {success: true, hasLicense: true, number: "ETH-2018-000001", ...}
   ```

2. **Dashboard Display:**
   - License status shows actual status (Valid/Expired)
   - License number shows real number (ETH-YYYY-XXXXXX)
   - Issue and expiry dates show real dates
   - Appropriate alerts for expired licenses

3. **API Response:**
   ```json
   {
     "success": true,
     "hasLicense": true,
     "number": "ETH-2018-000001",
     "status": "Expired",
     "userName": "John Smith",
     "userEmail": "john.smith@test.com"
   }
   ```

## 🆘 If Still Not Working

1. **Check server logs** for any errors
2. **Verify database connection** 
3. **Test with a fresh user** and license
4. **Clear browser cache** and localStorage
5. **Restart backend server**
6. **Check MongoDB service** is running

Run the debug script and share the output to identify the specific issue!
