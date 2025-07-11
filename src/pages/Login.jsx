import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../config/firebase';
import AnimatedBackground from '../components/AnimatedBackground';
import './Login.css';
import config from '../config/api.js';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRegisteredUser, setIsRegisteredUser] = useState(false);
    const [userData, setUserData] = useState(null);
    const timerRef = useRef(null);
    const recaptchaContainerRef = useRef(null);
    const navigate = useNavigate();

    const setupRecaptcha = () => {
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'normal',
                callback: () => {
                    // Enable the send OTP button when reCAPTCHA is solved
                    setLoading(false);
                },
                'expired-callback': () => {
                    setError('reCAPTCHA expired. Please try again.');
                    if (window.recaptchaVerifier) {
                        window.recaptchaVerifier.clear();
                        window.recaptchaVerifier = null;
                    }
                }
            });

            // Render the reCAPTCHA widget
            window.recaptchaVerifier.render();
        } catch (error) {
            console.error('Error setting up reCAPTCHA:', error);
            setError('Error initializing verification. Please refresh the page.');
        }
    };

    // Setup reCAPTCHA on component mount
    useEffect(() => {


        // Initialize reCAPTCHA if it hasn't been initialized
        if (!window.recaptchaVerifier) {
            setupRecaptcha();
        }

        // Cleanup function
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, []); // Empty dependency array means this runs once on mount

    const startOtpTimer = () => {
        setTimeLeft(60); // 2 minutes in seconds
        if (timerRef.current) clearInterval(timerRef.current);
        
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    // Reset verification when timer expires
                    setVerificationId(null);
                    setError('OTP expired. Please request a new code.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Clear timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Send OTP

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Reverify user registration before sending OTP
            await verifyUserRegistration(phoneNumber);
            
            if (!isRegisteredUser) {
                setError('User not registered');
                setLoading(false);
                return;
            }

            if (!window.recaptchaVerifier) {
                throw new Error('reCAPTCHA not initialized');
            }

            const formattedPhone = `+91${phoneNumber}`;
            const appVerifier = window.recaptchaVerifier;

            const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setVerificationId(confirmationResult);
            setLoading(false);
            startOtpTimer(); // Start timer after successful OTP send
        } catch (err) {
            setLoading(false);

            // Detect OTP timeout error by Firebase error code or message
            if (err.code === 'auth/code-expired' || err.message?.toLowerCase().includes('timeout')) {
                setError('OTP expired. Please request a new code.');
                setVerificationId(null); // Reset verification flow
            } else {
                setError('Error sending OTP. Please try again.');
            }
            console.error(err);

            // Reset reCAPTCHA on error
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }

            setupRecaptcha(); // Re-setup reCAPTCHA
            setRetryCount(prev => prev + 1); // Increment retry count
        }
    };

    // Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await verificationId.confirm(verificationCode);
            navigate('/'); // Navigate to home page after successful verification
        } catch (err) {
            setError('Invalid verification code. Please try again.');
            setLoading(false);
            console.error(err);
        }
    };

    const handleRetry = () => {
        setError('');
        setRetryCount(prev => prev + 1);

        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
        }

        // ✅ Re-setup reCAPTCHA after clearing
        setupRecaptcha();
    };

    // Format time for display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Add user verification function
    const verifyUserRegistration = async (phone) => {
        try {
            const response = await fetch(`${config.baseURL}${config.endpoints.checkUser}/${phone}`);
            const data = await response.json();

            if (data.status === 'success') {
                setIsRegisteredUser(data.userRegistered);
                if (data.userRegistered) {
                    setUserData(data.user);
                }
            } else {
                setError('Error verifying user status');
            }
        } catch (err) {
            console.error('User verification error:', err);
            setError('Error checking user registration');
        }
    };

    // Modify phone number input handler
    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        setPhoneNumber(value);
        
        // Check user registration when 10 digits are entered
        if (value.length === 10) {
            verifyUserRegistration(value);
        } else {
            setIsRegisteredUser(false);
            setUserData(null);
        }
    };

    return (
        <div className="login-container">
            <AnimatedBackground type="full" />
            <div className="login-card">
                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>Login to access your account</p>
                </div>

                {!verificationId ? (
                    <form onSubmit={handleSendOTP} className="login-form">
                        <div className="form-group">
                            <label htmlFor="mobile">Mobile Number</label>
                            <div className="mobile-input">
                                <span className="country-code">+91</span>
                                <input
                                    type="tel"
                                    id="mobile"
                                    value={phoneNumber}
                                    onChange={handlePhoneNumberChange}
                                    placeholder="Enter mobile number"
                                    maxLength="10"
                                    required
                                />
                            </div>
                            {phoneNumber.length === 10 && !isRegisteredUser && (
                                <div className="error-message">
                                    This number is not registered. 
                                    <Link 
                                        to="/#contact" 
                                        className="contact-link"
                                        onClick={() => {
                                            const contactSection = document.getElementById('contact');
                                            if (contactSection) {
                                                contactSection.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                    >
                                        Contact us
                                    </Link> 
                                    {" "}if you want to join our network of insurance advisors.
                                </div>
                            )}
                            {error && (
                                <div className="error-container">
                                    <div className="error-message">{error}</div>
                                    <button
                                        className="retry-button"
                                        onClick={handleRetry}
                                        disabled={retryCount >= 3}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                            {phoneNumber && phoneNumber.length < 10 && (
                                <span className="info-message">
                                    {`${10 - phoneNumber.length} digits remaining`}
                                </span>
                            )}
                        </div>
                        {/* Changed from ref to id */}
                        <div id="recaptcha-container" className="recaptcha-container"></div>
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading || phoneNumber.length !== 10 || !isRegisteredUser}
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="login-form">
                        <div className="form-group">
                            <label htmlFor="otp">Verification Code</label>
                            <input
                                type="text"
                                id="otp"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter OTP"
                                maxLength="6"
                                required
                            />
                            <div className="otp-timer">
                                Time remaining: {formatTime(timeLeft)}
                            </div>
                            {timeLeft === 0 && (
                                <button
                                    type="button"
                                    className="resend-button"
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                >
                                    Resend OTP
                                </button>
                            )}
                            {error && <div className="error-message">{error}</div>}
                            {verificationCode && verificationCode.length < 6 && (
                                <span className="info-message">
                                    {`${6 - verificationCode.length} digits remaining`}
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading || verificationCode.length !== 6 || timeLeft === 0}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;