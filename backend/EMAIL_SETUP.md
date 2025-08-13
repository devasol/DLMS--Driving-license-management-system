# Email Verification Setup Guide

This guide explains how to set up email verification for the DLMS (Driving License Management System).

## Overview

The system now includes email verification functionality that:
- Sends verification emails when users sign up
- Prevents login until email is verified
- Allows resending verification emails
- Sends welcome emails after successful verification

## Environment Variables Setup

Add the following variables to your `.env` file in the backend directory:

```env
# Email Configuration (Required for email verification)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:3000
```

## Gmail Setup (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. In Google Account settings, go to Security
2. Under "2-Step Verification", click on "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Enter "DLMS Backend" as the device name
5. Copy the generated 16-character password
6. Use this password as `EMAIL_PASSWORD` in your `.env` file

### Step 3: Update Environment Variables
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FRONTEND_URL=http://localhost:3000
```

## Alternative Email Services

### Using Custom SMTP
```env
EMAIL_SERVICE=smtp
EMAIL_USER=your_email@yourdomain.com
EMAIL_PASSWORD=your_email_password
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
FRONTEND_URL=http://localhost:3000
```

### Using SendGrid (Production Recommended)
```env
EMAIL_SERVICE=smtp
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
FRONTEND_URL=https://yourdomain.com
```

## Testing Email Verification

### 1. Start the Backend Server
```bash
cd backend
npm start
```

### 2. Start the Frontend Server
```bash
cd frontend
npm start
```

### 3. Test the Flow
1. Go to `http://localhost:3000/signup`
2. Fill out the registration form
3. Submit the form
4. Check your email for the verification link
5. Click the verification link
6. Try logging in with your credentials

## API Endpoints

The following new endpoints have been added:

### Email Verification
- **GET** `/api/auth/verify-email?token=<verification_token>`
  - Verifies the user's email address
  - Returns success/error message

### Resend Verification
- **POST** `/api/auth/resend-verification`
  - Body: `{ "email": "user@example.com" }`
  - Sends a new verification email

### Updated Signup
- **POST** `/api/auth/users/signup`
  - Now includes email verification token generation
  - Sends verification email automatically

### Updated Login
- **POST** `/api/auth/users/login`
  - Now checks if email is verified before allowing login
  - Returns 403 error if email not verified

## Database Changes

The User model now includes these additional fields:
- `isEmailVerified`: Boolean (default: false)
- `emailVerificationToken`: String
- `emailVerificationExpires`: Date

## Frontend Changes

### New Components
- `EmailVerification.jsx`: Handles email verification from links
- Updated `Signin.jsx`: Shows verification error and resend option
- Updated `Signup.jsx`: Shows verification message after signup

### New Routes
- `/verify-email`: Email verification page

## Troubleshooting

### Email Not Sending
1. Check your email credentials in `.env`
2. Ensure Gmail app password is correct (16 characters, no spaces)
3. Check server logs for email errors
4. Verify SMTP settings

### Verification Link Not Working
1. Check that `FRONTEND_URL` is correct in `.env`
2. Ensure the token hasn't expired (24 hours)
3. Check browser console for errors

### Login Still Blocked After Verification
1. Check database to ensure `isEmailVerified` is set to `true`
2. Clear browser cache and localStorage
3. Try logging in again

## Security Notes

- Verification tokens expire after 24 hours
- Tokens are cryptographically secure (32 bytes)
- Email verification is required for all new users
- Admin accounts bypass email verification
- Verification links are single-use

## Production Considerations

1. **Use a dedicated email service** (SendGrid, AWS SES, etc.)
2. **Set proper FRONTEND_URL** to your production domain
3. **Use HTTPS** for all email links
4. **Monitor email delivery** rates and bounces
5. **Implement rate limiting** for resend verification requests
6. **Add email templates** with your branding
7. **Set up proper DNS records** (SPF, DKIM, DMARC) for better deliverability

## Support

If you encounter issues with email verification:
1. Check the server logs for detailed error messages
2. Verify your email service configuration
3. Test with a different email provider if needed
4. Contact the development team for assistance
