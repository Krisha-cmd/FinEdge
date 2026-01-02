import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import './Login.css';
import config from '../config/api.js';

const Login = () => {
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            if (err.message.includes('auth/invalid-credential') || err.message.includes('auth/wrong-password')) {
                setError('Invalid email or password');
            } else if (err.message.includes('auth/user-not-found')) {
                setError('No account found with this email');
            } else if (err.message.includes('auth/too-many-requests')) {
                setError('Too many failed attempts. Please try again later.');
            } else {
                setError('Error logging in. Please try again.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
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

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    // Clear error when switching between login and forgot password
    useEffect(() => {
        setError('');
        setSuccess('');
    }, [showForgotPassword]);

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
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    {!showForgotPassword && (
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

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading || !email || (!showForgotPassword && !password)}
                    >
                        {loading
                            ? 'Processing...'
                            : showForgotPassword
                                ? 'Send Reset Link'
                                : 'Login'
                        }
                    </button>

                    <button
                        type="button"
                        className="forgot-password-button"
                        onClick={() => setShowForgotPassword(!showForgotPassword)}
                    >
                        {showForgotPassword ? 'Back to Login' : 'Forgot Password?'}
                    </button>

                    <div className="signup-link">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;