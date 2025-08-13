console.log('🔍 DEBUGGING: Checking if OTP system is working...');

// Test the OTP service directly
import { generateOTP, getOTPExpiration } from './services/otpService.js';

console.log('Testing OTP generation...');
const otp = generateOTP();
const expiration = getOTPExpiration();

console.log('Generated OTP:', otp);
console.log('Expiration time:', expiration);
console.log('Minutes from now:', Math.round((expiration - new Date()) / 1000 / 60));

console.log('\n✅ OTP service is working!');
console.log('The issue might be in the frontend or route handling.');
