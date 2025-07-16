import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaMobile, FaEnvelope } from 'react-icons/fa';
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
                <div className="profile-code">{profileData?.coCode || 'Not provided'}</div>
            </div>

            <div className="profile-grid">
                <h2>Contact Information</h2>
                <div className="info-section">
                    <div className="info-item">
                        <FaMobile className="info-icon" />
                        <div className="info-content">
                            <label>Mobile</label>
                            <p>{profileData?.mobile || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <FaEnvelope className="info-icon" />
                        <div className="info-content">
                            <label>Email</label>
                            <p>{profileData?.email || 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                <h2>Identity Details</h2>
                <div className="info-section">
                    <div className="info-item">
                        <div className="info-content">
                            <label>PAN</label>
                            <p>{profileData?.pan || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <div className="info-content">
                            <label>Aadhar</label>
                            <p>{profileData?.aadhar || 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                <h2>Banking Information</h2>
                <div className="info-section">
                    <div className="info-item">
                        <div className="info-content">
                            <label>Bank Name</label>
                            <p>{profileData?.bankName || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <div className="info-content">
                            <label>Account Number</label>
                            <p>{profileData?.bankAccount || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;