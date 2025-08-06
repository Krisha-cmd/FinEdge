import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext'; // Add this import
import AnimatedBackground from '../components/AnimatedBackground';
import './Login.css';
import config from '../config/api.js';
import { scrollToSection } from '../utils/scrollHelper';

const Login = () => {
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isRegisteredUser, setIsRegisteredUser] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [verificationAttempted, setVerificationAttempted] = useState(false);
    const { login, resetPassword } = useAuth(); // Add this line to destructure auth methods
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        setIsEmailValid(validateEmail(newEmail));
        // Reset registration status and verification attempt when email changes
        setIsRegisteredUser(false);
        setVerificationAttempted(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message.includes('auth/invalid-credential')
                ? 'Invalid password'
                : 'Error logging in. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call our custom reset password endpoint
            const response = await fetch(`${config.baseURL}/user/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess('Password reset link sent! Please check your email (including spam folder).');
                setError('');

                // Reset form after 3 seconds
                setTimeout(() => {
                    setShowForgotPassword(false);
                    setSuccess('');
                }, 3000);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Password reset error:', err);
            setError('Unable to send reset email. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const verifyUserRegistration = async () => {
        if (!email) {
            setError('Please enter an email address');
            return;
        }

        try {
            setVerificationAttempted(true);
            const response = await fetch(`${config.baseURL}${config.endpoints.checkUser}/${encodeURIComponent(email)}`);
            const data = await response.json();

            if (data.status === 'success') {
                setIsRegisteredUser(data.userRegistered);
                if (!data.userRegistered) {
                    setError('This email is not registered');
                }
            } else {
                setError('Error verifying user status');
            }
        } catch (err) {
            console.error('User verification error:', err);
            setError('Error checking user registration');
        }
    };

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the message after 5 seconds
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    return (
        <div className="login-container">
            <AnimatedBackground type="full" />
            <div className="login-card">
                <div className="login-header">
                    <h2>{showForgotPassword ? 'Reset Password' : 'Welcome Back'}</h2>
                    <p>{showForgotPassword
                        ? 'Enter your email to reset password'
                        : 'Login to access your account'}
                    </p>
                </div>

                <form onSubmit={showForgotPassword ? handleForgotPassword : handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="email-input">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Enter email address"
                                required
                            />
                        </div>
                        {/* Only show verify button when not in forgot password mode */}
                        {!showForgotPassword && (
                            <button
                                type="button"
                                className={`verify-button ${isEmailValid ? 'active' : ''}`}
                                onClick={verifyUserRegistration}
                                disabled={!isEmailValid}
                            >
                                Verify Email
                            </button>
                        )}
                    </div>

                    {/* Password field only shows after verification for login */}
                    {!showForgotPassword && isRegisteredUser && (
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    )}

                    {/* Show error and success messages */}
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    {successMessage && (
                        <div className="success-message">
                            {successMessage}
                        </div>
                    )}

                    {/* Show not registered message */}
                    {!isRegisteredUser && verificationAttempted && (
                        <div className="error-message">
                            This email is not onboarded.
                            <Link to="/signup" className="contact-link">
                                Sign up
                            </Link>
                            {" "}if you want to join our network.
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading || 
                            (showForgotPassword ? !isRegisteredUser : (!isRegisteredUser || !password))}
                    >
                        {loading
                            ? 'Processing...'
                            : showForgotPassword
                                ? 'Send Reset Link'
                                : 'Login'
                        }
                    </button>

                    {/* Only show forgot password button after successful verification */}
                    {isRegisteredUser && (
                        <button
                            type="button"
                            className="forgot-password-button"
                            onClick={() => {
                                setShowForgotPassword(!showForgotPassword);
                                setError('');
                                setSuccess('');
                            }}
                        >
                            {showForgotPassword
                                ? 'Back to Login'
                                : 'Forgot Password?'
                            }
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;