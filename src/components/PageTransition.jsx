import React from 'react';
import { motion } from 'framer-motion';
import './PageTransition.css';

const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
                duration: 0.2,
                ease: [0.43, 0.13, 0.23, 0.96] // Smooth easing function
            }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;