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
        const searchParams = new URLSearchParams(window.location.search);
        let code = searchParams.get('oobCode');
        
        // Check if we're coming from Firebase action URL
        if (!code) {
            const mode = searchParams.get('mode');
            if (mode === 'resetPassword') {
                code = searchParams.get('oobCode');
            }
        }

        if (code) {
            setOobCode(code);
            setValidCode(true);
            // Don't clean up URL as it contains necessary Firebase parameters
        } else {
            setError('Invalid password reset link');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
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
            await confirmPasswordReset(oobCode, newPassword); // Remove auth parameter since it's handled in the context
            navigate('/login', { 
                state: { 
                    message: 'Password reset successful! Please login with your new password.'
                }
            });
        } catch (error) {
            console.error('Reset password error:', error);
            if (error.code === 'auth/invalid-action-code') {
                setError('Invalid or expired reset link. Please request a new one.');
            } else {
                setError('Failed to reset password. Please try again.');
            }
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