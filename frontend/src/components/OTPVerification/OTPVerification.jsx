import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './OTPVerification.module.css';
import { FaEnvelope, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success, error, info
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [canResend, setCanResend] = useState(false);

  // Get email from navigation state
  const userEmail = location.state?.email;
  const fromSignup = location.state?.fromSignup;
  const initialMessage = location.state?.message;

  useEffect(() => {
    // Redirect to signup if no email provided
    if (!userEmail) {
      navigate('/signup');
      return;
    }

    // Set initial message
    if (initialMessage) {
      setMessage(initialMessage);
      setMessageType('info');
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userEmail, navigate, initialMessage]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setMessage('Please enter a 6-digit verification code');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5004/api/auth/users/verify-otp', {
        email: userEmail,
        otp: otp
      });

      if (response.data.verified) {
        setMessage('Email verified successfully! Redirecting to login...');
        setMessageType('success');
        
        // Redirect to login page after successful verification
        setTimeout(() => {
          navigate('/signin', {
            state: {
              message: 'Email verified successfully! You can now log in with your credentials.',
              type: 'success'
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      
      let errorMessage = 'Verification failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage(errorMessage);
      setMessageType('error');
      
      // If OTP expired, allow resend
      if (error.response?.data?.type === 'invalid_otp' && 
          error.response.data.message.includes('expired')) {
        setCanResend(true);
        setTimeLeft(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5004/api/auth/users/resend-otp', {
        email: userEmail
      });

      setMessage('New verification code sent! Please check your email.');
      setMessageType('success');
      setCanResend(false);
      setTimeLeft(300); // Reset timer to 5 minutes
      setOtp(''); // Clear current OTP input

      // Start new countdown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Resend OTP error:', error);
      
      let errorMessage = 'Failed to resend verification code. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <FaEnvelope className={styles.icon} />
          <h1>Verify Your Email</h1>
          <p>We've sent a 6-digit verification code to:</p>
          <strong>{userEmail}</strong>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleVerifyOTP} className={styles.form}>
            <div className={styles.otpInputContainer}>
              <label htmlFor="otp">Enter Verification Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                maxLength="6"
                className={styles.otpInput}
                disabled={isLoading}
                autoComplete="one-time-code"
              />
              <small className={styles.inputHint}>
                Enter the 6-digit code from your email
              </small>
            </div>

            {message && (
              <div className={`${styles.message} ${styles[messageType]}`}>
                {messageType === 'success' && <FaCheckCircle />}
                {messageType === 'error' && <FaExclamationTriangle />}
                {messageType === 'info' && <FaEnvelope />}
                <span>{message}</span>
              </div>
            )}

            <div className={styles.timer}>
              {timeLeft > 0 ? (
                <p>Code expires in: <strong>{formatTime(timeLeft)}</strong></p>
              ) : (
                <p className={styles.expired}>Verification code has expired</p>
              )}
            </div>

            <button
              type="submit"
              className={styles.verifyButton}
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleResendOTP}
              className={styles.resendButton}
              disabled={!canResend || isResending}
            >
              {isResending ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Sending...
                </>
              ) : (
                'Resend Code'
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToSignup}
              className={styles.backButton}
            >
              Back to Sign Up
            </button>
          </div>

          <div className={styles.help}>
            <p>Didn't receive the email?</p>
            <ul>
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes for the email to arrive</li>
              <li>Click "Resend Code" if the timer has expired</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
