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