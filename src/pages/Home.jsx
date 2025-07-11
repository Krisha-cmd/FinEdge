import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import InsuranceProducts from '../components/InsuranceProducts';
import ContactSection from '../components/ContactSection';
import ScrollToTop from '../components/ScrollToTop';

const Home = () => {
    const location = useLocation();

    useEffect(() => {
        // Handle initial load and hash changes
        if (location.hash) {
            const sectionId = location.hash.replace('#', '');
            const element = document.getElementById(sectionId);
            if (element) {
                // Add a slight delay to ensure DOM is ready
                setTimeout(() => {
                    element.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        }
    }, [location.hash]); // Re-run when hash changes

    return (
        <div className="home">
            <HeroSection />
            <div id="features">
                <FeaturesSection />
            </div>
            <div id="products">
                <InsuranceProducts />
            </div>
            <div id="contact">
                <ContactSection />
            </div>
            <ScrollToTop />
        </div>
    );
};

export default Home;