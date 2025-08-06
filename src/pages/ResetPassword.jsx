import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import './ResetPassword.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validCode, setValidCode] = useState(false);
    const [oobCode, setOobCode] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { confirmPasswordReset } = useAuth();

    useEffect(() => {
        // Try to get oobCode from URL parameters
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('oobCode');
        
        // If no code in direct URL, check for Firebase action URL parameters
        if (!code) {
            const actionUrl = new URL(window.location.href);
            const actionCode = actionUrl.searchParams.get('oobCode');
            if (actionCode) {
                setOobCode(actionCode);
                setValidCode(true);
                // Clean up the URL
                window.history.replaceState({}, '', '/reset-password');
                return;
            }
        } else {
            setOobCode(code);
            setValidCode(true);
            return;
        }

        setError('Invalid password reset link');
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validCode) {
            setError('Invalid reset code');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await confirmPasswordReset(oobCode, newPassword);
            // Show success message using proper UI instead of alert
            navigate('/login', { 
                state: { 
                    message: 'Password reset successful! Please login with your new password.'
                }
            });
        } catch (error) {
            setError(error.message || 'Failed to reset password. Please try again.');
            console.error('Reset password error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!validCode) {
        return (
            <div className="reset-password-container">
                <AnimatedBackground type="full" />
                <div className="reset-password-card">
                    <div className="error-message">
                        {error || 'Loading...'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-container">
            <AnimatedBackground type="full" />
            <div className="reset-password-card">
                <div className="reset-password-header">
                    <h2>Reset Your Password</h2>
                    <p>Please enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="reset-password-form">
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
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
                            placeholder="Confirm new password"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="reset-button"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;