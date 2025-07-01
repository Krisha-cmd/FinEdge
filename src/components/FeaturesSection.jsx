import React from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => {
    const features = [
        {
            title: 'Expert Insurance Brokers',
            description: 'Our team of experienced brokers helps you find the best insurance policies tailored to your needs.',
            icon: '🛡️'
        },
        {
            title: 'Competitive Commissions',
            description: 'We offer attractive commission structures for agents, ensuring you are rewarded for your hard work.',
            icon: '💎'
        },
        {
            title: 'Comprehensive Training',
            description: 'We provide extensive training and resources to help our agents succeed in the insurance market.',
            icon: '📚'
        },
        {
            title: '24/7 Support',
            description: 'Our dedicated support team is available around the clock to assist you with any queries or issues.',
            icon: '🌟'
        }
    ];

    return (
        <section className="features-section">
            <div className="features-background">
                <div className="bg-circle"></div>
                <div className="bg-dots"></div>
            </div>
            <h2 className="features-title">Our Key Features</h2>
            <div className="features-container">
                {features.map((feature, index) => (
                    <div className="feature-card" key={index}>
                        <div className="feature-icon">{feature.icon}</div>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-description">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;