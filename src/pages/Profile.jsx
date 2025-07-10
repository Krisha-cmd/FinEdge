import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { currentUser } = useAuth();

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Profile Information</h2>
                <div className="profile-info">
                    <div className="info-group">
                        <label>Phone Number</label>
                        <p>{currentUser?.phoneNumber}</p>
                    </div>
                    <div className="info-group">
                        <label>User ID</label>
                        <p>{currentUser?.uid}</p>
                    </div>
                    <div className="info-group">
                        <label>Last Sign In</label>
                        <p>{new Date(currentUser?.metadata?.lastSignInTime).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;