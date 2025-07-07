import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import InsuranceProducts from '../components/InsuranceProducts';
import ContactSection from '../components/ContactSection';
import ScrollToTop from '../components/ScrollToTop';

const Home = () => {
    return (
        <div className="home">
            <HeroSection />
            <FeaturesSection />
            <InsuranceProducts />
            <ContactSection />
            <ScrollToTop />
        </div>
    );
};

export default Home;