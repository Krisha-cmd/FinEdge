import React, { useState } from 'react';
import './Login.css';

const Login = () => {
    const [step, setStep] = useState(1);
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const handleMobileChange = (e) => {
        const value = e.target.value;
        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            setError('Please enter numbers only');
            return;
        }
        if (value.length > 10) {
            return;
        }
        setMobile(value);
        setError('');
    };

    const handleOtpChange = (e) => {
        const value = e.target.value;
        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            setError('Please enter numbers only');
            return;
        }
        if (value.length > 6) {
            return;
        }
        setOtp(value);
        setError('');
    };

    const handleMobileSubmit = (e) => {
        e.preventDefault();
        if (mobile.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        setError('');
        // Handle OTP verification
    };

    const handleResendOTP = () => {
        // Implement OTP resend logic
        console.log('Resending OTP to:', mobile);
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="circle-1"></div>
                <div className="circle-2"></div>
                <div className="circle-3"></div>
                <div className="floating-squares">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={`square square-${i + 1}`}></div>
                    ))}
                </div>
            </div>
            <div className="login-card">
                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>Login to access your account</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleMobileSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="mobile">Mobile Number</label>
                            <div className="mobile-input">
                                <span className="country-code">+91</span>
                                <input
                                    type="text"
                                    id="mobile"
                                    value={mobile}
                                    onChange={handleMobileChange}
                                    required
                                    placeholder="Enter your mobile number"
                                />
                            </div>
                            {error && <span className="error-message">{error}</span>}
                            {mobile && mobile.length < 10 && (
                                <span className="info-message">
                                    {`${10 - mobile.length} digits remaining`}
                                </span>
                            )}
                        </div>
                        <button 
                            type="submit" 
                            className="login-button"
                            disabled={mobile.length !== 10}
                        >
                            Get OTP
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={handleOtpChange}
                                required
                                placeholder="Enter 6-digit OTP"
                            />
                            {error && <span className="error-message">{error}</span>}
                            {otp && otp.length < 6 && (
                                <span className="info-message">
                                    {`${6 - otp.length} digits remaining`}
                                </span>
                            )}
                            <p className="mobile-display">OTP sent to: +91 {mobile}</p>
                        </div>
                        <button 
                            type="submit" 
                            className="login-button"
                            disabled={otp.length !== 6}
                        >
                            Verify OTP
                        </button>
                        <button 
                            type="button" 
                            className="resend-button"
                            onClick={handleResendOTP}
                        >
                            Resend OTP
                        </button>
                        <button 
                            type="button" 
                            className="back-button"
                            onClick={() => setStep(1)}
                        >
                            Change Number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;