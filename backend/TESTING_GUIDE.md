# License Renewal System Testing Guide

## 🚀 Quick Setup

### Step 1: Add Test Data to Database

1. **Open MongoDB Compass** or MongoDB shell
2. **Connect to your database** (usually `mongodb://localhost:27017/dlms`)
3. **Follow the instructions** in `test-data-manual.md` to add test users and expired licenses

### Step 2: Generate Sample License Documents

1. **Open** `sample-license-generator.html` in your web browser
2. **Download sample license images** by clicking the download buttons
3. **Save them** to your computer for testing file uploads

## 🧪 Testing Scenarios

### Scenario 1: User with Expired License Renewal

**Test User:** John Smith
- **Email:** john.smith@test.com
- **Password:** password123
- **License Status:** Expired (expired on 15/06/2023)

**Steps:**
1. Login to the user dashboard with John's credentials
2. Navigate to "License Renewal" section
3. Fill out the renewal form:
   - Name: John Smith
   - Email: john.smith@test.com
   - Password: password123
   - National ID: 123456789V
   - Upload: john_smith_expired_license.png (from sample generator)
   - Reason: "License Already Expired"
4. Submit the application
5. Verify success message appears

### Scenario 2: Admin Review and Approval

**Admin Login:** Use your existing admin credentials

**Steps:**
1. Login to admin dashboard
2. Navigate to "License Renewals" section
3. View the pending renewal application from John Smith
4. Click "View Document" to see the uploaded license
5. Click "Review" and approve the application
6. Click "Issue License" to generate new license
7. Verify new license is created with updated expiry date

### Scenario 3: Multiple Renewal Applications

**Test Users:**
- **Sarah Johnson:** sarah.johnson@test.com / password123 (Expired License)
- **Emily Davis:** emily.davis@test.com / password123 (Expired License)

**Steps:**
1. Submit renewal applications for both users
2. Test admin dashboard with multiple pending renewals
3. Test filtering by status (Pending, Approved, Rejected)
4. Test bulk processing capabilities

### Scenario 4: File Upload Validation

**Test Cases:**
1. **Valid Files:** Upload PNG, JPEG, GIF, PDF files
2. **Invalid Files:** Try uploading TXT, DOC, or other unsupported formats
3. **Large Files:** Try uploading files larger than 10MB
4. **No File:** Try submitting without uploading a document

**Expected Results:**
- Valid files should upload successfully with preview
- Invalid files should show error message
- Large files should be rejected
- No file should prevent form submission

### Scenario 5: User with Valid License (Expiring Soon)

**Test User:** Michael Brown
- **Email:** michael.brown@test.com
- **Password:** password123
- **License Status:** Valid (expires 28/02/2025)

**Steps:**
1. Login with Michael's credentials
2. Test renewal for a license that's still valid but expiring soon
3. Select reason: "License Expiring Soon"
4. Verify the system accepts renewal for valid licenses

## 🔍 What to Test

### Frontend Testing
- [ ] File upload functionality works
- [ ] File preview displays correctly for images
- [ ] Form validation works (required fields, file types)
- [ ] Success/error messages display properly
- [ ] Responsive design on different screen sizes

### Backend Testing
- [ ] File upload endpoint accepts valid files
- [ ] File validation rejects invalid files
- [ ] Database stores renewal applications correctly
- [ ] Admin can retrieve and view applications
- [ ] Document serving endpoint works
- [ ] License issuance updates database correctly

### Admin Dashboard Testing
- [ ] Renewal applications display in table
- [ ] Document viewing opens in new tab
- [ ] Status filtering works (All, Pending, Approved, Rejected)
- [ ] Approval/rejection workflow functions
- [ ] License issuance generates new license number
- [ ] New license has updated expiry date (5 years from issue)

### Security Testing
- [ ] Only authenticated users can submit renewals
- [ ] Only admins can access renewal management
- [ ] File uploads are validated server-side
- [ ] Uploaded files are stored securely
- [ ] User passwords are verified correctly

## 📊 Expected Database Changes

After testing, you should see:

### Users Collection
```javascript
// 4 new test users with hashed passwords
db.users.find({email: {$regex: "@test.com"}}).count() // Should return 4
```

### Licenses Collection
```javascript
// 4 new licenses (3 expired, 1 valid)
db.licenses.find({status: "Expired"}).count() // Should return 3
db.licenses.find({status: "Valid"}).count() // Should return 1+
```

### License Renewals Collection
```javascript
// New renewal applications
db.licenserenewal.find({}).count() // Should show submitted applications
```

### Uploads Directory
```
backend/uploads/documents/
├── [timestamp]-[random]-john_license.png
├── [timestamp]-[random]-sarah_license.jpg
└── [timestamp]-[random]-emily_license.pdf
```

## 🐛 Common Issues and Solutions

### Issue: "User not found with this email"
**Solution:** Make sure test users are added to database correctly

### Issue: "No existing license found for this user"
**Solution:** Verify licenses are created with correct userId references

### Issue: "Please upload your current license document"
**Solution:** Ensure file is selected before submitting form

### Issue: File upload fails
**Solution:** Check uploads/documents directory exists and has write permissions

### Issue: Document viewing returns 404
**Solution:** Verify file was saved correctly and path is accessible

## 📝 Test Checklist

- [ ] Database test data added successfully
- [ ] Sample license documents generated
- [ ] User can login with test credentials
- [ ] License renewal form loads correctly
- [ ] File upload works with valid files
- [ ] File validation rejects invalid files
- [ ] Renewal application submits successfully
- [ ] Admin can view pending renewals
- [ ] Admin can view uploaded documents
- [ ] Admin can approve/reject renewals
- [ ] Admin can issue new licenses
- [ ] New license has correct expiry date
- [ ] System handles multiple renewal applications
- [ ] Error handling works for edge cases

## 🎯 Success Criteria

The license renewal system is working correctly if:

1. ✅ Users with expired licenses can submit renewal applications
2. ✅ File upload accepts images and PDFs only
3. ✅ Admins can view and manage renewal applications
4. ✅ Admins can view uploaded license documents
5. ✅ Approved renewals generate new licenses with updated expiry dates
6. ✅ The system maintains data integrity throughout the process
7. ✅ All validation and error handling works as expected

## 📞 Support

If you encounter any issues during testing:
1. Check the browser console for JavaScript errors
2. Check the backend server logs for API errors
3. Verify MongoDB connection and data
4. Ensure all required directories exist
5. Check file permissions for uploads directory
