import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import InsuranceProducts from '../components/InsuranceProducts';

const Home = () => {
    return (
        <div className="home">
            <HeroSection />
            <InsuranceProducts />
            <FeaturesSection />
            <ContactSection />
        </div>
    );
};

export default Home;