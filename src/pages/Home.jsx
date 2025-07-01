import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div>
            <HeroSection />
            <FeaturesSection />
            <ContactSection/>
        </div>
    );
};

export default Home;