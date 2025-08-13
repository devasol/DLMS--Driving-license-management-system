# Gmail Setup Guide for Email Verification

## 🚀 Quick Setup for dawit8908@gmail.com

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA (you'll need your phone)

### Step 2: Generate App Password
1. After enabling 2FA, go back to **Security** settings
2. Under "Signing in to Google", click **App passwords**
3. You might need to sign in again
4. Select **Mail** for the app
5. Select **Other (Custom name)** for the device
6. Enter: **DLMS Backend Server**
7. Click **Generate**
8. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Replace the placeholder in your `.env` file:

```env
# Email Configuration (Required for email verification)
EMAIL_SERVICE=gmail
EMAIL_USER=dawit8908@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

**Important:** Remove the spaces from the app password, so it becomes: `abcdefghijklmnop`

### Step 4: Test the Setup
Run this command to test email sending:

```bash
node test-email-verification.js
```

## 🔧 Current Configuration

Your email is already set in the `.env` file:
- **Email:** dawit8908@gmail.com
- **Service:** Gmail
- **Status:** ⚠️ Needs App Password

## 📧 What Happens After Setup

1. **User signs up** → Account created with email verification required
2. **Verification email sent** → Professional email with verification link
3. **User clicks link** → Email verified, welcome email sent
4. **User can login** → Access granted to dashboard

## 🧪 Testing Commands

```bash
# Test email verification system
node test-email-verification.js

# Test signup process
node test-signup-error.js

# Test login with unverified email
node test-login-verification.js
```

## 🚨 Troubleshooting

### "Invalid login" Error
- Make sure 2FA is enabled
- Use the App Password, not your regular Gmail password
- Remove spaces from the App Password

### "Username and Password not accepted"
- Double-check the App Password
- Make sure you're using `dawit8908@gmail.com` exactly
- Try generating a new App Password

### Email Not Sending
- Check server logs for detailed errors
- Verify Gmail settings allow less secure apps (should be automatic with App Password)
- Test with a simple email first

## 📱 Alternative: Using Other Email Services

If Gmail doesn't work, you can use:

### SendGrid (Recommended for Production)
```env
EMAIL_SERVICE=smtp
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
```

### Outlook/Hotmail
```env
EMAIL_SERVICE=smtp
EMAIL_USER=your_email@outlook.com
EMAIL_PASSWORD=your_password
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

## ✅ Success Indicators

When everything is working, you'll see:
- ✅ User registration successful
- ✅ Verification email sent
- ✅ Login blocked until verified
- ✅ Email verification working
- ✅ Welcome email after verification

## 🔗 Useful Links

- [Google App Passwords Help](https://support.google.com/accounts/answer/185833)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [2-Step Verification Setup](https://support.google.com/accounts/answer/185839)
