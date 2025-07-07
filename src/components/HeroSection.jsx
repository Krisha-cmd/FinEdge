import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import './HeroSection.css';

const HeroSection = () => {
    return (
        <div className="hero-section">
            <AnimatedBackground type="full" />
            <div className="hero-content">
                <h1 className="animate-in">Welcome to One Infinity FinEdge Pvt Ltd</h1>
                <p className="animate-in">Your trusted insurance broker connecting you with the best policies.</p>
                <Link to="/login" className="hero-cta-button animate-in">Get Started</Link>
            </div>
        </div>
    );
};

export default HeroSection;