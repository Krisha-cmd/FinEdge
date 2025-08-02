import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from './AnimatedBackground';
import './HeroSection.css';

const HeroSection = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isExiting, setIsExiting] = useState(false);

    const handleGetStarted = () => {
        setIsExiting(true);
        setTimeout(() => {
            navigate('/login');
        }, 100);
    };

    return (
        <motion.div 
            className="hero-section"
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
        >
            <AnimatedBackground type="full" />
            <div className="hero-content">
                {currentUser ? (
                    <>
                        <h1 className="animate-in">Thanks for visiting us!</h1>
                        <p className="animate-in">
                            Our website is currently under development and will be live by Independence Day.
                        </p>
                        <p className="animate-in highlight-text">
                            We will be proudly revealing our esteemed partners on the platform
                        </p>
                    </>
                ) : (
                    // <>
                    //     <h1 className="animate-in">Welcome to Ten Infinity</h1>
                    //     <p className="animate-in">Your trusted insurance broker connecting you with the best policies.</p>
                    //     <button 
                    //         onClick={handleGetStarted} 
                    //         className="hero-cta-button animate-in"
                    //     >
                    //         Get Started
                    //     </button>
                    // </>
                                        <>
                        <h1 className="animate-in">Thanks for visiting us!</h1>
                        <p className="animate-in">
                            Our website is currently under development and will be live by Independence Day.
                        </p>
                        <p className="animate-in highlight-text">
                            We will be proudly revealing our esteemed partners on the platform
                        </p>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default HeroSection;