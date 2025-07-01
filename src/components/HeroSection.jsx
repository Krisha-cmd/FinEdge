import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
    return (
        <div className="hero-section">
            <div className="hero-background">
                <div className="animated-circle circle-1"></div>
                <div className="animated-circle circle-2"></div>
                <div className="animated-circle circle-3"></div>
                <div className="floating-squares">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={`square square-${i + 1}`}></div>
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