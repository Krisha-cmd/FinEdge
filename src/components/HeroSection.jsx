import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaUserShield, FaCar, FaMotorcycle } from 'react-icons/fa';
import healthIcon from '../assets/health-insurance.png';
import lifeIcon from '../assets/life-insurance.png';
import carIcon from '../assets/car-insurance.png';
import scooterIcon from '../assets/scooter-insurance.png';
import './HeroSection.css';

const floatingIcons = [
    { icon: <FaHeartbeat />, name: 'health' },
    { icon: <FaUserShield />, name: 'life' },
    { icon: <FaCar />, name: 'car' },
    { icon: <FaMotorcycle />, name: 'scooter' }
];

const HeroSection = () => {
    return (
        <div className="hero-section">
            <div className="hero-background">
                <div className="animated-circle circle-1">
                    <img src={healthIcon} alt="Health Insurance" className="circle-icon" />
                </div>
                <div className="animated-circle circle-2">
                    <img src={lifeIcon} alt="Life Insurance" className="circle-icon" />
                </div>
                <div className="animated-circle circle-3">
                    <img src={carIcon} alt="Car Insurance" className="circle-icon" />
                </div>
                <div className="animated-circle circle-4">
                    <img src={scooterIcon} alt="Two-Wheeler Insurance" className="circle-icon" />
                </div>
                <div className="floating-icons">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className={`floating-icon icon-${i + 1}`}>
                            {floatingIcons[i % 4].icon}
                        </div>
                    ))}
                </div>
            </div>
            <div className="hero-content">
                <h1 className="animate-in">Welcome to One Infinity FinEdge Pvt Ltd</h1>
                <p className="animate-in">Your trusted insurance broker connecting you with the best policies.</p>
                <Link to="/login" className="hero-cta-button animate-in">Get Started</Link>
            </div>
        </div>
    );
};

export default HeroSection;