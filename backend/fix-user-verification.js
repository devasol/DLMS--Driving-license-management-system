import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixUserVerification() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user that just registered
    const user = await User.findOne({ 
      $or: [
        { email: 'dawitsolo8908@gmail.com' },
        { user_email: 'dawitsolo8908@gmail.com' }
      ]
    });

    if (user) {
      console.log('\n📊 Current User Details:');
      console.log('- ID:', user._id);
      console.log('- Name:', user.fullName || user.full_name);
      console.log('- Email:', user.email || user.user_email);
      console.log('- Email Verified:', user.isEmailVerified);
      console.log('- Verification Token:', user.emailVerificationToken || 'Not set');
      console.log('- Token Expires:', user.emailVerificationExpires || 'Not set');

      // Generate verification token
      const crypto = await import('crypto');
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with verification fields
      user.isEmailVerified = false;
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = verificationExpires;
      
      await user.save();

      console.log('\n✅ Updated User Details:');
      console.log('- Email Verified:', user.isEmailVerified);
      console.log('- Verification Token:', user.emailVerificationToken);
      console.log('- Token Expires:', user.emailVerificationExpires);

      console.log('\n🔗 Verification URL:');
      console.log(`http://localhost:3000/verify-email?token=${verificationToken}`);

      // Now let's test the email service
      try {
        const emailService = await import('./services/emailService.js');
        console.log('\n📧 Testing email service...');
        
        // Test sending verification email
        const emailResult = await emailService.sendVerificationEmail(
          user.email || user.user_email,
          user.fullName || user.full_name,
          verificationToken
        );

        if (emailResult.success) {
          console.log('✅ Email sent successfully!');
          console.log('- Message ID:', emailResult.messageId);
        } else {
          console.log('❌ Email failed to send:', emailResult.error);
        }
      } catch (emailError) {
        console.log('❌ Email service error:', emailError.message);
      }

    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixUserVerification();
