# OTP Email Verification System

## Overview
The DLMS now includes a robust OTP (One-Time Password) email verification system for user registration. Users must verify their email address with a 6-digit code that expires after 2 minutes.

## Features
- ✅ 6-digit OTP generation
- ✅ 2-minute expiration time
- ✅ Email verification required before login
- ✅ Resend OTP functionality
- ✅ Secure OTP validation
- ✅ Professional email templates
- ✅ Sender email: dlms.sys.2025@gmail.com

## API Endpoints

### 1. Register User (Send OTP)
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "message": "Registration initiated! Please check your email for the verification code.",
  "success": true,
  "requiresOTP": true,
  "email": "john@example.com",
  "simulated": false
}
```

### 2. Verify OTP
**POST** `/api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "message": "Email verified successfully! You can now log in with your credentials.",
  "success": true,
  "verified": true
}
```

**Response (Invalid/Expired OTP):**
```json
{
  "message": "Verification code has expired. Please request a new code.",
  "type": "invalid_otp"
}
```

### 3. Resend OTP
**POST** `/api/auth/resend-otp`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (Success):**
```json
{
  "message": "New verification code sent! Please check your email.",
  "success": true,
  "simulated": false
}
```

### 4. Login (Requires Verified Email)
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123",
  "isAdmin": false
}
```

**Response (Unverified Email):**
```json
{
  "message": "Please verify your email before logging in. Check your email for the verification code.",
  "type": "email_not_verified",
  "email": "john@example.com"
}
```

## Database Schema Changes

### User Model Updates
```javascript
// New fields added to User schema
{
  isEmailVerified: { type: Boolean, default: false },
  emailOTP: { type: String },
  otpExpires: { type: Date }
}
```

## Email Configuration

### Environment Variables
```env
EMAIL_SERVICE=gmail
EMAIL_USER=dlms.sys.2025@gmail.com
EMAIL_PASSWORD=GMAIL_APP_PASSWORD_NEEDED
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup Required
1. Enable 2-Factor Authentication on dlms.sys.2025@gmail.com
2. Generate App Password for the application
3. Update EMAIL_PASSWORD in .env file

## Frontend Integration

### Registration Flow
1. User submits registration form
2. Frontend calls `/api/auth/register`
3. If `requiresOTP: true`, show OTP input form
4. User enters OTP from email
5. Frontend calls `/api/auth/verify-otp`
6. On success, redirect to login page

### Login Flow
1. User submits login form
2. Frontend calls `/api/auth/login`
3. If `type: "email_not_verified"`, show OTP verification form
4. Allow user to resend OTP if needed
5. Complete verification before allowing login

## Security Features

### OTP Security
- 6-digit random numeric code
- 2-minute expiration (120 seconds)
- Single-use (cleared after verification)
- Secure generation using crypto.randomBytes

### Email Security
- Professional email templates
- Clear expiration warnings
- Security tips included in emails
- Automated sender (no-reply style)

## Testing

### Run OTP System Test
```bash
cd backend
node test-otp-system.js
```

### Manual Testing Steps
1. Register a new user
2. Check console/email for OTP
3. Try logging in without verification (should fail)
4. Verify OTP
5. Login successfully

## Error Handling

### Common Error Types
- `validation_error`: Missing required fields
- `duplicate_error`: Email already registered
- `user_not_found`: User doesn't exist
- `already_verified`: Email already verified
- `invalid_otp`: Wrong or expired OTP
- `email_not_verified`: Login blocked for unverified user
- `email_error`: Failed to send email
- `server_error`: Unexpected server error

## Production Considerations

### Email Service
- Consider using professional email service (SendGrid, AWS SES)
- Set up proper SPF/DKIM records
- Monitor email delivery rates

### Rate Limiting
- Implement rate limiting for OTP requests
- Prevent spam/abuse of email system
- Consider CAPTCHA for repeated requests

### Monitoring
- Log OTP generation and verification attempts
- Monitor failed verification attempts
- Track email delivery success rates

## Files Modified/Created

### New Files
- `backend/services/otpService.js` - OTP generation and email service
- `backend/test-otp-system.js` - Testing script
- `backend/OTP_VERIFICATION_GUIDE.md` - This documentation

### Modified Files
- `backend/models/User.js` - Added OTP fields
- `backend/routes/authRoutes.js` - Updated auth endpoints
- `backend/.env` - Updated email configuration
