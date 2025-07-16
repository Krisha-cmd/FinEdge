import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import config from '../config/api';
import './Profile.css';

const Profile = () => {
    const { currentUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await currentUser.getIdToken();
                const response = await fetch(`${config.baseURL}${config.endpoints.profile}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.status === 'success') {
                    setProfileData(data.profile);
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchProfile();
        }
    }, [currentUser]);

    if (loading) return <div className="profile-loading">Loading profile...</div>;
    if (error) return <div className="profile-error">Error: {error}</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {profileData?.name?.charAt(0)}
                </div>
                <h1>{profileData?.name}</h1>
                <span className="profile-code">{profileData?.coCode}</span>
            </div>

            <div className="profile-grid">
                <div className="contact-info">
                    <h3>Contact Information</h3>
                    <div className="card-content">
                        <div className="info-item">
                            <i className="icon phone-icon">📱</i>
                            <div>
                                <label>Mobile</label>
                                <p>{profileData?.mobile}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <i className="icon email-icon">📧</i>
                            <div>
                                <label>Email</label>
                                <p>{profileData?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="identity-info">
                    <h3>Identity Details</h3>
                    <div className="card-content">
                        <div className="info-item">
                            <i className="icon pan-icon">🪪</i>
                            <div>
                                <label>PAN</label>
                                <p>{profileData?.pan}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <i className="icon aadhar-icon">📄</i>
                            <div>
                                <label>Aadhar</label>
                                <p>{profileData?.aadhar}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-card banking-info">
                    <h3>Banking Details</h3>
                    <div className="card-content">
                        <div className="info-item">
                            <i className="icon bank-icon">🏦</i>
                            <div>
                                <label>Bank Name</label>
                                <p>{profileData?.bankName}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <i className="icon account-icon">💳</i>
                            <div>
                                <label>Account Number</label>
                                <p>{profileData?.bankAccount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-card meta-info">
                    <h3>Additional Information</h3>
                    <div className="card-content">
                        <div className="info-item">
                            <i className="icon date-icon">📅</i>
                            <div>
                                <label>Joining Date</label>
                                <p>{profileData?.joiningDate}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <i className="icon last-login-icon">🕒</i>
                            <div>
                                <label>Last Login</label>
                                <p>{new Date(currentUser?.metadata?.lastSignInTime).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;