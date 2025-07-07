import React from 'react';
import { FaHeartbeat, FaUserShield, FaCar, FaMotorcycle } from 'react-icons/fa';
import healthIcon from '../assets/health-insurance.png';
import lifeIcon from '../assets/life-insurance.png';
import carIcon from '../assets/car-insurance.png';
import scooterIcon from '../assets/scooter-insurance.png';
import './AnimatedBackground.css';

const floatingIcons = [FaHeartbeat, FaUserShield, FaCar, FaMotorcycle];

const AnimatedBackground = ({ type = 'full' }) => {
    return (
        <div className={`animated-background ${type}`}>
            {/* Static circles with PNG icons */}
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

            {/* Floating icons using React Icons */}
            <div className="floating-icons">
                {[...Array(12)].map((_, i) => {
                    const IconComponent = floatingIcons[i % 4];
                    return (
                        <div key={i} className={`floating-icon icon-${i + 1}`}>
                            <IconComponent />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnimatedBackground;