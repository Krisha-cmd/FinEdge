import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import AnimatedBackground from '../components/AnimatedBackground';
import config from '../config/api.js';
import SuccessModal from '../components/SuccessModal';
import './SignUp.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        panNo: '',
        aadharNo: '',
        referralId: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [emailError, setEmailError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear email error when email is changed
        if (name === 'email') {
            setEmailError('');
        }
    };

    const sendRegistrationEmail = async (userData) => {
        try {
            const response = await fetch(`${config.baseURL}/${config.endpoints.sendRegistrationEmail}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to send registration email');
            }
        } catch (error) {
            console.error('Error sending registration email:', error);
            throw error;
        }
    };

    const checkEmailExists = async (email) => {
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            return methods.length > 0;
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setEmailError('');
        setLoading(true);

        try {
            // Check if email exists
            const emailExists = await checkEmailExists(formData.email);
            if (emailExists) {
                setEmailError('This email is already registered. Please use a different email or login.');
                setLoading(false);
                return;
            }

            // Send registration email
            const emailData = {
                ...formData,
                password: undefined // Remove password before sending email
            };
            await sendRegistrationEmail(emailData);

            // Show success modal instead of alert
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Registration error:', error);
            if (error.code === 'auth/email-already-in-use') {
                setEmailError('This email is already registered. Please use a different email or login.');
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        navigate('/login');
    };

    return (
        <div className="signup-container">
            <AnimatedBackground type="full" />
            <div className="signup-card">
                <div className="signup-header">
                    <h2>Join Our Network</h2>
                    <p>Fill in your details to register</p>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">Full Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                pattern="[0-9]{10}"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={emailError ? 'error' : ''}
                                required
                            />
                            {emailError && <div className="error-message email-error">{emailError}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="panNo">PAN Number</label>
                            <input
                                type="text"
                                id="panNo"
                                name="panNo"
                                value={formData.panNo}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="aadharNo">Aadhar Number</label>
                            <input
                                type="text"
                                id="aadharNo"
                                name="aadharNo"
                                value={formData.aadharNo}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="referralId">Referral Name</label>
                            <input
                                type="text"
                                id="referralId"
                                name="referralId"
                                value={formData.referralId}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="reason">How did you know about us? *</label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            rows="2"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="signup-button"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Sign Up'}
                    </button>
                </form>
            </div>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleModalClose}
                message="Thanks for signing up! We'll review your application and send you an email once your onboarding is completed. Please check your email for further instructions."
            />
        </div>
    );
};

export default SignUp;