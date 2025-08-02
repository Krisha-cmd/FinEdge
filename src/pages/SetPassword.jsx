import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import './SetPassword.css';

const SetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Get email from URL and decode
        const params = new URLSearchParams(location.search);
        const encodedEmail = params.get('email');
        if (!encodedEmail) {
            navigate('/');
            return;
        }

        try {
            const decodedEmail = atob(encodedEmail);
            setEmail(decodedEmail);
        } catch (error) {
            console.error('Invalid email encoding:', error);
            navigate('/');
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate password
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            // Create user with email and password
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message.includes('auth/email-already-in-use')
                ? 'This email is already registered'
                : 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setpassword-container">
            <AnimatedBackground type="full" />
            <div className="setpassword-card">
                <div className="setpassword-header">
                    <h2>Set Your Password</h2>
                    <p>Create a password to complete your registration</p>
                </div>

                <form onSubmit={handleSubmit} className="setpassword-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="disabled-input"
                        />
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPassword;