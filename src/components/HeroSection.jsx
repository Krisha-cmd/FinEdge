import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
import './HeroSection.css';

const HeroSection = () => {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    const handleGetStarted = () => {
        setIsExiting(true);
        setTimeout(() => {
            navigate('/login');
        }, 500); // Match this with animation duration
    };

    return (
        <motion.div 
            className="hero-section"
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 0.2 , ease: "easeInOut" }}
        >
            <AnimatedBackground type="full" />
            <div className="hero-content">
                <h1 className="animate-in">Welcome to One Infinity FinEdge Pvt Ltd</h1>
                <p className="animate-in">Your trusted insurance broker connecting you with the best policies.</p>
                <button 
                    onClick={handleGetStarted} 
                    className="hero-cta-button animate-in"
                >
                    Get Started
                </button>
            </div>
        </motion.div>
    );
};

export default HeroSection;